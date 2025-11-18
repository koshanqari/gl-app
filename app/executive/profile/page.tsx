"use client";

import { useState, useEffect } from "react";
import { User, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockExecutive } from "@/lib/mock-data";

export default function ExecutiveProfilePage() {
  const [executive, setExecutive] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    // Load executive session
    const session = localStorage.getItem("executive-session");
    if (session) {
      const executiveData = JSON.parse(session);
      setExecutive(executiveData);
      setFormData({
        name: executiveData.name || "",
        phone: executiveData.phone || "",
        email: executiveData.email || "",
      });
    }
  }, []);

  const handleSave = () => {
    // Update the session with new data
    const updatedExecutive = {
      ...executive,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
    };
    
    localStorage.setItem("executive-session", JSON.stringify(updatedExecutive));
    setExecutive(updatedExecutive);
    
    alert("Profile updated successfully!");
  };

  if (!executive) {
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
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
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
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter your phone number"
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
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Last Login</p>
              <p className="text-slate-900 text-sm">
                {executive.loginTime ? new Date(executive.loginTime).toLocaleString() : "N/A"}
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
              <h3 className="font-semibold text-slate-900 mb-1">Authentication Method</h3>
              <p className="text-sm text-slate-600">
                You are currently using OTP-based authentication. 
                An OTP will be sent to your email address ({formData.email}) when you log in.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

