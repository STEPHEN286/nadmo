// Export utilities for reports data
import { saveAs } from 'file-saver';

// Helper function to format data for export
const formatValueForExport = (value, type = 'text') => {
  if (value === null || value === undefined) return '';
  
  switch (type) {
    case 'region':
      return value && typeof value === 'object' ? value.name || '' : String(value);
    case 'district':
      return value && typeof value === 'object' ? value.name || '' : String(value);
    case 'date':
      try {
        return new Date(value).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      } catch {
        return String(value);
      }
    case 'datetime':
      try {
        return new Date(value).toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return String(value);
      }
    case 'status':
      if (typeof value === 'string') {
        return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ');
      }
      return String(value);
    case 'user':
      if (typeof value === 'object' && value !== null) {
        return value.fullName || value.name || value.email || 'Unknown';
      }
      return String(value);
    case 'location':
      if (typeof value === 'object' && value !== null) {
        const parts = [];
        if (value.district) parts.push(value.district);
        if (value.region) parts.push(value.region);
        return parts.length > 0 ? parts.join(' - ') : String(value);
      }
      return String(value);
    case 'number':
      const num = Number(value);
      return isNaN(num) ? String(value) : num.toLocaleString();
    case 'description':
      // Handle long descriptions with better formatting
      if (typeof value === 'string' && value.length > 100) {
        return value.substring(0, 100) + '...';
      }
      return String(value);
    default:
      return String(value);
  }
};

// Convert data to CSV format
export const exportToCSV = (data, fields, filename = 'reports', reportType = 'educational') => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Helper function to properly escape CSV values and handle content wrapping
  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    
    // Clean up the string - remove extra whitespace and normalize line breaks
    const cleanedValue = stringValue
      .trim()
      .replace(/\r\n/g, '\n')  // Normalize line breaks
      .replace(/\r/g, '\n')    // Handle old Mac line breaks
      .replace(/\n+/g, ' ')    // Replace multiple line breaks with single space
      .replace(/\s+/g, ' ');   // Replace multiple spaces with single space
    
    // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (cleanedValue.includes(',') || cleanedValue.includes('"') || cleanedValue.includes('\n')) {
      return `"${cleanedValue.replace(/"/g, '""')}"`;
    }
    return cleanedValue;
  };

  // Helper function to format long text with wrapping
  const formatLongText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    
    // Try to break at word boundaries
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      if ((currentLine + word).length <= maxLength) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    
    if (currentLine) lines.push(currentLine);
    return lines.join(' ');
  };

  // Create headers with proper formatting
  const headers = fields.map(field => {
    const headerText = field.label
      .replace(/([A-Z])/g, ' $1')  // Add space before capital letters
      .replace(/^./, str => str.toUpperCase())  // Capitalize first letter
      .trim();
    return escapeCSV(headerText);
  });
  
  // Create rows with enhanced formatting
  const rows = data.map((item, index) => {
    return fields.map(field => {
      const value = item[field.key];
      let formattedValue = formatValueForExport(value, field.type);
      
      // Apply special formatting based on field type
      switch (field.type) {
        case 'description':
        case 'text':
          // Wrap long descriptions
          formattedValue = formatLongText(formattedValue, 80);
          break;
        case 'datetime':
        case 'date':
          // Ensure consistent date formatting
          if (formattedValue) {
            formattedValue = formattedValue.replace(/,/g, ' -');
          }
          break;
        case 'status':
          // Ensure status is properly formatted
          formattedValue = formattedValue.replace(/_/g, ' ').toLowerCase();
          break;
        default:
          // For other types, just ensure proper length
          if (formattedValue.length > 50) {
            formattedValue = formatLongText(formattedValue, 50);
          }
      }
      
      return escapeCSV(formattedValue);
    });
  });

  // Add metadata header for educational reports
  const metadata = reportType === 'educational' ? [
    `Educational Reports Export`,
    `Generated on: ${new Date().toLocaleString('en-GB')}`,
    `Total Reports: ${data.length}`,
    `Report Type: Educational`,
    `Fields: ${fields.length}`,
    ''  // Empty line for spacing
  ] : [
    `Export Date: ${new Date().toLocaleString('en-GB')}`,
    `Total Records: ${data.length}`,
    `Fields: ${fields.length}`,
    ''  // Empty line for spacing
  ];

  // Combine metadata, headers, and rows
  const csvContent = [
    ...metadata,
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  // Add BOM for proper UTF-8 encoding in Excel
  const BOM = '\uFEFF';
  const csvWithBOM = BOM + csvContent;
  
  // Create and download file
  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
};

