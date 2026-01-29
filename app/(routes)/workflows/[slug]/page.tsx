"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  GitBranch, 
  Save, 
  ArrowLeft,
  Settings2,
  Share2,
  Trash2,
  Loader2,
  Download
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { WorkflowCanvas, WorkflowToolbar } from "@/components/workflow";
import { WorkflowExportDialog } from "@/components/workflow/WorkflowExportDialog";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Node, Edge } from "reactflow";

interface WorkflowData {
  id: string;
  name: string;
  description: string;
  slug: string;
  nodes: Node[];
  edges: Edge[];
  isPublic: boolean;
  tags: string[];
  authorId: string;
  author: {
    id: string;
    name: string | null;
  };
}

export default function WorkflowEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  // Unwrap params using React.use()
  const { slug } = use(params);
  
  const router = useRouter();
  const { toast } = useToast();
  
  const [workflow, setWorkflow] = useState<WorkflowData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form state
  const [workflowName, setWorkflowName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState("");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const res = await fetch(`/api/workflows/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            router.push("/workflows"); // Redirect if not found
            toast({
              title: "Error",
              description: "Workflow not found",
              variant: "destructive",
            });
            return;
          }
          throw new Error("Failed to fetch workflow");
        }
        const data = await res.json();
        setWorkflow(data);
        
        // Initialize state
        setWorkflowName(data.name);
        setDescription(data.description || "");
        setIsPublic(data.isPublic);
        setTags(Array.isArray(data.tags) ? data.tags.join(", ") : "");
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load workflow",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflow();
  }, [slug, router, toast]);

  const handleSave = async (currentNodes: Node[], currentEdges: Edge[]) => {
    // Update local state first to ensure we have latest nodes for subsequent saves
    setNodes(currentNodes);
    setEdges(currentEdges);
    
    setIsSaving(true);
    try {
      const res = await fetch(`/api/workflows/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workflowName,
          description,
          nodes: currentNodes,
          edges: currentEdges,
          isPublic,
          tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setWorkflow(updated);
        toast({
          title: "Workflow Saved",
          description: "Your changes have been saved successfully.",
        });
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

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/workflows/${slug}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast({
          title: "Workflow Deleted",
          description: "Resources have been cleaned up.",
        });
        router.push("/workflows");
      } else {
        throw new Error("Failed to delete workflow");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete workflow",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!workflow) return null;

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
                  className="h-9 text-lg font-semibold border-0 focus-visible:ring-0 bg-transparent px-0 w-[200px] md:w-[300px]"
                  placeholder="Workflow name..."
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <WorkflowExportDialog 
                workflowSlug={workflow.slug} 
                workflowName={workflow.name} 
              />

              {/* Settings Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" title="Settings">
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
                    
                    <div className="pt-6 border-t">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="w-full">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Workflow
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your
                              workflow and remove it from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              {isDeleting ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
        <div className="flex gap-6 h-[calc(100vh-140px)]">
          {/* Toolbar */}
          <WorkflowToolbar />

          {/* Canvas */}
          <div className="flex-1 border rounded-xl overflow-hidden shadow-sm bg-card">
            <WorkflowCanvas
              initialNodes={nodes}
              initialEdges={edges}
              onSave={handleSave}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
