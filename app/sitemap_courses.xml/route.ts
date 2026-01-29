/**
 * Courses Sitemap Route
 * 
 * GET /sitemap_courses.xml
 */

import { NextResponse } from "next/server";
import { getCoursesSitemap, generateSitemapXml } from "@/lib/seo/sitemap";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET() {
  try {
    const courses = await getCoursesSitemap();
    const xml = generateSitemapXml(courses);
    
    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Courses sitemap generation failed:", error);
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}
