"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";

/**
 * ExportButton - Export data to CSV/PDF
 * @param {Function} onExport - Export handler, receives format ('csv' | 'pdf' | 'excel')
 * @param {boolean} loading - Loading state
 * @param {string} className - Additional CSS classes
 * @param {Array} formats - Available export formats
 */
export function ExportButton({
  onExport,
  loading = false,
  className,
  formats = ["csv", "pdf"],
  label = "Export",
}) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format) => {
    if (isExporting || loading) return;

    setIsExporting(true);
    try {
      await onExport?.(format);
      toast.success(`Export to ${format.toUpperCase()} started`);
    } catch (error) {
      toast.error(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const formatIcons = {
    csv: FileSpreadsheet,
    pdf: FileText,
    excel: FileSpreadsheet,
    json: FileText,
  };

  const formatLabels = {
    csv: "Export as CSV",
    pdf: "Export as PDF",
    excel: "Export as Excel",
    json: "Export as JSON",
  };

  const isLoading = isExporting || loading;

  if (formats.length === 1) {
    return (
      <Button
        variant="outline"
        onClick={() => handleExport(formats[0])}
        disabled={isLoading}
        className={className}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        {label}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isLoading} className={className}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {formats.map((format) => {
          const Icon = formatIcons[format] || FileText;
          return (
            <DropdownMenuItem key={format} onClick={() => handleExport(format)}>
              <Icon className="h-4 w-4 mr-2" />
              {formatLabels[format] || `Export as ${format.toUpperCase()}`}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ExportButton;
