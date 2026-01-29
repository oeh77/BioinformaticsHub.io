"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus, Trash2, ExternalLink, Lock, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import Link from "next/link";

interface Tool {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  category: { name: string };
}

interface Stack {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isPublic: boolean;
  tools: { tool: Tool }[];
}

export function MyStackManager() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newStack, setNewStack] = useState({
    name: "",
    description: "",
    isPublic: true,
  });

  useEffect(() => {
    if (status === "authenticated") {
      fetchStacks();
    } else {
      setIsLoading(false);
    }
  }, [status]);

  const fetchStacks = async () => {
    try {
      const res = await fetch("/api/stacks");
      if (!res.ok) throw new Error("Failed to fetch stacks");
      const data = await res.json();
      setStacks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newStack.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your stack.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch("/api/stacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStack),
      });

      if (!res.ok) throw new Error("Failed to create stack");

      const created = await res.json();
      setStacks((prev) => [{ ...created, tools: [] }, ...prev]);
      setNewStack({ name: "", description: "", isPublic: true });
      setCreateOpen(false);

      toast({
        title: "Stack created",
        description: "You can now add tools to your stack.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create stack.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (stackId: string) => {
    try {
      const res = await fetch(`/api/stacks?id=${stackId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete stack");

      setStacks((prev) => prev.filter((s) => s.id !== stackId));

      toast({
        title: "Stack deleted",
        description: "Your stack has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete stack.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveTool = async (stackId: string, toolId: string) => {
    try {
      const res = await fetch(
        `/api/stacks/${stackId}/tools?toolId=${toolId}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Failed to remove tool");

      setStacks((prev) =>
        prev.map((s) =>
          s.id === stackId
            ? { ...s, tools: s.tools.filter((t) => t.tool.id !== toolId) }
            : s
        )
      );

      toast({
        title: "Tool removed",
        description: "Tool removed from your stack.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove tool.",
        variant: "destructive",
      });
    }
  };

  if (status === "unauthenticated") {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Sign in to create stacks</h3>
        <p className="text-muted-foreground">
          Create and share your bioinformatics tool collections
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Stacks</h2>
          <p className="text-muted-foreground">
            Create collections of your favorite tools
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Stack
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new stack</DialogTitle>
              <DialogDescription>
                Give your stack a name and description
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  placeholder="My Genomics Stack"
                  value={newStack.name}
                  onChange={(e) =>
                    setNewStack((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Essential tools for genome analysis..."
                  value={newStack.description}
                  onChange={(e) =>
                    setNewStack((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {newStack.isPublic ? (
                    <Globe className="h-4 w-4 text-primary" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">
                    {newStack.isPublic ? "Public" : "Private"}
                  </span>
                </div>
                <Switch
                  checked={newStack.isPublic}
                  onCheckedChange={(checked) =>
                    setNewStack((prev) => ({ ...prev, isPublic: checked }))
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Stack
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {stacks.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-lg font-semibold mb-2">No stacks yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first stack to start collecting tools
          </p>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Stack
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {stacks.map((stack) => (
            <div
              key={stack.id}
              className="p-6 rounded-xl border border-border/50 bg-card/50 hover:bg-card/80 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{stack.name}</h3>
                    {stack.isPublic ? (
                      <Globe className="h-4 w-4 text-primary" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  {stack.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {stack.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {stack.isPublic && (
                    <Link href={`/stacks/${stack.slug}`}>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        title="View stack"
                        aria-label="View stack"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(stack.id)}
                    className="text-destructive hover:text-destructive"
                    title="Delete stack"
                    aria-label="Delete stack"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {stack.tools.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No tools yet. Browse the directory to add tools.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {stack.tools.map(({ tool }) => (
                    <div
                      key={tool.id}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-sm group"
                    >
                      {tool.image && (
                        <Image
                          src={tool.image}
                          alt={tool.name}
                          width={20}
                          height={20}
                          className="rounded-sm"
                        />
                      )}
                      <span>{tool.name}</span>
                      <button
                        onClick={() => handleRemoveTool(stack.id, tool.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                        title={`Remove ${tool.name} from stack`}
                        aria-label={`Remove ${tool.name} from stack`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
