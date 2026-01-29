"use client";

import { useState } from "react";
import {
  Link2,
  Eye,
  Wand2,
  FileText,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface InsertionResult {
  originalContent: string;
  processedContent: string;
  insertedLinks: Array<{
    keyword: string;
    productId: string;
    position: number;
    shortCode: string;
  }>;
  stats: {
    totalKeywordsFound: number;
    linksInserted: number;
    linksSkipped: number;
    processingTimeMs: number;
  };
}

export default function AutoLinkPage() {
  const [content, setContent] = useState("");
  const [result, setResult] = useState<InsertionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"preview" | "original">("preview");

  async function handlePreview() {
    if (!content.trim()) {
      setError("Please enter some content to preview");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/affiliate/auto-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "preview",
          content,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Preview failed");
      }

      const data = await response.json();
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  function loadSampleContent() {
    setContent(`
# Introduction to Next-Generation Sequencing

Next-generation sequencing (NGS) has revolutionized genomics research. Today, platforms like the NovaSeq 6000 from Illumina can sequence entire human genomes in a matter of hours.

## Key Technologies

The sequencing landscape includes several major platforms:

1. **Illumina Systems** - Known for high accuracy and throughput
2. **Oxford Nanopore** - Real-time, long-read sequencing
3. **PacBio** - High-accuracy long reads with HiFi technology

## Cloud Computing for Bioinformatics

For large-scale data analysis, researchers often turn to AWS for its scalable compute resources. The combination of cloud computing and bioinformatics tools enables faster discovery.

## Educational Resources

If you're looking to learn more about genomics, Coursera offers excellent courses on data science and bioinformatics. Their Genomic Data Science Specialization is particularly popular among researchers.

## Laboratory Essentials

Quality reagents are essential for successful experiments. Thermo Fisher provides a comprehensive range of products for molecular biology, from basic chemicals to advanced sequencing kits.
    `.trim());
  }

// Refactored AutoLinkPage
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Auto-Link Insertion</h1>
          <p className="text-muted-foreground">
            Preview and manage automatic affiliate link insertion
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Wand2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-primary">How it works</h3>
            <p className="text-sm text-muted-foreground mt-1">
              The auto-linker scans your content for product names and keywords,
              then automatically inserts affiliate links. It respects placement limits,
              avoids code blocks, and maintains proper link density.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Input Content
            </h2>
            <button
              onClick={loadSampleContent}
              className="text-sm text-primary hover:underline hover:text-primary/80 transition-colors"
            >
              Load sample content
            </button>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="w-full px-4 py-3 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm placeholder:text-muted-foreground"
            placeholder="Paste your blog post or article content here..."
          />

          <div className="flex items-center gap-4">
            <button
              onClick={handlePreview}
              disabled={loading || !content.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Preview Links
                </>
              )}
            </button>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          {result ? (
            <>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-card border border-border rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{result.stats.totalKeywordsFound}</p>
                  <p className="text-xs text-muted-foreground">Keywords Found</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-500">
                    {result.stats.linksInserted}
                  </p>
                  <p className="text-xs text-green-500/60">Links Inserted</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {result.stats.linksSkipped}
                  </p>
                  <p className="text-xs text-yellow-600/60 dark:text-yellow-400/60">Skipped</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{result.stats.processingTimeMs}ms</p>
                  <p className="text-xs text-muted-foreground">Processing Time</p>
                </div>
              </div>

              {/* Inserted Links */}
              {result.insertedLinks.length > 0 && (
                <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    Inserted Links ({result.insertedLinks.length})
                  </h3>
                  <div className="space-y-2">
                    {result.insertedLinks.map((link, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm border border-border/50"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="font-medium">&quot;{link.keyword}&quot;</span>
                        </div>
                        <span className="text-muted-foreground font-mono text-xs">
                          /go/{link.shortCode}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview Tabs */}
              <div>
                <div className="flex border-b border-border mb-4">
                  <button
                    onClick={() => setActiveTab("preview")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === "preview"
                        ? "text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Processed Content
                  </button>
                  <button
                    onClick={() => setActiveTab("original")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === "original"
                        ? "text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Original
                  </button>
                </div>

                <div
                  className="bg-card rounded-xl p-4 border border-border max-h-[400px] overflow-y-auto font-mono text-sm"
                  dangerouslySetInnerHTML={{
                    __html:
                      activeTab === "preview"
                        ? result.processedContent
                            .replace(/\n/g, "<br>")
                            .replace(
                              /class="affiliate-link"/g,
                              'class="affiliate-link" style="color: #10b981; border-bottom: 1px dashed #10b98180;"'
                            )
                        : result.originalContent.replace(/\n/g, "<br>"),
                  }}
                />
              </div>

              {/* Style Preview */}
              <div className="text-xs text-muted-foreground">
                <p>
                  💡 Links are styled with <code className="bg-muted px-1 rounded border border-border">.affiliate-link</code> class.
                  Asterisks (*) indicate affiliate links for FTC compliance.
                </p>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-center py-20 border border-dashed border-border rounded-xl bg-muted/20">
              <div>
                <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Enter content and click &quot;Preview Links&quot; to see results
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Configuration Info */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
        <h3 className="font-semibold mb-4 text-foreground">Auto-Linking Configuration</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Max Links per Page</p>
            <p className="text-lg font-semibold text-foreground">10</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Max per Paragraph</p>
            <p className="text-lg font-semibold text-foreground">2</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Min Words Between</p>
            <p className="text-lg font-semibold text-foreground">50</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Excluded Elements</p>
            <p className="text-lg font-semibold text-foreground">code, pre, h1-h3</p>
          </div>
        </div>
      </div>
    </div>
  );
}
