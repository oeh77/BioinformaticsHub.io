"use client";

/**
 * Core Web Vitals Monitoring
 * 
 * Client-side tracking of:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay) / INP
 * - CLS (Cumulative Layout Shift)
 * - TTFB (Time to First Byte)
 * - FCP (First Contentful Paint)
 */

import { useEffect } from "react";

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
}

// Thresholds for Core Web Vitals
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
  FCP: { good: 1800, poor: 3000 },
};

/**
 * Get rating based on thresholds
 */
function getRating(name: string, value: number): "good" | "needs-improvement" | "poor" {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return "good";
  
  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}

/**
 * Send metrics to analytics endpoint
 */
function sendToAnalytics(metric: WebVitalsMetric) {
  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`);
  }

  // Send to Google Analytics 4
  if (typeof window !== "undefined" && "gtag" in window) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).gtag("event", metric.name, {
      value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
      metric_rating: metric.rating,
    });
  }

  // Send to custom analytics endpoint
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    navigator.sendBeacon?.(
      process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT,
      JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        url: window.location.href,
        timestamp: Date.now(),
      })
    );
  }
}

/**
 * Web Vitals tracking hook
 */
export function useWebVitals() {
  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    // Dynamic import to avoid SSR issues
    import("web-vitals").then((webVitals) => {
      const handleMetric = (metric: { name: string; value: number; delta: number; id: string }) => {
        const vitalsMetric: WebVitalsMetric = {
          name: metric.name,
          value: metric.value,
          rating: getRating(metric.name, metric.value),
          delta: metric.delta,
          id: metric.id,
        };
        sendToAnalytics(vitalsMetric);
      };

      webVitals.onLCP(handleMetric);
      webVitals.onCLS(handleMetric);
      webVitals.onTTFB(handleMetric);
      webVitals.onFCP(handleMetric);
      webVitals.onINP?.(handleMetric);
    }).catch(() => {
      // web-vitals not available
    });
  }, []);
}

/**
 * Web Vitals Provider Component
 */
export function WebVitalsProvider({ children }: { children: React.ReactNode }) {
  useWebVitals();
  return <>{children}</>;
}

/**
 * Performance marks for custom timing
 */
export const performanceMarks = {
  start(name: string) {
    if (typeof performance !== "undefined") {
      performance.mark(`${name}-start`);
    }
  },

  end(name: string) {
    if (typeof performance !== "undefined") {
      performance.mark(`${name}-end`);
      try {
        const measure = performance.measure(name, `${name}-start`, `${name}-end`);
        
        if (process.env.NODE_ENV === "development") {
          console.log(`[Performance] ${name}: ${measure.duration.toFixed(2)}ms`);
        }
        
        return measure.duration;
      } catch {
        return null;
      }
    }
    return null;
  },
};

/**
 * Get all performance entries
 */
export function getPerformanceMetrics() {
  if (typeof performance === "undefined") return null;

  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
  
  if (!navigation) return null;

  return {
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    connection: navigation.connectEnd - navigation.connectStart,
    ttfb: navigation.responseStart - navigation.requestStart,
    download: navigation.responseEnd - navigation.responseStart,
    domInteractive: navigation.domInteractive - navigation.startTime,
    domComplete: navigation.domComplete - navigation.startTime,
    loadComplete: navigation.loadEventEnd - navigation.startTime,
  };
}
