"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Square,
  RotateCcw,
  Download,
  Copy,
  Check,
  Loader2,
  Terminal,
  FileCode,
  ChevronDown,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";

// Pyodide types
interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  loadPackage: (packages: string | string[]) => Promise<void>;
  loadPackagesFromImports: (code: string) => Promise<void>;
  globals: Map<string, unknown>;
  FS: {
    writeFile: (path: string, data: string) => void;
    readFile: (path: string, opts: { encoding: string }) => string;
  };
}

declare global {
  interface Window {
    loadPyodide: (config?: { indexURL?: string }) => Promise<PyodideInterface>;
  }
}

interface CodePlaygroundProps {
  initialCode?: string;
  language?: "python" | "r";
  title?: string;
  packages?: string[];
  readOnly?: boolean;
  height?: string;
}

const EXAMPLE_SNIPPETS = {
  basic: `# Basic Python Example
print("Hello, Bioinformatics!")

# Simple list operations
sequences = ["ATCG", "GCTA", "TTAA", "GGCC"]
for seq in sequences:
    print(f"Sequence: {seq}, Length: {len(seq)}")
`,
  biopython: `# BioPython-like sequence analysis
# Note: Using pure Python for demo

def gc_content(sequence):
    """Calculate GC content of a DNA sequence"""
    gc = sequence.upper().count('G') + sequence.upper().count('C')
    return (gc / len(sequence)) * 100

def complement(sequence):
    """Return the complement of a DNA sequence"""
    comp = {'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G'}
    return ''.join(comp.get(base, 'N') for base in sequence.upper())

def reverse_complement(sequence):
    """Return the reverse complement"""
    return complement(sequence)[::-1]

# Example usage
dna = "ATCGATCGATCGATCG"
print(f"Original: {dna}")
print(f"GC Content: {gc_content(dna):.2f}%")
print(f"Complement: {complement(dna)}")
print(f"Reverse Complement: {reverse_complement(dna)}")
`,
  dataAnalysis: `# Data Analysis Example
import numpy as np

# Simulated gene expression data
genes = ['BRCA1', 'TP53', 'EGFR', 'MYC', 'KRAS']
control = np.random.normal(5, 1, 5)
treatment = np.random.normal(7, 1.5, 5)

print("Gene Expression Analysis")
print("=" * 50)

for i, gene in enumerate(genes):
    fold_change = treatment[i] / control[i]
    log2fc = np.log2(fold_change)
    status = "UP" if log2fc > 0.5 else "DOWN" if log2fc < -0.5 else "NC"
    print(f"{gene}: Control={control[i]:.2f}, Treatment={treatment[i]:.2f}, Log2FC={log2fc:.2f} [{status}]")

print("\\nSummary Statistics:")
print(f"Mean Control: {np.mean(control):.2f}")
print(f"Mean Treatment: {np.mean(treatment):.2f}")
`,
  visualization: `# Visualization with matplotlib
import matplotlib.pyplot as plt
import numpy as np

# Generate sample data
x = np.linspace(0, 10, 100)
y1 = np.sin(x)
y2 = np.cos(x)

# Create figure
plt.figure(figsize=(10, 5))

# Plot data
plt.subplot(1, 2, 1)
plt.plot(x, y1, 'b-', label='sin(x)')
plt.plot(x, y2, 'r--', label='cos(x)')
plt.xlabel('X')
plt.ylabel('Y')
plt.title('Trigonometric Functions')
plt.legend()
plt.grid(True, alpha=0.3)

# Create a scatter plot
plt.subplot(1, 2, 2)
np.random.seed(42)
data_x = np.random.randn(50)
data_y = data_x * 0.8 + np.random.randn(50) * 0.3
plt.scatter(data_x, data_y, alpha=0.6, c='purple')
plt.xlabel('Feature 1')
plt.ylabel('Feature 2')
plt.title('Correlation Plot')

plt.tight_layout()
plt.savefig('/tmp/plot.png', dpi=100)
print("Plot saved! (In browser, this would display inline)")
plt.show()
`,
};

