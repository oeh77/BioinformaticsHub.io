"use client";

import { useState, useEffect } from "react";
import { 
  Download, 
  FileCode, 
  FileText, 
  Check, 
  Copy,
  ExternalLink,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Node, Edge } from "reactflow";
import { exportWorkflow } from "@/lib/workflow/export";

interface WorkflowExportDialogProps {
  workflowSlug?: string;
  workflowName: string;
  trigger?: React.ReactNode;
  nodes?: Node[];
  edges?: Edge[];
}

export function WorkflowExportDialog({
  workflowSlug,
  workflowName,
  trigger,
  nodes,
  edges,
}: WorkflowExportDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedContent, setExportedContent] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<"cwl" | "nextflow" | "snakemake">("nextflow");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (!exportedContent) {
        handleExport("nextflow");
      }
    } else {
      // Reset state when dialog closes
      setExportedContent(null);
      setSelectedFormat("nextflow");
    }
  }, [isOpen]);

  const handleExport = async (format: "cwl" | "nextflow" | "snakemake") => {
    setSelectedFormat(format);
    setIsExporting(true);
    setExportedContent(null);
    
    try {
      // Client-side export if nodes/edges provided
      if (nodes && edges) {
        // Simulate async delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const result = exportWorkflow(format, nodes, edges, {
          name: workflowName,
          version: "1.0.0",
          author: "BioinformaticsHub.io User"
        });
        
        setExportedContent(result.content);
        
        toast({
          title: "Export Generated",
          description: `${workflowName} exported to ${format.toUpperCase()} format`,
        });
        return;
      }

      // Server-side export if slug provided
      if (!workflowSlug) {
        throw new Error("No workflow data available for export");
      }

      const res = await fetch(`/api/workflows/${workflowSlug}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to export workflow");
      }

      const data = await res.json();
      setExportedContent(data.content);
      
      toast({
        title: "Export Generated",
        description: `${workflowName} exported to ${format.toUpperCase()} format`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export workflow",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = async () => {
    if (exportedContent) {
      await navigator.clipboard.writeText(exportedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Workflow code copied to clipboard",
      });
    }
  };

  const handleDownload = () => {
    if (exportedContent) {
      const filenames: Record<string, string> = {
        cwl: `${workflowName.toLowerCase().replace(/\s+/g, "_")}.cwl`,
        nextflow: `${workflowName.toLowerCase().replace(/\s+/g, "_")}.nf`,
        snakemake: "Snakefile",
      };
      
      const blob = new Blob([exportedContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filenames[selectedFormat];
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh]" onClose={() => setIsOpen(false)}>
          {/* Header */}
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5" />
              Export Workflow
            </DialogTitle>
            <DialogDescription>
              Export &quot;{workflowName}&quot; to your preferred workflow language
            </DialogDescription>
          </DialogHeader>

          {/* Format Selection Buttons */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={selectedFormat === "nextflow" ? "default" : "outline"}
              onClick={() => handleExport("nextflow")}
              className="flex-1"
              disabled={isExporting}
            >
              <FileCode className="h-4 w-4 mr-2" />
              Nextflow
            </Button>
            <Button
              variant={selectedFormat === "snakemake" ? "default" : "outline"}
              onClick={() => handleExport("snakemake")}
              className="flex-1"
              disabled={isExporting}
            >
              <FileCode className="h-4 w-4 mr-2" />
              Snakemake
            </Button>
            <Button
              variant={selectedFormat === "cwl" ? "default" : "outline"}
              onClick={() => handleExport("cwl")}
              className="flex-1"
              disabled={isExporting}
            >
              <FileCode className="h-4 w-4 mr-2" />
              CWL
            </Button>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              {selectedFormat === "nextflow" && "main.nf"}
              {selectedFormat === "snakemake" && "Snakefile"}
              {selectedFormat === "cwl" && "workflow.cwl"}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                disabled={!exportedContent}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                disabled={!exportedContent}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>

          {/* Code Display */}
          <div className="bg-muted rounded-lg p-4 overflow-auto max-h-[300px]">
            {isExporting ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : exportedContent ? (
              <pre className="text-sm font-mono whitespace-pre overflow-x-auto">
                {exportedContent}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <FileCode className="h-12 w-12 mb-4 opacity-50" />
                <p>Select a format above to generate code</p>
              </div>
            )}
          </div>

          {/* Documentation Link */}
          <div className="mt-4 p-3 bg-blue-500/10 rounded-lg text-sm">
            <div className="flex items-start gap-2">
              <ExternalLink className="h-4 w-4 mt-0.5 text-blue-500" />
              <div>
                <p className="font-medium text-blue-600 dark:text-blue-400">
                  {selectedFormat === "nextflow" && "Nextflow Documentation"}
                  {selectedFormat === "snakemake" && "Snakemake Documentation"}
                  {selectedFormat === "cwl" && "CWL Documentation"}
                </p>
                <p className="text-muted-foreground">
                  {selectedFormat === "nextflow" && "Learn more at nextflow.io"}
                  {selectedFormat === "snakemake" && "Learn more at snakemake.readthedocs.io"}
                  {selectedFormat === "cwl" && "Learn more at commonwl.org"}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
