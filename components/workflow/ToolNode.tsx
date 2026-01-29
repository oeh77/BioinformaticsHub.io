"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Wrench } from "lucide-react";

interface ToolNodeData {
  name: string;
  description?: string;
  category?: string;
  slug?: string;
}

export const ToolNode = memo(({ data, selected }: NodeProps<ToolNodeData>) => {
  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 bg-card shadow-lg min-w-[180px]
        ${selected ? "border-primary ring-2 ring-primary/30" : "border-border"}
        transition-all
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-primary border-2 border-background"
      />
      
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-md bg-primary/10">
          <Wrench className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{data.name || "Tool"}</div>
          {data.category && (
            <div className="text-xs text-muted-foreground truncate">{data.category}</div>
          )}
        </div>
      </div>
      
      {data.description && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
          {data.description}
        </p>
      )}
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-primary border-2 border-background"
      />
    </div>
  );
});

ToolNode.displayName = "ToolNode";
