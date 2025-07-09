"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowUpRight } from "lucide-react"

// Table icon component (you can replace this with an actual icon from lucide-react if needed)
const TableIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
)

export function ExportPanel({ 
  filteredReports = [], 
  onExport, 
  isUpdating = false, 
  onCancel,
  availableFields = [],
  selectedFields = {},
  onFieldChange,
  currentFilters = {}
}) {
  const [exportFormat, setExportFormat] = useState("csv")

  const handleExport = () => {
    onExport(exportFormat, selectedFields)
  }

  const handleFieldChange = (fieldKey, checked) => {
    if (onFieldChange) {
      onFieldChange(fieldKey, checked)
    }
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ArrowUpRight className="h-5 w-5 mr-2" />
          Export Reports
        </CardTitle>
        <CardDescription>Configure and export filtered report data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Export Format */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Export Format</Label>
            <div className="space-y-2">
              <div
                onClick={() => setExportFormat("csv")}
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  exportFormat === "csv" ? "border-blue-500 bg-blue-100" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <span className="font-medium">CSV</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Spreadsheet format</p>
              </div>
              <div
                onClick={() => setExportFormat("pdf")}
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  exportFormat === "pdf" ? "border-blue-500 bg-blue-100" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ArrowUpRight className="h-4 w-4 text-red-600" />
                  <span className="font-medium">PDF</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Document format</p>
              </div>

              <div
                onClick={() => setExportFormat("excel")}
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  exportFormat === "excel"
                    ? "border-blue-500 bg-blue-100"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Excel</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Spreadsheet format</p>
              </div>

              {/* <div
                onClick={() => setExportFormat("json")}
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  exportFormat === "json"
                    ? "border-blue-500 bg-blue-100"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">JSON</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Data format</p>
              </div> */}
            </div>
          </div>

          {/* Field Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Select Fields</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableFields.map((field) => (
                <div key={field.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.key}
                    checked={selectedFields[field.key]}
                    onCheckedChange={(checked) => handleFieldChange(field.key, checked)}
                    disabled={field.required}
                  />
                  <Label htmlFor={field.key} className="text-sm">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Export Summary & Actions */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Export Summary</Label>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Format:</span>
                <span className="font-medium uppercase">{exportFormat}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reports:</span>
                <span className="font-medium">{filteredReports.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fields:</span>
                <span className="font-medium">{Object.values(selectedFields).filter(Boolean).length}</span>
              </div>
              {Object.keys(currentFilters).length > 0 && (
                <div className="pt-2 border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Active Filters:</div>
                  {Object.entries(currentFilters).map(([key, value]) => (
                    value && value !== 'all' && (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-gray-600 capitalize">{key}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
            <div className="flex space-x-2 mt-4">
              <Button
                onClick={handleExport}
                disabled={isUpdating || filteredReports.length === 0}
                className="flex-1"
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Export
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 