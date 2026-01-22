import { prisma } from "@/lib/prisma";
import { Users, Shield, User, UserCog } from "lucide-react";
import { RoleSelector } from "@/components/admin/role-selector";

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
    },
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === "ADMIN").length,
    editors: users.filter(u => u.role === "EDITOR").length,
    users: users.filter(u => u.role === "USER").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users & Roles</h1>
        <p className="text-muted-foreground mt-1">Manage user accounts and permissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Admins</p>
            <p className="text-2xl font-bold text-red-500">{stats.admins}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
            <Shield className="w-5 h-5" />
          </div>
        </div>
        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Editors</p>
            <p className="text-2xl font-bold text-orange-500">{stats.editors}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
            <UserCog className="w-5 h-5" />
          </div>
        </div>
        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Regular Users</p>
            <p className="text-2xl font-bold text-green-500">{stats.users}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Role</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No users yet.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name || "User"}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                            {(user.name?.[0] || user.email?.[0] || "U").toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium">{user.name || "Unnamed"}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{user.email}</td>
                    <td className="p-4">
                      <RoleSelector userId={user.id} currentRole={user.role} />
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
