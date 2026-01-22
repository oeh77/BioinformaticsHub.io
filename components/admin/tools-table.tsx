"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Wrench, ExternalLink, Pencil, Eye } from "lucide-react";
import { DeleteToolButton } from "@/components/admin/delete-tool-button";
import { BulkActions } from "@/components/admin/bulk-actions";

interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  pricing: string | null;
  published: boolean;
  featured: boolean;
  category: {
    id: string;
    name: string;
  };
}

interface ToolsTableProps {
  tools: Tool[];
}

export function ToolsTable({ tools }: ToolsTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isSelected = (id: string) => selectedIds.includes(id);

  const toggle = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const selectAll = () => {
    setSelectedIds(tools.map((t) => t.id));
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      <BulkActions
        selectedIds={selectedIds}
        totalItems={tools.length}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        deleteEndpoint="/api/admin/tools"
        itemName="tool"
      />

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 w-12">
                  <Checkbox
                    checked={selectedIds.length === tools.length && tools.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        selectAll();
                      } else {
                        deselectAll();
                      }
                    }}
                    aria-label="Select all tools"
                  />
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tool</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Pricing</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tools.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    <Wrench className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No tools found.
                  </td>
                </tr>
              ) : (
                tools.map((tool) => (
                  <tr
                    key={tool.id}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                      isSelected(tool.id) ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="p-4">
                      <Checkbox
                        checked={isSelected(tool.id)}
                        onCheckedChange={(checked) => toggle(tool.id, checked)}
                        aria-label={`Select ${tool.name}`}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {tool.name[0]}
                        </div>
                        <div>
                          <p className="font-medium">{tool.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{tool.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm px-2 py-1 rounded-full bg-secondary/50">
                        {tool.category.name}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{tool.pricing || "Free"}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${tool.published ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                          {tool.published ? 'Published' : 'Draft'}
                        </span>
                        {tool.featured && (
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/tools/${tool.id}/preview`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Preview tool">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/directory/tool/${tool.slug}`} target="_blank">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="View tool">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/tools/${tool.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit tool">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeleteToolButton toolId={tool.id} toolName={tool.name} />
                      </div>
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
