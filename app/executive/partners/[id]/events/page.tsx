"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Plus, Calendar, MapPin, Edit, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPartnersWithEventCount, getEventsByPartnerId } from "@/lib/mock-data";
import { EventDialog } from "@/components/event-dialog";

export default function EventManagementPage() {
  const params = useParams();
  const partnerId = params.id as string;

  const partner = getPartnersWithEventCount().find(p => p.id === partnerId);
  const events = getEventsByPartnerId(partnerId);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);

  if (!partner) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-slate-500">Partner not found</p>
        </CardContent>
      </Card>
    );
  }

  const handleOpenDialog = (event?: any) => {
    if (event) {
      setEditingEvent(event);
    } else {
      setEditingEvent(null);
    }
    setIsDialogOpen(true);
  };

  const handleCardClick = (eventId: string) => {
    // Navigate to independent Event Portal
    window.location.href = `/executive/events/${eventId}/overview`;
  };

  const handleEditClick = (e: React.MouseEvent, event: any) => {
    e.stopPropagation(); // Prevent card click
    handleOpenDialog(event);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Event Management</h1>
          <p className="text-slate-500 mt-1">
            Manage events for {partner.company_name}
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Events List */}
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <Card 
              key={event.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => handleCardClick(event.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {event.logo_url ? (
                      <img 
                        src={event.logo_url} 
                        alt={event.event_name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{event.event_name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {event.event_type}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleEditClick(e, event)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-slate-600 line-clamp-2">
                  {event.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDate(event.start_date)} - {formatDate(event.end_date)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Calendar className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No events yet</h3>
              <p className="text-slate-500 mb-6">
                Get started by creating your first event for {partner.company_name}
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Event
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Dialog */}
      <EventDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        event={editingEvent}
        partnerId={partnerId}
      />
    </div>
  );
}
