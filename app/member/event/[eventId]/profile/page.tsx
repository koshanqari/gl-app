"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { mockMembers } from "@/lib/mock-data";
import { getMemberSession } from "@/lib/auth-cookies";

export default function MemberProfilePage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const [memberData, setMemberData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    employee_id: "",
    kyc_document_type: "",
    kyc_document_number: "",
  });

  useEffect(() => {
    // Get member session
    const member = getMemberSession();
    if (member) {
      // Find member data for this event
      const memberRecord = mockMembers.find(
        m => m.email === member.email && m.event_id === eventId
      );
      
      if (memberRecord) {
        setMemberData(memberRecord);
        setFormData({
          name: memberRecord.name,
          email: memberRecord.email,
          phone: memberRecord.phone,
          employee_id: memberRecord.employee_id,
          kyc_document_type: memberRecord.kyc_document_type || "",
          kyc_document_number: memberRecord.kyc_document_number || "",
        });
      }
    }
  }, [eventId]);

  const handleSave = () => {
    // Update member data
    setMemberData({ ...memberData, ...formData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data
    if (memberData) {
      setFormData({
        name: memberData.name,
        email: memberData.email,
        phone: memberData.phone,
        employee_id: memberData.employee_id,
        kyc_document_type: memberData.kyc_document_type || "",
        kyc_document_number: memberData.kyc_document_number || "",
      });
    }
    setIsEditing(false);
  };

  if (!memberData) {
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

  return (
    <MobileContainer>
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
                  className="h-9 rounded-lg"
                >
                  <Save className="h-4 w-4 mr-1.5" />
                  Save
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
            memberData.kyc_document_type ? (
              <div className="px-3 py-1 rounded-full bg-green-50 border border-green-200">
                <span className="text-xs font-semibold text-green-700">Verified</span>
              </div>
            ) : (
              <div className="px-3 py-1 rounded-full bg-orange-50 border border-orange-200">
                <span className="text-xs font-semibold text-orange-700">Pending</span>
              </div>
            )
          }
        >
          KYC Information
        </MobileCardHeader>
        <MobileCardContent>
          {memberData.kyc_document_type ? (
            <div className="space-y-5">
              <MobileInfoRow 
                icon={FileText} 
                label="Document Type" 
                value={<span className="text-base font-semibold text-slate-900 capitalize">{memberData.kyc_document_type}</span>}
              />
              <MobileInfoRow 
                icon={FileText} 
                label="Document Number" 
                value={memberData.kyc_document_number}
              />
              
              {memberData.kyc_document_url && (
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl font-semibold mt-2"
                  onClick={() => window.open(memberData.kyc_document_url, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Document
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-900 mb-2">
                No KYC document yet
              </p>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                Please contact the event organizer to upload your KYC documents
              </p>
            </div>
          )}
        </MobileCardContent>
      </MobileCard>
    </MobileContainer>
  );
}

