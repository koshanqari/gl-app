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
    from_datetime: "",
    to_datetime: "",
    venue: "",
    description: "",
  });
  const [links, setLinks] = useState<ItineraryLink[]>([{ link_text: "", link_url: "" }]);

  useEffect(() => {
    if (activity) {
      // Edit mode - populate form
      const fromDate = activity.from_datetime ? new Date(activity.from_datetime).toISOString().slice(0, 16) : "";
      const toDate = activity.to_datetime ? new Date(activity.to_datetime).toISOString().slice(0, 16) : "";
      
      setFormData({
        name: activity.name || "",
        from_datetime: fromDate,
        to_datetime: toDate,
        venue: activity.venue || "",
        description: activity.description || "",
      });
      setLinks(activity.links && activity.links.length > 0 
        ? activity.links.map(l => ({ link_text: l.link_text, link_url: l.link_url }))
        : [{ link_text: "", link_url: "" }]
      );
    } else {
      // Add mode - reset form
      setFormData({
        name: "",
        from_datetime: "",
        to_datetime: "",
        venue: "",
        description: "",
      });
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

    if (!formData.name || !formData.from_datetime) {
      alert("Name and From Date/Time are required");
      return;
    }

    // Filter out empty links
    const validLinks = links.filter(link => link.link_text.trim() && link.link_url.trim());

    // Convert datetime-local format to ISO string for PostgreSQL
    const fromDateTime = formData.from_datetime ? new Date(formData.from_datetime).toISOString() : "";
    const toDateTime = formData.to_datetime ? new Date(formData.to_datetime).toISOString() : null;

    const activityData = {
      ...formData,
      id: activity?.id,
      event_id: eventId,
      from_datetime: fromDateTime,
      to_datetime: toDateTime,
      venue: formData.venue || null,
      description: formData.description || null,
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
              placeholder="e.g., Welcome Reception"
              required
            />
          </div>

          {/* From Date and Time */}
          <div>
            <Label htmlFor="from_datetime">
              From Date & Time <span className="text-red-500">*</span>
            </Label>
            <Input
              id="from_datetime"
              type="datetime-local"
              value={formData.from_datetime}
              onChange={(e) => setFormData({ ...formData, from_datetime: e.target.value })}
              required
            />
          </div>

          {/* To Date and Time (Optional) */}
          <div>
            <Label htmlFor="to_datetime">To Date & Time (Optional)</Label>
            <Input
              id="to_datetime"
              type="datetime-local"
              value={formData.to_datetime}
              onChange={(e) => setFormData({ ...formData, to_datetime: e.target.value })}
            />
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

