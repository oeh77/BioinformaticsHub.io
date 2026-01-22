import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, FileText, Wrench, GraduationCap, FolderOpen, Mail, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [userCount, toolCount, postCount, courseCount, resourceCount, subscriberCount, recentUsers, recentPosts] = await Promise.all([
    prisma.user.count(),
    prisma.tool.count(),
    prisma.post.count(),
    prisma.course.count(),
    prisma.resource.count(),
    prisma.subscriber.count({ where: { status: "SUBSCRIBED" } }),
    prisma.user.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, createdAt: true } }),
    prisma.post.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { id: true, title: true, slug: true, published: true, createdAt: true } }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Link href="/admin/users" className="glass-card p-5 flex items-center justify-between hover:border-blue-500/50 transition-colors">
          <div>
            <p className="text-xs text-muted-foreground">Users</p>
            <h3 className="text-2xl font-bold">{userCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Users className="w-5 h-5" />
          </div>
        </Link>

        <Link href="/admin/tools" className="glass-card p-5 flex items-center justify-between hover:border-green-500/50 transition-colors">
          <div>
            <p className="text-xs text-muted-foreground">Tools</p>
            <h3 className="text-2xl font-bold">{toolCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
            <Wrench className="w-5 h-5" />
          </div>
        </Link>

        <Link href="/admin/courses" className="glass-card p-5 flex items-center justify-between hover:border-orange-500/50 transition-colors">
          <div>
            <p className="text-xs text-muted-foreground">Courses</p>
            <h3 className="text-2xl font-bold">{courseCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
            <GraduationCap className="w-5 h-5" />
          </div>
        </Link>

        <Link href="/admin/resources" className="glass-card p-5 flex items-center justify-between hover:border-cyan-500/50 transition-colors">
          <div>
            <p className="text-xs text-muted-foreground">Resources</p>
            <h3 className="text-2xl font-bold">{resourceCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500">
            <FolderOpen className="w-5 h-5" />
          </div>
        </Link>

        <Link href="/admin/posts" className="glass-card p-5 flex items-center justify-between hover:border-purple-500/50 transition-colors">
          <div>
            <p className="text-xs text-muted-foreground">Posts</p>
            <h3 className="text-2xl font-bold">{postCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
            <FileText className="w-5 h-5" />
          </div>
        </Link>

        <Link href="/admin/subscribers" className="glass-card p-5 flex items-center justify-between hover:border-pink-500/50 transition-colors">
          <div>
            <p className="text-xs text-muted-foreground">Subscribers</p>
            <h3 className="text-2xl font-bold">{subscriberCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500">
            <Mail className="w-5 h-5" />
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Recent Users
            </h2>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users yet.</p>
            ) : (
              recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{user.name || "Unnamed"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Posts */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              Recent Posts
            </h2>
            <Link href="/admin/posts">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No posts yet.</p>
            ) : (
              recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{post.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${post.published ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground ml-4">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/tools/new">
            <Button size="sm" className="rounded-full">
              <Wrench className="w-4 h-4 mr-2" /> Add Tool
            </Button>
          </Link>
          <Link href="/admin/courses/new">
            <Button size="sm" variant="outline" className="rounded-full">
              <GraduationCap className="w-4 h-4 mr-2" /> Add Course
            </Button>
          </Link>
          <Link href="/admin/resources/new">
            <Button size="sm" variant="outline" className="rounded-full">
              <FolderOpen className="w-4 h-4 mr-2" /> Add Resource
            </Button>
          </Link>
          <Link href="/admin/posts/new">
            <Button size="sm" variant="outline" className="rounded-full">
              <FileText className="w-4 h-4 mr-2" /> Write Post
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
