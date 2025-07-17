# Report Content Components

This folder contains reusable components for building report and data management interfaces.

## Components

### ReportTable
A flexible table component with sorting, selection, pagination, and bulk actions.

**Features:**
- Multiple column types (text, badge, status, date, location, user, number, id, custom)
- Row selection with checkboxes
- Bulk actions for selected items
- Pagination support
- Loading states
- Custom row actions
- Responsive design

**Usage:**
```jsx
import { ReportTable } from '@/components/report-content'

<ReportTable
  title="Reports"
  description="List of reports"
  data={dataArray}
  columns={columnConfig}
  selectedItems={selectedIds}
  onSelectItem={handleSelect}
  onSelectAll={handleSelectAll}
  onSort={handleSort}
  sortField={currentSortField}
  sortDirection={sortDirection}
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
  showSelection={true}
  showPagination={true}
  showBulkActions={true}
  bulkActions={bulkActionConfig}
  onBulkAction={handleBulkAction}
  rowActions={actionConfig}
  isLoading={loading}
  emptyMessage="No data found"
/>
```

### ExportPanel
A comprehensive export configuration panel with format selection and field filtering.

**Features:**
- Multiple export formats (CSV, PDF, Excel)
- Field selection with checkboxes
- Export summary
- Loading states
- Responsive design

**Usage:**
```jsx
import { ExportPanel } from '@/components/report-content'

<ExportPanel
  filteredReports={data}
  onExport={handleExport}
  isUpdating={loading}
  onCancel={handleCancel}
  availableFields={fieldConfig}
  selectedFields={selectedFields}
  onFieldChange={handleFieldChange}
/>
```

### ReportFilters
A reusable filter component for search and filtering functionality.

**Features:**
- Search input with icon
- Multiple filter types (select, date)
- Active filter indicators
- Clear all filters functionality
- Responsive grid layout

**Usage:**
```jsx
import { ReportFilters } from '@/components/report-content'

<ReportFilters
  title="Filters & Search"
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  filters={filterConfig}
  onFilterChange={handleFilterChange}
  onClearFilters={clearFilters}
  showClearButton={true}
/>
```

### ReportStats
A statistics display component for showing key metrics.

**Features:**
- Grid layout for multiple stats
- Icons and colors
- Trend indicators
- Responsive design

**Usage:**
```jsx
import { ReportStats } from '@/components/report-content'

<ReportStats
  stats={[
    {
      label: "Total Reports",
      value: "1,247",
      icon: FileText,
      iconColor: "text-blue-600",
      trend: 12
    }
  ]}
/>
```

### ReportHeader
A header component for report pages with title, description, and actions.

**Features:**
- Title and description
- Configurable action buttons
- Link and click actions
- Responsive layout

**Usage:**
```jsx
import { ReportHeader } from '@/components/report-content'

<ReportHeader
  title="Reports Management"
  description="Monitor and manage all reports"
  actions={[
    {
      label: "Export Data",
      icon: Download,
      onClick: handleExport
    },
    {
      label: "Add New",
      icon: Plus,
      href: "/reports/add"
    }
  ]}
/>
```

## Importing Components

You can import individual components:
```jsx
import { ReportTable } from '@/components/report-content/report-table'
import { ExportPanel } from '@/components/report-content/export-panel'
```

Or import from the index file:
```jsx
import { ReportTable, ExportPanel, ReportFilters } from '@/components/report-content'
```

## Column Types for ReportTable

- `text`: Simple text display
- `badge`: Badge component with variants
- `status`: Status with icons and colors
- `date`: Formatted date display
- `location`: Location with map pin icon
- `user`: User with person icon
- `number`: Number with formatting
- `id`: Monospace ID display
- `custom`: Custom render function

## Filter Types for ReportFilters

- `search`: Search input with icon
- `select`: Dropdown select
- `date`: Date range select

## Examples
