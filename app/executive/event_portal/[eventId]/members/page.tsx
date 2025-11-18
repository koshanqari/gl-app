"use client";

import { useParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { Plus, Upload, Link2, Search, Mail, Phone, User, Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { getMembersByEventId } from "@/lib/mock-data";
import { MemberDialog } from "@/components/member-dialog";

export default function MembersPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const [members, setMembers] = useState(getMembersByEventId(eventId));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showCSVDropdown, setShowCSVDropdown] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCSVDropdown) {
        setShowCSVDropdown(false);
      }
    };
    
    if (showCSVDropdown) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showCSVDropdown]);

  // Filter members based on search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    
    const query = searchQuery.toLowerCase();
    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.employee_id.toLowerCase().includes(query) ||
        member.phone.toLowerCase().includes(query)
    );
  }, [members, searchQuery]);

  const handleAddMember = () => {
    setEditingMember(null);
    setIsDialogOpen(true);
  };

  const handleEditMember = (member: any) => {
    setEditingMember(member);
    setIsDialogOpen(true);
  };

  const handleSaveMember = (memberData: any) => {
    if (editingMember) {
      // Update existing member
      setMembers(members.map((m) => (m.id === memberData.id ? memberData : m)));
    } else {
      // Add new member
      setMembers([...members, memberData]);
    }
  };

  const handleDownloadTemplate = () => {
    // Create CSV template
    const csvContent = "Employee ID,Name,Email,Phone\nEMP001,John Doe,john.doe@example.com,1234567890\n";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'member_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    setShowCSVDropdown(false);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Parse CSV and add members
      console.log("CSV file selected:", file.name);
      alert("CSV upload will be implemented with backend integration");
      setShowCSVDropdown(false);
    }
    // Reset input
    e.target.value = '';
  };

  const registrationLink = `${window.location.origin}/register/${eventId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(registrationLink);
    alert("Registration link copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Members</h1>
          <p className="text-slate-500 mt-1">
            Manage event attendees and registrations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowLinkDialog(true)}>
            <Link2 className="mr-2 h-4 w-4" />
            Registration Link
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button 
                variant="outline" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCSVDropdown(!showCSVDropdown);
                }}
              >
                <Upload className="mr-2 h-4 w-4" />
                CSV
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            {showCSVDropdown && (
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownloadTemplate}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => document.getElementById('csv-upload')?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Data
                </DropdownMenuItem>
              </DropdownMenuContent>
            )}
          </DropdownMenu>
          
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCSVUpload}
          />
          
          <Button onClick={handleAddMember}>
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, employee ID, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <Button variant="ghost" onClick={() => setSearchQuery("")}>
            Clear
          </Button>
        )}
      </div>

      {/* Members Count */}
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <User className="h-4 w-4" />
        <span>
          {filteredMembers.length} {filteredMembers.length === 1 ? "member" : "members"}
          {searchQuery && ` (filtered from ${members.length})`}
        </span>
      </div>

      {/* Members Table */}
      {filteredMembers.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Employee ID
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Phone
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredMembers.map((member) => (
                    <tr
                      key={member.id}
                      onClick={() => handleEditMember(member)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-slate-900">{member.employee_id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-slate-900">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-slate-600">
                          <Mail className="h-4 w-4 mr-2 text-slate-400" />
                          {member.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-slate-600">
                          <Phone className="h-4 w-4 mr-2 text-slate-400" />
                          {member.phone}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <User className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {searchQuery ? "No members found" : "No members yet"}
              </h3>
              <p className="text-slate-500 mb-6">
                {searchQuery
                  ? "Try adjusting your search criteria"
                  : "Get started by adding your first member or uploading a CSV"}
              </p>
              {!searchQuery && (
                <Button onClick={handleAddMember}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Member
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Member Dialog */}
      <MemberDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        member={editingMember}
        eventId={eventId}
        onSave={handleSaveMember}
      />

      {/* Registration Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowLinkDialog(false)}>
          <Card className="w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Registration Link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                Share this link with attendees to let them self-register for the event.
              </p>
              <div className="flex items-center gap-2">
                <Input
                  value={registrationLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button onClick={handleCopyLink}>
                  Copy
                </Button>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
