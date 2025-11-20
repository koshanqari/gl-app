"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MobileFooter } from "@/components/mobile";
import { Calendar, MapPin, Building2, ArrowRight, LogOut } from "lucide-react";
import { LoadingScreen } from "@/components/loading-screen";
import { getMemberSession, clearMemberSession, setRedirectUrl, setLastVisitedPage } from "@/lib/auth-cookies";

export default function MemberEventsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [member, setMember] = useState<any>(null);
  const [memberEvents, setMemberEvents] = useState<any[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const hasCheckedAuth = useRef(false);
  const hasPreloaded = useRef(false);
  const hasAutoRedirected = useRef(false);
  const shouldShowEventsList = useRef(false);

  useEffect(() => {
    // Only check auth once
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;
    
    // Check if member is logged in
    const session = getMemberSession();
    if (!session) {
      setRedirectUrl(pathname);
      router.push("/member/login");
    } else {
      setMember(session);
    }
  }, [router, pathname]);

  // Track last visited page
  useEffect(() => {
    if (member && pathname.startsWith('/member/')) {
      setLastVisitedPage('member', pathname);
    }
  }, [pathname, member]);

  // Preload data after auth is complete
  useEffect(() => {
    if (!member || hasPreloaded.current) return;
    hasPreloaded.current = true;

    const preloadData = async () => {
      try {
        // Step 1: Load member events (30%)
        setLoadingProgress(30);
        
        // Fetch all members with this email to get all event_ids
        const membersResponse = await fetch(`/api/members?email=${encodeURIComponent(member.email)}`);
        const membersData = await membersResponse.json();
        
        if (membersResponse.ok && membersData.members) {
          // Get unique event IDs
          const eventIds: string[] = [...new Set(membersData.members.map((m: any) => m.event_id).filter(Boolean) as string[])];
          
          // Fetch each event
          const eventPromises = eventIds.map(async (eventId: string) => {
            try {
              const eventResponse = await fetch(`/api/events/${eventId}`);
              const eventData = await eventResponse.json();
              return eventResponse.ok ? eventData.event : null;
            } catch (error) {
              console.error(`Failed to fetch event ${eventId}:`, error);
              return null;
            }
          });
          
          const events = (await Promise.all(eventPromises)).filter(Boolean);
          setMemberEvents(events);
          
          // Check if we should show events list (e.g., from back button or URL parameter)
          const urlParams = new URLSearchParams(window.location.search);
          const showList = urlParams.get('show') === 'list' || shouldShowEventsList.current;
          
          if (showList) {
            // User explicitly wants to see events list - don't auto-redirect
            shouldShowEventsList.current = false;
            hasAutoRedirected.current = false;
          } else if (events.length === 1 && !hasAutoRedirected.current) {
            // Initial load with single event - auto-redirect
            hasAutoRedirected.current = true;
            // Small delay to ensure state is set
            await new Promise(resolve => setTimeout(resolve, 100));
            router.push(`/member/event/${events[0].id}/profile`);
            return; // Don't continue with loading screen
          }
        }

        // Step 2: Prefetch routes (60%)
        setLoadingProgress(60);
        await new Promise(resolve => setTimeout(resolve, 200));

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
  }, [member, router]);

  const handleLogout = () => {
    clearMemberSession();
    router.push("/member/login");
  };

  const handleEventSelect = (eventId: string) => {
    router.push(`/member/event/${eventId}/profile`);
  };

  // Show loading screen on initial load
  if (isInitialLoading) {
    return <LoadingScreen progress={loadingProgress} />;
  }

  if (!member) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-lg mx-auto bg-white min-h-screen flex flex-col">
        {/* Mobile Header */}
        <header className="bg-white sticky top-0 z-10 shadow-sm flex-shrink-0">
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex-1 min-w-0 mr-3">
              <h1 className="text-xl font-bold text-slate-900">My Events</h1>
              <p className="text-sm text-slate-500 truncate">{member.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="flex-shrink-0 rounded-full"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col">
          <div className="px-4 pt-3 pb-6 space-y-3 flex-1">
          {memberEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No Events Yet
              </h3>
              <p className="text-sm text-slate-500 text-center max-w-xs">
                You&apos;ll see your registered events here once they&apos;re available
              </p>
            </div>
          ) : (
            memberEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 active:scale-[0.98] transition-transform cursor-pointer"
                onClick={() => handleEventSelect(event.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Event Name */}
                    <h3 className="font-bold text-slate-900 text-lg mb-3 leading-tight">
                      {event.event_name}
                    </h3>
                    
                    {/* Event Details */}
                    <div className="space-y-2.5">
                      <div className="flex items-start text-sm text-slate-600">
                        <Calendar className="h-4.5 w-4.5 mr-2.5 flex-shrink-0 mt-0.5" />
                        <span>
                          {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(event.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      
                      <div className="flex items-start text-sm text-slate-600">
                        <MapPin className="h-4.5 w-4.5 mr-2.5 flex-shrink-0 mt-0.5" />
                        <span>{event.location || "Location TBA"}</span>
                      </div>
                      
                      <div className="flex items-start text-sm text-slate-600">
                        <Building2 className="h-4.5 w-4.5 mr-2.5 flex-shrink-0 mt-0.5" />
                        <span className="capitalize">{event.event_type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <ArrowRight className="h-5 w-5 text-slate-300 flex-shrink-0 mt-1" />
                </div>
              </div>
            ))
          )}
          </div>
          <div className="mt-auto">
            <MobileFooter />
          </div>
        </div>
      </div>
    </div>
  );
}

