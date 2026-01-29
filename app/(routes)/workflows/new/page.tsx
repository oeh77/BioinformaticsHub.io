"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  GitBranch, 
  Save, 
  ArrowLeft,
  Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { WorkflowCanvas, WorkflowToolbar } from "@/components/workflow";
import { WorkflowExportDialog } from "@/components/workflow/WorkflowExportDialog";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Node, Edge } from "reactflow";

export default function NewWorkflowPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState("");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const handleSave = async (savedNodes: Node[], savedEdges: Edge[]) => {
    // If called from header button without args, use state.
    // But header button calls with (nodes, edges) where nodes/edges are from state.
    // Child onSave calls with (nodes, edges) from child state.
    
    // We update state to be sure
    setNodes(savedNodes);
    setEdges(savedEdges);
    
    setIsSaving(true);
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workflowName,
          description,
          nodes: savedNodes,
          edges: savedEdges,
          isPublic,
          tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        }),
      });

      if (res.ok) {
        const workflow = await res.json();
        toast({
          title: "Workflow Saved",
          description: "Your workflow has been created successfully.",
        });
        router.push(`/workflows/${workflow.slug}`);
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to save workflow");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save workflow",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/workflows">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-primary" />
                <Input
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="h-9 text-lg font-semibold border-0 focus-visible:ring-0 bg-transparent px-0"
                  placeholder="Workflow name..."
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Export Dialog */}
              <WorkflowExportDialog 
                workflowName={workflowName}
                nodes={nodes}
                edges={edges}
              />

              {/* Settings Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Workflow Settings</SheetTitle>
                    <SheetDescription>
                      Configure your workflow metadata and visibility settings.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-6 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe what this workflow does..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (comma separated)</Label>
                      <Input
                        id="tags"
                        placeholder="genomics, rna-seq, alignment..."
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Public Workflow</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow others to view and fork this workflow
                        </p>
                      </div>
                      <Switch
                        checked={isPublic}
                        onCheckedChange={setIsPublic}
                      />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <Button 
                onClick={() => handleSave(nodes, edges)} 
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Toolbar */}
          <WorkflowToolbar />

          {/* Canvas */}
          <div className="flex-1">
            <WorkflowCanvas
              initialNodes={[
                {
                  id: "input-1",
                  type: "input",
                  position: { x: 250, y: 50 },
                  data: { label: "Input FASTQ", type: "fastq" },
                },
                {
                  id: "output-1",
                  type: "output",
                  position: { x: 250, y: 400 },
                  data: { label: "Results", type: "report" },
                },
              ]}
              onSave={handleSave}
              onChange={(nds, eds) => {
                setNodes(nds);
                setEdges(eds);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