export function CodePlayground({
  initialCode = EXAMPLE_SNIPPETS.basic,
  language = "python",
  title = "Code Playground",
  packages = [],
  readOnly = false,
  height = "400px",
}: CodePlaygroundProps) {
  const { toast } = useToast();
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [loadedPackages, setLoadedPackages] = useState<string[]>([]);
  const [selectedExample, setSelectedExample] = useState<string>("basic");
  const [copied, setCopied] = useState(false);
  const [showPackages, setShowPackages] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load Pyodide
  const loadPyodide = useCallback(async () => {
    if (pyodide) return pyodide;
    
    setIsLoading(true);
    setOutput("Loading Python environment...\n");

    try {
      // Load Pyodide script
      if (!window.loadPyodide) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js";
        script.async = true;
        document.head.appendChild(script);
        
        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Pyodide"));
        });
      }

      const pyodideInstance = await window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
      });

      // Load numpy by default
      setOutput((prev) => prev + "Loading numpy...\n");
      await pyodideInstance.loadPackage("numpy");
      setLoadedPackages(["numpy"]);

      // Load additional packages
      if (packages.length > 0) {
        for (const pkg of packages) {
          setOutput((prev) => prev + `Loading ${pkg}...\n`);
          await pyodideInstance.loadPackage(pkg);
          setLoadedPackages((prev) => [...prev, pkg]);
        }
      }

      setPyodide(pyodideInstance);
      setOutput("Python environment ready! ✓\n\n");
      
      toast({
        title: "Python Ready",
        description: "Python environment loaded successfully",
      });

      return pyodideInstance;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setOutput(`Error loading Python: ${errorMsg}\n`);
      toast({
        title: "Loading Failed",
        description: errorMsg,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [pyodide, packages, toast]);

  // Run code
  const runCode = async () => {
    setIsRunning(true);
    setOutput("");

    try {
      const py = pyodide || await loadPyodide();
      if (!py) {
        setIsRunning(false);
        return;
      }

      // Capture stdout
      await py.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
      `);

      // Load packages from imports
      try {
        await py.loadPackagesFromImports(code);
      } catch {
        // Some packages may not be available
      }

      // Run user code
      const result = await py.runPythonAsync(code);

      // Get stdout output
      const stdout = await py.runPythonAsync("sys.stdout.getvalue()");
      const stderr = await py.runPythonAsync("sys.stderr.getvalue()");

      let output = "";
      if (stdout) output += stdout;
      if (stderr) output += `\n[stderr]: ${stderr}`;
      if (result !== undefined && result !== null && !stdout) {
        output += String(result);
      }

      setOutput(output || "Code executed successfully (no output)");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setOutput(`Error: ${errorMsg}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Stop execution (not really possible with Pyodide, but for UI)
  const stopExecution = () => {
    setIsRunning(false);
    setOutput((prev) => prev + "\n[Execution stopped by user]");
  };

  // Reset code
  const resetCode = () => {
    setCode(initialCode);
    setOutput("");
  };

  // Copy code
  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download code
  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "script.py";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Load example
  const loadExample = (example: string) => {
    setSelectedExample(example);
    setCode(EXAMPLE_SNIPPETS[example as keyof typeof EXAMPLE_SNIPPETS] || EXAMPLE_SNIPPETS.basic);
    setOutput("");
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{title}</CardTitle>
            <Badge variant="secondary" className="ml-2">
              {language === "python" ? "Python 3.11" : "R"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedExample} onValueChange={loadExample}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Examples" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="biopython">Sequence Analysis</SelectItem>
                <SelectItem value="dataAnalysis">Data Analysis</SelectItem>
                <SelectItem value="visualization">Visualization</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Code Editor */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            readOnly={readOnly}
            aria-label="Python code editor"
            placeholder="Enter your Python code here..."
            className="w-full font-mono text-sm bg-muted p-4 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-primary min-h-[400px]"
            spellCheck={false}
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={copyCode}
              title="Copy code"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={downloadCode}
              title="Download code"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              onClick={runCode}
              disabled={isRunning || isLoading}
              className="gap-2"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isLoading ? "Loading..." : isRunning ? "Running..." : "Run"}
            </Button>
            {isRunning && (
              <Button variant="destructive" onClick={stopExecution}>
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            )}
            <Button variant="outline" onClick={resetCode}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          <Collapsible open={showPackages} onOpenChange={setShowPackages}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Package className="h-4 w-4" />
                Packages ({loadedPackages.length})
                <ChevronDown className={`h-4 w-4 transition-transform ${showPackages ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="absolute mt-2 p-2 bg-popover border rounded-lg shadow-lg z-10">
              <div className="flex flex-wrap gap-1">
                {loadedPackages.length > 0 ? (
                  loadedPackages.map((pkg) => (
                    <Badge key={pkg} variant="secondary">
                      {pkg}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Click &quot;Run&quot; to load Python
                  </span>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Output */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Terminal className="h-4 w-4" />
            Output
          </div>
          <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg min-h-[150px] max-h-[300px] overflow-auto font-mono text-sm whitespace-pre-wrap">
            {output || "Click 'Run' to execute your code..."}
          </pre>
        </div>

        {/* Help text */}
        <div className="text-xs text-muted-foreground">
          <strong>Available packages:</strong> numpy, matplotlib, scipy, pandas, scikit-learn (loaded on demand)
        </div>
      </CardContent>
    </Card>
  );
}
