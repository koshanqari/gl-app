"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Building2, LogOut, User, RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/loading-screen";
import { ExecutiveFooter } from "@/components/executive-footer";
import { getPartnersWithEventCount } from "@/lib/mock-data";
import { getExecutiveSession, clearExecutiveSession, setRedirectUrl, setLastVisitedPage } from "@/lib/auth-cookies";
import { RefreshProvider, useRefresh } from "@/contexts/refresh-context";

function ExecutivePortalContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { triggerRefresh } = useRefresh();
  const [executive, setExecutive] = useState<any>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasCheckedAuth = useRef(false);
  const hasPreloaded = useRef(false);

  useEffect(() => {
    // Only check auth once
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;
    
    // Check if user is logged in
    const session = getExecutiveSession();
    if (!session) {
      // Store current URL for redirect after login
      setRedirectUrl(pathname);
      router.push("/executive/login");
    } else {
      setExecutive(session);
    }
  }, [router, pathname]);

  // Track last visited page
  useEffect(() => {
    if (executive && pathname.startsWith('/executive/')) {
      setLastVisitedPage('executive', pathname);
    }
  }, [pathname, executive]);

  // Preload all routes and data after auth is complete
  useEffect(() => {
    if (!executive || hasPreloaded.current) return;
    hasPreloaded.current = true;

    const preloadData = async () => {
      try {
        // Step 1: Preload partner data (20%)
        setLoadingProgress(20);
        const partners = getPartnersWithEventCount();
        await new Promise(resolve => setTimeout(resolve, 200));

        // Step 2: Prefetch routes (30-90%)
        const routes = [
          '/executive/executive_portal/partners',
          '/executive/executive_portal/profile',
        ];

        // Add partner portal routes for each partner
        partners.forEach(partner => {
          routes.push(`/executive/partner_portal/${partner.id}/events`);
          routes.push(`/executive/partner_portal/${partner.id}/profile`);
        });

        const totalRoutes = routes.length;
        for (let i = 0; i < totalRoutes; i++) {
          try {
            router.prefetch(routes[i]);
            setLoadingProgress(30 + Math.round(((i + 1) / totalRoutes) * 60));
            await new Promise(resolve => setTimeout(resolve, 50));
          } catch (error) {
            console.error('Failed to prefetch route:', routes[i], error);
          }
        }

        // Step 3: Complete (100%)
        setLoadingProgress(100);
        await new Promise(resolve => setTimeout(resolve, 300));
        setIsInitialLoading(false);
      } catch (error) {
        console.error('Preload error:', error);
        setIsInitialLoading(false);
      }
    };

    preloadData();
  }, [executive, router]);

  const handleLogout = () => {
    clearExecutiveSession();
    router.push("/executive/login");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    triggerRefresh();
    // Give a brief moment for the animation
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  // Only show loading screen on initial load
  if (isInitialLoading) {
    return <LoadingScreen progress={loadingProgress} />;
  }

  // If auth is complete but executive isn't loaded yet, return null
  if (!executive) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Fixed Header */}
      <header className="bg-white border-b border-slate-200 z-20 flex-shrink-0">
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
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh Page Data"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
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
      <div className="flex flex-1 overflow-hidden">
        {/* Fixed Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 overflow-y-auto">
          <nav className="p-4 space-y-2">
            <Button
              variant={pathname === "/executive/executive_portal/quick-links" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => router.push("/executive/executive_portal/quick-links")}
            >
              <Zap className="mr-2 h-4 w-4" />
              Quick Links
            </Button>
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

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full flex flex-col">
            <div className="flex-1 p-6">
              {children}
            </div>
            {/* Footer at bottom */}
            <ExecutiveFooter />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ExecutivePortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RefreshProvider>
      <ExecutivePortalContent>{children}</ExecutivePortalContent>
    </RefreshProvider>
  );
}

