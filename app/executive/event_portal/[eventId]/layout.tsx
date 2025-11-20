"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LayoutDashboard, Users, Home, FileText, LogOut, Building2, Calendar, Plane, UtensilsCrossed, UserCog, UserPlus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExecutiveFooter } from "@/components/executive-footer";
import { useEffect, useState, useRef } from "react";
import { EventDataProvider } from "@/lib/event-context";
import { LoadingScreen } from "@/components/loading-screen";
import { getExecutiveSession, getCollaboratorSession, clearExecutiveSession, clearCollaboratorSession, setRedirectUrl, setLastVisitedPage } from "@/lib/auth-cookies";
import { RefreshProvider, useRefresh } from "@/contexts/refresh-context";

interface CollaboratorPermissions {
  overview: boolean;
  members: boolean;
  stay: boolean;
  crew: boolean;
  itinerary: boolean;
  travel: boolean;
  meals: boolean;
  event_profile: boolean;
}

function EventLayoutContent({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { triggerRefresh } = useRefresh();
  const eventId = params.eventId as string;
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<"executive" | "collaborator" | null>(null);
  const [permissions, setPermissions] = useState<CollaboratorPermissions | null>(null);
  const [event, setEvent] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasCheckedAuth = useRef(false);
  const hasPreloaded = useRef(false);

  useEffect(() => {
    // Only check auth once per mount
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;
    
    // For /executive/* routes, check for collaborator session FIRST
    // This ensures collaborators can access the event portal even if there's a stale executive session
    const collabSession = getCollaboratorSession();
    const executiveSession = getExecutiveSession();
    
    // Debug logging
    console.log('[EventLayout] Auth check:', {
      eventId,
      hasCollabSession: !!collabSession,
      collabEventId: collabSession?.eventId,
      eventIdMatch: collabSession?.eventId === eventId,
      hasExecutiveSession: !!executiveSession,
    });
    
    // Check collaborator session first - if it matches the event, use it
    if (collabSession && collabSession.eventId === eventId) {
      // Collaborator session matches the current event - use it
      console.log('[EventLayout] Using collaborator session');
      setUserRole("collaborator");
      setUser({ id: collabSession.id, name: "Collaborator", email: collabSession.email });
      setPermissions(collabSession.permissions);
    } else if (executiveSession) {
      // No valid collaborator session, but executive session exists - use it
      console.log('[EventLayout] Using executive session');
        setUserRole("executive");
        setUser(executiveSession);
        // Executives have all permissions
        setPermissions({
          overview: true,
          members: true,
          stay: true,
          crew: true,
          itinerary: true,
          travel: true,
          meals: true,
          event_profile: true,
        });
    } else {
      // No valid session found
      console.log('[EventLayout] No valid session, redirecting...');
      // If collaborator session exists but for different event, clear it
      if (collabSession && collabSession.eventId !== eventId) {
        clearCollaboratorSession();
      }
      // Store current URL for redirect after login
      setRedirectUrl(pathname);
      // Redirect to collaborator login if there was a collaborator session, otherwise executive login
      if (collabSession) {
        // Redirect to collaborator login with the current event ID
        console.log('[EventLayout] Redirecting to collaborator login');
        router.push(`/collaborator/login?event=${eventId}`);
      } else {
        // No session at all, redirect to executive login
        console.log('[EventLayout] Redirecting to executive login');
        router.push("/executive/login");
      }
    }
  }, [router, pathname, eventId]);

  // Track last visited page (only for executives)
  useEffect(() => {
    if (userRole === 'executive' && pathname.startsWith('/executive/')) {
      setLastVisitedPage('executive', pathname);
    }
  }, [pathname, userRole]);

  // Preload all routes and data after auth is complete
  useEffect(() => {
    if (!permissions || hasPreloaded.current) return;
    hasPreloaded.current = true;

    const preloadData = async () => {
      try {
        // Step 1: Fetch event data (20%)
        setLoadingProgress(20);
        const eventResponse = await fetch(`/api/events/${eventId}`);
        if (eventResponse.ok) {
          const eventData = await eventResponse.json();
          setEvent(eventData.event);
          
          // Step 2: Fetch partner data (40%)
          setLoadingProgress(40);
          if (eventData.event.partner_id) {
            const partnerResponse = await fetch(`/api/partners/${eventData.event.partner_id}`);
            if (partnerResponse.ok) {
              const partnerData = await partnerResponse.json();
              setPartner(partnerData.partner);
            }
          }
        }

        // Step 3: Prefetch routes (50-90%)
        setLoadingProgress(50);
        const routes = [
          '/executive/event_portal/' + eventId + '/overview',
          '/executive/event_portal/' + eventId + '/members',
          '/executive/event_portal/' + eventId + '/stay',
          '/executive/event_portal/' + eventId + '/crew',
          '/executive/event_portal/' + eventId + '/itinerary',
          '/executive/event_portal/' + eventId + '/travel',
          '/executive/event_portal/' + eventId + '/meals',
          '/executive/event_portal/' + eventId + '/profile',
          '/executive/event_portal/' + eventId + '/collaborators',
        ];

        // Filter routes based on permissions
        const allowedRoutes = routes.filter(route => {
          if (route.includes('/overview')) return permissions.overview;
          if (route.includes('/members')) return permissions.members;
          if (route.includes('/stay')) return permissions.stay;
          if (route.includes('/crew')) return permissions.crew;
          if (route.includes('/itinerary')) return permissions.itinerary;
          if (route.includes('/travel')) return permissions.travel;
          if (route.includes('/meals')) return permissions.meals;
          if (route.includes('/profile')) return permissions.event_profile;
          if (route.includes('/collaborators')) return userRole === 'executive';
          return true;
        });

        // Preload each route with progress
        const totalRoutes = allowedRoutes.length;
        for (let i = 0; i < totalRoutes; i++) {
          try {
            // Prefetch the route
            router.prefetch(allowedRoutes[i]);
            // Update progress
            setLoadingProgress(50 + Math.round(((i + 1) / totalRoutes) * 40));
            // Small delay to show progress
            await new Promise(resolve => setTimeout(resolve, 50));
          } catch (error) {
            console.error('Failed to prefetch route:', allowedRoutes[i], error);
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
  }, [permissions, router, eventId, userRole]);

  const handleLogout = () => {
    if (userRole === "collaborator") {
      clearCollaboratorSession();
      router.push("/collaborator/login");
    } else {
      clearExecutiveSession();
      router.push("/executive/login");
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    triggerRefresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  // EventDataProvider context (currently not used, but kept for potential future use)
  // All data is now fetched via API calls in individual pages
  const members: any[] = [];
  const hotels: any[] = [];
  const roomAssignments: any[] = [];

  // Only show loading screen on initial load
  if (isInitialLoading) {
    return <LoadingScreen progress={loadingProgress} />;
  }

  // If auth is complete but data isn't ready yet, return null to avoid flash
  if (!event || !partner || !user || !permissions || !userRole) {
    return null;
  }

  // Construct eventData object for compatibility
  const eventData = {
    ...event,
    partner: partner
  };

  // Prepare context value
  const contextValue = {
    eventId,
    event,
    partner,
    members,
    hotels,
    roomAssignments,
    user,
    userRole: userRole as "executive" | "collaborator",
    permissions,
  };

  return (
    <EventDataProvider value={contextValue}>
      <div className="h-screen flex flex-col bg-slate-50">
        {/* Fixed Header */}
        <header className="bg-white border-b border-slate-200 z-20 flex-shrink-0">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              {userRole === "executive" && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.push(`/executive/partner_portal/${partner.id}/events`)}
                  title="Back to Event Management"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="flex items-center gap-3">
                {event.logo_url ? (
                  <img 
                    src={event.logo_url} 
                    alt={event.event_name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{event.event_name}</h1>
                  <p className="text-xs text-slate-500">
                    {partner.company_name} • {event.event_type}
                    {userRole === "collaborator" && " • Collaborator Access"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
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
            {permissions.overview && (
              <Link
                href={`/executive/event_portal/${eventId}/overview`}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname === `/executive/event_portal/${eventId}/overview`
                    ? "bg-primary text-primary-foreground"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Overview
                </div>
                <span className="text-xs text-slate-500">Soon</span>
              </Link>
            )}
            
            {permissions.members && (
              <Link
                href={`/executive/event_portal/${eventId}/members`}
                className={`w-full flex items-center justify-start px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname === `/executive/event_portal/${eventId}/members`
                    ? "bg-primary text-primary-foreground"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Users className="mr-2 h-4 w-4" />
                Members
              </Link>
            )}
            
            {permissions.stay && (
              <Link
                href={`/executive/event_portal/${eventId}/stay`}
                className={`w-full flex items-center justify-start px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname === `/executive/event_portal/${eventId}/stay`
                    ? "bg-primary text-primary-foreground"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Home className="mr-2 h-4 w-4" />
                Stay
              </Link>
            )}
            
            {permissions.itinerary && (
              <Link
                href={`/executive/event_portal/${eventId}/itinerary`}
                className={`w-full flex items-center justify-start px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname === `/executive/event_portal/${eventId}/itinerary`
                    ? "bg-primary text-primary-foreground"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <FileText className="mr-2 h-4 w-4" />
                Itinerary
              </Link>
            )}
            
            {permissions.crew && (
              <Link
                href={`/executive/event_portal/${eventId}/crew`}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname === `/executive/event_portal/${eventId}/crew`
                    ? "bg-primary text-primary-foreground"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center">
                  <UserCog className="mr-2 h-4 w-4" />
                  Crew
                </div>
                <span className="text-xs text-slate-500">Soon</span>
              </Link>
            )}
            
            {permissions.travel && (
              <Link
                href={`/executive/event_portal/${eventId}/travel`}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname === `/executive/event_portal/${eventId}/travel`
                    ? "bg-primary text-primary-foreground"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center">
                  <Plane className="mr-2 h-4 w-4" />
                  Travel
                </div>
                <span className="text-xs text-slate-500">Soon</span>
              </Link>
            )}
            
            {permissions.meals && (
              <Link
                href={`/executive/event_portal/${eventId}/meals`}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname === `/executive/event_portal/${eventId}/meals`
                    ? "bg-primary text-primary-foreground"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center">
                  <UtensilsCrossed className="mr-2 h-4 w-4" />
                  Meals
                </div>
                <span className="text-xs text-slate-500">Soon</span>
              </Link>
            )}
            
            {permissions.event_profile && (
              <Link
                href={`/executive/event_portal/${eventId}/profile`}
                className={`w-full flex items-center justify-start px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname === `/executive/event_portal/${eventId}/profile`
                    ? "bg-primary text-primary-foreground"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Event Profile
              </Link>
            )}
            
            {/* Collaborators link - only for executives */}
            {userRole === "executive" && (
              <>
                <div className="my-2 border-t border-slate-200" />
                <Link
                  href={`/executive/event_portal/${eventId}/collaborators`}
                  className={`w-full flex items-center justify-start px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname === `/executive/event_portal/${eventId}/collaborators`
                      ? "bg-primary text-primary-foreground"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Collaborators
                </Link>
              </>
            )}
          </nav>
        </aside>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto page-transition">
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
    </EventDataProvider>
  );
}

export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RefreshProvider>
      <EventLayoutContent>{children}</EventLayoutContent>
    </RefreshProvider>
  );
}