// Convert data to Excel format using ExcelJS
export const exportToExcelFormatted = async (data, fields, filename = 'reports', reportType = 'educational') => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  try {
    console.log('Starting Excel export with:', { dataLength: data.length, fieldsCount: fields.length, reportType });
    
    // Dynamic import to avoid bundling issues
    const ExcelJS = await import('exceljs');
    console.log('ExcelJS imported successfully');
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reports');
    console.log('Workbook and worksheet created');

    // Debug: log field keys and first data item keys
    const fieldKeys = fields.map(f => f.key);
    console.log('Field keys:', fieldKeys);
    if (data.length > 0) {
      console.log('First data item keys:', Object.keys(data[0]));
    }

    // Create header row
    const headerRow = fields.map(field => field.label);
    console.log('Headers:', headerRow);
    worksheet.addRow(headerRow);

    // Add data rows
    data.forEach((item, index) => {
      const row = fields.map(field => {
        const value = item[field.key];
        const formattedValue = formatValueForExport(value, field.type);
        return formattedValue;
      });
      console.log(`Row ${index + 1}:`, row);
      worksheet.addRow(row);
    });

    // Set basic column widths
    worksheet.columns.forEach((col, i) => {
      col.width = 15;
    });

    // console.log('Generating buffer...');
    // Generate buffer and download file
    const buffer = await workbook.xlsx.writeBuffer();
    // console.log('Buffer generated, size:', buffer.byteLength);
    
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
    // console.log('Excel file downloaded successfully');
  } catch (error) {
    // console.error('Error exporting to Excel:', error);
    throw new Error(`Failed to export to Excel: ${error.message}`);
  }
};

// Convert data to JSON format
export const exportToJSON = (data, fields, filename = 'reports') => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Prepare data for JSON export
  const jsonData = data.map(item => {
    const exportItem = {};
    fields.forEach(field => {
      const value = item[field.key];
      exportItem[field.label] = formatValueForExport(value, field.type);
    });
    return exportItem;
  });

  // Create and download file
  const jsonContent = JSON.stringify(jsonData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.json`);
};

// Convert data to PDF format
export const exportToPDF = async (data, fields, filename = 'reports', reportType = 'educational') => {
  try {
    // Dynamic import to avoid bundling issues
    const jsPDF = await import('jspdf');
    const autoTable = await import('jspdf-autotable');
    
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const { default: JsPDF } = jsPDF;
    const doc = new JsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' });

    // Add title
    doc.setFontSize(18);
    doc.setTextColor(44, 62, 80);
    doc.text(reportType === 'schools' ? 'Schools Export' : 'Reports Export', 40, 40);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString('en-GB')}`, 40, 60);
    doc.text(`Total ${reportType === 'schools' ? 'Schools' : 'Reports'}: ${data.length}`, 40, 75);

    // Prepare table data
    const headers = fields.map(field => field.label);
    const tableData = data.map(item => {
      return fields.map(field => {
        let value = item[field.key];
        let type = field.type;
        // For schools, handle region/district as objects
        if (reportType === 'schools') {
          if (field.key === 'region') type = 'region';
          if (field.key === 'district') type = 'district';
        }
        let formatted = formatValueForExport(value, type);
        // Word wrap long text fields
        if (typeof formatted === 'string' && formatted.length > 60) {
          formatted = formatted.replace(/(.{60})/g, '$1\n');
        }
        return formatted;
      });
    });

    // Add table
    autoTable.default(doc, {
      head: [headers],
      body: tableData,
      startY: 90,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 5,
        overflow: 'linebreak',
        halign: 'left',
        valign: 'middle',
        lineWidth: 0.5,
        lineColor: [180, 180, 180],
        minCellHeight: 18,
        maxCellWidth: 120,
        textColor: [44, 62, 80],
      },
      headStyles: {
        fillColor: [44, 123, 202],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'center',
        valign: 'middle',
        cellPadding: 7,
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      columnStyles: Object.fromEntries(
        fields.map((f, i) => [i, { cellWidth: 'auto', maxCellWidth: 120 }])
      ),
      didDrawPage: function (data) {
        // Add page number
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      },
    });

    // Save PDF
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export to PDF. Please try CSV format instead.');
  }
};

