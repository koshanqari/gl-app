"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LayoutDashboard, Users, MapPin, FileText, LogOut, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEventWithPartner } from "@/lib/mock-data";
import { useEffect, useState } from "react";

export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const eventId = params.eventId as string;
  const [executive, setExecutive] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
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

  // Get event with partner details
  const eventData = getEventWithPartner(eventId);

  if (!isMounted || !eventData || !eventData.partner || !executive) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const { partner, ...event } = eventData;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push(`/executive/partner_portal/${partner.id}/events`)}
              title="Back to Event Management"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
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
            <Link
              href={`/executive/event_portal/${eventId}/overview`}
              className={`w-full flex items-center justify-start px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                pathname === `/executive/event_portal/${eventId}/overview`
                  ? "bg-primary text-primary-foreground"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Overview
            </Link>
            <Link
              href={`/executive/event_portal/${eventId}/registrations`}
              className={`w-full flex items-center justify-start px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                pathname === `/executive/event_portal/${eventId}/registrations`
                  ? "bg-primary text-primary-foreground"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Users className="mr-2 h-4 w-4" />
              Registrations
            </Link>
            <Link
              href={`/executive/event_portal/${eventId}/venue`}
              className={`w-full flex items-center justify-start px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                pathname === `/executive/event_portal/${eventId}/venue`
                  ? "bg-primary text-primary-foreground"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Venue
            </Link>
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

