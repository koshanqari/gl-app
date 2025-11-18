"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Save, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEventWithPartner } from "@/lib/mock-data";

export default function EventProfilePage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const eventData = getEventWithPartner(eventId);

  const [formData, setFormData] = useState({
    event_name: "",
    event_type: "",
    description: "",
    logo_url: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    if (eventData) {
      const { partner, ...event } = eventData;
      setFormData({
        event_name: event.event_name || "",
        event_type: event.event_type || "",
        description: event.description || "",
        logo_url: event.logo_url || "",
        start_date: event.start_date || "",
        end_date: event.end_date || "",
      });
    }
  }, [eventId, eventData]);

  const handleSave = () => {
    // TODO: Save the updated event data
    console.log("Saving event data:", formData);
    alert("Event profile updated! (This will be connected to backend)");
  };

  if (!eventData || !eventData.partner) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-slate-500">Event not found</p>
        </CardContent>
      </Card>
    );
  }

  const { partner } = eventData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Event Profile</h1>
          <p className="text-slate-500 mt-1">
            View and manage event information
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* Event Information */}
      <Card>
        <CardHeader>
          <CardTitle>Event Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="event_name">Event Name *</Label>
              <Input
                id="event_name"
                value={formData.event_name}
                onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="event_type">Event Type *</Label>
              <Input
                id="event_type"
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                placeholder="e.g., Conference, Meeting"
              />
            </div>

            <div>
              <Label htmlFor="logo_url">Event Logo URL</Label>
              <Input
                id="logo_url"
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the event"
                className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Dates */}
      <Card>
        <CardHeader>
          <CardTitle>Event Dates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
                min={formData.start_date}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partner Information (Read-only) */}
      <Card>
        <CardHeader>
          <CardTitle>Partner Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Company Name</p>
              <p className="text-slate-900">{partner.company_name}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Industry Type</p>
              <p className="text-slate-900">{partner.industry_type}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Company Size</p>
              <p className="text-slate-900">{partner.company_size}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Website</p>
              <a 
                href={partner.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {partner.website}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Metadata */}
      <Card className="border-slate-200 bg-slate-50">
        <CardHeader>
          <CardTitle>Event Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Event ID</p>
              <p className="text-slate-900 font-mono text-sm">{eventId}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Status</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

