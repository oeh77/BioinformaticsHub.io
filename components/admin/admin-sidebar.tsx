"use client";

import Link from "next/link";
import Image from "next/image";
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
  Briefcase,
  MessageSquare,
  Lightbulb,
  Sparkles,
  Globe,
  DollarSign,
  Menu,
  Scale,
  GitBranch,
  MessageCircleQuestion,
  Bell,
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
      { href: "/admin/autoblog", label: "Auto-Blog", icon: Sparkles },
      { href: "/admin/jobs", label: "Job Board", icon: Briefcase },
      { href: "/admin/compare", label: "Compare", icon: Scale },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
    ]
  },
  {
    title: "Affiliate",
    items: [
      { href: "/admin/affiliate", label: "Overview", icon: DollarSign },
      { href: "/admin/affiliate/partners", label: "Partners", icon: Users },
      { href: "/admin/affiliate/products", label: "Products", icon: Puzzle },
      { href: "/admin/affiliate/links", label: "Links", icon: Webhook },
      { href: "/admin/affiliate/conversions", label: "Conversions", icon: BarChart3 },
      { href: "/admin/affiliate/campaigns", label: "Campaigns", icon: Sparkles },
      { href: "/admin/affiliate/payouts", label: "Payouts", icon: DollarSign },
      { href: "/admin/affiliate/auto-link", label: "Auto-Link", icon: Lightbulb },
    ]
  },
  {
    title: "Community",
    items: [
      { href: "/admin/community", label: "Q&A Forum", icon: MessageCircleQuestion },
      { href: "/admin/workflows", label: "Workflows", icon: GitBranch },
      { href: "/admin/notifications", label: "Notifications", icon: Bell },
    ]
  },
  {
    title: "Moderation",
    items: [
      { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
      { href: "/admin/suggestions", label: "Suggestions", icon: Lightbulb },
    ]
  },
  {
    title: "Management",
    items: [
      { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/menus", label: "Menus", icon: Menu },
      { href: "/admin/seo", label: "SEO", icon: Globe },
      { href: "/admin/monetization", label: "Monetization", icon: DollarSign },
      { href: "/admin/adsense", label: "AdSense", icon: DollarSign },
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
        <div className="flex items-center gap-3 mb-2">
          <Image
            src="/icon.png"
            alt="BioinformaticsHub.io"
            width={48}
            height={48}
            className="w-12 h-12"
          />
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Admin Panel
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mb-6 ml-[60px]">
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
