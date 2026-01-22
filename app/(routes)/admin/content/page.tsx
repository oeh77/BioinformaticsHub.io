import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ContentManager() {
  const tools = await prisma.tool.findMany({
    take: 20,
    orderBy: { updatedAt: 'desc' },
    include: { category: true }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Content Manager</h1>
        <Button>
            <Plus className="w-4 h-4 mr-2" /> Add New
        </Button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-secondary/50 text-muted-foreground border-b border-white/10">
                <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                </tr>
            </thead>
            <tbody>
                {tools.map(tool => (
                    <tr key={tool.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-medium">{tool.name}</td>
                        <td className="px-6 py-4">Tool</td>
                        <td className="px-6 py-4">{tool.category.name}</td>
                        <td className="px-6 py-4">
                            {tool.published ? 
                                <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded-full text-xs">Published</span> : 
                                <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full text-xs">Draft</span>
                            }
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                            <Button size="sm" variant="ghost"><Edit className="w-4 h-4" /></Button>
                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600"><Trash className="w-4 h-4" /></Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}
