"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { UserPlus, Trash2, Copy, Link2, X, LayoutDashboard, Users, Home, UserCog, FileText, Plane, UtensilsCrossed, Calendar, Edit, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { getEventById } from "@/lib/mock-data";

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
  password: string;
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
  const event = getEventById(eventId);

  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: "collab-1",
      name: "Hotel Manager",
      email: "manager@grandplaza.com",
      password: "hotel123",
      organization: "Grand Plaza Hotel",
      permissions: {
        overview: false,
        members: false,
        stay: true,
        crew: false,
        itinerary: false,
        travel: false,
        meals: false,
        event_profile: false,
      },
      created_at: new Date().toISOString(),
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
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

  const handleAddCollaborator = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.organization) {
      return;
    }

    const hasPermissions = Object.values(formData.permissions).some(p => p);
    if (!hasPermissions) {
      return;
    }

    if (editingId) {
      // Update existing collaborator
      setCollaborators(
        collaborators.map((collab) =>
          collab.id === editingId
            ? {
                ...collab,
                name: formData.name,
                email: formData.email,
                password: formData.password,
                organization: formData.organization,
                permissions: { ...formData.permissions },
              }
            : collab
        )
      );
    } else {
      // Add new collaborator
      const newCollaborator: Collaborator = {
        id: `collab-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        organization: formData.organization,
        permissions: { ...formData.permissions },
        created_at: new Date().toISOString(),
      };
      setCollaborators([...collaborators, newCollaborator]);
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
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleEditCollaborator = (collaborator: Collaborator) => {
    setFormData({
      name: collaborator.name,
      email: collaborator.email,
      password: collaborator.password,
      organization: collaborator.organization,
      permissions: { ...collaborator.permissions },
    });
    setEditingId(collaborator.id);
    setShowAddForm(true);
  };

  const handleDeleteCollaborator = (id: string) => {
    if (confirm("Are you sure you want to revoke this collaborator's access?")) {
      setCollaborators(collaborators.filter(c => c.id !== id));
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

  const handleCopyPassword = async (password: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(password);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = password;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error("Failed to copy password:", err);
    }
  };

  const togglePasswordVisibility = (collaboratorId: string) => {
    setVisiblePasswords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(collaboratorId)) {
        newSet.delete(collaboratorId);
      } else {
        newSet.add(collaboratorId);
      }
      return newSet;
    });
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
    const credentials = `Portal Link: ${window.location.origin}/collaborator/login?event=${eventId}\n\nEmail: ${collaborator.email}\nPassword: ${collaborator.password}`;
    
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
          <Button onClick={() => setShowAddForm(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Collaborator
          </Button>
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
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                />
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
                <Button onClick={handleAddCollaborator}>
                  {editingId ? (
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
          <CardTitle>Collaborator Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {collaborators.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Collaborators Yet</h3>
              <p className="text-slate-500">
                Click "Add Collaborator" above to give external teams access to specific features
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {collaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-base font-semibold text-slate-900">
                          {collaborator.name}
                        </h3>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {getEnabledPermissionsCount(collaborator.permissions)} permissions
                        </Badge>
                      </div>
                      
                      <div className="space-y-3 mb-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <span className="font-medium">Organization:</span>
                          <span>{collaborator.organization}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Email Section */}
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-slate-500">Email</div>
                            <div className="flex items-center gap-2 bg-slate-50 rounded-md px-3 py-2 border border-slate-200">
                              <span className="text-sm text-slate-900 flex-1 truncate">
                                {collaborator.email}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyEmail(collaborator.email)}
                                className="h-7 w-7 p-0 hover:bg-slate-200"
                                title="Copy Email"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Password Section */}
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-slate-500">Password</div>
                            <div className="flex items-center gap-2 bg-slate-50 rounded-md px-3 py-2 border border-slate-200">
                              <span className="text-sm text-slate-900 flex-1 font-mono">
                                {visiblePasswords.has(collaborator.id) ? collaborator.password : "••••••••"}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => togglePasswordVisibility(collaborator.id)}
                                className="h-7 w-7 p-0 hover:bg-slate-200"
                                title={visiblePasswords.has(collaborator.id) ? "Hide Password" : "Show Password"}
                              >
                                {visiblePasswords.has(collaborator.id) ? (
                                  <EyeOff className="h-3.5 w-3.5" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyPassword(collaborator.password)}
                                className="h-7 w-7 p-0 hover:bg-slate-200"
                                title="Copy Password"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <span className="font-medium">Created:</span>
                          <span>{new Date(collaborator.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Permissions Display */}
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-2">Access to:</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(collaborator.permissions)
                            .filter(([_, enabled]) => enabled)
                            .map(([key, _]) => {
                              const { label, icon: Icon } = permissionLabels[key as keyof CollaboratorPermissions];
                              return (
                                <Badge
                                  key={key}
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200"
                                >
                                  <Icon className="h-3 w-3 mr-1" />
                                  {label}
                                </Badge>
                              );
                            })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCollaborator(collaborator)}
                        title="Edit Collaborator"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyLink}
                        title="Copy Portal Link"
                      >
                        <Link2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyCredentials(collaborator)}
                        title="Copy Full Credentials"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCollaborator(collaborator.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Revoke Access"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
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

