"use client";

/**
 * Google Analytics 4 Component
 * 
 * Provides tracking for:
 * - Page views
 * - Custom events
 * - User engagement
 */

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Track page views
 */
function AnalyticsPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    
    window.gtag?.("config", GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }, [pathname, searchParams]);

  return null;
}

/**
 * Google Analytics Provider
 */
export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              cookie_flags: 'SameSite=None;Secure',
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <AnalyticsPageView />
      </Suspense>
    </>
  );
}

/**
 * Track custom events
 */
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined") return;

  window.gtag?.("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
}

/**
 * Common event helpers
 */
export const analytics = {
  /**
   * Track tool view
   */
  toolView: (toolName: string, category: string) => {
    trackEvent("tool_view", "Tools", toolName);
  },

  /**
   * Track tool compare
   */
  toolCompare: (toolNames: string[]) => {
    trackEvent("tool_compare", "Compare", toolNames.join(" vs "));
  },

  /**
   * Track search
   */
  search: (query: string, resultsCount: number) => {
    trackEvent("search", "Search", query, resultsCount);
  },

  /**
   * Track blog read
   */
  blogRead: (postTitle: string, readTimePercent: number) => {
    trackEvent("blog_read", "Blog", postTitle, Math.round(readTimePercent));
  },

  /**
   * Track course enrollment intent
   */
  courseEnroll: (courseTitle: string) => {
    trackEvent("course_enroll", "Courses", courseTitle);
  },

  /**
   * Track newsletter signup
   */
  newsletterSignup: (source: string) => {
    trackEvent("newsletter_signup", "Engagement", source);
  },

  /**
   * Track bookmark
   */
  bookmark: (contentType: string, contentName: string) => {
    trackEvent("bookmark", contentType, contentName);
  },

  /**
   * Track external link click
   */
  externalLink: (url: string, toolName?: string) => {
    trackEvent("external_link", "Outbound", toolName || url);
  },
};