// Main export function
export const exportReports = async (data, fields, format, filename = 'reports', reportType = 'educational') => {
  const selectedFields = fields.filter(field => field.selected);
  
  if (selectedFields.length === 0) {
    throw new Error('Please select at least one field to export');
  }

  switch (format.toLowerCase()) {
    case 'csv':
      return exportToCSV(data, selectedFields, filename, reportType);
    case 'excel':
      return exportToExcelFormatted(data, selectedFields, filename, reportType);
    case 'pdf':
      return exportToPDF(data, selectedFields, filename, reportType);
    case 'json':
      return exportToJSON(data, selectedFields, filename);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

// Get available fields for different report types
export const getAvailableFields = (reportType = 'educational') => {
  const commonFields = [
    { key: 'id', label: 'Report ID', type: 'text', required: true, selected: true },
    { key: 'status', label: 'Status', type: 'status', required: true, selected: true },
    { key: 'createdAt', label: 'Created Date', type: 'datetime', required: true, selected: true },
  ];

  if (reportType === 'educational') {
    return [
      ...commonFields,
      { key: 'schoolName', label: 'School Name', type: 'text', required: true, selected: true },
      { key: 'district', label: 'District', type: 'text', required: true, selected: true },
      { key: 'region', label: 'Region', type: 'text', required: false, selected: true },
      { key: 'reportType', label: 'Report Type', type: 'text', required: true, selected: true },
      { key: 'academicYear', label: 'Academic Year', type: 'text', required: true, selected: true },
      { key: 'submittedBy', label: 'Submitted By', type: 'user', required: false, selected: true },
      { key: 'submittedAt', label: 'Submitted Date', type: 'datetime', required: false, selected: true },
      { key: 'lastUpdated', label: 'Last Updated', type: 'datetime', required: false, selected: false },
      { key: 'totalStudents', label: 'Total Students', type: 'number', required: false, selected: false },
      { key: 'maleStudents', label: 'Male Students', type: 'number', required: false, selected: false },
      { key: 'femaleStudents', label: 'Female Students', type: 'number', required: false, selected: false },
      { key: 'teachers', label: 'Teachers', type: 'number', required: false, selected: false },
      { key: 'maleTeachers', label: 'Male Teachers', type: 'number', required: false, selected: false },
      { key: 'femaleTeachers', label: 'Female Teachers', type: 'number', required: false, selected: false },
      { key: 'infrastructure', label: 'Infrastructure', type: 'text', required: false, selected: false },
      { key: 'classrooms', label: 'Classrooms', type: 'number', required: false, selected: false },
      { key: 'laboratories', label: 'Laboratories', type: 'number', required: false, selected: false },
      { key: 'library', label: 'Library', type: 'text', required: false, selected: false },
      { key: 'computerLab', label: 'Computer Lab', type: 'text', required: false, selected: false },
      { key: 'sportsFacilities', label: 'Sports Facilities', type: 'text', required: false, selected: false },
      { key: 'description', label: 'Description', type: 'text', required: false, selected: false },
      { key: 'notes', label: 'Notes', type: 'text', required: false, selected: false },
      { key: 'priority', label: 'Priority Level', type: 'text', required: false, selected: false },
    ];
  }

  if (reportType === 'nadmo') {
    return [
      ...commonFields,
      { key: 'type', label: 'Disaster Type', type: 'text', required: true, selected: true },
      { key: 'location', label: 'Location', type: 'location', required: true, selected: true },
      { key: 'severity', label: 'Severity', type: 'status', required: true, selected: true },
      { key: 'reporterName', label: 'Reporter', type: 'user', required: false, selected: true },
      { key: 'description', label: 'Description', type: 'text', required: false, selected: true },
      { key: 'casualties', label: 'Casualties', type: 'text', required: false, selected: false },
      { key: 'coordinates', label: 'Coordinates', type: 'text', required: false, selected: false },
    ];
  }

  return commonFields;
}; 