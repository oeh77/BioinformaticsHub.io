import { prisma } from "@/lib/prisma";
import { Mail, Users, UserX, UserCheck, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExportSubscribersButton } from "@/components/admin/export-subscribers-button";

export const dynamic = 'force-dynamic';

export default async function AdminSubscribersPage() {
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: subscribers.length,
    subscribed: subscribers.filter(s => s.status === "SUBSCRIBED").length,
    unsubscribed: subscribers.filter(s => s.status === "UNSUBSCRIBED").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Newsletter Subscribers</h1>
          <p className="text-muted-foreground mt-1">Manage your email subscriber list</p>
        </div>
        <ExportSubscribersButton />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Total Subscribers</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-500">{stats.subscribed}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Unsubscribed</p>
            <p className="text-2xl font-bold text-red-500">{stats.unsubscribed}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
            <UserX className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Subscribed On</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No subscribers yet.
                  </td>
                </tr>
              ) : (
                subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                          {subscriber.email[0].toUpperCase()}
                        </div>
                        <span className="font-medium">{subscriber.email}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      {subscriber.name || <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        subscriber.status === "SUBSCRIBED" 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {subscriber.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(subscriber.createdAt).toLocaleDateString('en-US', {
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
