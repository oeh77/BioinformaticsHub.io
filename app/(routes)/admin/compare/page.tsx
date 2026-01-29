"use client";

import { 
  Scale, 
  Eye, 
  ExternalLink, 
  Search, 
  Filter, 
  Plus, 
  X, 
  Star, 
  Trash2,
  GripVertical,
  CheckCircle,
  XCircle,
  Minus,
  Sparkles,
  Save,
  Edit,
  AlertTriangle,
  MoreVertical
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ComparisonItem {
  id: string;
  title: string;
  category: string;
  isFeatured: boolean;
  description?: string;
  tool1?: ToolData;
  tool2?: ToolData;
  features?: FeatureRow[];
  seoTitle?: string;
  seoDescription?: string;
}

// This is a static list from the public compare page
// In a full implementation, this would be fetched from a database
const initialComparisons: ComparisonItem[] = [
  { id: "blast-vs-bwa", title: "BLAST vs BWA", category: "Sequence Alignment", isFeatured: true },
  { id: "bowtie-vs-star", title: "Bowtie2 vs STAR", category: "RNA-Seq Alignment", isFeatured: false },
  { id: "galaxy-vs-clc", title: "Galaxy vs CLC Genomics Workbench", category: "Analysis Platforms", isFeatured: true },
  { id: "geneious-vs-snapgene", title: "Geneious Prime vs SnapGene", category: "Molecular Biology", isFeatured: false },
  { id: "samtools-vs-picard", title: "SAMtools vs Picard", category: "BAM/SAM Processing", isFeatured: false },
  { id: "gatk-vs-deepvariant", title: "GATK vs DeepVariant", category: "Variant Calling", isFeatured: true },
  { id: "bioconductor-vs-biopython", title: "Bioconductor vs Biopython", category: "Programming Libraries", isFeatured: false },
  { id: "illumina-vs-oxford-nanopore", title: "Illumina vs Oxford Nanopore", category: "Sequencing Platforms", isFeatured: true },
  { id: "ensembl-vs-ucsc", title: "Ensembl vs UCSC Genome Browser", category: "Genome Browsers", isFeatured: false },
  { id: "clustal-vs-mafft", title: "Clustal Omega vs MAFFT", category: "Multiple Sequence Alignment", isFeatured: false },
  { id: "alphafold-vs-rosetta", title: "AlphaFold vs Rosetta", category: "Protein Structure", isFeatured: true },
  { id: "megahit-vs-spades", title: "MEGAHIT vs SPAdes", category: "Genome Assembly", isFeatured: false },
  { id: "salmon-vs-kallisto", title: "Salmon vs Kallisto", category: "RNA-Seq Quantification", isFeatured: false },
  { id: "deseq2-vs-edger", title: "DESeq2 vs edgeR", category: "Differential Expression", isFeatured: false },
  { id: "fastqc-vs-multiqc", title: "FastQC vs MultiQC", category: "Quality Control", isFeatured: false },
  { id: "qiime2-vs-mothur", title: "QIIME 2 vs mothur", category: "Microbiome Analysis", isFeatured: false },
  { id: "kraken2-vs-metaphlan", title: "Kraken2 vs MetaPhlAn", category: "Taxonomic Classification", isFeatured: false },
  { id: "cytoscape-vs-gephi", title: "Cytoscape vs Gephi", category: "Network Analysis", isFeatured: false },
  { id: "nextflow-vs-snakemake", title: "Nextflow vs Snakemake", category: "Workflow Management", isFeatured: true },
  { id: "igv-vs-jbrowse", title: "IGV vs JBrowse2", category: "Genome Visualization", isFeatured: false },
  { id: "trimmomatic-vs-fastp", title: "Trimmomatic vs fastp", category: "Read Preprocessing", isFeatured: false },
  { id: "interpro-vs-pfam", title: "InterPro vs Pfam", category: "Protein Annotation", isFeatured: false },
  { id: "kegg-vs-reactome", title: "KEGG vs Reactome", category: "Pathway Databases", isFeatured: false },
  { id: "seurat-vs-scanpy", title: "Seurat vs Scanpy", category: "Single-Cell Analysis", isFeatured: true },
  { id: "prokka-vs-bakta", title: "Prokka vs Bakta", category: "Genome Annotation", isFeatured: false },
];

const categoryOptions = [
  "Sequence Alignment",
  "RNA-Seq Alignment",
  "Analysis Platforms",
  "Molecular Biology",
  "BAM/SAM Processing",
  "Variant Calling",
  "Programming Libraries",
  "Sequencing Platforms",
  "Genome Browsers",
  "Multiple Sequence Alignment",
  "Protein Structure",
  "Genome Assembly",
  "RNA-Seq Quantification",
  "Differential Expression",
  "Quality Control",
  "Microbiome Analysis",
  "Taxonomic Classification",
  "Network Analysis",
  "Workflow Management",
  "Genome Visualization",
  "Read Preprocessing",
  "Protein Annotation",
  "Pathway Databases",
  "Single-Cell Analysis",
  "Genome Annotation",
];

interface ToolData {
  name: string;
  tagline: string;
  pricing: string;
  bestFor: string;
  pros: string[];
  cons: string[];
}

interface FeatureRow {
  name: string;
  tool1Value: "yes" | "no" | "partial";
  tool2Value: "yes" | "no" | "partial";
}

interface ComparisonFormData {
  id?: string;
  title: string;
  category: string;
  description: string;
  isFeatured: boolean;
  tool1: ToolData;
  tool2: ToolData;
  features: FeatureRow[];
  seoTitle: string;
  seoDescription: string;
}

const initialFormData: ComparisonFormData = {
  title: "",
  category: "",
  description: "",
  isFeatured: false,
  tool1: {
    name: "",
    tagline: "",
    pricing: "Free",
    bestFor: "",
    pros: [""],
    cons: [""],
  },
  tool2: {
    name: "",
    tagline: "",
    pricing: "Free",
    bestFor: "",
    pros: [""],
    cons: [""],
  },
  features: [
    { name: "", tool1Value: "yes", tool2Value: "yes" },
  ],
  seoTitle: "",
  seoDescription: "",
};

export default function AdminComparePage() {
  const [comparisons, setComparisons] = useState<ComparisonItem[]>(initialComparisons);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingComparison, setEditingComparison] = useState<ComparisonItem | null>(null);
  const [formData, setFormData] = useState<ComparisonFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState<"basic" | "tool1" | "tool2" | "features" | "seo">("basic");
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingComparison, setDeletingComparison] = useState<ComparisonItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const categories = [...new Set(comparisons.map(c => c.category))].sort();

  const filteredComparisons = comparisons.filter(comparison => {
    const matchesSearch = comparison.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          comparison.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || comparison.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredCount = comparisons.filter(c => c.isFeatured).length;

  const openCreateModal = () => {
    setEditingComparison(null);
    setFormData(initialFormData);
    setActiveTab("basic");
    setShowModal(true);
  };

  const openEditModal = (comparison: ComparisonItem) => {
    setEditingComparison(comparison);
    setFormData({
      id: comparison.id,
      title: comparison.title,
      category: comparison.category,
      description: comparison.description || "",
      isFeatured: comparison.isFeatured,
      tool1: comparison.tool1 || {
        name: comparison.title.split(" vs ")[0] || "",
        tagline: "",
        pricing: "Free",
        bestFor: "",
        pros: [""],
        cons: [""],
      },
      tool2: comparison.tool2 || {
        name: comparison.title.split(" vs ")[1] || "",
        tagline: "",
        pricing: "Free",
        bestFor: "",
        pros: [""],
        cons: [""],
      },
      features: comparison.features || [{ name: "", tool1Value: "yes", tool2Value: "yes" }],
      seoTitle: comparison.seoTitle || "",
      seoDescription: comparison.seoDescription || "",
    });
    setActiveTab("basic");
    setShowModal(true);
    setOpenDropdown(null);
  };

  const openDeleteModal = (comparison: ComparisonItem) => {
    setDeletingComparison(comparison);
    setShowDeleteModal(true);
    setOpenDropdown(null);
  };

  const handleSaveComparison = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (editingComparison) {
      // Update existing comparison
      setComparisons(prev => prev.map(c => 
        c.id === editingComparison.id 
          ? {
              ...c,
              title: formData.title,
              category: formData.category,
              isFeatured: formData.isFeatured,
              description: formData.description,
              tool1: formData.tool1,
              tool2: formData.tool2,
              features: formData.features,
              seoTitle: formData.seoTitle,
              seoDescription: formData.seoDescription,
            }
          : c
      ));
    } else {
      // Create new comparison
      const newId = formData.title.toLowerCase().replace(/\s+vs\s+/gi, "-vs-").replace(/\s+/g, "-");
      setComparisons(prev => [
        {
          id: newId,
          title: formData.title,
          category: formData.category,
          isFeatured: formData.isFeatured,
          description: formData.description,
          tool1: formData.tool1,
          tool2: formData.tool2,
          features: formData.features,
          seoTitle: formData.seoTitle,
          seoDescription: formData.seoDescription,
        },
        ...prev,
      ]);
    }

    setSaving(false);
    setShowModal(false);
    setFormData(initialFormData);
    setEditingComparison(null);
  };

  const handleDeleteComparison = async () => {
    if (!deletingComparison) return;
    
    setDeleting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setComparisons(prev => prev.filter(c => c.id !== deletingComparison.id));
    
    setDeleting(false);
    setShowDeleteModal(false);
    setDeletingComparison(null);
  };

  const toggleFeatured = (id: string) => {
    setComparisons(prev => prev.map(c => 
      c.id === id ? { ...c, isFeatured: !c.isFeatured } : c
    ));
  };

  const updateTool = (tool: "tool1" | "tool2", field: keyof ToolData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [tool]: {
        ...prev[tool],
        [field]: value,
      },
    }));
  };

  const addProCon = (tool: "tool1" | "tool2", type: "pros" | "cons") => {
    setFormData(prev => ({
      ...prev,
      [tool]: {
        ...prev[tool],
        [type]: [...prev[tool][type], ""],
      },
    }));
  };

  const removeProCon = (tool: "tool1" | "tool2", type: "pros" | "cons", index: number) => {
    setFormData(prev => ({
      ...prev,
      [tool]: {
        ...prev[tool],
        [type]: prev[tool][type].filter((_, i) => i !== index),
      },
    }));
  };

  const updateProCon = (tool: "tool1" | "tool2", type: "pros" | "cons", index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [tool]: {
        ...prev[tool],
        [type]: prev[tool][type].map((item, i) => i === index ? value : item),
      },
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, { name: "", tool1Value: "yes", tool2Value: "yes" }],
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const updateFeature = (index: number, field: keyof FeatureRow, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => 
        i === index ? { ...feature, [field]: value } : feature
      ),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Scale className="w-7 h-7 text-primary" />
            Tool Comparisons
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage bioinformatics tool comparison pages
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 rounded-lg font-medium transition-all shadow-lg shadow-primary/25"
          >
            <Plus className="w-4 h-4" />
            Create Featured Comparison
          </button>
          <Link 
            href="/compare" 
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Public Page
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/20">
              <Scale className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{comparisons.length}</p>
              <p className="text-sm text-muted-foreground">Total Comparisons</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-yellow-500/20">
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{featuredCount}</p>
              <p className="text-sm text-muted-foreground">Featured</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-accent/20">
              <Filter className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{categories.length}</p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-green-500/20">
              <Eye className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">All</p>
              <p className="text-sm text-muted-foreground">Published</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search comparisons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          title="Filter by category"
          className="px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Comparisons List */}
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Comparison</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Featured</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredComparisons.map((comparison) => (
                <tr key={comparison.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Scale className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="font-medium">{comparison.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2.5 py-1 bg-white/10 rounded-full">
                      {comparison.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleFeatured(comparison.id)}
                      className={`flex items-center gap-1.5 text-sm transition-colors ${
                        comparison.isFeatured 
                          ? "text-yellow-400 hover:text-yellow-300" 
                          : "text-muted-foreground hover:text-yellow-400"
                      }`}
                      title={comparison.isFeatured ? "Remove from featured" : "Mark as featured"}
                    >
                      <Star className={`w-4 h-4 ${comparison.isFeatured ? "fill-current" : ""}`} />
                      {comparison.isFeatured ? "Featured" : "—"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-green-400 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                      Published
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/compare#${comparison.id}`}
                        target="_blank"
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-lg transition-colors"
                        title="View comparison"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => openEditModal(comparison)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Edit comparison"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(comparison)}
                        className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete comparison"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredComparisons.length === 0 && (
          <div className="text-center py-12">
            <Scale className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No comparisons found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingComparison && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card text-card-foreground rounded-xl border border-border w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-500/20 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Delete Comparison</h3>
                  <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete <strong className="text-foreground">&quot;{deletingComparison.title}&quot;</strong>? 
                This will permanently remove this comparison from the system.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingComparison(null);
                  }}
                  disabled={deleting}
                  className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteComparison}
                  disabled={deleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? "Deleting..." : "Delete Comparison"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Comparison Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card text-card-foreground rounded-2xl border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/10 to-accent/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  {editingComparison ? <Edit className="w-5 h-5 text-primary" /> : <Sparkles className="w-5 h-5 text-primary" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {editingComparison ? "Edit Comparison" : "Create Featured Comparison"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {editingComparison 
                      ? `Editing: ${editingComparison.title}`
                      : "Add a new tool comparison with advanced features"
                    }
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingComparison(null);
                  setFormData(initialFormData);
                }} 
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Close modal"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border overflow-x-auto">
              {[
                { id: "basic", label: "Basic Info" },
                { id: "tool1", label: formData.tool1.name || "Tool 1" },
                { id: "tool2", label: formData.tool2.name || "Tool 2" },
                { id: "features", label: "Feature Matrix" },
                { id: "seo", label: "SEO" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-b-2 border-primary text-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-220px)]">
              {/* Basic Info Tab */}
              {activeTab === "basic" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-2">Comparison Title *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., BLAST vs BWA"
                        className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        title="Select category"
                        className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="">Select a category</option>
                        {categoryOptions.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isFeatured}
                          onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                          className="w-5 h-5 rounded border-input accent-primary"
                        />
                        <span className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          Mark as Featured
                        </span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      placeholder="Brief description of what this comparison covers..."
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Tool 1 Tab */}
              {activeTab === "tool1" && (
                <ToolForm
                  tool={formData.tool1}
                  toolNum={1}
                  updateTool={(field, value) => updateTool("tool1", field, value)}
                  addProCon={(type) => addProCon("tool1", type)}
                  removeProCon={(type, index) => removeProCon("tool1", type, index)}
                  updateProCon={(type, index, value) => updateProCon("tool1", type, index, value)}
                />
              )}

              {/* Tool 2 Tab */}
              {activeTab === "tool2" && (
                <ToolForm
                  tool={formData.tool2}
                  toolNum={2}
                  updateTool={(field, value) => updateTool("tool2", field, value)}
                  addProCon={(type) => addProCon("tool2", type)}
                  removeProCon={(type, index) => removeProCon("tool2", type, index)}
                  updateProCon={(type, index, value) => updateProCon("tool2", type, index, value)}
                />
              )}

              {/* Features Tab */}
              {activeTab === "features" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Feature Comparison Matrix</h3>
                      <p className="text-sm text-muted-foreground">Define features and mark support for each tool</p>
                    </div>
                    <button
                      onClick={addFeature}
                      className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 text-primary hover:bg-primary/30 rounded-lg text-sm transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Feature
                    </button>
                  </div>

                  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground w-8"></th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Feature Name</th>
                          <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground w-32">
                            {formData.tool1.name || "Tool 1"}
                          </th>
                          <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground w-32">
                            {formData.tool2.name || "Tool 2"}
                          </th>
                          <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground w-20">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {formData.features.map((feature, index) => (
                          <tr key={index} className="hover:bg-white/5">
                            <td className="px-4 py-3">
                              <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={feature.name}
                                onChange={(e) => updateFeature(index, "name", e.target.value)}
                                placeholder="e.g., Open Source"
                                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <select
                                value={feature.tool1Value}
                                onChange={(e) => updateFeature(index, "tool1Value", e.target.value)}
                                title="Tool 1 support"
                                className="px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                              >
                                <option value="yes">✓ Yes</option>
                                <option value="no">✗ No</option>
                                <option value="partial">◐ Partial</option>
                              </select>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <select
                                value={feature.tool2Value}
                                onChange={(e) => updateFeature(index, "tool2Value", e.target.value)}
                                title="Tool 2 support"
                                className="px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                              >
                                <option value="yes">✓ Yes</option>
                                <option value="no">✗ No</option>
                                <option value="partial">◐ Partial</option>
                              </select>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => removeFeature(index)}
                                disabled={formData.features.length === 1}
                                className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Remove feature"
                                aria-label="Remove feature"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Yes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-sm">No</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Minus className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm">Partial</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SEO Tab */}
              {activeTab === "seo" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">SEO Title</label>
                    <input
                      type="text"
                      value={formData.seoTitle}
                      onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                      placeholder="Custom SEO title (leave blank to auto-generate)"
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.seoTitle.length}/60 characters
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">SEO Description</label>
                    <textarea
                      value={formData.seoDescription}
                      onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                      rows={3}
                      placeholder="Custom meta description for search engines..."
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.seoDescription.length}/160 characters
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Search Preview</h4>
                    <div className="space-y-1">
                      <p className="text-blue-400 text-lg font-medium truncate">
                        {formData.seoTitle || formData.title || "Comparison Title"} | BioinformaticsHub.io
                      </p>
                      <p className="text-green-400 text-sm">
                        https://bioinformaticshub.io/compare/{formData.title.toLowerCase().replace(/\s+vs\s+/gi, "-vs-").replace(/\s+/g, "-") || "tool1-vs-tool2"}
                      </p>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {formData.seoDescription || formData.description || "Compare the top bioinformatics tools and platforms side by side..."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-border flex items-center justify-between bg-white/5">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingComparison(null);
                  setFormData(initialFormData);
                }}
                className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors"
              >
                Cancel
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const tabs = ["basic", "tool1", "tool2", "features", "seo"] as const;
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex < tabs.length - 1) {
                      setActiveTab(tabs[currentIndex + 1]);
                    }
                  }}
                  disabled={activeTab === "seo"}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  Next Step
                </button>
                <button
                  onClick={handleSaveComparison}
                  disabled={saving || !formData.title || !formData.category}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 rounded-lg font-medium transition-all disabled:opacity-50 shadow-lg shadow-primary/25"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : editingComparison ? "Update Comparison" : "Create Comparison"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Tool Form Component
