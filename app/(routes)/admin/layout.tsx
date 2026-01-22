import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminMobileSidebar } from "@/components/admin/admin-mobile-sidebar";
import { AdminLogoutButton } from "@/components/admin/logout-button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Redirect if not authenticated or not admin
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/?error=unauthorized");
  }

  return (
    <div className="md:ml-64">
      <div className="flex min-h-screen pt-16">
        {/* Mobile Sidebar */}
        <AdminMobileSidebar userName={session.user.name} />

        {/* Desktop Sidebar */}
        <aside className="w-64 border-r border-white/10 hidden md:flex flex-col bg-card/50 backdrop-blur-sm fixed h-[calc(100vh-4rem)] z-40 left-0">
          <AdminSidebar userName={session.user.name} />
          
          <div className="mt-auto p-6 border-t border-white/10">
            <AdminLogoutButton />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 bg-secondary/20 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
