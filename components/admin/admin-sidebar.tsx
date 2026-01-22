"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Users, 
  Wrench, 
  GraduationCap,
  FolderOpen,
  FolderTree,
  Mail,
  BarChart3,
  Puzzle,
  Key,
  Webhook,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ]
  },
  {
    title: "Content",
    items: [
      { href: "/admin/tools", label: "Tools", icon: Wrench },
      { href: "/admin/courses", label: "Courses", icon: GraduationCap },
      { href: "/admin/resources", label: "Resources", icon: FolderOpen },
      { href: "/admin/posts", label: "Blog Posts", icon: FileText },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
    ]
  },
  {
    title: "Management",
    items: [
      { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/settings", label: "Settings", icon: Settings },
      { href: "/admin/integrations", label: "Integrations", icon: Puzzle },
      { href: "/admin/api-keys", label: "API Keys", icon: Key },
      { href: "/admin/webhooks", label: "Webhooks", icon: Webhook },
    ]
  }
];

interface AdminSidebarProps {
  userName?: string | null;
  onNavClick?: () => void;
}

export function AdminSidebar({ userName, onNavClick }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-1 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Admin Panel
        </h2>
        <p className="text-xs text-muted-foreground mb-6">
          Welcome, {userName || "Admin"}
        </p>
        
        <nav className="space-y-1" role="navigation" aria-label="Admin navigation">
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {section.title && (
                <div className="pt-4 pb-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider px-3 font-semibold">
                    {section.title}
                  </span>
                </div>
              )}
              
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={onNavClick}
                    aria-current={active ? "page" : undefined}
                  >
                    <span 
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer text-sm font-medium group",
                        active 
                          ? "bg-primary/15 text-primary border-l-2 border-primary shadow-sm" 
                          : "text-foreground/70 hover:bg-white/5 hover:text-foreground"
                      )}
                    >
                      <Icon 
                        className={cn(
                          "w-4 h-4 transition-transform duration-200",
                          active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                          "group-hover:scale-110"
                        )} 
                      />
                      <span>{item.label}</span>
                      {active && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
