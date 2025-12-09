"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, X, Trash2 } from "lucide-react";

interface ItineraryLink {
  link_text: string;
  link_url: string;
}

interface ItineraryActivity {
  id?: string;
  name: string;
  from_datetime: string;
  to_datetime: string | null;
  venue: string | null;
  description: string | null;
  sequence_order?: number;
  group_id?: string;
  links: ItineraryLink[];
}

interface ItineraryActivityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activity?: ItineraryActivity | null;
  eventId: string;
  onSave: (activity: any) => void;
}

export function ItineraryActivityDialog({
  isOpen,
  onClose,
  activity,
  eventId,
  onSave,
}: ItineraryActivityDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    activity_date: "", // Just the date
    from_time: "",     // Optional time
    to_time: "",       // Optional time
    venue: "",
    description: "",
    sequence_order: 0,
    group_id: "",
  });
  const [links, setLinks] = useState<ItineraryLink[]>([{ link_text: "", link_url: "" }]);
  const [useSpecificTime, setUseSpecificTime] = useState(false);
  const [groups, setGroups] = useState<Array<{ id: string; group_name: string }>>([]);

  // Fetch groups when dialog opens
  useEffect(() => {
    if (isOpen && eventId) {
      fetch(`/api/itinerary-groups?event_id=${eventId}`)
        .then(res => res.json())
        .then(data => {
          if (data.groups) {
            setGroups(data.groups);
          }
        })
        .catch(err => console.error('Failed to fetch groups:', err));
    }
  }, [isOpen, eventId]);

  useEffect(() => {
    if (activity) {
      // Edit mode - populate form
      const fromDateTime = activity.from_datetime ? new Date(activity.from_datetime) : null;
      const toDateTime = activity.to_datetime ? new Date(activity.to_datetime) : null;
      
      const activityDate = fromDateTime ? fromDateTime.toISOString().split('T')[0] : "";
      const fromTime = fromDateTime ? fromDateTime.toTimeString().slice(0, 5) : "";
      const toTime = toDateTime ? toDateTime.toTimeString().slice(0, 5) : "";
      
      // Check if time is 00:00 (meaning no specific time was set)
      const hasSpecificTime = fromTime !== "00:00";
      
      setFormData({
        name: activity.name || "",
        activity_date: activityDate,
        from_time: hasSpecificTime ? fromTime : "",
        to_time: hasSpecificTime && toTime !== "00:00" ? toTime : "",
        venue: activity.venue || "",
        description: activity.description || "",
        sequence_order: activity.sequence_order || 0,
        group_id: activity.group_id || "",
      });
      setUseSpecificTime(hasSpecificTime);
      setLinks(activity.links && activity.links.length > 0 
        ? activity.links.map(l => ({ link_text: l.link_text, link_url: l.link_url }))
        : [{ link_text: "", link_url: "" }]
      );
    } else {
      // Add mode - reset form
      setFormData({
        name: "",
        activity_date: "",
        from_time: "",
        to_time: "",
        venue: "",
        description: "",
        sequence_order: 0,
        group_id: "",
      });
      setUseSpecificTime(false);
      setLinks([{ link_text: "", link_url: "" }]);
    }
  }, [activity, isOpen]);

  const handleAddLink = () => {
    setLinks([...links, { link_text: "", link_url: "" }]);
  };

  const handleRemoveLink = (index: number) => {
    if (links.length > 1) {
      setLinks(links.filter((_, i) => i !== index));
    } else {
      setLinks([{ link_text: "", link_url: "" }]);
    }
  };

  const handleLinkChange = (index: number, field: keyof ItineraryLink, value: string) => {
    const updatedLinks = [...links];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setLinks(updatedLinks);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.activity_date) {
      alert("Name and Date are required");
      return;
    }

    // Filter out empty links
    const validLinks = links.filter(link => link.link_text.trim() && link.link_url.trim());

    // Build datetime from date + optional time
    let fromDateTime: string;
    let toDateTime: string | null = null;
    
    if (useSpecificTime && formData.from_time) {
      // Use specific time
      fromDateTime = new Date(`${formData.activity_date}T${formData.from_time}:00`).toISOString();
      if (formData.to_time) {
        toDateTime = new Date(`${formData.activity_date}T${formData.to_time}:00`).toISOString();
      }
    } else {
      // No specific time - use midnight (will be ignored in display)
      fromDateTime = new Date(`${formData.activity_date}T00:00:00`).toISOString();
    }

    const activityData = {
      id: activity?.id,
      event_id: eventId,
      name: formData.name,
      from_datetime: fromDateTime,
      to_datetime: toDateTime,
      venue: formData.venue || null,
      description: formData.description || null,
      group_id: formData.group_id || null,
      sequence_order: formData.sequence_order || undefined,
      links: validLinks,
    };

    onSave(activityData);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {activity ? "Edit Activity" : "Add Activity"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <Label htmlFor="name">
              Activity Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Airport Pickup, Hotel Check-in, City Tour"
              required
            />
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="activity_date">
              Day / Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="activity_date"
              type="date"
              value={formData.activity_date}
              onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
              required
            />
          </div>

          {/* Time Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="useSpecificTime"
              checked={useSpecificTime}
              onChange={(e) => setUseSpecificTime(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <Label htmlFor="useSpecificTime" className="font-normal cursor-pointer">
              Add specific time (optional)
            </Label>
          </div>

          {/* Time Fields (conditional) */}
          {useSpecificTime && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="from_time">From Time</Label>
                <Input
                  id="from_time"
                  type="time"
                  value={formData.from_time}
                  onChange={(e) => setFormData({ ...formData, from_time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="to_time">To Time (Optional)</Label>
                <Input
                  id="to_time"
                  type="time"
                  value={formData.to_time}
                  onChange={(e) => setFormData({ ...formData, to_time: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Group Selection */}
          {groups.length > 0 && (
            <div>
              <Label htmlFor="group_id">Itinerary Group (Optional)</Label>
              <Select
                value={formData.group_id || "none"}
                onValueChange={(value) => setFormData({ ...formData, group_id: value === "none" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a group (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Group</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.group_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                Select which group this activity belongs to (e.g., Day 1, Day 2)
              </p>
            </div>
          )}

          {/* Sequence Order */}
          <div>
            <Label htmlFor="sequence_order">
              Order in Group (leave 0 for auto)
            </Label>
            <Input
              id="sequence_order"
              type="number"
              min="0"
              value={formData.sequence_order}
              onChange={(e) => setFormData({ ...formData, sequence_order: parseInt(e.target.value) || 0 })}
              placeholder="Order within the group (1, 2, 3...)"
            />
            <p className="text-xs text-slate-500 mt-1">
              Activities are sorted by this number within each group. Leave as 0 to auto-assign.
            </p>
          </div>

          {/* Venue */}
          <div>
            <Label htmlFor="venue">Venue</Label>
            <Input
              id="venue"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              placeholder="e.g., Grand Ballroom, Hotel XYZ"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Activity description..."
              rows={4}
            />
          </div>

          {/* Links */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Links</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLink}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Link
              </Button>
            </div>
            <div className="space-y-3">
              {links.map((link, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Input
                      placeholder="Link text"
                      value={link.link_text}
                      onChange={(e) => handleLinkChange(index, "link_text", e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="URL"
                      type="url"
                      value={link.link_url}
                      onChange={(e) => handleLinkChange(index, "link_url", e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveLink(index)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              {activity ? "Update" : "Add"} Activity
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

