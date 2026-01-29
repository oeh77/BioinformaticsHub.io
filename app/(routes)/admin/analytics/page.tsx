import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Wrench,
  GraduationCap,
  FileText,
  FolderOpen,
  Users,
  Mail,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getAnalytics() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Total counts
  const [
    totalTools,
    totalCourses,
    totalPosts,
    totalResources,
    totalUsers,
    totalSubscribers,
    totalCategories,
  ] = await Promise.all([
    prisma.tool.count(),
    prisma.course.count(),
    prisma.post.count(),
    prisma.resource.count(),
    prisma.user.count(),
    prisma.subscriber.count(),
    prisma.category.count(),
  ]);

  // Published counts
  const [publishedTools, publishedCourses, publishedPosts] = await Promise.all([
    prisma.tool.count({ where: { published: true } }),
    prisma.course.count({ where: { published: true } }),
    prisma.post.count({ where: { published: true } }),
  ]);

  // Recent activity (last 7 days)
  const [
    recentTools,
    recentCourses,
    recentPosts,
    recentUsers,
    recentSubscribers,
  ] = await Promise.all([
    prisma.tool.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.course.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.post.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.subscriber.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
  ]);

  // Monthly activity (last 30 days)
  const [monthlyTools, monthlyCourses, monthlyPosts, monthlySubscribers] =
    await Promise.all([
      prisma.tool.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.course.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.post.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.subscriber.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    ]);

  // Top categories by content
  const categoryStats = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          tools: true,
          courses: true,
          posts: true,
          resources: true,
        },
      },
    },
    orderBy: {
      tools: {
        _count: "desc",
      },
    },
    take: 5,
  });

  // Recent items
  const [recentToolsList, recentPostsList, recentUsersList] = await Promise.all(
    [
      prisma.tool.findMany({
        select: { id: true, name: true, slug: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.post.findMany({
        select: { id: true, title: true, slug: true, createdAt: true, published: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.user.findMany({
        select: { id: true, name: true, email: true, createdAt: true, role: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]
  );

  // Featured tools count
  const featuredTools = await prisma.tool.count({ where: { featured: true } });

  return {
    totals: {
      tools: totalTools,
      courses: totalCourses,
      posts: totalPosts,
      resources: totalResources,
      users: totalUsers,
      subscribers: totalSubscribers,
      categories: totalCategories,
    },
    published: {
      tools: publishedTools,
      courses: publishedCourses,
      posts: publishedPosts,
    },
    weekly: {
      tools: recentTools,
      courses: recentCourses,
      posts: recentPosts,
      users: recentUsers,
      subscribers: recentSubscribers,
    },
    monthly: {
      tools: monthlyTools,
      courses: monthlyCourses,
      posts: monthlyPosts,
      subscribers: monthlySubscribers,
    },
    categoryStats,
    recentItems: {
      tools: recentToolsList,
      posts: recentPostsList,
      users: recentUsersList,
    },
    featuredTools,
  };
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default async function AnalyticsPage() {
  const analytics = await getAnalytics();

  const contentCards = [
    {
      label: "Tools",
      total: analytics.totals.tools,
      published: analytics.published.tools,
      weekly: analytics.weekly.tools,
      icon: Wrench,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      href: "/admin/tools",
    },
    {
      label: "Courses",
      total: analytics.totals.courses,
      published: analytics.published.courses,
      weekly: analytics.weekly.courses,
      icon: GraduationCap,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      href: "/admin/courses",
    },
    {
      label: "Posts",
      total: analytics.totals.posts,
      published: analytics.published.posts,
      weekly: analytics.weekly.posts,
      icon: FileText,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      href: "/admin/posts",
    },
    {
      label: "Resources",
      total: analytics.totals.resources,
      published: analytics.totals.resources,
      weekly: 0,
      icon: FolderOpen,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      href: "/admin/resources",
    },
  ];

// Refactored AnalyticsPage
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your platform&apos;s performance and content
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {contentCards.map((card) => (
          <Link key={card.label} href={card.href}>
            <div className="bg-card border border-border p-4 rounded-lg shadow-sm hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="flex items-start justify-between">
                <div
                  className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center`}
                >
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-3xl font-bold mt-3 text-foreground">{card.total}</p>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-green-500 dark:text-green-400">
                  +{card.weekly} this week
                </span>
                <span className="text-xs text-muted-foreground">
                  • {card.published} published
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* User & Subscriber Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/users">
          <div className="bg-card border border-border p-6 rounded-lg shadow-sm hover:border-primary/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-cyan-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{analytics.totals.users}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500 dark:text-green-400" />
                <span className="text-sm text-muted-foreground">
                  <span className="text-green-500 dark:text-green-400 font-medium">+{analytics.weekly.users}</span> new this week
                </span>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/subscribers">
          <div className="bg-card border border-border p-6 rounded-lg shadow-sm hover:border-primary/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {analytics.totals.subscribers}
                </p>
                <p className="text-sm text-muted-foreground">Subscribers</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500 dark:text-green-400" />
                <span className="text-sm text-muted-foreground">
                  <span className="text-green-500 dark:text-green-400 font-medium">+{analytics.weekly.subscribers}</span> new this week
                </span>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/categories">
          <div className="bg-card border border-border p-6 rounded-lg shadow-sm hover:border-primary/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {analytics.totals.categories}
                </p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {analytics.featuredTools} featured tools
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Monthly Growth */}
      <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Monthly Growth (Last 30 Days)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-muted-foreground">Tools</span>
            </div>
            <p className="text-2xl font-bold text-foreground">+{analytics.monthly.tools}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-muted-foreground">Courses</span>
            </div>
            <p className="text-2xl font-bold text-foreground">+{analytics.monthly.courses}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-sm text-muted-foreground">Posts</span>
            </div>
            <p className="text-2xl font-bold text-foreground">+{analytics.monthly.posts}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-pink-500" />
              <span className="text-sm text-muted-foreground">Subscribers</span>
            </div>
            <p className="text-2xl font-bold text-foreground">+{analytics.monthly.subscribers}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Top Categories</h2>
            <Link
              href="/admin/categories"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {analytics.categoryStats.map((cat) => {
              const total =
                cat._count.tools +
                cat._count.courses +
                cat._count.posts +
                cat._count.resources;
              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {cat.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {cat._count.tools} tools, {cat._count.courses} courses
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-foreground">{total}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Recent Activity</h2>
          <div className="space-y-4">
            {/* Recent Tools */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Latest Tools
              </p>
              {analytics.recentItems.tools.slice(0, 3).map((tool) => (
                <Link
                  key={tool.id}
                  href={`/admin/tools/${tool.id}/edit`}
                  className="flex items-center justify-between py-2 hover:text-primary transition-colors text-foreground"
                >
                  <span className="text-sm">{tool.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(tool.createdAt)}
                  </span>
                </Link>
              ))}
            </div>

            {/* Recent Posts */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Latest Posts
              </p>
              {analytics.recentItems.posts.slice(0, 3).map((post) => (
                <Link
                  key={post.id}
                  href={`/admin/posts/${post.id}/edit`}
                  className="flex items-center justify-between py-2 hover:text-primary transition-colors text-foreground"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm truncate max-w-[200px]">{post.title}</span>
                    {!post.published && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                        Draft
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(post.createdAt)}
                  </span>
                </Link>
              ))}
            </div>

            {/* Recent Users */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                New Users
              </p>
              {analytics.recentItems.users.slice(0, 3).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-2 text-foreground"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {user.name || user.email || "Anonymous"}
                    </span>
                    {user.role === "ADMIN" && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                        Admin
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
