"use client";

import { FileText, Mail, Phone, User, Edit, FileCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  country_code: string;
  phone: string;
  kyc_document_type?: string;
  kyc_document_number?: string;
  kyc_document_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface MemberDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onEdit: () => void;
}

export function MemberDetailsDialog({ isOpen, onClose, member, onEdit }: MemberDetailsDialogProps) {
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Member Details</DialogTitle>
            <Button onClick={onEdit} size="sm" className="mr-8">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <FileText className="h-3 w-3" />
                  <span>Employee ID</span>
                </div>
                <p className="text-sm font-mono font-medium text-slate-900">{member.employee_id}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <User className="h-3 w-3" />
                  <span>Name</span>
                </div>
                <p className="text-sm font-medium text-slate-900">{member.name}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Mail className="h-3 w-3" />
                  <span>Email</span>
                </div>
                <p className="text-sm text-slate-900">{member.email}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Phone className="h-3 w-3" />
                  <span>Phone</span>
                </div>
                <p className="text-sm text-slate-900">{member.country_code} {member.phone}</p>
              </div>
            </div>
          </div>

          {/* KYC Information */}
          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">KYC Information</h3>
            {member.kyc_document_type ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <FileCheck className="h-3 w-3" />
                      <span>Document Type</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {getDocumentTypeName(member.kyc_document_type)}
                      </Badge>
                    </div>
                  </div>

                  {member.kyc_document_number && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <FileText className="h-3 w-3" />
                        <span>Document Number</span>
                      </div>
                      <p className="text-sm font-mono text-slate-900">{member.kyc_document_number}</p>
                    </div>
                  )}
                </div>

                {member.kyc_document_url && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <FileText className="h-3 w-3" />
                      <span>Document</span>
                    </div>
                    <a
                      href={member.kyc_document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      View Document
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-slate-500 italic">
                No KYC information available
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-500">
              <div>
                <span className="font-medium">Created:</span>{" "}
                {new Date(member.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>{" "}
                {new Date(member.updated_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

