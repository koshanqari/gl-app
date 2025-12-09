"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ItineraryGroup {
  id?: string;
  event_id: string;
  group_name: string;
  group_order: number;
  start_date?: string;
  end_date?: string;
  description?: string;
}

interface ItineraryGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  group: ItineraryGroup | null;
  eventId: string;
  onSave: (group: ItineraryGroup) => Promise<void>;
}

export function ItineraryGroupDialog({
  isOpen,
  onClose,
  group,
  eventId,
  onSave,
}: ItineraryGroupDialogProps) {
  const [formData, setFormData] = useState<ItineraryGroup>({
    event_id: eventId,
    group_name: "",
    group_order: 1,
    start_date: "",
    end_date: "",
    description: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (group) {
      setFormData({
        id: group.id,
        event_id: group.event_id,
        group_name: group.group_name || "",
        group_order: group.group_order || 1,
        start_date: group.start_date || "",
        end_date: group.end_date || "",
        description: group.description || "",
      });
    } else {
      setFormData({
        event_id: eventId,
        group_name: "",
        group_order: 1,
        start_date: "",
        end_date: "",
        description: "",
      });
    }
  }, [group, eventId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.group_name.trim()) {
      alert("Group name is required");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Failed to save group:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <CardTitle>
            {group ? "Edit Itinerary Group" : "Create Itinerary Group"}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 h-6 w-6"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="group_name">
                Group Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="group_name"
                value={formData.group_name}
                onChange={(e) =>
                  setFormData({ ...formData, group_name: e.target.value })
                }
                placeholder="e.g., Day 1, Day 2, Pre-Event, Post Event"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="group_order">Order</Label>
                <Input
                  id="group_order"
                  type="number"
                  min="1"
                  value={formData.group_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      group_order: parseInt(e.target.value) || 1,
                    })
                  }
                />
                <p className="text-xs text-slate-500">
                  Lower numbers appear first
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date (Optional)</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date (Optional)</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Add a description for this group..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : group ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

