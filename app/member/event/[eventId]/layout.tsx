"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Home, Calendar, Plane, UtensilsCrossed, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileFooter } from "@/components/mobile";
import { LoadingScreen } from "@/components/loading-screen";
import { MemberEventDataProvider } from "@/contexts/member-event-data-context";
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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isKYCComplete, setIsKYCComplete] = useState(false);
  const [hotel, setHotel] = useState<any>(null);
  const [hotelImageUrl, setHotelImageUrl] = useState<string>("");
  const [roomAssignment, setRoomAssignment] = useState<any>(null);
  const [roommates, setRoommates] = useState<any[]>([]);

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

  // Preload all data during initial loading
  useEffect(() => {
    const preloadAllData = async () => {
      try {
        setLoading(true);
        setLoadingProgress(0);
        const session = getMemberSession();
        if (!session) return;

        // Step 1: Fetch event data (20%)
        setLoadingProgress(20);
        const eventResponse = await fetch(`/api/events/${eventId}`);
        const eventData = await eventResponse.json();

        if (!eventResponse.ok || !eventData.event) {
          setLoading(false);
          return;
        }

        setEvent(eventData.event);

        // Step 2: Fetch partner data (30%)
        setLoadingProgress(30);
        if (eventData.event.partner_id) {
          const partnerResponse = await fetch(`/api/partners/${eventData.event.partner_id}`);
          const partnerData = await partnerResponse.json();

          if (partnerResponse.ok) {
            setPartner(partnerData.partner);
          }
        }

        // Step 3: Fetch member data and check KYC (40%)
        setLoadingProgress(40);
        const membersResponse = await fetch(`/api/members?event_id=${eventId}&email=${encodeURIComponent(session.email)}`);
        const membersData = await membersResponse.json();

        if (!membersResponse.ok || !membersData.members) {
          setLoading(false);
          return;
        }

        const memberRecord = membersData.members.find(
          (m: any) => m.email === session.email && m.event_id === eventId
        );

        if (!memberRecord) {
          setLoading(false);
          return;
        }

        setMemberData(memberRecord);
        
        // Check if KYC is complete
        const kycComplete = !!(
          memberRecord.kyc_document_type &&
          memberRecord.kyc_document_number &&
          memberRecord.kyc_document_url
        );
        setIsKYCComplete(kycComplete);

        // Step 4: Fetch hotel data (60%)
        setLoadingProgress(60);
        const hotelResponse = await fetch(`/api/hotels?event_id=${eventId}`);
        const hotelData = await hotelResponse.json();

        if (hotelResponse.ok && hotelData.hotel) {
          setHotel(hotelData.hotel);
          
          // Fetch signed URL for hotel image if it exists
          if (hotelData.hotel.image_url) {
            const imageUrl = hotelData.hotel.image_url.trim();
            if (imageUrl.startsWith('http://') || 
                imageUrl.startsWith('https://') || 
                imageUrl.startsWith('data:') ||
                imageUrl.startsWith('blob:')) {
              setHotelImageUrl(imageUrl);
            } else {
              try {
                const imageUrlResponse = await fetch(`/api/file-url?key=${encodeURIComponent(imageUrl)}`);
                const imageUrlData = await imageUrlResponse.json();
                if (imageUrlResponse.ok && imageUrlData.url) {
                  setHotelImageUrl(imageUrlData.url);
                }
              } catch (error) {
                console.error('Failed to fetch hotel image URL:', error);
              }
            }
          }
        }

        // Step 5: Fetch room assignments (80%)
        setLoadingProgress(80);
        if (kycComplete) {
          const assignmentsResponse = await fetch(`/api/room-assignments?event_id=${eventId}`);
          const assignmentsData = await assignmentsResponse.json();

          if (assignmentsResponse.ok && assignmentsData.assignments) {
            const assignment = assignmentsData.assignments.find(
              (ra: any) => ra.member_id === memberRecord.id
            );

            if (assignment) {
              setRoomAssignment(assignment);

              // Fetch roommates if room number exists
              if (assignment.room_number) {
                const roomAssignments = assignmentsData.assignments.filter(
                  (ra: any) => ra.room_number === assignment.room_number &&
                        ra.member_id !== memberRecord.id
                );

                const roommateIds = roomAssignments.map((ra: any) => ra.member_id);
                if (roommateIds.length > 0) {
                  const roommatePromises = roommateIds.map(async (id: string) => {
                    const memberResponse = await fetch(`/api/members/${id}`);
                    const memberData = await memberResponse.json();
                    return memberResponse.ok ? memberData.member : null;
                  });

                  const roommateData = (await Promise.all(roommatePromises)).filter(Boolean);
                  setRoommates(roommateData);
                }
              }
            }
          }
        }

        // Step 6: Complete (100%)
        setLoadingProgress(100);
        await new Promise(resolve => setTimeout(resolve, 300));
        setLoading(false);
      } catch (error) {
        console.error('Failed to preload data:', error);
        setLoading(false);
      }
    };

    if (eventId) {
      preloadAllData();
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

  if (!member || loading || !event || !memberData) {
    return <LoadingScreen progress={loadingProgress} />;
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
    <MemberEventDataProvider
      data={{
        memberData: memberData || null,
        hotel: hotel || null,
        hotelImageUrl: hotelImageUrl || "",
        roomAssignment: roomAssignment || null,
        roommates: roommates || [],
        isKYCComplete: isKYCComplete || false,
      }}
    >
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
    </MemberEventDataProvider>
  );
}

