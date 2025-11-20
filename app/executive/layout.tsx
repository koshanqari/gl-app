"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Building2, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExecutiveFooter } from "@/components/executive-footer";
import { getExecutiveSession, clearExecutiveSession, setRedirectUrl } from "@/lib/auth-cookies";

export default function ExecutiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [executive, setExecutive] = useState<any>(null);

  useEffect(() => {
    // Skip auth check for event portal routes - they have their own layout that handles collaborator sessions
    const isEventPortal = pathname.startsWith("/executive/event_portal");
    
    // Check if user is logged in (only for non-event-portal routes)
    if (pathname !== "/executive/login" && !isEventPortal) {
      const session = getExecutiveSession();
      if (!session) {
        setRedirectUrl(pathname);
        router.push("/executive/login");
      } else {
        setExecutive(session);
      }
    }
  }, [pathname, router]);

  const handleLogout = () => {
    clearExecutiveSession();
    router.push("/executive/login");
  };

  // Don't show layout on login page, or any portal pages
  const isExecutivePortal = pathname.startsWith("/executive/executive_portal");
  const isPartnerPortal = pathname.startsWith("/executive/partner_portal");
  const isEventPortal = pathname.startsWith("/executive/event_portal");
  
  if (pathname === "/executive/login" || isExecutivePortal || isPartnerPortal || isEventPortal) {
    return <>{children}</>;
  }

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
              variant={pathname === "/executive/partners" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => router.push("/executive/partners")}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Partner Management
            </Button>
            <Button
              variant={pathname === "/executive/profile" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => router.push("/executive/profile")}
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

      {/* Footer */}
      <ExecutiveFooter />
    </div>
  );
}

