"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Member {
  id: string;
  event_id: string;
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface MemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  member?: Member | null;
  eventId: string;
  onSave: (member: any) => void;
}

export function MemberDialog({ isOpen, onClose, member, eventId, onSave }: MemberDialogProps) {
  const [formData, setFormData] = useState({
    employee_id: "",
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (member) {
      // Edit mode - populate form with member data
      setFormData({
        employee_id: member.employee_id || "",
        name: member.name || "",
        email: member.email || "",
        phone: member.phone || "",
      });
    } else {
      // Add mode - reset form
      setFormData({
        employee_id: "",
        name: "",
        email: "",
        phone: "",
      });
    }
  }, [member, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const memberData = {
      ...formData,
      id: member?.id || `member-${Date.now()}`,
      event_id: eventId,
      status: "active",
      created_at: member?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSave(memberData);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{member ? "Edit Member" : "Add New Member"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="employee_id">Employee ID *</Label>
            <Input
              id="employee_id"
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              required
              placeholder="e.g., EMP001"
            />
          </div>

          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Full name"
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="email@example.com"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone (10 digits) *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              placeholder="1234567890"
              maxLength={10}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              {member ? "Update Member" : "Add Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

