"use client";

import { CodePlayground } from "@/components/playground/CodePlayground";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Code2, 
  Dna, 
  BarChart3, 
  BookOpen,
  Lightbulb,
  Terminal
} from "lucide-react";

const EXAMPLES = {
  sequenceAnalysis: `# DNA Sequence Analysis
def gc_content(seq):
    """Calculate GC content percentage"""
    gc = seq.upper().count('G') + seq.upper().count('C')
    return (gc / len(seq)) * 100

def find_orfs(seq, min_length=100):
    """Find Open Reading Frames"""
    orfs = []
    start_codon = "ATG"
    stop_codons = ["TAA", "TAG", "TGA"]
    
    for i in range(len(seq) - 2):
        if seq[i:i+3] == start_codon:
            for j in range(i + 3, len(seq) - 2, 3):
                codon = seq[j:j+3]
                if codon in stop_codons:
                    if j - i >= min_length:
                        orfs.append((i, j + 3, seq[i:j+3]))
                    break
    return orfs

# Example
dna = "ATGAAACCCGGGTTTATTTAAGGCATGCCCAAATAG"
print(f"Sequence: {dna}")
print(f"Length: {len(dna)} bp")
print(f"GC Content: {gc_content(dna):.1f}%")

orfs = find_orfs(dna, min_length=9)
print(f"\\nORFs found: {len(orfs)}")
for start, end, seq in orfs:
    print(f"  Position {start}-{end}: {seq[:20]}...")
`,
  dataAnalysis: `# Gene Expression Data Analysis
import numpy as np

# Simulated RNA-seq count data
np.random.seed(42)
genes = ['BRCA1', 'TP53', 'EGFR', 'MYC', 'KRAS', 'PIK3CA', 'PTEN', 'RB1']
control = np.random.negative_binomial(10, 0.3, len(genes))
treatment = np.random.negative_binomial(15, 0.3, len(genes))

print("Differential Expression Analysis")
print("=" * 60)
print(f"{'Gene':<10} {'Control':<10} {'Treatment':<10} {'Log2FC':<10} {'Status'}")
print("-" * 60)

for i, gene in enumerate(genes):
    # Add pseudocount for log
    log2fc = np.log2((treatment[i] + 1) / (control[i] + 1))
    if log2fc > 1:
        status = "↑ UP"
    elif log2fc < -1:
        status = "↓ DOWN"
    else:
        status = "- NC"
    print(f"{gene:<10} {control[i]:<10} {treatment[i]:<10} {log2fc:>+.2f}{'':5} {status}")

print("\\n" + "=" * 60)
print(f"Up-regulated: {sum(np.log2((treatment + 1) / (control + 1)) > 1)}")
print(f"Down-regulated: {sum(np.log2((treatment + 1) / (control + 1)) < -1)}")
print(f"No change: {sum(abs(np.log2((treatment + 1) / (control + 1))) <= 1)}")
`,
  statistics: `# Statistical Analysis for Bioinformatics
import numpy as np

def t_test(group1, group2):
    """Simple two-sample t-test"""
    n1, n2 = len(group1), len(group2)
    mean1, mean2 = np.mean(group1), np.mean(group2)
    var1, var2 = np.var(group1, ddof=1), np.var(group2, ddof=1)
    
    # Pooled standard error
    se = np.sqrt(var1/n1 + var2/n2)
    t_stat = (mean1 - mean2) / se
    
    # Degrees of freedom (Welch's approximation)
    df = ((var1/n1 + var2/n2)**2) / ((var1/n1)**2/(n1-1) + (var2/n2)**2/(n2-1))
    
    return t_stat, df

# Simulated expression data
np.random.seed(42)
control = np.random.normal(10, 2, 20)  # 20 control samples
treatment = np.random.normal(12, 2.5, 20)  # 20 treatment samples

print("Statistical Comparison of Expression Levels")
print("=" * 50)
print(f"Control (n={len(control)}):")
print(f"  Mean: {np.mean(control):.2f}")
print(f"  SD: {np.std(control, ddof=1):.2f}")
print(f"  Range: {np.min(control):.2f} - {np.max(control):.2f}")

print(f"\\nTreatment (n={len(treatment)}):")
print(f"  Mean: {np.mean(treatment):.2f}")
print(f"  SD: {np.std(treatment, ddof=1):.2f}")
print(f"  Range: {np.min(treatment):.2f} - {np.max(treatment):.2f}")

t_stat, df = t_test(control, treatment)
print(f"\\nT-test Results:")
print(f"  t-statistic: {t_stat:.3f}")
print(f"  Degrees of freedom: {df:.1f}")
print(f"  Difference: {np.mean(treatment) - np.mean(control):.2f}")
print(f"  Effect size (Cohen's d): {(np.mean(treatment) - np.mean(control)) / np.sqrt((np.var(treatment) + np.var(control))/2):.2f}")
`,
};

export default function PlaygroundPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Code2 className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold">Code Playground</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Write and run Python code directly in your browser. Perfect for learning
          bioinformatics concepts and testing algorithms.
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Badge variant="secondary">Python 3.11</Badge>
          <Badge variant="outline">Pyodide</Badge>
          <Badge variant="outline">NumPy</Badge>
          <Badge variant="outline">Matplotlib</Badge>
        </div>
      </div>

      {/* Main Playground */}
      <div className="mb-12">
        <CodePlayground 
          title="Interactive Python Environment"
          height="350px"
        />
      </div>

      {/* Example Sections */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-primary" />
          Example Notebooks
        </h2>

        <Tabs defaultValue="sequence" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="sequence" className="gap-2">
              <Dna className="h-4 w-4" />
              Sequence Analysis
            </TabsTrigger>
            <TabsTrigger value="expression" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Gene Expression
            </TabsTrigger>
            <TabsTrigger value="statistics" className="gap-2">
              <Terminal className="h-4 w-4" />
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sequence">
            <CodePlayground
              title="DNA Sequence Analysis"
              initialCode={EXAMPLES.sequenceAnalysis}
              height="400px"
            />
          </TabsContent>

          <TabsContent value="expression">
            <CodePlayground
              title="Gene Expression Analysis"
              initialCode={EXAMPLES.dataAnalysis}
              height="400px"
            />
          </TabsContent>

          <TabsContent value="statistics">
            <CodePlayground
              title="Statistical Analysis"
              initialCode={EXAMPLES.statistics}
              height="450px"
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" />
              Browser-Based
            </CardTitle>
            <CardDescription>
              No installation required. Python runs directly in your browser using WebAssembly.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Learn by Doing
            </CardTitle>
            <CardDescription>
              Interactive examples for sequence analysis, data processing, and visualization.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dna className="h-5 w-5 text-primary" />
              Bioinformatics Ready
            </CardTitle>
            <CardDescription>
              Pre-loaded with NumPy, SciPy, and other scientific computing libraries.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
