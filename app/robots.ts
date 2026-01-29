/**
 * Expert-Level Robots.txt Generator for BioinformaticsHub.io
 * 
 * Optimized for maximum SEO visibility on Google, Bing, and other search engines.
 * This configuration follows Google's Webmaster Guidelines and Bing's best practices.
 * 
 * Key strategies:
 * 1. Whitelist valuable content paths for indexing
 * 2. Block low-value, duplicate, or private paths
 * 3. Specific directives for each major crawler
 * 4. Crawl-delay optimization for server performance
 * 5. Multiple sitemap references for complete coverage
 * 
 * @see https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt
 * @see https://www.bing.com/webmasters/help/how-to-create-a-robots-txt-file-cb7c31ec
 */

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bioinformaticshub.io";

  return {
    rules: [
      // ═══════════════════════════════════════════════════════════════════════
      // GOOGLEBOT - Primary Search Engine (No crawl-delay, Google ignores it)
      // ═══════════════════════════════════════════════════════════════════════
      {
        userAgent: "Googlebot",
        allow: [
          "/",                          // Homepage - highest priority
          "/directory/",                // Tool directory - core content
          "/directory/tool/",           // Individual tool pages
          "/blog/",                      // Blog posts - fresh content
          "/courses/",                   // Educational content
          "/jobs/",                      // Job listings
          "/resources/",                 // Resource guides
          "/compare/",                   // Comparison pages - unique value
          "/stacks/",                    // User-curated stacks
          "/faq",                        // FAQ - structured data opportunity
          "/contact",                    // Contact page
          "/affiliate/disclosure",       // Required legal page
          "/terms",                      // Terms of service
          "/privacy",                    // Privacy policy
          "/*.png$",                     // Allow images for rich snippets
          "/*.jpg$",                     // Allow JPEG images
          "/*.webp$",                    // Allow WebP images
          "/*.svg$",                     // Allow SVG graphics
          "/*.gif$",                     // Allow GIF images
          "/sitemap*.xml",               // Sitemaps for discovery
        ],
        disallow: [
          // Admin & Authentication - Never index
          "/admin/",
          "/admin",
          "/api/admin/",
          "/auth/",
          "/login",
          "/register",
          
          // API Endpoints - Prevent API abuse from search
          "/api/",
          
          // User Private Content
          "/user/",
          "/profile",
          "/bookmarks",
          "/partner/",
          
          // Search & Filters - Prevent duplicate content
          "/search?",
          "/search$",
          "/*?q=",
          "/*?query=",
          "/*?page=",
          "/*?sort=",
          "/*?filter=",
          "/*?category=",
          "/*?pricing=",
          "/*?level=",
          
          // Utility & System Paths
          "/_next/",
          "/static/chunks/",
          "/*.js$",
          "/*.css$",
          "/*.json$",
          "/favicon.ico",
          
          // Duplicate/Low-value Paths
          "/preview/",
          "/*?ref=",
          "/*?utm_",
          "/*?source=",
          "/*?campaign=",
          "/go/",                        // Affiliate redirects
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════
      // GOOGLEBOT-IMAGE - Image Search Optimization
      // ═══════════════════════════════════════════════════════════════════════
      {
        userAgent: "Googlebot-Image",
        allow: [
          "/",
          "/*.png$",
          "/*.jpg$",
          "/*.jpeg$",
          "/*.webp$",
          "/*.gif$",
          "/*.svg$",
          "/images/",
          "/uploads/",
          "/og-*.png",
        ],
        disallow: [
          "/admin/",
          "/api/",
          "/_next/",
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════
      // BINGBOT - Microsoft Bing (Respects crawl-delay)
      // ═══════════════════════════════════════════════════════════════════════
      {
        userAgent: "Bingbot",
        allow: [
          "/",
          "/directory/",
          "/directory/tool/",
          "/blog/",
          "/courses/",
          "/jobs/",
          "/resources/",
          "/compare/",
          "/stacks/",
          "/faq",
          "/contact",
          "/terms",
          "/privacy",
          "/sitemap*.xml",
        ],
        disallow: [
          "/admin/",
          "/api/",
          "/auth/",
          "/login",
          "/register",
          "/user/",
          "/profile",
          "/bookmarks",
          "/partner/",
          "/search?",
          "/search$",
          "/*?q=",
          "/*?page=",
          "/*?sort=",
          "/*?filter=",
          "/_next/",
          "/go/",
          "/preview/",
        ],
        // Bing respects crawl-delay (1 second between requests)
        // crawlDelay: 1, // Uncomment if server load is high
      },

      // ═══════════════════════════════════════════════════════════════════════
      // YANDEXBOT - Russian Search Engine
      // ═══════════════════════════════════════════════════════════════════════
      {
        userAgent: "Yandex",
        allow: [
          "/",
          "/directory/",
          "/blog/",
          "/courses/",
          "/jobs/",
          "/resources/",
        ],
        disallow: [
          "/admin/",
          "/api/",
          "/auth/",
          "/user/",
          "/partner/",
          "/search?",
          "/_next/",
          "/go/",
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════
      // DUCKDUCKBOT - Privacy-focused Search
      // ═══════════════════════════════════════════════════════════════════════
      {
        userAgent: "DuckDuckBot",
        allow: [
          "/",
          "/directory/",
          "/blog/",
          "/courses/",
          "/jobs/",
          "/resources/",
          "/faq",
        ],
        disallow: [
          "/admin/",
          "/api/",
          "/auth/",
          "/user/",
          "/partner/",
          "/search?",
          "/_next/",
          "/go/",
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════
      // SLURP - Yahoo Search (via Bing partnership)
      // ═══════════════════════════════════════════════════════════════════════
      {
        userAgent: "Slurp",
        allow: [
          "/",
          "/directory/",
          "/blog/",
          "/courses/",
        ],
        disallow: [
          "/admin/",
          "/api/",
          "/auth/",
          "/user/",
          "/partner/",
          "/search?",
          "/_next/",
          "/go/",
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════
      // APPLEBOT - Apple Siri & Spotlight
      // ═══════════════════════════════════════════════════════════════════════
      {
        userAgent: "Applebot",
        allow: [
          "/",
          "/directory/",
          "/blog/",
          "/courses/",
          "/jobs/",
          "/resources/",
        ],
        disallow: [
          "/admin/",
          "/api/",
          "/auth/",
          "/user/",
          "/partner/",
          "/search?",
          "/_next/",
          "/go/",
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════
      // FACEBOOKBOT - Facebook/Meta Link Previews
      // ═══════════════════════════════════════════════════════════════════════
      {
        userAgent: "facebookexternalhit",
        allow: [
          "/",
          "/directory/",
          "/directory/tool/",
          "/blog/",
          "/courses/",
          "/jobs/",
          "/resources/",
          "/*.png$",
          "/*.jpg$",
          "/og-*.png",
        ],
        disallow: [
          "/admin/",
          "/api/",
          "/auth/",
          "/user/",
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════
      // TWITTERBOT - Twitter/X Card Previews
      // ═══════════════════════════════════════════════════════════════════════
      {
        userAgent: "Twitterbot",
        allow: [
          "/",
          "/directory/",
          "/directory/tool/",
          "/blog/",
          "/courses/",
          "/jobs/",
          "/*.png$",
          "/*.jpg$",
          "/og-*.png",
        ],
        disallow: [
          "/admin/",
          "/api/",
          "/auth/",
          "/user/",
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════
      // LINKEDINBOT - LinkedIn Link Previews
      // ═══════════════════════════════════════════════════════════════════════
      {
        userAgent: "LinkedInBot",
        allow: [
          "/",
          "/directory/",
          "/blog/",
          "/courses/",
          "/jobs/",
          "/*.png$",
          "/*.jpg$",
        ],
        disallow: [
          "/admin/",
          "/api/",
          "/auth/",
          "/user/",
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════
      // BLOCK AI TRAINING BOTS (Optional - Protect content)
      // ═══════════════════════════════════════════════════════════════════════
      {
        userAgent: "GPTBot",
        disallow: ["/"],
      },
      {
        userAgent: "ChatGPT-User",
        disallow: ["/"],
      },
      {
        userAgent: "CCBot",
        disallow: ["/"],
      },
      {
        userAgent: "anthropic-ai",
        disallow: ["/"],
      },
      {
        userAgent: "Claude-Web",
        disallow: ["/"],
      },

      // ═══════════════════════════════════════════════════════════════════════
      // BLOCK AGGRESSIVE/HARMFUL BOTS
      // ═══════════════════════════════════════════════════════════════════════
      {
        userAgent: "AhrefsBot",
        disallow: ["/"],
      },
      {
        userAgent: "SemrushBot",
        disallow: ["/"], // Comment out if you use SEMrush
      },
      {
        userAgent: "MJ12bot",
        disallow: ["/"],
      },
      {
        userAgent: "DotBot",
        disallow: ["/"],
      },
      {
        userAgent: "BLEXBot",
        disallow: ["/"],
      },

      // ═══════════════════════════════════════════════════════════════════════
      // DEFAULT CATCH-ALL - All Other Bots
      // ═══════════════════════════════════════════════════════════════════════
      {
        userAgent: "*",
        allow: [
          "/",
          "/directory/",
          "/directory/tool/",
          "/blog/",
          "/courses/",
          "/jobs/",
          "/resources/",
          "/compare/",
          "/faq",
          "/contact",
          "/terms",
          "/privacy",
        ],
        disallow: [
          "/admin/",
          "/api/",
          "/auth/",
          "/login",
          "/register",
          "/user/",
          "/profile",
          "/bookmarks",
          "/partner/",
          "/search?",
          "/search$",
          "/*?q=",
          "/*?page=",
          "/*?sort=",
          "/*?filter=",
          "/_next/",
          "/go/",
          "/preview/",
          "/*?ref=",
          "/*?utm_",
        ],
      },
    ],

    // ═══════════════════════════════════════════════════════════════════════
    // SITEMAPS - All sitemap references for complete content discovery
    // ═══════════════════════════════════════════════════════════════════════
    sitemap: [
      `${siteUrl}/sitemap.xml`,           // Main sitemap index
      `${siteUrl}/sitemap_tools.xml`,     // Tools directory
      `${siteUrl}/sitemap_posts.xml`,     // Blog posts
      `${siteUrl}/sitemap_courses.xml`,   // Courses
      `${siteUrl}/sitemap_pages.xml`,     // Static pages
    ],

    // Host directive (optional, deprecated but some bots still use it)
    host: siteUrl,
  };
}
