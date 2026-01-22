"use client";

import { useState } from "react";
import { Download, FileJson, FileSpreadsheet, Loader2 } from "lucide-react";

interface AdvancedExportButtonProps {
  endpoint: string;
  filename: string;
  label?: string;
}

export function AdvancedExportButton({
  endpoint,
  filename,
  label = "Export",
}: AdvancedExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = async (format: "csv" | "json") => {
    setExporting(true);
    setShowMenu(false);

    try {
      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Export failed");
      }

      const items = data.items || data;
      let content: string;
      let mimeType: string;
      let extension: string;

      if (format === "csv") {
        content = convertToCSV(items);
        mimeType = "text/csv;charset=utf-8;";
        extension = "csv";
      } else {
        content = JSON.stringify(items, null, 2);
        mimeType = "application/json;charset=utf-8;";
        extension = "json";
      }

      // Create download link
      const blob = new Blob([content], { type: mimeType });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${filename}_${new Date().toISOString().split("T")[0]}.${extension}`
      );
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
    if (!data || data.length === 0) return "";

    const allKeys = new Set<string>();
    data.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (typeof item[key] !== "object" || item[key] === null) {
          allKeys.add(key);
        }
      });
    });

    const headers = Array.from(allKeys);
    const headerRow = headers.map(escapeCSV).join(",");

    const dataRows = data.map((item) => {
      return headers
        .map((header) => {
          const value = item[header];
          if (value === null || value === undefined) return "";
          if (value instanceof Date) return escapeCSV(value.toISOString());
          if (typeof value === "boolean") return value.toString();
          if (typeof value === "number") return value.toString();
          return escapeCSV(value.toString());
        })
        .join(",");
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
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={exporting}
        className="inline-flex items-center px-4 py-2 rounded-full border border-white/20 bg-secondary/50 hover:bg-secondary transition-colors disabled:opacity-50"
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
      </button>

      {showMenu && !exporting && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-white/10 bg-card/95 backdrop-blur-sm shadow-lg z-50">
          <div className="p-1">
            <button
              onClick={() => handleExport("csv")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary/10 transition-colors text-left"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <div>
                <div className="text-sm font-medium">CSV</div>
                <div className="text-xs text-muted-foreground">Excel compatible</div>
              </div>
            </button>
            <button
              onClick={() => handleExport("json")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary/10 transition-colors text-left"
            >
              <FileJson className="w-4 h-4" />
              <div>
                <div className="text-sm font-medium">JSON</div>
                <div className="text-xs text-muted-foreground">Developer friendly</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
