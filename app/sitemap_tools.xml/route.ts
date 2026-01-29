/**
 * Tools Sitemap Route
 * 
 * GET /sitemap_tools.xml
 */

import { NextResponse } from "next/server";
import { getToolsSitemap, generateSitemapXml } from "@/lib/seo/sitemap";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET() {
  try {
    const tools = await getToolsSitemap();
    const xml = generateSitemapXml(tools);
    
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Tools sitemap generation failed:", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}
