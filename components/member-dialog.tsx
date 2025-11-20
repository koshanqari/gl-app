"use client";

import { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PhoneInput } from "@/components/ui/phone-input";
import { FileUpload } from "@/components/ui/file-upload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Member {
  id: string;
  event_id: string;
  employee_id: string;
  name: string;
  email: string;
  country_code: string;
  phone: string;
  kyc_document_type?: string;
  kyc_document_number?: string;
  kyc_document_url?: string;
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
    country_code: "+91",
    phone: "",
    kyc_document_type: "",
    kyc_document_number: "",
    kyc_document_url: "",
  });

  useEffect(() => {
    if (member) {
      // Edit mode - populate form with member data
      setFormData({
        employee_id: member.employee_id || "",
        name: member.name || "",
        email: member.email || "",
        country_code: member.country_code || "+91",
        phone: member.phone || "",
        kyc_document_type: member.kyc_document_type || "",
        kyc_document_number: member.kyc_document_number || "",
        kyc_document_url: member.kyc_document_url || "",
      });
    } else {
      // Add mode - reset form
      setFormData({
        employee_id: "",
        name: "",
        email: "",
        country_code: "+91",
        phone: "",
        kyc_document_type: "",
        kyc_document_number: "",
        kyc_document_url: "",
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{member ? "Edit Member" : "Add New Member"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="employee_id">Employee ID</Label>
            <Input
              id="employee_id"
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              placeholder="e.g., EMP001"
            />
          </div>

          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Full name"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <PhoneInput
              countryCode={formData.country_code}
              phoneNumber={formData.phone}
              onCountryCodeChange={(value) => setFormData({ ...formData, country_code: value })}
              onPhoneNumberChange={(value) => setFormData({ ...formData, phone: value })}
            />
          </div>

          {/* KYC Section - Optional */}
          <div className="pt-4 border-t">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">KYC Details (Optional)</h4>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="kyc_document_type">Document Type</Label>
                <Select
                  value={formData.kyc_document_type}
                  onValueChange={(value) => setFormData({ ...formData, kyc_document_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                    <SelectItem value="pan">PAN Card</SelectItem>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="driving_license">Driving License</SelectItem>
                    <SelectItem value="voter_id">Voter ID</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="kyc_document_number">Document Number</Label>
                <Input
                  id="kyc_document_number"
                  value={formData.kyc_document_number}
                  onChange={(e) => setFormData({ ...formData, kyc_document_number: e.target.value })}
                  placeholder="Enter document number"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Upload Document/Image</Label>
                  {formData.kyc_document_url && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/file-url?key=${encodeURIComponent(formData.kyc_document_url)}`);
                          const data = await response.json();
                          if (response.ok) {
                            window.open(data.url, '_blank');
                          }
                        } catch (error) {
                          console.error('Failed to open file:', error);
                        }
                      }}
                      className="h-7 text-xs"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Open
                    </Button>
                  )}
                </div>
                <FileUpload
                  value={formData.kyc_document_url}
                  onChange={(url) => setFormData({ ...formData, kyc_document_url: url })}
                  folder="kyc"
                  accept="image/*,application/pdf,.pdf"
                  maxSize={10 * 1024 * 1024}
                />
                <p className="text-xs text-slate-500 mt-1">Upload PDF, JPG, PNG (max 10MB)</p>
              </div>
            </div>
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

