"use client";

import { useState, useEffect } from "react";
import { Home, User, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface Member {
  id: string;
  event_id: string;
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  kyc_document_type?: string;
  kyc_document_number?: string;
  kyc_document_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface RoomAssignment {
  room_number?: string;
  room_type?: string;
}

export interface CheckInRecord {
  timestamp: string;
  action: 'check-in' | 'check-out';
}

interface RoomAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  member?: Member | null;
  roomAssignment?: RoomAssignment | null;
  checkInRecords?: CheckInRecord[];
  isCheckedIn?: boolean;
  onCheckInToggle?: (memberId: string, currentState: boolean) => void;
  onSave: (assignment: RoomAssignment) => void;
}

export function RoomAssignmentDialog({
  isOpen,
  onClose,
  member,
  roomAssignment,
  checkInRecords,
  isCheckedIn,
  onCheckInToggle,
  onSave,
}: RoomAssignmentDialogProps) {
  const [formData, setFormData] = useState<RoomAssignment>({
    room_number: "",
    room_type: "Single",
  });

  useEffect(() => {
    if (roomAssignment) {
      setFormData({
        room_number: roomAssignment.room_number || "",
        room_type: roomAssignment.room_type || "Single",
      });
    } else {
      setFormData({
        room_number: "",
        room_type: "Single",
      });
    }
  }, [roomAssignment, isOpen]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  if (!member) return null;

  const getDocumentTypeName = (type: string) => {
    const types: Record<string, string> = {
      aadhaar: "Aadhaar Card",
      pan: "PAN Card",
      passport: "Passport",
      driving_license: "Driving License",
      voter_id: "Voter ID",
      other: "Other",
    };
    return types[type] || type;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Room Assignment - {member.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Member Details (Fixed) */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <User className="mr-2 h-4 w-4" />
              Member Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Name</p>
                <p className="text-slate-900">{member.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Employee ID</p>
                <p className="text-slate-900 font-mono text-sm">{member.employee_id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Email</p>
                <p className="text-slate-900">{member.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Phone</p>
                <p className="text-slate-900">{member.phone}</p>
              </div>

              {/* KYC Details */}
              {member.kyc_document_type && (
                <>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">KYC Document</p>
                    <Badge variant="default" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      <FileText className="h-3 w-3 mr-1" />
                      {getDocumentTypeName(member.kyc_document_type)}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">Document Number</p>
                    <p className="text-slate-900">{member.kyc_document_number || "N/A"}</p>
                  </div>
                  {member.kyc_document_url && (
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm font-medium text-slate-500">View Document</p>
                      <a
                        href={member.kyc_document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary hover:underline text-sm font-medium"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Open KYC Document
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Check-in Information */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Check-in Information
              </h3>
              {onCheckInToggle && member && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="checkin-checkbox"
                    checked={isCheckedIn || false}
                    onCheckedChange={() => onCheckInToggle(member.id, isCheckedIn || false)}
                  />
                  <Label 
                    htmlFor="checkin-checkbox" 
                    className="text-sm font-medium cursor-pointer"
                  >
                    {isCheckedIn ? 'Checked In' : 'Check In'}
                  </Label>
                </div>
              )}
            </div>
            
            {checkInRecords && checkInRecords.length > 0 ? (
              <div className="space-y-2">
                {checkInRecords.map((record, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Badge 
                      variant="outline" 
                      className={
                        record.action === 'check-in'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-orange-50 text-orange-700 border-orange-200'
                      }
                    >
                      {record.action === 'check-in' ? 'Check-in' : 'Check-out'} #{Math.floor(index / 2) + 1}
                    </Badge>
                    <span className="text-slate-700">
                      {new Date(record.timestamp).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No check-ins recorded yet</p>
            )}
          </div>

          {/* Room Allotment (Editable) */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center">
                <Home className="mr-2 h-4 w-4" />
                Room Allotment
              </h3>
              <p className="text-xs text-slate-500 max-w-xs text-right">
                All members with the same room number will automatically be set as roommates
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room_number">Room Number</Label>
                <Input
                  id="room_number"
                  value={formData.room_number}
                  onChange={(e) =>
                    setFormData({ ...formData, room_number: e.target.value })
                  }
                  placeholder="e.g., 205"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="room_type">Room Type</Label>
                <select
                  id="room_type"
                  value={formData.room_type}
                  onChange={(e) =>
                    setFormData({ ...formData, room_type: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Triple">Triple</option>
                  <option value="Suite">Suite</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Home className="mr-2 h-4 w-4" />
              Save Assignment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

