
import { PageHeader } from "@/components/ui/page-header";
import { BookOpen, Search, ArrowRight, Dna, FileText } from "lucide-react";

export const metadata = {
  title: "Bioinformatics Glossary | BioinformaticsHub",
  description: "Comprehensive glossary of bioinformatics terms, definitions, and concepts.",
};

const glossaryTerms = [
  {
    letter: "A",
    terms: [
      {
        term: "Accession Number",
        definition: "A unique identifier assigned to a sequence record in databases like GenBank or RefSeq (e.g., M12345, AC123456)."
      },
      {
        term: "Algorithm",
        definition: "A step-by-step procedure or set of rules for solving a problem or making a calculation, commonly used in bioinformatics for sequence alignment and data analysis."
      },
      {
        term: "Alignment",
        definition: "The process of arranging sequences of DNA, RNA, or protein to identify regions of similarity that may be a consequence of functional, structural, or evolutionary relationships."
      },
      {
        term: "Annotation",
        definition: "The process of identifying the locations of genes and all of the coding regions in a genome and determining what those genes do."
      },
      {
        term: "Assembly",
        definition: "The process of putting together small fragments of DNA sequences into a long, continuous sequence or a complete genome."
      }
    ]
  },
  {
    letter: "B",
    terms: [
      {
        term: "Base Pair (bp)",
        definition: "Two nitrogenous bases joined by hydrogen bonds; the unit of DNA length. Adenine pairs with Thymine (A-T) and Guanine pairs with Cytosine (G-C)."
      },
      {
        term: "Bioinformatics",
        definition: "An interdisciplinary field that develops methods and software tools for understanding biological data, particularly when the data sets are large and complex."
      },
      {
        term: "BLAST (Basic Local Alignment Search Tool)",
        definition: "A popular algorithm for comparing primary biological sequence information, such as the amino-acid sequences of proteins or the nucleotides of DNA sequences."
      }
    ]
  },
  {
    letter: "C",
    terms: [
      {
        term: "Central Dogma",
        definition: "The framework for understanding the transfer of sequence information. It states that DNA makes RNA, and RNA makes protein."
      },
      {
        term: "Clustering",
        definition: "The grouping of similar data points (e.g., gene expression profiles) into clusters, often used to find patterns in high-throughput data."
      },
      {
        term: "Codon",
        definition: "A sequence of three nucleotides which together form a unit of genetic code in a DNA or RNA molecule."
      },
      {
        term: "Contig",
        definition: "A set of overlapping DNA segments that together represent a consensus region of DNA."
      },
      {
        term: "Coverage",
        definition: "The number of times a specific nucleotide is sequenced in a sequencing experiment (e.g., 30x coverage)."
      }
    ]
  },
  {
    letter: "D",
    terms: [
      {
        term: "Data Mining",
        definition: "The computational process of discovering patterns in large data sets involving methods at the intersection of machine learning, statistics, and database systems."
      },
      {
        term: "De Novo Assembly",
        definition: "Assembling short reads to create full-length sequences without using a reference genome."
      },
      {
        term: "DNA (Deoxyribonucleic Acid)",
        definition: "The molecule that carries the genetic instructions used in the growth, development, functioning, and reproduction of all known living organisms."
      }
    ]
  },
  {
    letter: "E",
    terms: [
      {
        term: "E-value (Expect Value)",
        definition: "A parameter in BLAST searches that describes the number of hits one can expect to see by chance when searching a database of a particular size."
      },
      {
        term: "Exon",
        definition: "A segment of a DNA or RNA molecule containing information coding for a protein or peptide sequence."
      },
      {
        term: "Expression",
        definition: "The process by which information from a gene is used in the synthesis of a functional gene product (RNA or protein)."
      }
    ]
  },
  {
    letter: "G",
    terms: [
      {
        term: "Gene",
        definition: "A distinct sequence of nucleotides forming part of a chromosome, the order of which determines the order of monomers in a polypeptide or nucleic acid molecule."
      },
      {
        term: "Genome",
        definition: "The haploid set of chromosomes in a gamete or microorganism, or in each cell of a multicellular organism; the complete set of genes or genetic material present in a cell or organism."
      },
      {
        term: "Genomics",
        definition: "The branch of molecular biology concerned with the structure, function, evolution, and mapping of genomes."
      },
      {
        term: "Genotype",
        definition: "The genetic constitution of an individual organism."
      }
    ]
  },
  {
    letter: "H",
    terms: [
      {
        term: "Hidden Markov Model (HMM)",
        definition: "A statistical model used to describe the evolution of observable events that depend on internal factors, which are not directly observable. Widely used for sequence analysis (e.g., gene finding)."
      },
      {
        term: "High-Throughput Sequencing",
        definition: "Technologies that sequence DNA and RNA much more quickly and cheaply than the previously used Sanger sequencing, revolutionizing the study of genomics."
      },
      {
        term: "Homology",
        definition: "Similarity in sequence of a protein or nucleic acid between organisms of the same or different species."
      }
    ]
  },
  {
    letter: "I",
    terms: [
      {
        term: "Indel",
        definition: "A molecular biology term for an insertion or deletion of bases in the genome of an organism."
      },
      {
        term: "Intron",
        definition: "A segment of a DNA or RNA molecule which does not code for proteins and interrupts the sequence of genes."
      }
    ]
  },
  {
    letter: "M",
    terms: [
      {
        term: "Machine Learning",
        definition: "The study of computer algorithms that improve automatically through experience and by the use of data. Essential for predictive modeling in bioinformatics."
      },
      {
        term: "Metagenomics",
        definition: "The study of genetic material recovered directly from environmental samples."
      },
      {
        term: "Motif",
        definition: "A nucleotide or amino-acid sequence pattern that is widespread and usually doubles as a biological significance."
      },
      {
        term: "Mutation",
        definition: "The changing of the structure of a gene, resulting in a variant form that may be transmitted to subsequent generations."
      }
    ]
  },
  {
    letter: "N",
    terms: [
      {
        term: "Next-Generation Sequencing (NGS)",
        definition: "Also known as high-throughput sequencing, the catch-all term used to describe a number of different modern sequencing technologies."
      },
      {
        term: "Nucleotide",
        definition: "The basic building block of nucleic acids (DNA and RNA)."
      }
    ]
  },
  {
    letter: "O",
    terms: [
      {
        term: "Omics",
        definition: "A suffix used in biology to refer to a field of study in biology ending in -omics, such as genomics, proteomics, or metabolomics."
      },
      {
        term: "Open Reading Frame (ORF)",
        definition: "A part of a reading frame that leads to the translatable part of an RNA sequence."
      },
      {
        term: "Orthologs",
        definition: "Genes in different species that evolved from a common ancestral gene by speciation."
      }
    ]
  },
  {
    letter: "P",
    terms: [
      {
        term: "Paralogs",
        definition: "Genes related by duplication within a genome."
      },
      {
        term: "Phylogenetics",
        definition: "The study of the evolutionary history and relationships among or within groups of organisms."
      },
      {
        term: "Proteomics",
        definition: "The large-scale study of proteins."
      }
    ]
  },
  {
    letter: "R",
    terms: [
      {
        term: "Read",
        definition: "A sequence of nucleotides generated from a single DNA fragment in a sequencing experiment."
      },
      {
        term: "Reference Genome",
        definition: "A digital nucleic acid sequence database, assembled by scientists as a representative example of a species' set of genes."
      },
      {
        term: "RNA-Seq",
        definition: "A technique used to analyze the continuously changing cellular transcriptome."
      }
    ]
  },
  {
    letter: "S",
    terms: [
      {
        term: "Sequence Alignment",
        definition: "A way of arranging the sequences of DNA, RNA, or protein to identify regions of similarity."
      },
      {
        term: "SNP (Single Nucleotide Polymorphism)",
        definition: "A variation in a single nucleotide that occurs at a specific position in the genome."
      }
    ]
  },
  {
    letter: "T",
    terms: [
      {
        term: "Transcriptomics",
        definition: "The study of the transcriptome, the complete set of RNA transcripts that are produced by the genome."
      },
      {
        term: "Translation",
        definition: "The process of translating the sequence of a messenger RNA (mRNA) molecule to a sequence of amino acids during protein synthesis."
      }
    ]
  },
  {
    letter: "V",
    terms: [
      {
        term: "Variant Calling",
        definition: "The process of identifying variants from sequence data."
      }
    ]
  }
];

