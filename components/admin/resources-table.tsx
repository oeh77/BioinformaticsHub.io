"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FolderOpen, ExternalLink, Pencil } from "lucide-react";
import { DeleteResourceButton } from "@/components/admin/delete-resource-button";
import { BulkActions } from "@/components/admin/bulk-actions";

interface Resource {
  id: string;
  title: string;
  slug: string;
  type: string;
  description: string;
  url: string | null;
  category: {
    id: string;
    name: string;
  } | null;
}

interface ResourcesTableProps {
  resources: Resource[];
}

export function ResourcesTable({ resources }: ResourcesTableProps) {
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
    setSelectedIds(resources.map((r) => r.id));
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  const typeColors: Record<string, string> = {
    Database: "bg-blue-500/10 text-blue-400",
    Documentation: "bg-green-500/10 text-green-400",
    Tutorial: "bg-purple-500/10 text-purple-400",
    Paper: "bg-yellow-500/10 text-yellow-400",
    Dataset: "bg-orange-500/10 text-orange-400",
    Other: "bg-gray-500/10 text-gray-400",
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      <BulkActions
        selectedIds={selectedIds}
        totalItems={resources.length}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        deleteEndpoint="/api/admin/resources"
        itemName="resource"
      />

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 w-12">
                  <Checkbox
                    checked={selectedIds.length === resources.length && resources.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        selectAll();
                      } else {
                        deselectAll();
                      }
                    }}
                    aria-label="Select all resources"
                  />
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Resource</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No resources found.
                  </td>
                </tr>
              ) : (
                resources.map((resource) => (
                  <tr
                    key={resource.id}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                      isSelected(resource.id) ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="p-4">
                      <Checkbox
                        checked={isSelected(resource.id)}
                        onCheckedChange={(checked) => toggle(resource.id, checked)}
                        aria-label={`Select ${resource.title}`}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 font-bold">
                          {resource.title[0]}
                        </div>
                        <div>
                          <p className="font-medium">{resource.title}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                            {resource.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${typeColors[resource.type] || typeColors.Other}`}>
                        {resource.type}
                      </span>
                    </td>
                    <td className="p-4">
                      {resource.category ? (
                        <span className="text-sm px-2 py-1 rounded-full bg-secondary/50">
                          {resource.category.name}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {resource.url && (
                          <Link href={resource.url} target="_blank">
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="View resource">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        <Link href={`/admin/resources/${resource.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit resource">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeleteResourceButton resourceId={resource.id} resourceName={resource.title} />
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
