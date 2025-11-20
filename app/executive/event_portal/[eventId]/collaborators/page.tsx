"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { UserPlus, Trash2, Copy, Link2, X, LayoutDashboard, Users, Home, UserCog, FileText, Plane, UtensilsCrossed, Calendar, Edit, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useRefresh } from "@/contexts/refresh-context";

interface CollaboratorPermissions {
  overview: boolean;
  members: boolean;
  stay: boolean;
  crew: boolean;
  itinerary: boolean;
  travel: boolean;
  meals: boolean;
  event_profile: boolean;
}

interface Collaborator {
  id: string;
  name: string;
  email: string;
  organization: string;
  permissions: CollaboratorPermissions;
  created_at: string;
}

const permissionLabels = {
  overview: { label: "Overview", icon: LayoutDashboard },
  members: { label: "Members", icon: Users },
  stay: { label: "Stay", icon: Home },
  crew: { label: "Crew", icon: UserCog },
  itinerary: { label: "Itinerary", icon: FileText },
  travel: { label: "Travel", icon: Plane },
  meals: { label: "Meals", icon: UtensilsCrossed },
  event_profile: { label: "Event Profile", icon: Calendar },
};

export default function CollaboratorsPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { refreshKey } = useRefresh();

  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    organization: "",
    permissions: {
      overview: false,
      members: false,
      stay: false,
      crew: false,
      itinerary: false,
      travel: false,
      meals: false,
      event_profile: false,
    },
  });

  // Fetch collaborators from API
  const fetchCollaborators = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/collaborators?event_id=${eventId}`);
      const data = await response.json();

      if (response.ok) {
        setCollaborators(data.collaborators || []);
      } else {
        console.error('Failed to fetch collaborators:', data.message);
      }
    } catch (error) {
      console.error('Failed to fetch collaborators:', error);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // Fetch on mount and when refresh is triggered
  useEffect(() => {
    fetchCollaborators();
  }, [fetchCollaborators, refreshKey]);

  const handleAddCollaborator = async () => {
    if (!formData.name || !formData.email || !formData.organization) {
      alert('Please fill in all required fields');
      return;
    }

    // Password required only when creating new collaborator
    if (!editingId && !formData.password) {
      alert('Password is required for new collaborators');
      return;
    }

    const hasPermissions = Object.values(formData.permissions).some(p => p);
    if (!hasPermissions) {
      alert('Please select at least one permission');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        // Update existing collaborator
        const response = await fetch(`/api/collaborators/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
          await fetchCollaborators();
          setShowAddForm(false);
          setEditingId(null);
        } else {
          alert(data.message || 'Failed to update collaborator');
        }
      } else {
        // Add new collaborator
        const response = await fetch('/api/collaborators', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            event_id: eventId,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          await fetchCollaborators();
          setShowAddForm(false);
        } else {
          alert(data.message || 'Failed to create collaborator');
        }
      }

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        organization: "",
        permissions: {
          overview: false,
          members: false,
          stay: false,
          crew: false,
          itinerary: false,
          travel: false,
          meals: false,
          event_profile: false,
        },
      });
    } catch (error) {
      console.error('Failed to save collaborator:', error);
      alert('Failed to save collaborator. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditCollaborator = (collaborator: Collaborator) => {
    setFormData({
      name: collaborator.name,
      email: collaborator.email,
      password: '', // Clear password - leave blank to keep current, or enter new password
      organization: collaborator.organization,
      permissions: { ...collaborator.permissions },
    });
    setEditingId(collaborator.id);
    setShowAddForm(true);
  };

  const handleDeleteCollaborator = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this collaborator's access?")) {
      return;
    }

    try {
      const response = await fetch(`/api/collaborators/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        await fetchCollaborators();
      } else {
        alert(data.message || 'Failed to delete collaborator');
      }
    } catch (error) {
      console.error('Failed to delete collaborator:', error);
      alert('Failed to delete collaborator. Please try again.');
    }
  };

  const handleCopyEmail = async (email: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = email;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error("Failed to copy email:", err);
    }
  };



  const handleCopyLink = async () => {
    const link = `${window.location.origin}/collaborator/login?event=${eventId}`;
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = link;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleCopyCredentials = async (collaborator: Collaborator) => {
    const credentials = `Portal Link: ${window.location.origin}/collaborator/login?event=${eventId}\n\nEmail: ${collaborator.email}\n\nNote: Password is encrypted. Contact administrator to reset if needed.`;
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(credentials);
      } else {
        // Fallback for non-HTTPS or older browsers
        const textArea = document.createElement("textarea");
        textArea.value = credentials;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error("Failed to copy credentials:", err);
    }
  };

  const togglePermission = (permission: keyof CollaboratorPermissions) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [permission]: !formData.permissions[permission],
      },
    });
  };

  const getEnabledPermissionsCount = (permissions: CollaboratorPermissions) => {
    return Object.values(permissions).filter(p => p).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Collaborators</h1>
          <p className="text-slate-500 mt-1">
            Manage external access and permissions for this event
          </p>
        </div>
        {!showAddForm && (
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-blue-600" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-blue-900">Portal Link:</span>
                  <code className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/collaborator/login?event={eventId}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyLink}
                    className="h-7 w-7 p-0 hover:bg-blue-100"
                    title="Copy Link"
                  >
                    <Copy className="h-3.5 w-3.5 text-blue-600" />
                  </Button>
                </div>
              </div>
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Collaborator
            </Button>
          </div>
        )}
      </div>

      {/* Add Collaborator Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{editingId ? "Edit Collaborator" : "Add New Collaborator"}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                  setFormData({
                    name: "",
                    email: "",
                    password: "",
                    organization: "",
                    permissions: {
                      overview: false,
                      members: false,
                      stay: false,
                      crew: false,
                      itinerary: false,
                      travel: false,
                      meals: false,
                      event_profile: false,
                    },
                  });
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organization/Role *</Label>
                <Input
                  id="organization"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="Grand Plaza Hotel / HR Team"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="collaborator@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  {editingId ? "New Password (leave blank to keep current)" : "Password *"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingId ? "Enter new password or leave blank" : "Enter password"}
                />
                {editingId && (
                  <p className="text-xs text-slate-500">
                    Leave blank to keep the current password unchanged
                  </p>
                )}
              </div>
            </div>

            {/* Permissions */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Permissions *</h3>
              <p className="text-xs text-slate-500 mb-4">
                Select which features this collaborator can access
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(permissionLabels).map(([key, { label, icon: Icon }]) => (
                  <div
                    key={key}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.permissions[key as keyof CollaboratorPermissions]
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => togglePermission(key as keyof CollaboratorPermissions)}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.permissions[key as keyof CollaboratorPermissions]}
                        onCheckedChange={() => togglePermission(key as keyof CollaboratorPermissions)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Icon className="h-4 w-4 text-slate-600" />
                      <Label className="cursor-pointer text-sm">{label}</Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({
                    name: "",
                    email: "",
                    password: "",
                    organization: "",
                    permissions: {
                      overview: false,
                      members: false,
                      stay: false,
                      crew: false,
                      itinerary: false,
                      travel: false,
                      meals: false,
                      event_profile: false,
                    },
                  });
                }}
              >
                  Cancel
                </Button>
                <Button onClick={handleAddCollaborator} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingId ? 'Updating...' : 'Adding...'}
                    </>
                  ) : editingId ? (
                    <>
                      <Edit className="mr-2 h-4 w-4" />
                      Update Collaborator
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Collaborator
                    </>
                  )}
                </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Collaborators List */}
      <Card>
        <CardHeader>
          <CardTitle>Collaborator Accounts ({collaborators.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 mx-auto text-slate-400 animate-spin mb-4" />
              <p className="text-slate-500">Loading collaborators...</p>
            </div>
          ) : collaborators.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Collaborators Yet</h3>
              <p className="text-slate-500">
                Click &quot;Add Collaborator&quot; above to give external teams access to specific features
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Organization</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Permissions</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Created</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {collaborators.map((collaborator) => (
                    <tr
                      key={collaborator.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <UserPlus className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-slate-900">{collaborator.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-700">{collaborator.organization}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-700">{collaborator.email}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyEmail(collaborator.email)}
                            className="h-7 w-7 p-0"
                            title="Copy Email"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {Object.entries(collaborator.permissions)
                            .filter(([_, enabled]) => enabled)
                            .map(([key, _]) => {
                              const { label, icon: Icon } = permissionLabels[key as keyof CollaboratorPermissions];
                              return (
                                <Badge
                                  key={key}
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200 text-xs"
                                >
                                  <Icon className="h-3 w-3 mr-1" />
                                  {label}
                                </Badge>
                              );
                            })}
                          {getEnabledPermissionsCount(collaborator.permissions) === 0 && (
                            <span className="text-xs text-slate-400">No permissions</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-600">
                          {new Date(collaborator.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCollaborator(collaborator)}
                            title="Edit Collaborator"
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyCredentials(collaborator)}
                            title="Copy Email & Portal Link"
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCollaborator(collaborator.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Revoke Access"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <UserPlus className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                About Collaborators
              </h4>
              <p className="text-sm text-blue-800">
                Collaborators are external users (hotel staff, HR team, catering, etc.) who can access specific features of this event based on the permissions you grant. They cannot access other events or executive features.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

