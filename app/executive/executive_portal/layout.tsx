"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Building2, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ExecutivePortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [executive, setExecutive] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const session = localStorage.getItem("executive-session");
    if (!session) {
      router.push("/executive/login");
    } else {
      setExecutive(JSON.parse(session));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("executive-session");
    router.push("/executive/login");
  };

  // Show loading while checking session
  if (!executive) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">GL</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">GoldenLotus</h1>
              <p className="text-xs text-slate-500">MICE Management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">{executive.name}</p>
              <p className="text-xs text-slate-500">{executive.email}</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar + Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-73px)] p-4">
          <nav className="space-y-2">
            <Button
              variant={pathname === "/executive/executive_portal/partners" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => router.push("/executive/executive_portal/partners")}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Partner Management
            </Button>
            <Button
              variant={pathname === "/executive/executive_portal/profile" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => router.push("/executive/executive_portal/profile")}
            >
              <User className="mr-2 h-4 w-4" />
              Executive Profile
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

