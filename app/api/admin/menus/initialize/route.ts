import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Default header menu items
const defaultHeaderItems = [
  {
    section: { name: "Main Navigation", slug: "main-nav", position: 0 },
    items: [
      { label: "Directory", href: "/directory", icon: "Database", iconColor: "text-blue-400", gradient: "from-blue-500/10 to-purple-500/10", itemType: "dropdown", position: 0 },
      { label: "Categories", href: "/directory", icon: "Layers", iconColor: "text-purple-400", gradient: "from-purple-500/10 to-pink-500/10", itemType: "dropdown", position: 1 },
      { label: "Blog", href: "/blog", icon: "FileText", iconColor: "text-emerald-400", gradient: "from-emerald-500/10 to-teal-500/10", itemType: "link", position: 2 },
      { label: "Courses", href: "/courses", icon: "GraduationCap", iconColor: "text-orange-400", gradient: "from-orange-500/10 to-amber-500/10", itemType: "link", position: 3 },
      { label: "Compare", href: "/compare", icon: "Users", iconColor: "text-cyan-400", gradient: "from-cyan-500/10 to-blue-500/10", itemType: "link", position: 4 },
      { label: "Resources", href: "/resources", icon: "BookOpen", iconColor: "text-rose-400", gradient: "from-rose-500/10 to-pink-500/10", itemType: "link", position: 5 },
    ],
  },
];

// Default footer menu items
const defaultFooterItems = [
  {
    section: { name: "Discover", slug: "footer-discover", position: 0 },
    items: [
      { label: "Tools Directory", href: "/directory", position: 0 },
      { label: "Courses", href: "/courses", position: 1 },
      { label: "Blog", href: "/blog", position: 2 },
      { label: "Comparisons", href: "/compare", position: 3 },
    ],
  },
  {
    section: { name: "Resources", slug: "footer-resources", position: 1 },
    items: [
      { label: "Beginner's Guide", href: "/resources/beginner-guide", position: 0 },
      { label: "Learning Paths", href: "/resources/paths", position: 1 },
      { label: "Glossary", href: "/resources/glossary", position: 2 },
      { label: "Newsletter", href: "/newsletter", position: 3 },
    ],
  },
  {
    section: { name: "Legal", slug: "footer-legal", position: 2 },
    items: [
      { label: "Privacy Policy", href: "/privacy", position: 0 },
      { label: "Terms of Use", href: "/terms", position: 1 },
      { label: "Affiliate Disclosure", href: "/affiliate", position: 2 },
      { label: "Contact Us", href: "/contact", position: 3 },
    ],
  },
];

// POST - Initialize default menu items
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const location = body.location || "header";
    const defaults = location === "header" ? defaultHeaderItems : defaultFooterItems;

    for (const group of defaults) {
      // Check if section already exists
      const existingSection = await prisma.menuSection.findUnique({
        where: { slug: group.section.slug },
      });

      let sectionId: string;

      if (existingSection) {
        sectionId = existingSection.id;
      } else {
        // Create section
        const section = await prisma.menuSection.create({
          data: {
            name: group.section.name,
            slug: group.section.slug,
            location,
            position: group.section.position,
            isEnabled: true,
          },
        });
        sectionId = section.id;
      }

      // Create items
      for (const item of group.items) {
        // Check if item already exists in this section with same label
        const existingItem = await prisma.menuItem.findFirst({
          where: {
            sectionId,
            label: item.label,
          },
        });

        if (!existingItem) {
          await prisma.menuItem.create({
            data: {
              label: item.label,
              href: item.href,
              sectionId,
              icon: (item as { icon?: string }).icon || null,
              iconColor: (item as { iconColor?: string }).iconColor || null,
              gradient: (item as { gradient?: string }).gradient || null,
              itemType: (item as { itemType?: string }).itemType || "link",
              position: item.position,
              isEnabled: true,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: "Default menu items initialized" });
  } catch (error) {
    console.error("Error initializing default menu:", error);
    return NextResponse.json(
      { error: "Failed to initialize default menu" },
      { status: 500 }
    );
  }
}
