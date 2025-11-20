"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UserPlus, LogOut, Users, Mail, Phone, Lock, Edit, Eye, EyeOff } from "lucide-react";
import { PhoneInput, parsePhoneNumber, combinePhoneNumber, getSearchablePhone } from "@/components/ui/phone-input";

interface Executive {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  country_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export default function AdminPanelPage() {
  const router = useRouter();
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingExecutive, setEditingExecutive] = useState<Executive | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    country_code: "+91",
    phone: "",
    password: "",
  });

  const [editFormData, setEditFormData] = useState({
    id: "",
    email: "",
    name: "",
    country_code: "+91",
    phone: "",
    password: "",
    is_active: true,
  });

  useEffect(() => {
    fetchExecutives();
  }, []);

  const fetchExecutives = async () => {
    try {
      const response = await fetch('/api/get-executives');
      const data = await response.json();
      
      if (response.ok) {
        setExecutives(data.executives);
      }
    } catch (error) {
      console.error('Failed to fetch executives');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExecutive = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/add-executive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Executive ${formData.name} added successfully!`);
        setFormData({ email: "", name: "", country_code: "+91", phone: "", password: "" });
        fetchExecutives();
      } else if (response.status === 401) {
        router.push('/secret');
      } else {
        setError(data.message || 'Failed to add executive');
      }
    } catch (error) {
      setError('Failed to add executive. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/secret');
  };

  // Filter executives based on search query
  const filteredExecutives = executives.filter((exec) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase().trim();
    
    // Create multiple searchable formats
    const countryCode = (exec.country_code || "").toLowerCase();
    const phone = (exec.phone || "").toLowerCase();
    const fullPhone = `${countryCode}${phone}`;
    const fullPhoneWithSpace = `${countryCode} ${phone}`;
    
    // Also search without the + symbol
    const countryCodeWithoutPlus = countryCode.replace('+', '');
    const fullPhoneWithoutPlus = `${countryCodeWithoutPlus}${phone}`;
    
    return (
      exec.name.toLowerCase().includes(query) ||
      exec.email.toLowerCase().includes(query) ||
      countryCode.includes(query) ||
      countryCodeWithoutPlus.includes(query) ||
      phone.includes(query) ||
      fullPhone.includes(query) ||
      fullPhoneWithSpace.includes(query) ||
      fullPhoneWithoutPlus.includes(query)
    );
  });

  const handleEditClick = (executive: Executive) => {
    setEditingExecutive(executive);
    
    setEditFormData({
      id: executive.id,
      email: executive.email,
      name: executive.name,
      country_code: executive.country_code || "+91",
      phone: executive.phone || "",
      password: "", // Don't pre-fill password
      is_active: executive.is_active,
    });
    setEditDialogOpen(true);
    setError("");
    setSuccess("");
  };

  const handleUpdateExecutive = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/update-executive', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Executive ${editFormData.name} updated successfully!`);
        setEditDialogOpen(false);
        fetchExecutives();
        setTimeout(() => setSuccess(""), 3000);
      } else if (response.status === 401) {
        router.push('/secret');
      } else {
        setError(data.message || 'Failed to update executive');
      }
    } catch (error) {
      setError('Failed to update executive. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
            <p className="text-sm text-slate-500">Executive Management</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Executive Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Add New Executive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddExecutive} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    disabled={submitting}
                  />
                </div>

                <PhoneInput
                  countryCode={formData.country_code}
                  phoneNumber={formData.phone}
                  onCountryCodeChange={(code) => setFormData({...formData, country_code: code})}
                  onPhoneNumberChange={(number) => setFormData({...formData, phone: number})}
                  label="Phone Number"
                  disabled={submitting}
                  id="phone"
                />

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="text"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    disabled={submitting}
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md p-3">
                    {success}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? "Adding..." : "Add Executive"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Executives List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Executives ({executives.length})
              </CardTitle>
              <div className="mt-4">
                <Input
                  type="text"
                  placeholder="Search by name, email, +91, 91, phone number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
                {searchQuery && (
                  <p className="text-xs text-slate-500 mt-2">
                    Showing {filteredExecutives.length} of {executives.length} executives
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-slate-500 text-center py-8">Loading...</p>
              ) : filteredExecutives.length === 0 ? (
                <p className="text-slate-500 text-center py-8">
                  {searchQuery ? "No executives match your search" : "No executives found"}
                </p>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredExecutives.map((exec) => (
                    <div
                      key={exec.id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <p className="font-semibold text-slate-900">{exec.name}</p>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail className="h-3 w-3" />
                            {exec.email}
                          </div>
                          {exec.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Phone className="h-3 w-3" />
                              <span className="font-mono">
                                <span className="text-slate-500">{exec.country_code || "+91"}</span>
                                {" "}
                                <span>{exec.phone}</span>
                              </span>
                            </div>
                          )}
                          <div className="space-y-0.5 text-xs text-slate-400 pt-1">
                            <p>Created: {new Date(exec.created_at).toLocaleDateString()} {new Date(exec.created_at).toLocaleTimeString()}</p>
                            <p>Updated: {new Date(exec.updated_at).toLocaleDateString()} {new Date(exec.updated_at).toLocaleTimeString()}</p>
                            <p>Last Login: {exec.last_login_at ? `${new Date(exec.last_login_at).toLocaleDateString()} ${new Date(exec.last_login_at).toLocaleTimeString()}` : 'Never'}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              exec.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {exec.is_active ? "Active" : "Inactive"}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(exec)}
                            className="gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {success && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
            {success}
          </div>
        )}
      </main>

      {/* Edit Executive Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Executive</DialogTitle>
            <DialogDescription>
              Update executive information. Leave password blank to keep current password.
            </DialogDescription>
          </DialogHeader>

          {/* Executive Info Summary */}
          {editingExecutive && (
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Created:</span>
                <span className="text-slate-700">{new Date(editingExecutive.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Updated:</span>
                <span className="text-slate-700">{new Date(editingExecutive.updated_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Login:</span>
                <span className="text-slate-700">{editingExecutive.last_login_at ? new Date(editingExecutive.last_login_at).toLocaleString() : 'Never'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Password:</span>
                <span className="text-slate-700 flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Encrypted (bcrypt hash)
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleUpdateExecutive} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                required
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                required
                disabled={submitting}
              />
            </div>

            <PhoneInput
              countryCode={editFormData.country_code}
              phoneNumber={editFormData.phone}
              onCountryCodeChange={(code) => setEditFormData({...editFormData, country_code: code})}
              onPhoneNumberChange={(number) => setEditFormData({...editFormData, phone: number})}
              label="Phone Number"
              disabled={submitting}
              id="edit-phone"
            />

            <div className="space-y-2">
              <Label htmlFor="edit-password">New Password (leave blank to keep current)</Label>
              <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Current password is encrypted and cannot be viewed
              </div>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password to reset"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({...editFormData, password: e.target.value})}
                  disabled={submitting}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-is-active"
                checked={editFormData.is_active}
                onChange={(e) => setEditFormData({...editFormData, is_active: e.target.checked})}
                className="rounded"
                disabled={submitting}
              />
              <Label htmlFor="edit-is-active" className="font-normal cursor-pointer">
                Active Account
              </Label>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={submitting}
              >
                {submitting ? "Updating..." : "Update Executive"}
              </Button>
              <Button 
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

