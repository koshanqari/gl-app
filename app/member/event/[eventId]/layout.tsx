"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Home, Calendar, Plane, UtensilsCrossed, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileFooter } from "@/components/mobile";
import { useEffect, useState } from "react";
import { getMemberSession, clearMemberSession, setRedirectUrl, setLastVisitedPage } from "@/lib/auth-cookies";

export default function MemberEventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const eventId = params.eventId as string;
  const [member, setMember] = useState<any>(null);
  const [memberData, setMemberData] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isKYCComplete, setIsKYCComplete] = useState(false);

  useEffect(() => {
    // Check if member is logged in
    const session = getMemberSession();
    if (!session) {
      setRedirectUrl(pathname);
      router.push("/member/login");
    } else {
      setMember(session);
    }
  }, [router, pathname]);

  // Fetch event, partner, and member data
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        const session = getMemberSession();
        if (!session) return;

        // Fetch event data
        const eventResponse = await fetch(`/api/events/${eventId}`);
        const eventData = await eventResponse.json();

        if (eventResponse.ok && eventData.event) {
          setEvent(eventData.event);

          // Fetch partner data if partner_id exists
          if (eventData.event.partner_id) {
            const partnerResponse = await fetch(`/api/partners/${eventData.event.partner_id}`);
            const partnerData = await partnerResponse.json();

            if (partnerResponse.ok) {
              setPartner(partnerData.partner);
            }
          }

          // Fetch member data to check KYC status
          const membersResponse = await fetch(`/api/members?event_id=${eventId}&email=${encodeURIComponent(session.email)}`);
          const membersData = await membersResponse.json();

          if (membersResponse.ok && membersData.members) {
            const memberRecord = membersData.members.find(
              (m: any) => m.email === session.email && m.event_id === eventId
            );

            if (memberRecord) {
              setMemberData(memberRecord);
              // Check if KYC is complete (all 3 fields must be filled)
              const kycComplete = !!(
                memberRecord.kyc_document_type &&
                memberRecord.kyc_document_number &&
                memberRecord.kyc_document_url
              );
              setIsKYCComplete(kycComplete);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch event data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  // Listen for KYC update events from profile page
  useEffect(() => {
    const handleKYCUpdate = () => {
      const session = getMemberSession();
      if (!session || !eventId) return;

      // Refetch member data to check KYC status
      fetch(`/api/members?event_id=${eventId}&email=${encodeURIComponent(session.email)}`)
        .then(res => res.json())
        .then(data => {
          if (data.members) {
            const memberRecord = data.members.find(
              (m: any) => m.email === session.email && m.event_id === eventId
            );
            if (memberRecord) {
              setMemberData(memberRecord);
              const kycComplete = !!(
                memberRecord.kyc_document_type &&
                memberRecord.kyc_document_number &&
                memberRecord.kyc_document_url
              );
              setIsKYCComplete(kycComplete);
            }
          }
        })
        .catch(err => console.error('Failed to refresh KYC status:', err));
    };

    window.addEventListener('kyc-updated', handleKYCUpdate);
    return () => window.removeEventListener('kyc-updated', handleKYCUpdate);
  }, [eventId]);

  // Track last visited page
  useEffect(() => {
    if (member && pathname.startsWith('/member/')) {
      setLastVisitedPage('member', pathname);
    }
  }, [pathname, member]);

  const handleLogout = () => {
    clearMemberSession();
    router.push("/member/login");
  };

  if (!member || loading || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const navItems = [
    {
      icon: User,
      label: "Profile",
      href: `/member/event/${eventId}/profile`,
    },
    {
      icon: Home,
      label: "Stay",
      href: `/member/event/${eventId}/stay`,
    },
    {
      icon: Calendar,
      label: "Itinerary",
      href: `/member/event/${eventId}/itinerary`,
      soon: true,
    },
    {
      icon: Plane,
      label: "Travel",
      href: `/member/event/${eventId}/travel`,
      soon: true,
    },
    {
      icon: UtensilsCrossed,
      label: "Meals",
      href: `/member/event/${eventId}/meals`,
      soon: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center">
      <div className="w-full max-w-lg bg-white min-h-screen flex flex-col relative">
        {/* Header */}
        <header className="bg-white sticky top-0 z-10 shadow-sm flex-shrink-0">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/member/events?show=list")}
                className="rounded-full flex-shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-bold text-slate-900 truncate">
                  {event.event_name}
                </h1>
                <p className="text-xs text-slate-500 truncate">
                  {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(event.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="rounded-full flex-shrink-0"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 pb-20 flex flex-col">
        <div className="flex-1">
        {children}
        </div>
        <div className="mt-auto">
        <MobileFooter />
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border-t border-slate-200 z-10">
          <div className="flex items-stretch h-16">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors ${
                    isActive
                      ? "text-slate-900"
                      : "text-slate-500 active:bg-slate-50"
                  }`}
                  onClick={(e) => {
                    // Allow navigation even if coming soon or KYC incomplete
                    // The page itself will handle showing appropriate messages
                  }}
                >
                  <item.icon 
                    className={`h-6 w-6 transition-all ${
                      isActive ? "scale-110" : ""
                    }`} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className={`text-xs ${
                    isActive ? "font-semibold" : "font-medium"
                  }`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-slate-900 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

