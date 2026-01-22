"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteToolButtonProps {
  toolId: string;
  toolName: string;
}

export function DeleteToolButton({ toolId, toolName }: DeleteToolButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/tools/${toolId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowConfirm(false)}
          className="text-xs"
        >
          Cancel
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-500 hover:text-red-600 text-xs"
        >
          {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirm"}
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
      onClick={() => setShowConfirm(true)}
      title={`Delete ${toolName}`}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
