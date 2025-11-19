"use client";

import { useState, useEffect } from "react";
import { User, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneInput } from "@/components/ui/phone-input";
import { getExecutiveSession, setExecutiveSession } from "@/lib/auth-cookies";

export default function ExecutiveProfilePage() {
  const [executive, setExecutive] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    country_code: "+91",
    phone: "",
    email: "",
  });

  useEffect(() => {
    // Load executive from database
    const session = getExecutiveSession();
    if (session && session.id) {
      fetchExecutiveProfile(session.id);
    }
  }, []);

  const fetchExecutiveProfile = async (id: string) => {
    try {
      const response = await fetch(`/api/executive/profile?id=${id}`);
      const data = await response.json();

      if (response.ok) {
        setExecutive(data.executive);
        setFormData({
          name: data.executive.name || "",
          country_code: data.executive.country_code || "+91",
          phone: data.executive.phone || "",
          email: data.executive.email || "",
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await fetch('/api/executive/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: executive.id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update session with new data
        const fullPhone = formData.phone && formData.country_code 
          ? `${formData.country_code}${formData.phone}`
          : null;

        const updatedExecutive = {
          id: data.executive.id,
          email: data.executive.email,
          name: data.executive.name,
          phone: fullPhone,
          loginTime: executive.loginTime || new Date().toISOString(),
        };
        
        setExecutiveSession(updatedExecutive);
        setExecutive(data.executive);
        
        alert("Profile updated successfully!");
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !executive) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-500 mt-1">
            Manage your executive account information
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle>Executive Profile</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
              />
              <p className="text-xs text-slate-500 mt-1">
                This email is used for login
              </p>
            </div>

            <div className="md:col-span-2">
              <PhoneInput
                countryCode={formData.country_code}
                phoneNumber={formData.phone}
                onCountryCodeChange={(code) => setFormData({ ...formData, country_code: code })}
                onPhoneNumberChange={(number) => setFormData({ ...formData, phone: number })}
                label="Phone Number"
                id="phone"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>View your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">User ID</p>
              <p className="text-slate-900 font-mono text-sm">{executive.id}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Role</p>
              <p className="text-slate-900">Executive</p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Account Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                executive.is_active 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              }`}>
                {executive.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Last Login</p>
              <p className="text-slate-900 text-sm">
                {executive.last_login_at ? new Date(executive.last_login_at).toLocaleString() : "Never"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Account Created</p>
              <p className="text-slate-900 text-sm">
                {executive.created_at ? new Date(executive.created_at).toLocaleDateString() : "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Last Updated</p>
              <p className="text-slate-900 text-sm">
                {executive.updated_at ? new Date(executive.updated_at).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Authentication & Security</h3>
              <p className="text-sm text-slate-600">
                Your account is secured with password-based authentication. 
                To change your password, please contact the administrator.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

