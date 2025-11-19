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
import { PhoneInput } from "@/components/ui/phone-input";
import { AddressInput } from "@/components/ui/address-input";

interface POC {
  name: string;
  country_code: string;
  phone: string;
  email: string;
  designation: string;
  is_primary?: boolean;
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
    country: "IN", // Default to India
    pincode: "",
    industry_type: "",
    company_size: "",
    logo_url: "",
    website: "",
    tax_number: "",
  });

  const [pocs, setPocs] = useState<POC[]>([
    { name: "", country_code: "+91", phone: "", email: "", designation: "", is_primary: true }
  ]);

  useEffect(() => {
    if (partner) {
      setFormData({
        company_name: partner.company_name || "",
        address_lane: partner.address_lane || "",
        city: partner.city || "",
        state: partner.state || "",
        country: partner.country || "IN",
        pincode: partner.pincode || "",
        industry_type: partner.industry_type || "",
        company_size: partner.company_size || "",
        logo_url: partner.logo_url || "",
        website: partner.website || "",
        tax_number: partner.tax_number || "",
      });
      
      // Set POCs from partner data
      if (partner.pocs && partner.pocs.length > 0) {
        setPocs(partner.pocs.map((poc: any, index: number) => ({
          name: poc.name || "",
          country_code: poc.country_code || "+91",
          phone: poc.phone || "",
          email: poc.email || "",
          designation: poc.designation || "",
          is_primary: poc.is_primary || index === 0
        })));
      } else {
        setPocs([{ name: "", country_code: "+91", phone: "", email: "", designation: "", is_primary: true }]);
      }
    } else {
      setFormData({
        company_name: "",
        address_lane: "",
        city: "",
        state: "",
        country: "IN",
        pincode: "",
        industry_type: "",
        company_size: "",
        logo_url: "",
        website: "",
        tax_number: "",
      });
      setPocs([{ name: "", country_code: "+91", phone: "", email: "", designation: "", is_primary: true }]);
    }
  }, [partner]);

  const handleAddPOC = () => {
    setPocs([...pocs, { name: "", country_code: "+91", phone: "", email: "", designation: "", is_primary: false }]);
  };

  const handleRemovePOC = (index: number) => {
    if (pocs.length > 1) {
      const pocToRemove = pocs[index];
      const remainingPocs = pocs.filter((_, i) => i !== index);
      
      // If removing the primary POC, set the first remaining POC as primary
      if (pocToRemove.is_primary && remainingPocs.length > 0) {
        remainingPocs[0].is_primary = true;
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
      is_primary: i === index
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
      tax_number: formData.tax_number,
      pocs: validPocs,
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
                
                <div className="col-span-2">
                  <Label htmlFor="tax_number">Tax Number (GST/VAT/TIN/EIN)</Label>
                  <Input
                    id="tax_number"
                    value={formData.tax_number}
                    onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
                    placeholder="Enter tax identification number"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Address</h3>
              
              <AddressInput
                country={formData.country}
                pincode={formData.pincode}
                state={formData.state}
                city={formData.city}
                addressLane={formData.address_lane}
                onCountryChange={(value) => {
                  console.log('Partner dialog updating country to:', value);
                  setFormData(prev => ({ ...prev, country: value }));
                }}
                onPincodeChange={(value) => setFormData(prev => ({ ...prev, pincode: value }))}
                onStateChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
                onCityChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
                onAddressLaneChange={(value) => setFormData(prev => ({ ...prev, address_lane: value }))}
              />
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
                <div key={index} className={`border rounded-lg p-4 space-y-4 relative ${poc.is_primary ? 'border-primary bg-primary/5' : ''}`}>
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
                      {poc.is_primary && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
                          Primary
                        </span>
                      )}
                    </div>
                    {!poc.is_primary && pocs.length > 1 && (
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

                    <div className="col-span-2">
                      <Label htmlFor={`poc_email_${index}`}>Email</Label>
                      <Input
                        id={`poc_email_${index}`}
                        type="email"
                        value={poc.email}
                        onChange={(e) => handlePOCChange(index, "email", e.target.value)}
                      />
                    </div>

                    <div className="col-span-2">
                      <PhoneInput
                        countryCode={poc.country_code}
                        phoneNumber={poc.phone}
                        onCountryCodeChange={(code) => handlePOCChange(index, "country_code", code)}
                        onPhoneNumberChange={(number) => handlePOCChange(index, "phone", number)}
                        label="Phone Number"
                        id={`poc_phone_${index}`}
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

