/**
 * Posts Sitemap Route
 * 
 * GET /sitemap_posts.xml
 */

import { NextResponse } from "next/server";
import { getPostsSitemap, generateSitemapXml } from "@/lib/seo/sitemap";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET() {
  try {
    const posts = await getPostsSitemap();
    const xml = generateSitemapXml(posts);
    
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Posts sitemap generation failed:", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}
