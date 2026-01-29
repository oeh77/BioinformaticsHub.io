"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Check, Loader2, PlusCircle, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface Stack {
  id: string;
  name: string;
  tools: { toolId: string }[];
}

interface AddToStackButtonProps {
  toolId: string;
}

export function AddToStackButton({ toolId }: AddToStackButtonProps) {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && isOpen) {
      fetchStacks();
    }
  }, [status, isOpen]);

  const fetchStacks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/stacks");
      if (!res.ok) return;
      const data = await res.json();
      setStacks(
        data.map((s: { id: string; name: string; tools: { tool: { id: string } }[] }) => ({
          id: s.id,
          name: s.name,
          tools: s.tools.map((t: { tool: { id: string } }) => ({ toolId: t.tool.id })),
        }))
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToStack = async (stackId: string) => {
    setAddingTo(stackId);
    try {
      const res = await fetch(`/api/stacks/${stackId}/tools`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId }),
      });

      if (res.status === 409) {
        toast({
          title: "Already in stack",
          description: "This tool is already in the selected stack.",
        });
        return;
      }

      if (!res.ok) throw new Error("Failed to add to stack");

      setStacks((prev) =>
        prev.map((s) =>
          s.id === stackId
            ? { ...s, tools: [...s.tools, { toolId }] }
            : s
        )
      );

      toast({
        title: "Added to stack",
        description: "Tool has been added to your stack.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add tool to stack.",
        variant: "destructive",
      });
    } finally {
      setAddingTo(null);
    }
  };

  const handleUnauthClick = () => {
    signIn();
  };

  if (status === "loading") {
    return (
      <Button variant="outline" size="sm" className="gap-2" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
        Add to Stack
      </Button>
    );
  }

  if (status !== "authenticated") {
    return (
      <Button variant="outline" size="sm" className="gap-2" onClick={handleUnauthClick}>
        <Plus className="h-4 w-4" />
        Add to Stack
      </Button>
    );
  }

  const isInStack = (stackId: string) =>
    stacks.find((s) => s.id === stackId)?.tools.some((t) => t.toolId === toolId);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add to Stack
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Your Stacks</DropdownMenuLabel>
        
        {isLoading && stacks.length === 0 ? (
           <div className="p-4 flex justify-center">
             <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
           </div>
        ) : stacks.length === 0 ? (
          <div className="p-3 text-sm text-muted-foreground text-center">
            No stacks found
          </div>
        ) : (
          stacks.map((stack) => {
            const added = isInStack(stack.id);
            return (
              <DropdownMenuItem
                key={stack.id}
                onClick={(e) => {
                  e.preventDefault(); // Keep menu open? No, standard behavior is fine
                  if (!added) handleAddToStack(stack.id);
                }}
                disabled={!!added || addingTo === stack.id}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <Layers className="h-3 w-3 opacity-50" />
                  <span className="truncate max-w-[120px]">{stack.name}</span>
                </div>
                {addingTo === stack.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : added ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : null}
              </DropdownMenuItem>
            );
          })
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="cursor-pointer text-primary font-medium"
          onClick={() => router.push('/profile')}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create new stack
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
