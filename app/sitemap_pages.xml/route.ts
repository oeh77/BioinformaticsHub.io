/**
 * Static Pages Sitemap Route
 * 
 * GET /sitemap_pages.xml
 */

import { NextResponse } from "next/server";
import { getStaticPages, getCategoriesSitemap, generateSitemapXml } from "@/lib/seo/sitemap";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET() {
  try {
    const staticPages = getStaticPages();
    const categories = await getCategoriesSitemap();
    const xml = generateSitemapXml([...staticPages, ...categories]);
    
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Pages sitemap generation failed:", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}
