"use client";

import { useState, useEffect } from "react";
import { Upload, X } from "lucide-react";
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
  const [uploadedFileName, setUploadedFileName] = useState<string>("");

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
      // Set filename if document exists
      if (member.kyc_document_url) {
        const filename = member.kyc_document_url.split("/").pop() || "Existing document";
        setUploadedFileName(filename);
      } else {
        setUploadedFileName("");
      }
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
      setUploadedFileName("");
    }
  }, [member, isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real application, you would upload to a server/cloud storage
      // For now, we'll create a mock URL
      const mockUrl = `https://example.com/documents/${file.name}`;
      setFormData({ ...formData, kyc_document_url: mockUrl });
      setUploadedFileName(file.name);
      
      // TODO: Implement actual file upload to server/cloud storage
      console.log("File selected:", file.name);
    }
    // Reset input
    e.target.value = '';
  };

  const handleRemoveFile = () => {
    setFormData({ ...formData, kyc_document_url: "" });
    setUploadedFileName("");
  };

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
                <select
                  id="kyc_document_type"
                  value={formData.kyc_document_type}
                  onChange={(e) => setFormData({ ...formData, kyc_document_type: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">Select document type</option>
                  <option value="aadhaar">Aadhaar Card</option>
                  <option value="pan">PAN Card</option>
                  <option value="passport">Passport</option>
                  <option value="driving_license">Driving License</option>
                  <option value="voter_id">Voter ID</option>
                  <option value="other">Other</option>
                </select>
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
                <Label htmlFor="kyc_document_upload">Upload Document</Label>
                <div className="flex items-center gap-2">
                  {!uploadedFileName ? (
                    <>
                      <input
                        id="kyc_document_upload"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("kyc_document_upload")?.click()}
                        className="w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Choose File
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 w-full p-2 border rounded-md">
                      <span className="text-sm flex-1 truncate">{uploadedFileName}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">Accepted formats: PDF, JPG, PNG</p>
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

