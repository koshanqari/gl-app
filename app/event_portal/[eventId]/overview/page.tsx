"use client";

import { useParams } from "next/navigation";
import { Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getEventWithPartner } from "@/lib/mock-data";

export default function EventOverviewPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const eventData = getEventWithPartner(eventId);

  if (!eventData || !eventData.partner) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-slate-500">Event not found</p>
        </CardContent>
      </Card>
    );
  }

  const { partner, ...event } = eventData;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Event Overview</h1>
        <p className="text-slate-500 mt-1">
          Complete details and summary of your event
        </p>
      </div>

      {/* Event Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Event Status</CardTitle>
            <Badge variant="default" className="bg-green-500">
              {event.status === 'active' ? 'Active' : event.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Event Type</p>
                <p className="text-sm text-slate-600">{event.event_type}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Duration</p>
                <p className="text-sm text-slate-600">
                  {formatDate(event.start_date)}
                </p>
                <p className="text-sm text-slate-600">
                  to {formatDate(event.end_date)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Description */}
      <Card>
        <CardHeader>
          <CardTitle>About This Event</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">{event.description}</p>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Registrations</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Venues Booked</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Activities Planned</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500">Coming soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for more content */}
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <Calendar className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              More features coming soon
            </h3>
            <p className="text-slate-500">
              This is where you&apos;ll manage all aspects of your event
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

