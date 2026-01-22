"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

interface ExportButtonProps {
  endpoint: string;
  filename: string;
  label?: string;
}

export function ExportButton({
  endpoint,
  filename,
  label = "Export to CSV",
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Export failed");
      }

      // Convert JSON to CSV
      const csvContent = convertToCSV(data.items || data);
      
      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const convertToCSV = (data: any[]): string => {
    if (!data || data.length === 0) {
      return "";
    }

    // Get all unique keys from all objects
    const allKeys = new Set<string>();
    data.forEach(item => {
      Object.keys(item).forEach(key => {
        if (typeof item[key] !== "object" || item[key] === null) {
          allKeys.add(key);
        }
      });
    });

    const headers = Array.from(allKeys);
    
    // Create CSV header row
    const headerRow = headers.map(escapeCSV).join(",");
    
    // Create CSV data rows
    const dataRows = data.map(item => {
      return headers.map(header => {
        const value = item[header];
        if (value === null || value === undefined) {
          return "";
        }
        // Handle dates
        if (value instanceof Date) {
          return escapeCSV(value.toISOString());
        }
        // Handle boolean
        if (typeof value === "boolean") {
          return value.toString();
        }
        // Handle numbers
        if (typeof value === "number") {
          return value.toString();
        }
        return escapeCSV(value.toString());
      }).join(",");
    });

    return [headerRow, ...dataRows].join("\n");
  };

  const escapeCSV = (value: string): string => {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  return (
    <Button
      onClick={handleExport}
      disabled={exporting}
      variant="outline"
      className="rounded-full"
    >
      {exporting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          {label}
        </>
      )}
    </Button>
  );
}
