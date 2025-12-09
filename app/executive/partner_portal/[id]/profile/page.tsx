"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Plus, X, Save, Upload, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function PartnerProfilePage() {
  const params = useParams();
  const partnerId = params.id as string;

  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
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

  const [pocs, setPocs] = useState<POC[]>([
    { name: "", country_code: "+91", phone: "", email: "", designation: "", is_primary: true }
  ]);

  // Logo upload state
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoSignedUrl, setLogoSignedUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPartner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerId]);

  // Fetch signed URL for logo when logo_url changes
  useEffect(() => {
    const fetchLogoUrl = async () => {
      if (!formData.logo_url) {
        setLogoSignedUrl(null);
        return;
      }
      
      // If it's already a URL, use it directly
      if (formData.logo_url.startsWith('http://') || formData.logo_url.startsWith('https://')) {
        setLogoSignedUrl(formData.logo_url);
        return;
      }
      
      // It's an S3 key, fetch signed URL
      try {
        const response = await fetch(`/api/file-url?key=${encodeURIComponent(formData.logo_url)}`);
        const data = await response.json();
        if (response.ok && data.url) {
          setLogoSignedUrl(data.url);
        } else {
          setLogoSignedUrl(null);
        }
      } catch (error) {
        console.error('Failed to fetch logo URL:', error);
        setLogoSignedUrl(null);
      }
    };
    
    fetchLogoUrl();
  }, [formData.logo_url]);

  const fetchPartner = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/partners/${partnerId}`);
      const data = await response.json();

      if (response.ok) {
        const partnerData = data.partner;
        setPartner(partnerData);
        
        setFormData({
          company_name: partnerData.company_name || "",
          address_lane: partnerData.address_lane || "",
          city: partnerData.city || "",
          state: partnerData.state || "",
          country: partnerData.country || "IN",
          pincode: partnerData.pincode || "",
          industry_type: partnerData.industry_type || "",
          company_size: partnerData.company_size || "",
          logo_url: partnerData.logo_url || "",
          website: partnerData.website || "",
          tax_number: partnerData.tax_number || "",
        });

        if (partnerData.pocs && partnerData.pocs.length > 0) {
          setPocs(partnerData.pocs.map((poc: any, index: number) => ({
            name: poc.name || "",
            country_code: poc.country_code || "+91",
            phone: poc.phone || "",
            email: poc.email || "",
            designation: poc.designation || "",
            is_primary: poc.is_primary || index === 0
          })));
        }
      } else {
        console.error('Failed to fetch partner:', data.message);
      }
    } catch (error) {
      console.error('Failed to fetch partner:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPOC = () => {
    setPocs([...pocs, { name: "", country_code: "+91", phone: "", email: "", designation: "", is_primary: false }]);
  };

  const handleRemovePOC = (index: number) => {
    if (pocs.length > 1) {
      const pocToRemove = pocs[index];
      const remainingPocs = pocs.filter((_, i) => i !== index);
      
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

  // Handle logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 2MB for logo
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setLogoError("Logo must be less than 2MB");
      return;
    }

    // Only allow images
    if (!file.type.startsWith('image/')) {
      setLogoError("Please upload an image file (PNG, JPG, etc.)");
      return;
    }

    setLogoError(null);
    setUploadingLogo(true);

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);

      // Upload to S3
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('folder', 'partners');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await response.json();

      if (response.ok && data.key) {
        setFormData(prev => ({ ...prev, logo_url: data.key }));
      } else {
        setLogoError(data.message || 'Failed to upload logo');
        setLogoPreview(null);
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      setLogoError('Failed to upload logo. Please try again.');
      setLogoPreview(null);
    } finally {
      setUploadingLogo(false);
      // Reset input
      if (logoInputRef.current) {
        logoInputRef.current.value = '';
      }
    }
  };

  // Get logo display URL
  const getLogoDisplayUrl = () => {
    if (logoPreview) return logoPreview;
    if (logoSignedUrl) return logoSignedUrl;
    return null;
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logo_url: '' }));
    setLogoPreview(null);
    setLogoError(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Filter out empty POCs
      const validPocs = pocs.filter(poc => 
        poc.name.trim() || poc.phone.trim() || poc.email.trim() || poc.designation.trim()
      );

      const response = await fetch(`/api/partners/${partnerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: partnerId,
          ...formData,
          pocs: validPocs,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Profile saved successfully!");
        await fetchPartner(); // Refresh data
      } else {
        alert(data.message || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading partner profile...</p>
        </div>
      </div>
    );
  }

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
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
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

            <div className="col-span-2">
              <Label>Company Logo</Label>
              <div className="mt-2">
                {/* Logo Preview */}
                {(logoPreview || logoSignedUrl || formData.logo_url) ? (
                  <div className="flex items-start gap-4">
                    <div className="relative w-32 h-32 border-2 border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center">
                      {getLogoDisplayUrl() ? (
                        <img
                          src={getLogoDisplayUrl()!}
                          alt="Company logo"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Building2 className="h-8 w-8 text-slate-300" />
                      )}
                      {uploadingLogo && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={uploadingLogo}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Change Logo
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveLogo}
                        disabled={uploadingLogo}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => !uploadingLogo && logoInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors"
                  >
                    {uploadingLogo ? (
                      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    ) : (
                      <>
                        <Building2 className="h-8 w-8 text-slate-400 mb-2" />
                        <span className="text-sm text-slate-500">Click to upload company logo</span>
                        <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 2MB</span>
                      </>
                    )}
                  </div>
                )}
                
                {/* Hidden file input */}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                
                {/* Error message */}
                {logoError && (
                  <p className="text-sm text-red-600 mt-2">{logoError}</p>
                )}
                
                {/* Optional: Allow manual URL entry */}
                <div className="mt-3">
                  <p className="text-xs text-slate-500 mb-1">Or enter logo URL directly:</p>
                  <Input
                    type="url"
                    value={formData.logo_url.startsWith('partners/') ? '' : formData.logo_url}
                    onChange={(e) => {
                      setFormData({ ...formData, logo_url: e.target.value });
                      setLogoPreview(null);
                    }}
                    placeholder="https://example.com/logo.png"
                    className="text-sm"
                  />
                </div>
              </div>
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
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle>Address</CardTitle>
        </CardHeader>
        <CardContent>
          <AddressInput
            country={formData.country}
            pincode={formData.pincode}
            state={formData.state}
            city={formData.city}
            addressLane={formData.address_lane}
            onCountryChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
            onPincodeChange={(value) => setFormData(prev => ({ ...prev, pincode: value }))}
            onStateChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
            onCityChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
            onAddressLaneChange={(value) => setFormData(prev => ({ ...prev, address_lane: value }))}
          />
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
        </CardContent>
      </Card>
    </div>
  );
}
