"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Event {
  id: string;
  partner_id: string;
  event_name: string;
  event_type: string;
  description: string;
  logo_url: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event | null;
  partnerId: string;
}

export function EventDialog({ isOpen, onClose, event, partnerId }: EventDialogProps) {
  const [formData, setFormData] = useState({
    event_name: "",
    event_type: "",
    description: "",
    logo_url: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    if (event) {
      // Edit mode - populate form with event data
      setFormData({
        event_name: event.event_name || "",
        event_type: event.event_type || "",
        description: event.description || "",
        logo_url: event.logo_url || "",
        start_date: event.start_date || "",
        end_date: event.end_date || "",
      });
    } else {
      // Add mode - reset form
      setFormData({
        event_name: "",
        event_type: "",
        description: "",
        logo_url: "",
        start_date: "",
        end_date: "",
      });
    }
  }, [event, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData = {
      ...formData,
      partner_id: partnerId,
      id: event?.id || `event-${Date.now()}`,
      status: "active",
      created_at: event?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("Event saved:", eventData);
    alert(`Event ${event ? "updated" : "created"} successfully! (Will be saved to backend)`);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Add New Event"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">Event Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="event_name">Event Name *</Label>
                <Input
                  id="event_name"
                  value={formData.event_name}
                  onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                  required
                  placeholder="e.g., Annual Conference 2024"
                />
              </div>

              <div>
                <Label htmlFor="event_type">Event Type *</Label>
                <Input
                  id="event_type"
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  required
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
          </div>

          {/* Event Dates */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">Event Dates</h3>
            
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
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              {event ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

