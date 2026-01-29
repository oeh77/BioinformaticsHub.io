/**
 * Content SEO Analyzer
 * 
 * Analyzes content for SEO quality and provides recommendations:
 * - Keyword density analysis
 * - Readability scoring
 * - Content quality metrics
 * - SEO score calculation
 */

export interface ContentAnalysis {
  score: number; // 0-100
  wordCount: number;
  readingTime: number; // minutes
  keywordDensity: Record<string, number>;
  readability: {
    score: number;
    level: "easy" | "moderate" | "difficult";
    avgSentenceLength: number;
    avgWordLength: number;
  };
  issues: SEOIssue[];
  suggestions: string[];
}

export interface SEOIssue {
  type: "error" | "warning" | "info";
  message: string;
  field?: string;
}

// Scientific/bioinformatics stopwords to ignore in keyword analysis
const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
  "be", "have", "has", "had", "do", "does", "did", "will", "would",
  "could", "should", "may", "might", "must", "can", "this", "that",
  "these", "those", "it", "its", "they", "them", "their", "we", "our",
  "you", "your", "he", "she", "his", "her", "which", "who", "whom",
  "what", "when", "where", "why", "how", "all", "each", "every", "both",
  "few", "more", "most", "other", "some", "such", "no", "not", "only",
  "same", "so", "than", "too", "very", "just", "also", "now", "here",
]);

/**
 * Analyze content for SEO quality
 */