export default function GlossaryPage() {
  return (
    <div className="min-h-screen pb-20">
      <PageHeader 
        title="Bioinformatics Glossary"
        subtitle="Your essential dictionary for navigating the complex terminology of computational biology."
        backgroundImage="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1600&auto=format&fit=crop&q=80"
      />

      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Alphabet Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 rounded-2xl sticky top-24 shadow-lg">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                Jump to Letter
              </h3>
              <div className="flex flex-wrap gap-2">
                {glossaryTerms.map((group) => (
                  <a 
                    key={group.letter}
                    href={`#letter-${group.letter}`}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary/50 hover:bg-primary/20 hover:text-primary transition-colors text-sm font-medium border border-white/5"
                  >
                    {group.letter}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Terms Content */}
          <div className="lg:col-span-3 space-y-12">
            {glossaryTerms.map((group) => (
              <div key={group.letter} id={`letter-${group.letter}`} className="scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-2xl font-bold text-primary shadow-inner">
                    {group.letter}
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                </div>

                <div className="grid gap-6">
                  {group.terms.map((item, idx) => (
                    <div key={idx} className="glass-card p-6 rounded-xl hover:border-primary/30 transition-all duration-300 group">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          <BookOpen className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors opacity-50 group-hover:opacity-100" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors font-mono">
                            {item.term}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {item.definition}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
