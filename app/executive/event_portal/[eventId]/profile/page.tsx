"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";

export default function EventProfilePage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    event_name: "",
    event_type: "",
    description: "",
    logo_url: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    fetchEventData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch event data
      const eventResponse = await fetch(`/api/events/${eventId}`);
      const eventData = await eventResponse.json();

      if (!eventResponse.ok) {
        setError(eventData.message || "Failed to fetch event");
        setLoading(false);
        return;
      }

      const fetchedEvent = eventData.event;
      setEvent(fetchedEvent);

      // Set form data
      setFormData({
        event_name: fetchedEvent.event_name || "",
        event_type: fetchedEvent.event_type || "",
        description: fetchedEvent.description || "",
        logo_url: fetchedEvent.logo_url || "",
        start_date: fetchedEvent.start_date ? fetchedEvent.start_date.split('T')[0] : "",
        end_date: fetchedEvent.end_date ? fetchedEvent.end_date.split('T')[0] : "",
      });

      // Fetch partner data if partner_id exists
      if (fetchedEvent.partner_id) {
        const partnerResponse = await fetch(`/api/partners/${fetchedEvent.partner_id}`);
        const partnerData = await partnerResponse.json();

        if (partnerResponse.ok) {
          setPartner(partnerData.partner);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch event data:", err);
      setError("Failed to load event data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.event_name || !formData.start_date || !formData.end_date) {
      alert("Please fill in all required fields (Event Name, Start Date, End Date)");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update event");
        alert(data.message || "Failed to update event");
        return;
      }

      // Refresh event data
      await fetchEventData();
      alert("Event profile updated successfully!");
    } catch (err: any) {
      console.error("Failed to save event:", err);
      setError("Failed to save event. Please try again.");
      alert("Failed to save event. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="h-8 w-8 mx-auto text-slate-400 animate-spin mb-4" />
          <p className="text-slate-500">Loading event data...</p>
        </CardContent>
      </Card>
    );
  }

  if (error && !event) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchEventData}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  if (!event) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-slate-500">Event not found</p>
        </CardContent>
      </Card>
    );
  }

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
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
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
              <Label htmlFor="logo_url">Event Logo</Label>
              <FileUpload
                value={formData.logo_url}
                onChange={(url) => setFormData({ ...formData, logo_url: url })}
                folder="events"
                accept="image/*"
                maxSize={5 * 1024 * 1024}
                fileType="image"
              />
              <p className="text-xs text-slate-500 mt-1">Upload JPG, PNG (max 5MB)</p>
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
      {partner && (
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

              {partner.website && (
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
              )}
            </div>
          </CardContent>
        </Card>
      )}

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