export function analyzeContent(content: {
  title: string;
  description?: string;
  body: string;
  targetKeyword?: string;
}): ContentAnalysis {
  const { title, description = "", body, targetKeyword } = content;
  const issues: SEOIssue[] = [];
  const suggestions: string[] = [];

  // Word count
  const words = body.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;

  // Reading time (200 words per minute average)
  const readingTime = Math.ceil(wordCount / 200);

  // Keyword density
  const keywordDensity = calculateKeywordDensity(body);

  // Readability
  const readability = calculateReadability(body);

  // Title analysis
  if (title.length < 30) {
    issues.push({
      type: "warning",
      message: "Title is too short. Aim for 50-60 characters.",
      field: "title",
    });
  } else if (title.length > 60) {
    issues.push({
      type: "warning",
      message: "Title may be truncated in search results (>60 chars).",
      field: "title",
    });
  }

  // Description analysis
  if (!description) {
    issues.push({
      type: "error",
      message: "Missing meta description.",
      field: "description",
    });
  } else if (description.length < 120) {
    issues.push({
      type: "warning",
      message: "Meta description is too short. Aim for 150-160 characters.",
      field: "description",
    });
  } else if (description.length > 160) {
    issues.push({
      type: "warning",
      message: "Meta description may be truncated (>160 chars).",
      field: "description",
    });
  }

  // Content length analysis
  if (wordCount < 300) {
    issues.push({
      type: "error",
      message: `Content is too thin (${wordCount} words). Aim for at least 800 words.`,
      field: "body",
    });
    suggestions.push("Add more detailed explanations, examples, or related topics.");
  } else if (wordCount < 800) {
    issues.push({
      type: "warning",
      message: `Content could be longer (${wordCount} words). Aim for 800+ words for better ranking.`,
      field: "body",
    });
  }

  // Target keyword analysis
  if (targetKeyword) {
    const keywordLower = targetKeyword.toLowerCase();
    const density = keywordDensity[keywordLower] || 0;

    if (!title.toLowerCase().includes(keywordLower)) {
      issues.push({
        type: "warning",
        message: `Target keyword "${targetKeyword}" not found in title.`,
        field: "title",
      });
    }

    if (description && !description.toLowerCase().includes(keywordLower)) {
      issues.push({
        type: "info",
        message: `Consider adding target keyword to meta description.`,
        field: "description",
      });
    }

    if (density < 0.5) {
      suggestions.push(`Increase usage of target keyword "${targetKeyword}" (currently ${density.toFixed(1)}%).`);
    } else if (density > 3) {
      issues.push({
        type: "warning",
        message: `Keyword stuffing detected. "${targetKeyword}" appears too frequently (${density.toFixed(1)}%).`,
        field: "body",
      });
    }
  }

  // Heading structure check
  const hasH1 = /<h1[^>]*>/i.test(body);
  const hasH2 = /<h2[^>]*>/i.test(body);
  
  if (!hasH1 && !title) {
    issues.push({
      type: "warning",
      message: "No H1 heading found in content.",
      field: "body",
    });
  }

  if (!hasH2 && wordCount > 500) {
    suggestions.push("Add H2 subheadings to break up content and improve readability.");
  }

  // Internal links check
  const internalLinks = (body.match(/href=["'][^"']*[^"']+["']/gi) || []).length;
  if (internalLinks < 2 && wordCount > 500) {
    suggestions.push("Add more internal links to related content (aim for 3-5 per article).");
  }

  // External links check
  const externalLinks = (body.match(/href=["']https?:\/\/[^"']+["']/gi) || []).length;
  if (externalLinks < 1 && wordCount > 500) {
    suggestions.push("Consider linking to authoritative external sources.");
  }

  // Calculate overall score
  const score = calculateSEOScore({
    titleScore: title.length >= 30 && title.length <= 60 ? 20 : 10,
    descriptionScore: description && description.length >= 120 && description.length <= 160 ? 15 : 5,
    contentScore: Math.min(25, (wordCount / 800) * 25),
    readabilityScore: readability.score >= 60 ? 20 : 10,
    keywordScore: targetKeyword && keywordDensity[targetKeyword.toLowerCase()] ? 10 : 5,
    structureScore: hasH2 ? 10 : 5,
  });

  return {
    score,
    wordCount,
    readingTime,
    keywordDensity,
    readability,
    issues,
    suggestions,
  };
}

/**
 * Calculate keyword density for all significant words
 */
function calculateKeywordDensity(text: string): Record<string, number> {
  const cleanText = text
    .replace(/<[^>]+>/g, " ") // Remove HTML tags
    .replace(/[^\w\s]/g, " ") // Remove punctuation
    .toLowerCase();

  const words = cleanText.split(/\s+/).filter((w) => w.length > 2 && !STOPWORDS.has(w));
  const totalWords = words.length;

  if (totalWords === 0) return {};

  const wordCounts: Record<string, number> = {};
  for (const word of words) {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  }

  const density: Record<string, number> = {};
  for (const [word, count] of Object.entries(wordCounts)) {
    if (count >= 2) {
      density[word] = (count / totalWords) * 100;
    }
  }

  // Sort by density and take top 20
  return Object.fromEntries(
    Object.entries(density)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
  );
}

/**
 * Calculate readability score (simplified Flesch Reading Ease)
 */
function calculateReadability(text: string): {
  score: number;
  level: "easy" | "moderate" | "difficult";
  avgSentenceLength: number;
  avgWordLength: number;
} {
  const cleanText = text.replace(/<[^>]+>/g, " ");
  
  const sentences = cleanText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = cleanText.split(/\s+/).filter((w) => w.length > 0);
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);

  const sentenceCount = sentences.length || 1;
  const wordCount = words.length || 1;

  const avgSentenceLength = wordCount / sentenceCount;
  const avgSyllablesPerWord = syllables / wordCount;
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / wordCount;

  // Flesch Reading Ease formula
  const score = Math.max(0, Math.min(100,
    206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord
  ));

  let level: "easy" | "moderate" | "difficult";
  if (score >= 60) {
    level = "easy";
  } else if (score >= 40) {
    level = "moderate";
  } else {
    level = "difficult";
  }

  return {
    score: Math.round(score),
    level,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    avgWordLength: Math.round(avgWordLength * 10) / 10,
  };
}

/**
 * Count syllables in a word (approximate)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;
  
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

/**
 * Calculate overall SEO score
 */
function calculateSEOScore(scores: {
  titleScore: number;
  descriptionScore: number;
  contentScore: number;
  readabilityScore: number;
  keywordScore: number;
  structureScore: number;
}): number {
  const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
  return Math.round(total);
}

/**
 * Generate SEO improvement suggestions based on analysis
 */
export function generateImprovementPlan(analysis: ContentAnalysis): string[] {
  const plan: string[] = [];

  if (analysis.score < 50) {
    plan.push("🔴 Critical: Your content needs significant SEO improvements.");
  } else if (analysis.score < 70) {
    plan.push("🟡 Good start, but there's room for improvement.");
  } else {
    plan.push("🟢 Great SEO foundation! Fine-tune with the suggestions below.");
  }

  // Add prioritized suggestions
  const errorIssues = analysis.issues.filter((i) => i.type === "error");
  const warningIssues = analysis.issues.filter((i) => i.type === "warning");

  if (errorIssues.length > 0) {
    plan.push("\n**Critical Issues:**");
    errorIssues.forEach((issue) => plan.push(`- ❌ ${issue.message}`));
  }

  if (warningIssues.length > 0) {
    plan.push("\n**Warnings:**");
    warningIssues.forEach((issue) => plan.push(`- ⚠️ ${issue.message}`));
  }

  if (analysis.suggestions.length > 0) {
    plan.push("\n**Suggestions:**");
    analysis.suggestions.forEach((s) => plan.push(`- 💡 ${s}`));
  }

  return plan;
}
