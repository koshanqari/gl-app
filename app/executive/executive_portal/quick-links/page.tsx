"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Users, ExternalLink, Search, Loader2, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRefresh } from "@/contexts/refresh-context";

interface Event {
  id: string;
  event_name: string;
  event_type: string;
  start_date: string;
  end_date: string;
  location: string;
  partner_id: string;
  partner_name?: string;
  is_active: boolean;
}

export default function QuickLinksPage() {
  const router = useRouter();
  const { refreshKey } = useRefresh();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/events');
        const data = await response.json();
        
        if (response.ok) {
          setEvents(data.events || []);
        } else {
          console.error('Failed to fetch events:', data.message);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [refreshKey]);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = events.filter(event => 
      event.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.partner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.event_type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort by start date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.start_date).getTime();
      const dateB = new Date(b.start_date).getTime();
      return dateB - dateA;
    });

    return filtered;
  }, [events, searchQuery]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Navigate to event portal
  const handleEventClick = (eventId: string) => {
    router.push(`/executive/event_portal/${eventId}/overview`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Quick Links</h1>
        <p className="text-slate-500 mt-1">Access all events quickly</p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search events by name, location, partner, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Events</p>
                <p className="text-2xl font-bold text-slate-900">{events.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Active Events</p>
                <p className="text-2xl font-bold text-slate-900">
                  {events.filter(e => e.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Unique Partners</p>
                <p className="text-2xl font-bold text-slate-900">
                  {new Set(events.map(e => e.partner_id)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {searchQuery ? "No events found" : "No events yet"}
              </h3>
              <p className="text-slate-500">
                {searchQuery
                  ? "Try adjusting your search criteria"
                  : "Events will appear here once they are created"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event.id)}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-primary hover:bg-slate-50 cursor-pointer transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary transition-colors">
                        {event.event_name}
                      </h3>
                      <Badge variant={event.is_active ? "default" : "secondary"}>
                        {event.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        <span>{event.partner_name || "Unknown Partner"}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDate(event.start_date)} - {formatDate(event.end_date)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span className="capitalize">{event.event_type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <ExternalLink className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors flex-shrink-0 ml-4" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

