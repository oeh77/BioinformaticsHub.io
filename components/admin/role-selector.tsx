"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface RoleSelectorProps {
  userId: string;
  currentRole: string;
}

const roleColors: Record<string, string> = {
  ADMIN: "bg-red-500/10 text-red-500 border-red-500/30",
  EDITOR: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  USER: "bg-green-500/10 text-green-500 border-green-500/30",
};

export function RoleSelector({ userId, currentRole }: RoleSelectorProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [role, setRole] = useState(currentRole);

  const handleRoleChange = async (newRole: string) => {
    if (newRole === role) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        setRole(newRole);
        router.refresh();
      }
    } catch (error) {
      console.error("Role update failed:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isUpdating) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Updating...
      </div>
    );
  }

  return (
    <select
      title="Select user role"
      aria-label="Select user role"
      value={role}
      onChange={(e) => handleRoleChange(e.target.value)}
      className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer outline-none ${roleColors[role] || roleColors.USER}`}
    >
      <option value="USER">User</option>
      <option value="EDITOR">Editor</option>
      <option value="ADMIN">Admin</option>
    </select>
  );
}
