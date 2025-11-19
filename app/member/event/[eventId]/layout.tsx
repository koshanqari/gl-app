"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Home, Calendar, Plane, UtensilsCrossed, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileFooter } from "@/components/mobile";
import { getEventWithPartner } from "@/lib/mock-data";
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

  // Get event details
  const eventData = getEventWithPartner(eventId);

  if (!member || !eventData) {
    return null;
  }

  const { partner, ...event } = eventData;

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
    <div className="min-h-screen bg-slate-50 flex justify-center">
      <div className="w-full max-w-lg bg-white min-h-screen flex flex-col relative">
        {/* Header */}
        <header className="bg-white sticky top-0 z-10 shadow-sm">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/member/events")}
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
      <main className="flex-1 overflow-y-auto pb-20 bg-slate-50">
        {children}
        <MobileFooter />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border-t border-slate-200 z-10">
          <div className="flex items-stretch h-16">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const isDisabled = item.soon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors ${
                    isActive
                      ? "text-slate-900"
                      : isDisabled
                      ? "text-slate-300 pointer-events-none"
                      : "text-slate-500 active:bg-slate-50"
                  }`}
                  onClick={(e) => {
                    if (isDisabled) {
                      e.preventDefault();
                    }
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

