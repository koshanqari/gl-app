"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Building2, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExecutiveFooter } from "@/components/executive-footer";
import { useEffect, useState, useRef } from "react";
import { LoadingScreen } from "@/components/loading-screen";
import { getExecutiveSession, clearExecutiveSession, setRedirectUrl, setLastVisitedPage } from "@/lib/auth-cookies";
import { RefreshProvider, useRefresh } from "@/contexts/refresh-context";

function PartnerLayoutContent({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const partnerId = params.id as string;
  const { triggerRefresh } = useRefresh();
  const [executive, setExecutive] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
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
        // Step 1: Fetch partner data (20%)
        setLoadingProgress(20);
        const partnerResponse = await fetch(`/api/partners/${partnerId}`);
        if (partnerResponse.ok) {
          const partnerData = await partnerResponse.json();
          setPartner(partnerData.partner);
        }
        
        // Step 2: Fetch events data for this partner (40%)
        setLoadingProgress(40);
        const eventsResponse = await fetch(`/api/events?partner_id=${partnerId}`);
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setEvents(eventsData.events);
          
          // Step 3: Prefetch routes (50-90%)
          const routes = [
            `/executive/partner_portal/${partnerId}/events`,
            `/executive/partner_portal/${partnerId}/profile`,
          ];

          // Add event portal routes for each event
          eventsData.events.forEach((event: any) => {
            routes.push(`/executive/event_portal/${event.id}/overview`);
            routes.push(`/executive/event_portal/${event.id}/members`);
            routes.push(`/executive/event_portal/${event.id}/stay`);
            routes.push(`/executive/event_portal/${event.id}/profile`);
          });

          const totalRoutes = routes.length;
          for (let i = 0; i < totalRoutes; i++) {
            try {
              router.prefetch(routes[i]);
              setLoadingProgress(50 + Math.round(((i + 1) / totalRoutes) * 40));
              await new Promise(resolve => setTimeout(resolve, 50));
            } catch (error) {
              console.error('Failed to prefetch route:', routes[i], error);
            }
          }
        }

        // Step 4: Complete (100%)
        setLoadingProgress(100);
        await new Promise(resolve => setTimeout(resolve, 300));
        setIsInitialLoading(false);
      } catch (error) {
        console.error('Preload error:', error);
        setIsInitialLoading(false);
      }
    };

    preloadData();
  }, [executive, router, partnerId]);

  const handleLogout = () => {
    clearExecutiveSession();
    router.push("/executive/login");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    triggerRefresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  // Only show loading screen on initial load
  if (isInitialLoading) {
    return <LoadingScreen progress={loadingProgress} />;
  }

  // If auth is complete but data isn't ready yet, return null
  if (!partner || !executive) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Fixed Header */}
      <header className="bg-white border-b border-slate-200 z-20 flex-shrink-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/executive/executive_portal/partners")}
              title="Back to Partner Management"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              {partner.logo_url ? (
                <img 
                  src={partner.logo_url} 
                  alt={partner.company_name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-slate-900">{partner.company_name}</h1>
                <p className="text-xs text-slate-500">
                  {partner.industry_type} • {partner.company_size}
                </p>
              </div>
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
            <Link
              href={`/executive/partner_portal/${partnerId}/events`}
              className={`w-full flex items-center justify-start px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                pathname === `/executive/partner_portal/${partnerId}/events`
                  ? "bg-primary text-primary-foreground"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Event Management
            </Link>
            <Link
              href={`/executive/partner_portal/${partnerId}/profile`}
              className={`w-full flex items-center justify-start px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                pathname === `/executive/partner_portal/${partnerId}/profile`
                  ? "bg-primary text-primary-foreground"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Partner Profile
            </Link>
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

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RefreshProvider>
      <PartnerLayoutContent>{children}</PartnerLayoutContent>
    </RefreshProvider>
  );
}
