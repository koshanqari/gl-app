"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TravelSchedule {
  id?: string;
  name: string;
  from_datetime: string;
  to_datetime: string | null;
  pickup_location: string | null;
  dropoff_location: string | null;
  vehicle_type: string | null;
  description: string | null;
}

interface TravelScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  schedule?: TravelSchedule | null;
  eventId: string;
  onSave: (schedule: any) => void;
}

export function TravelScheduleDialog({
  isOpen,
  onClose,
  schedule,
  eventId,
  onSave,
}: TravelScheduleDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    from_datetime: "",
    to_datetime: "",
    pickup_location: "",
    dropoff_location: "",
    vehicle_type: "",
    description: "",
  });

  useEffect(() => {
    if (schedule) {
      // Edit mode - populate form
      const fromDate = schedule.from_datetime ? new Date(schedule.from_datetime).toISOString().slice(0, 16) : "";
      const toDate = schedule.to_datetime ? new Date(schedule.to_datetime).toISOString().slice(0, 16) : "";
      
      setFormData({
        name: schedule.name || "",
        from_datetime: fromDate,
        to_datetime: toDate,
        pickup_location: schedule.pickup_location || "",
        dropoff_location: schedule.dropoff_location || "",
        vehicle_type: schedule.vehicle_type || "",
        description: schedule.description || "",
      });
    } else {
      // Add mode - reset form
      setFormData({
        name: "",
        from_datetime: "",
        to_datetime: "",
        pickup_location: "",
        dropoff_location: "",
        vehicle_type: "",
        description: "",
      });
    }
  }, [schedule, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert datetime-local to ISO format
    const fromDatetimeISO = formData.from_datetime 
      ? new Date(formData.from_datetime).toISOString()
      : null;
    const toDatetimeISO = formData.to_datetime 
      ? new Date(formData.to_datetime).toISOString()
      : null;

    const scheduleData = {
      ...(schedule?.id && { id: schedule.id }),
      event_id: eventId,
      name: formData.name,
      from_datetime: fromDatetimeISO,
      to_datetime: toDatetimeISO || null,
      pickup_location: formData.pickup_location || null,
      dropoff_location: formData.dropoff_location || null,
      vehicle_type: formData.vehicle_type || null,
      description: formData.description || null,
    };

    onSave(scheduleData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {schedule ? "Edit Travel Schedule" : "Add Travel Schedule"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Schedule Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Airport to Hotel - Morning Cab"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from_datetime">From Date & Time *</Label>
              <Input
                id="from_datetime"
                type="datetime-local"
                value={formData.from_datetime}
                onChange={(e) => setFormData({ ...formData, from_datetime: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="to_datetime">To Date & Time</Label>
              <Input
                id="to_datetime"
                type="datetime-local"
                value={formData.to_datetime}
                onChange={(e) => setFormData({ ...formData, to_datetime: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicle_type">Vehicle Type</Label>
            <Input
              id="vehicle_type"
              value={formData.vehicle_type}
              onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
              placeholder="e.g., Cab, Bus, Car"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickup_location">Pickup Location</Label>
            <Input
              id="pickup_location"
              value={formData.pickup_location}
              onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
              placeholder="e.g., Airport Terminal 2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dropoff_location">Dropoff Location</Label>
            <Input
              id="dropoff_location"
              value={formData.dropoff_location}
              onChange={(e) => setFormData({ ...formData, dropoff_location: e.target.value })}
              placeholder="e.g., Hotel Grand Plaza"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details about this travel schedule..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {schedule ? "Update" : "Create"} Schedule
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}