function ToolForm({
  tool,
  toolNum,
  updateTool,
  addProCon,
  removeProCon,
  updateProCon,
}: {
  tool: ToolData;
  toolNum: number;
  updateTool: (field: keyof ToolData, value: string | string[]) => void;
  addProCon: (type: "pros" | "cons") => void;
  removeProCon: (type: "pros" | "cons", index: number) => void;
  updateProCon: (type: "pros" | "cons", index: number, value: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-border">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
          {toolNum}
        </div>
        <h3 className="font-semibold">Tool {toolNum} Details</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Tool Name *</label>
          <input
            type="text"
            value={tool.name}
            onChange={(e) => updateTool("name", e.target.value)}
            placeholder="e.g., BLAST"
            className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Tagline</label>
          <input
            type="text"
            value={tool.tagline}
            onChange={(e) => updateTool("tagline", e.target.value)}
            placeholder="e.g., Sequence Similarity Search"
            className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Pricing</label>
          <select
            value={tool.pricing}
            onChange={(e) => updateTool("pricing", e.target.value)}
            title="Select pricing model"
            className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="Free">Free</option>
            <option value="Freemium">Freemium</option>
            <option value="Paid">Paid</option>
            <option value="Free/Paid">Free/Paid</option>
            <option value="Open Source">Open Source</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Best For</label>
          <input
            type="text"
            value={tool.bestFor}
            onChange={(e) => updateTool("bestFor", e.target.value)}
            placeholder="e.g., Finding homologous sequences"
            className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Pros */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            Pros
          </label>
          <button
            onClick={() => addProCon("pros")}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            + Add Pro
          </button>
        </div>
        <div className="space-y-2">
          {tool.pros.map((pro, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={pro}
                onChange={(e) => updateProCon("pros", index, e.target.value)}
                placeholder="Enter a pro..."
                className="flex-1 px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                onClick={() => removeProCon("pros", index)}
                disabled={tool.pros.length === 1}
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30"
                title="Remove pro"
                aria-label="Remove pro"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Cons */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-400" />
            Cons
          </label>
          <button
            onClick={() => addProCon("cons")}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            + Add Con
          </button>
        </div>
        <div className="space-y-2">
          {tool.cons.map((con, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={con}
                onChange={(e) => updateProCon("cons", index, e.target.value)}
                placeholder="Enter a con..."
                className="flex-1 px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                onClick={() => removeProCon("cons", index)}
                disabled={tool.cons.length === 1}
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30"
                title="Remove con"
                aria-label="Remove con"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
