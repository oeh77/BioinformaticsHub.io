"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { FileOutput } from "lucide-react";

interface OutputNodeData {
  label: string;
  type?: string;  // report, visualization, etc.
}

export const OutputNode = memo(({ data, selected }: NodeProps<OutputNodeData>) => {
  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 bg-blue-500/10 shadow-lg min-w-[150px]
        ${selected ? "border-blue-500 ring-2 ring-blue-500/30" : "border-blue-500/50"}
        transition-all
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500 border-2 border-background"
      />
      
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-md bg-blue-500/20">
          <FileOutput className="h-4 w-4 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{data.label || "Output"}</div>
          {data.type && (
            <div className="text-xs text-muted-foreground">{data.type}</div>
          )}
        </div>
      </div>
    </div>
  );
});

OutputNode.displayName = "OutputNode";
