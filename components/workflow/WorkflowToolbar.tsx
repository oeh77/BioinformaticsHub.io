"use client";

import { useState, useEffect } from "react";
import { 
  Wrench, 
  FileInput, 
  FileOutput, 
  Plus,
  Search,
  GripVertical
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import { STANDARD_TOOLS, WorkflowTool } from "@/lib/workflow/tools";

export function WorkflowToolbar() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Group tools by category
  const toolsByCategory = STANDARD_TOOLS.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, WorkflowTool[]>);

  const categories = Object.keys(toolsByCategory).sort();

  const onDragStart = (event: React.DragEvent, nodeType: string, data?: object) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    if (data) {
      event.dataTransfer.setData("tool-data", JSON.stringify(data));
    }
    event.dataTransfer.effectAllowed = "move";
  };

  const DraggableItem = ({ 
    type, 
    label, 
    icon: Icon, 
    data,
    description,
    badge 
  }: { 
    type: string; 
    label: string; 
    icon: any;
    data?: object;
    description?: string;
    badge?: string;
  }) => (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, type, data)}
      className="p-3 bg-card border rounded-lg cursor-grab active:cursor-grabbing hover:shadow-md transition-all flex items-center gap-3 group"
    >
      <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="p-2 rounded-md bg-primary/10 shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{label}</span>
          {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        )}
      </div>
    </div>
  );

  return (
    <Card className="w-80 h-full flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Nodes
        </CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0 pb-4">
        <ScrollArea className="h-full px-4">
          <div className="space-y-6">
            {/* Basic Nodes */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Basic Nodes</h4>
              <DraggableItem
                type="input"
                label="Data Input"
                icon={FileInput}
                data={{ label: "Input Data", type: "fastq" }}
                description="FASTQ, FASTA, BAM, VCF"
              />
              <DraggableItem
                type="output"
                label="Output"
                icon={FileOutput}
                data={{ label: "Results", type: "report" }}
                description="Reports, visualizations"
              />
            </div>

            {/* Tool Categories */}
            {categories.map((category) => {
              const categoryTools = toolsByCategory[category].filter(tool => 
                tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tool.description.toLowerCase().includes(searchQuery.toLowerCase())
              );

              if (categoryTools.length === 0) return null;

              return (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                    {category}
                    <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                      {categoryTools.length}
                    </Badge>
                  </h4>
                  {categoryTools.map((tool) => (
                    <DraggableItem
                      key={tool.id}
                      type="tool"
                      label={tool.name}
                      icon={tool.icon || Wrench}
                      data={{
                        name: tool.name,
                        description: tool.description,
                        category: tool.category,
                        slug: tool.id,
                        inputs: tool.inputs,
                        outputs: tool.outputs
                      }}
                      description={tool.description}
                    />
                  ))}
                </div>
              );
            })}

            {Object.values(toolsByCategory).flat().filter(t => 
              t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              t.description.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tools found
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
