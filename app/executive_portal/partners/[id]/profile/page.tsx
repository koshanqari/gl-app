"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Plus, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPartnersWithEventCount } from "@/lib/mock-data";

interface POC {
  name: string;
  phone: string;
  email: string;
  designation: string;
  isPrimary?: boolean;
}

export default function PartnerProfilePage() {
  const params = useParams();
  const partnerId = params.id as string;

  const partner = getPartnersWithEventCount().find(p => p.id === partnerId);

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

      if (partner.pocs && partner.pocs.length > 0) {
        setPocs(partner.pocs.map((poc: POC, index: number) => ({
          ...poc,
          isPrimary: poc.isPrimary || index === 0
        })));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerId]);

  const handleAddPOC = () => {
    setPocs([...pocs, { name: "", phone: "", email: "", designation: "", isPrimary: false }]);
  };

  const handleRemovePOC = (index: number) => {
    if (pocs.length > 1) {
      const pocToRemove = pocs[index];
      const remainingPocs = pocs.filter((_, i) => i !== index);
      
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

  const handleSave = () => {
    // TODO: Save the updated partner data
    console.log("Saving partner data:", { ...formData, pocs });
    alert("Profile saved! (This will be connected to backend)");
  };

  if (!partner) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-slate-500">Partner not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Partner Profile</h1>
          <p className="text-slate-500 mt-1">
            View and manage partner information
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle>Address</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Points of Contact */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Points of Contact</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddPOC}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add POC
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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
                  <Label htmlFor={`poc_phone_${index}`}>Phone</Label>
                  <Input
                    id={`poc_phone_${index}`}
                    type="tel"
                    value={poc.phone}
                    onChange={(e) => handlePOCChange(index, "phone", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
