"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function ExportSubscribersButton() {
  const handleExport = async () => {
    try {
      const response = await fetch("/api/admin/subscribers/export");
      const data = await response.json();
      
      if (data.subscribers) {
        const csv = [
          ["Email", "Name", "Status", "Subscribed On"],
          ...data.subscribers.map((s: { email: string; name: string; status: string; createdAt: string }) => [
            s.email,
            s.name || "",
            s.status,
            new Date(s.createdAt).toLocaleDateString(),
          ]),
        ]
          .map(row => row.join(","))
          .join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <Button onClick={handleExport} variant="outline" className="rounded-full">
      <Download className="w-4 h-4 mr-2" /> Export CSV
    </Button>
  );
}
