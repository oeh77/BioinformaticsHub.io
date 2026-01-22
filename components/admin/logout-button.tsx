"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function AdminLogoutButton() {
  return (
    <Button 
      variant="ghost" 
      className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <LogOut className="w-4 h-4 mr-2" /> Logout
    </Button>
  );
}
