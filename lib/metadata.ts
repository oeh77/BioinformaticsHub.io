import type { Metadata } from "next";

// Default SEO configuration
export const defaultMetadata: Metadata = {
  title: {
    default: "BioinformaticsHub - Tools, Courses & Resources",
    template: "%s | BioinformaticsHub",
  },
  description:
    "Discover the best bioinformatics tools, online courses, and resources. Your comprehensive hub for computational biology and bioinformatics education.",
  keywords: [
    "bioinformatics",
    "computational biology",
    "genomics",
    "proteomics",
    "bioinformatics tools",
    "bioinformatics courses",
    "NGS analysis",
    "sequence analysis",
    "protein structure",
    "molecular biology",
  ],
  authors: [{ name: "BioinformaticsHub Team" }],
  creator: "BioinformaticsHub",
  publisher: "BioinformaticsHub",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://bioinformaticshub.io"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "BioinformaticsHub",
    title: "BioinformaticsHub - Tools, Courses & Resources",
    description:
      "Discover the best bioinformatics tools, online courses, and resources. Your comprehensive hub for computational biology and bioinformatics education.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BioinformaticsHub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BioinformaticsHub - Tools, Courses & Resources",
    description:
      "Discover the best bioinformatics tools, online courses, and resources.",
    images: ["/og-image.png"],
    creator: "@bioinformaticshub",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
};

// Helper function to generate page metadata
export function generatePageMetadata({
  title,
  description,
  image,
  noIndex = false,
}: {
  title: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  return {
    title,
    description: description || defaultMetadata.description as string,
    openGraph: {
      title,
      description: description || defaultMetadata.description as string,
      images: image ? [{ url: image }] : defaultMetadata.openGraph?.images,
    },
    twitter: {
      title,
      description: description || defaultMetadata.description as string,
      images: image ? [image] : defaultMetadata.twitter?.images,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : defaultMetadata.robots,
  };
}
