"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { FileInput } from "lucide-react";

interface InputNodeData {
  label: string;
  type?: string;  // fastq, fasta, bam, vcf, etc.
}

export const InputNode = memo(({ data, selected }: NodeProps<InputNodeData>) => {
  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 bg-green-500/10 shadow-lg min-w-[150px]
        ${selected ? "border-green-500 ring-2 ring-green-500/30" : "border-green-500/50"}
        transition-all
      `}
    >
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-md bg-green-500/20">
          <FileInput className="h-4 w-4 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{data.label || "Input"}</div>
          {data.type && (
            <div className="text-xs text-muted-foreground">.{data.type}</div>
          )}
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-green-500 border-2 border-background"
      />
    </div>
  );
});

InputNode.displayName = "InputNode";
