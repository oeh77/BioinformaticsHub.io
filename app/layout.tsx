import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { JsonLd } from "@/components/seo/json-ld";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/seo";
import { siteConfig } from "@/lib/seo/config";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { WebVitalsProvider } from "@/components/analytics/web-vitals";
import { AdConsentBanner } from "@/components/ads";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "BioinformaticsHub.io - Tools, Tutorials & Resources for Computational Biology",
    template: "%s | BioinformaticsHub.io",
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: "BioinformaticsHub Team" }],
  creator: "BioinformaticsHub.io",
  publisher: "BioinformaticsHub.io",
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
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "BioinformaticsHub.io - Tools, Tutorials & Resources",
    description: siteConfig.description,
    images: [
      {
        url: `${siteConfig.url}/og-default.png`,
        width: 1200,
        height: 630,
        alt: "BioinformaticsHub.io",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.twitterHandle,
    creator: siteConfig.twitterHandle,
    title: "BioinformaticsHub.io",
    description: siteConfig.description,
    images: [`${siteConfig.url}/og-default.png`],
  },
  alternates: {
    canonical: siteConfig.url,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  category: "Science",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Consent Mode v2 - Must load before other scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'analytics_storage': 'denied',
                'wait_for_update': 500
              });
            `,
          }}
        />
        {/* Global Structured Data */}
        <JsonLd data={generateOrganizationSchema()} />
        <JsonLd data={generateWebSiteSchema()} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        {/* Google Analytics */}
        <GoogleAnalytics />
        
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <WebVitalsProvider>
              <Header />
                <main className="flex-1 pt-24">
                  {children}
                </main>
              <Footer />
              <Toaster />
              {/* GDPR Consent Banner */}
              <AdConsentBanner />
            </WebVitalsProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
