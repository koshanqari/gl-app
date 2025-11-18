"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface POC {
  name: string;
  phone: string;
  email: string;
  designation: string;
  isPrimary?: boolean;
}

interface PartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner?: any;
  onSubmit: (partner: any) => void;
}

export function PartnerDialog({ open, onOpenChange, partner, onSubmit }: PartnerDialogProps) {
  const [formData, setFormData] = useState({
    company_name: "",
    address_lane: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    industry_type: "",
    company_size: "",
    logo_url: "",
    website: "",
  });

  const [pocs, setPocs] = useState<POC[]>([
    { name: "", phone: "", email: "", designation: "", isPrimary: true }
  ]);

  useEffect(() => {
    if (partner) {
      setFormData({
        company_name: partner.company_name || "",
        address_lane: partner.address_lane || "",
        city: partner.city || "",
        state: partner.state || "",
        country: partner.country || "",
        pincode: partner.pincode || "",
        industry_type: partner.industry_type || "",
        company_size: partner.company_size || "",
        logo_url: partner.logo_url || "",
        website: partner.website || "",
      });
      
      // Set POCs from partner data
      if (partner.pocs && partner.pocs.length > 0) {
        setPocs(partner.pocs.map((poc: POC, index: number) => ({
          ...poc,
          isPrimary: poc.isPrimary || index === 0
        })));
      } else {
        setPocs([{ name: "", phone: "", email: "", designation: "", isPrimary: true }]);
      }
    } else {
      setFormData({
        company_name: "",
        address_lane: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
        industry_type: "",
        company_size: "",
        logo_url: "",
        website: "",
      });
      setPocs([{ name: "", phone: "", email: "", designation: "", isPrimary: true }]);
    }
  }, [partner]);

  const handleAddPOC = () => {
    setPocs([...pocs, { name: "", phone: "", email: "", designation: "", isPrimary: false }]);
  };

  const handleRemovePOC = (index: number) => {
    if (pocs.length > 1) {
      const pocToRemove = pocs[index];
      const remainingPocs = pocs.filter((_, i) => i !== index);
      
      // If removing the primary POC, set the first remaining POC as primary
      if (pocToRemove.isPrimary && remainingPocs.length > 0) {
        remainingPocs[0].isPrimary = true;
      }
      
      setPocs(remainingPocs);
    }
  };

  const handlePOCChange = (index: number, field: keyof POC, value: string | boolean) => {
    const newPocs = [...pocs];
    (newPocs[index] as any)[field] = value;
    setPocs(newPocs);
  };

  const handleSetPrimaryPOC = (index: number) => {
    const newPocs = pocs.map((poc, i) => ({
      ...poc,
      isPrimary: i === index
    }));
    setPocs(newPocs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty POCs
    const validPocs = pocs.filter(poc => 
      poc.name.trim() || poc.phone.trim() || poc.email.trim() || poc.designation.trim()
    );
    
    const partnerData = {
      ...(partner?.id && { id: partner.id }),
      company_name: formData.company_name,
      address_lane: formData.address_lane,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      pincode: formData.pincode,
      industry_type: formData.industry_type,
      company_size: formData.company_size,
      logo_url: formData.logo_url,
      website: formData.website,
      pocs: validPocs,
      status: partner?.status || "active", // Keep existing status or set as active
      ...(partner && { events_count: partner.events_count }),
    };

    onSubmit(partnerData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{partner ? "Edit Partner" : "Add New Partner"}</DialogTitle>
          <DialogDescription>
            {partner ? "Update partner information" : "Add a new corporate partner or client"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Company Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="industry_type">Industry Type</Label>
                  <Input
                    id="industry_type"
                    value={formData.industry_type}
                    onChange={(e) => setFormData({ ...formData, industry_type: e.target.value })}
                    placeholder="e.g., Technology, Finance"
                  />
                </div>

                <div>
                  <Label htmlFor="company_size">Company Size</Label>
                  <Input
                    id="company_size"
                    value={formData.company_size}
                    onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                    placeholder="e.g., Small, Medium, Large"
                  />
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="logo_url">Company Logo URL</Label>
                  <Input
                    id="logo_url"
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Address</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="address_lane">Street Address</Label>
                  <Input
                    id="address_lane"
                    value={formData.address_lane}
                    onChange={(e) => setFormData({ ...formData, address_lane: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Points of Contact */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Points of Contact</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddPOC}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add POC
                </Button>
              </div>
              
              {pocs.map((poc, index) => (
                <div key={index} className={`border rounded-lg p-4 space-y-4 relative ${poc.isPrimary ? 'border-primary bg-primary/5' : ''}`}>
                  {pocs.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => handleRemovePOC(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">
                        Contact {index + 1}
                      </span>
                      {poc.isPrimary && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
                          Primary
                        </span>
                      )}
                    </div>
                    {!poc.isPrimary && pocs.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => handleSetPrimaryPOC(index)}
                      >
                        Set as Primary
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`poc_name_${index}`}>Name</Label>
                      <Input
                        id={`poc_name_${index}`}
                        value={poc.name}
                        onChange={(e) => handlePOCChange(index, "name", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`poc_designation_${index}`}>Designation</Label>
                      <Input
                        id={`poc_designation_${index}`}
                        value={poc.designation}
                        onChange={(e) => handlePOCChange(index, "designation", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`poc_email_${index}`}>Email</Label>
                      <Input
                        id={`poc_email_${index}`}
                        type="email"
                        value={poc.email}
                        onChange={(e) => handlePOCChange(index, "email", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`poc_phone_${index}`}>Phone (10 digits)</Label>
                      <Input
                        id={`poc_phone_${index}`}
                        type="tel"
                        value={poc.phone}
                        onChange={(e) => handlePOCChange(index, "phone", e.target.value)}
                        placeholder="1234567890"
                        maxLength={10}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {partner ? "Update Partner" : "Add Partner"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

