"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import {
  MobileCard,
  MobileCardHeader,
  MobileCardContent,
  MobileInfoRow,
  MobileContainer,
} from "@/components/mobile";
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  FileText, 
  ExternalLink,
  Edit,
  Save,
  X
} from "lucide-react";
import { useMemberEventData } from "@/contexts/member-event-data-context";

export default function MemberProfilePage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { memberData: contextMemberData } = useMemberEventData();
  const [memberData, setMemberData] = useState<any>(contextMemberData);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    employee_id: "",
    country_code: "+91",
    kyc_document_type: "",
    kyc_document_number: "",
    kyc_document_url: "",
  });
  const [isEditingKYC, setIsEditingKYC] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form data from context member data
  useEffect(() => {
    if (contextMemberData) {
      setMemberData(contextMemberData);
      setFormData({
        name: contextMemberData.name,
        email: contextMemberData.email,
        phone: contextMemberData.phone,
        employee_id: contextMemberData.employee_id,
        country_code: contextMemberData.country_code || "+91",
        kyc_document_type: contextMemberData.kyc_document_type || "",
        kyc_document_number: contextMemberData.kyc_document_number || "",
        kyc_document_url: contextMemberData.kyc_document_url || "",
      });
    }
  }, [contextMemberData]);

  const handleSave = async () => {
    if (!memberData?.id) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/members/${memberData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Update memberData with the saved data from API
        setMemberData({ ...memberData, ...data.member });
        setFormData({
          name: data.member.name,
          email: data.member.email,
          phone: data.member.phone,
          employee_id: data.member.employee_id,
          country_code: data.member.country_code || "+91",
          kyc_document_type: data.member.kyc_document_type || "",
          kyc_document_number: data.member.kyc_document_number || "",
          kyc_document_url: data.member.kyc_document_url || "",
        });
        setIsEditing(false);
        // Dispatch event to notify layout that KYC may have been updated
        window.dispatchEvent(new Event('kyc-updated'));
      } else {
        console.error('Failed to update profile:', data.message);
        alert(`Failed to update profile: ${data.message}`);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data
    if (memberData) {
      setFormData({
        name: memberData.name,
        email: memberData.email,
        phone: memberData.phone,
        employee_id: memberData.employee_id,
        country_code: memberData.country_code || "+91",
        kyc_document_type: memberData.kyc_document_type || "",
        kyc_document_number: memberData.kyc_document_number || "",
        kyc_document_url: memberData.kyc_document_url || "",
      });
    }
    setIsEditing(false);
    setIsEditingKYC(false);
  };

  if (isLoading) {
    return (
      <MobileContainer>
        <MobileCard>
          <MobileCardContent className="py-12 text-center">
            <p className="text-slate-500">Loading profile...</p>
          </MobileCardContent>
        </MobileCard>
      </MobileContainer>
    );
  }

  if (!memberData) {
    return (
      <MobileContainer>
        <MobileCard>
          <MobileCardContent className="py-12 text-center">
            <p className="text-slate-500">Member data not found</p>
          </MobileCardContent>
        </MobileCard>
      </MobileContainer>
    );
  }

  // Check if KYC is complete
  const isKYCComplete = !!(
    formData.kyc_document_type &&
    formData.kyc_document_number &&
    formData.kyc_document_url
  );

  return (
    <MobileContainer>
      {/* KYC Warning Banner */}
      {!isKYCComplete && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 mx-4 mt-4 rounded-r-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                Please complete KYC to continue
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Personal Information */}
      <MobileCard>
        <MobileCardHeader
          action={
            !isEditing ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-9 rounded-lg"
              >
                <Edit className="h-4 w-4 mr-1.5" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="h-9 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="h-9 rounded-lg"
                >
                  <Save className="h-4 w-4 mr-1.5" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            )
          }
        >
          Personal Information
        </MobileCardHeader>
        <MobileCardContent className="space-y-5">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-semibold text-slate-700">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 rounded-xl border-slate-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  maxLength={10}
                  className="h-12 rounded-xl border-slate-200"
                />
              </div>
            </>
          ) : (
            <>
              <MobileInfoRow icon={User} label="Full Name" value={memberData.name} />
              <MobileInfoRow icon={Mail} label="Email Address" value={memberData.email} />
              <MobileInfoRow icon={Phone} label="Phone Number" value={memberData.phone} />
              <MobileInfoRow icon={Briefcase} label="Employee ID" value={memberData.employee_id} />
            </>
          )}
        </MobileCardContent>
      </MobileCard>

      {/* KYC Information */}
      <MobileCard>
        <MobileCardHeader
          action={
            !isEditingKYC ? (
              <div className="flex gap-2 items-center">
                {(memberData.kyc_document_type || formData.kyc_document_type) && 
                 (memberData.kyc_document_number || formData.kyc_document_number) && 
                 (memberData.kyc_document_url || formData.kyc_document_url) ? (
              <div className="px-3 py-1 rounded-full bg-green-50 border border-green-200">
                    <span className="text-xs font-semibold text-green-700">Complete</span>
              </div>
            ) : (
              <div className="px-3 py-1 rounded-full bg-orange-50 border border-orange-200">
                    <span className="text-xs font-semibold text-orange-700">Incomplete</span>
                  </div>
                )}
                {((memberData.kyc_document_type || formData.kyc_document_type) || 
                  (memberData.kyc_document_number || formData.kyc_document_number) || 
                  (memberData.kyc_document_url || formData.kyc_document_url)) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingKYC(true)}
                    className="h-9 rounded-lg"
                  >
                    <Edit className="h-4 w-4 mr-1.5" />
                    Edit
                  </Button>
                )}
              </div>
            ) : isEditingKYC ? (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditingKYC(false);
                    handleCancel();
                  }}
                  className="h-9 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={async () => {
                    await handleSave();
                    setIsEditingKYC(false);
                  }}
                  disabled={isSaving}
                  className="h-9 rounded-lg"
                >
                  <Save className="h-4 w-4 mr-1.5" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            ) : null
          }
        >
          KYC Information
        </MobileCardHeader>
        <MobileCardContent>
          {isEditingKYC || (
            !memberData.kyc_document_type && 
            !memberData.kyc_document_number && 
            !memberData.kyc_document_url
          ) ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="kyc_type" className="text-xs font-semibold text-slate-700">
                  Document Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.kyc_document_type}
                  onValueChange={(value) => setFormData({ ...formData, kyc_document_type: value })}
                >
                  <SelectTrigger className="h-12 rounded-xl border-slate-200">
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

              <div className="space-y-2">
                <Label htmlFor="kyc_number" className="text-xs font-semibold text-slate-700">
                  Document Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="kyc_number"
                  value={formData.kyc_document_number}
                  onChange={(e) => setFormData({ ...formData, kyc_document_number: e.target.value })}
                  placeholder="Enter document number"
                  className="h-12 rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Upload Document/Image <span className="text-red-500">*</span>
                </Label>
                <FileUpload
                  value={formData.kyc_document_url}
                  onChange={(url) => setFormData({ ...formData, kyc_document_url: url })}
                  folder="kyc"
                  accept="image/*,application/pdf,.pdf"
                  maxSize={10 * 1024 * 1024}
                />
                <p className="text-xs text-slate-500">Upload PDF, JPG, PNG (max 10MB)</p>
                
                {formData.kyc_document_url && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 rounded-xl font-semibold"
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
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Uploaded Document
                  </Button>
                )}
              </div>

              {!memberData.kyc_document_type && (
                <Button
                  className="w-full h-12 rounded-xl font-semibold mt-4"
                  onClick={async () => {
                    if (formData.kyc_document_type && formData.kyc_document_number && formData.kyc_document_url) {
                      await handleSave();
                      setIsEditingKYC(false);
                    }
                  }}
                  disabled={!formData.kyc_document_type || !formData.kyc_document_number || !formData.kyc_document_url || isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save KYC Information"}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <MobileInfoRow 
                icon={FileText} 
                label="Document Type" 
                value={<span className="text-base font-semibold text-slate-900 capitalize">{(memberData.kyc_document_type || formData.kyc_document_type)?.replace(/_/g, ' ')}</span>}
              />
              <MobileInfoRow 
                icon={FileText} 
                label="Document Number" 
                value={memberData.kyc_document_number || formData.kyc_document_number}
              />
              
              {(memberData.kyc_document_url || formData.kyc_document_url) && (
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl font-semibold mt-2"
                  onClick={async () => {
                    try {
                      const key = memberData.kyc_document_url || formData.kyc_document_url;
                      const response = await fetch(`/api/file-url?key=${encodeURIComponent(key)}`);
                      const data = await response.json();
                      if (response.ok) {
                        window.open(data.url, '_blank');
                      }
                    } catch (error) {
                      console.error('Failed to open file:', error);
                    }
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Document
                </Button>
              )}
            </div>
          )}
        </MobileCardContent>
      </MobileCard>
    </MobileContainer>
  );
}

