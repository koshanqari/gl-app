"use client";

import { useParams } from "next/navigation";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Plus, Upload, Link2, Search, Mail, Phone, User, Download, ChevronDown, FileCheck, X, Loader2, FileText } from "lucide-react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MemberDialog } from "@/components/member-dialog";
import { MemberDetailsDialog } from "@/components/member-details-dialog";
import { useRefresh } from "@/contexts/refresh-context";

export default function MembersPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { refreshKey } = useRefresh();

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [viewingMember, setViewingMember] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [kycFilter, setKycFilter] = useState<"all" | "completed" | "pending">("all");
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  // Fetch members from API
  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/members?event_id=${eventId}`);
      const data = await response.json();
      
      if (response.ok) {
        setMembers(data.members);
      } else {
        console.error('Failed to fetch members:', data.message);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // Fetch event and partner data
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const eventResponse = await fetch(`/api/events/${eventId}`);
        if (eventResponse.ok) {
          const eventData = await eventResponse.json();
          setEvent(eventData.event);
          
          if (eventData.event.partner_id) {
            const partnerResponse = await fetch(`/api/partners/${eventData.event.partner_id}`);
            if (partnerResponse.ok) {
              const partnerData = await partnerResponse.json();
              setPartner(partnerData.partner);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch event/partner data:', error);
      }
    };
    
    fetchEventData();
  }, [eventId]);

  // Fetch members on mount and when refresh is triggered
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers, refreshKey]);

  // Calculate KYC stats
  const kycStats = useMemo(() => {
    const completed = members.filter(m => 
      m.kyc_document_type && m.kyc_document_type.trim() !== "" &&
      m.kyc_document_number && m.kyc_document_number.trim() !== "" &&
      m.kyc_document_url && m.kyc_document_url.trim() !== ""
    ).length;
    const pending = members.length - completed;
    return { completed, pending, total: members.length };
  }, [members]);

  // Filter members based on search query and KYC status
  const filteredMembers = useMemo(() => {
    let filtered = members;
    
    // Apply KYC filter - ALL 3 fields required for completed
    if (kycFilter === "completed") {
      filtered = filtered.filter(m => 
        m.kyc_document_type && m.kyc_document_type.trim() !== "" &&
        m.kyc_document_number && m.kyc_document_number.trim() !== "" &&
        m.kyc_document_url && m.kyc_document_url.trim() !== ""
      );
    } else if (kycFilter === "pending") {
      filtered = filtered.filter(m => 
        !m.kyc_document_type || m.kyc_document_type.trim() === "" ||
        !m.kyc_document_number || m.kyc_document_number.trim() === "" ||
        !m.kyc_document_url || m.kyc_document_url.trim() === ""
      );
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (member) =>
          member.name.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query) ||
          member.employee_id.toLowerCase().includes(query) ||
          member.phone.toLowerCase().includes(query) ||
          (member.country_code && member.country_code.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [members, searchQuery, kycFilter]);

  const handleAddMember = () => {
    setEditingMember(null);
    setIsDialogOpen(true);
  };

  const handleViewMember = (member: any) => {
    setViewingMember(member);
    setIsDetailsDialogOpen(true);
  };

  const handleEditFromDetails = () => {
    setEditingMember(viewingMember);
    setIsDetailsDialogOpen(false);
    setIsDialogOpen(true);
  };

  const handleSaveMember = async (memberData: any) => {
    try {
      if (editingMember) {
        // Update existing member
        const response = await fetch(`/api/members/${memberData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(memberData),
        });

        const data = await response.json();

        if (response.ok) {
          await fetchMembers(); // Refresh the list
        } else {
          alert(data.message || 'Failed to update member');
        }
      } else {
        // Add new member
        const response = await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...memberData, event_id: eventId }),
        });

        const data = await response.json();

        if (response.ok) {
          await fetchMembers(); // Refresh the list
        } else {
          alert(data.message || 'Failed to create member');
        }
      }
    } catch (error) {
      console.error('Failed to save member:', error);
      alert('Failed to save member. Please try again.');
    }
  };

  const handleDownloadTemplate = () => {
    // Create CSV template with basic fields only (no KYC fields)
    const csvContent = "Employee ID,Name,Email,Country Code,Phone\nEMP001,John Doe,john.doe@example.com,+91,1234567890\n";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'member_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadData = () => {
    // Export existing members data with ALL fields
    if (members.length === 0) {
      alert('No members to export');
      return;
    }

    console.log('Exporting members:', members.length);
    console.log('Sample member:', members[0]);

    // Create CSV content - wrap all fields in quotes for safety
    const headers = [
      'ID',
      'Event ID',
      'Employee ID',
      'Name', 
      'Email',
      'Country Code',
      'Phone',
      'KYC Document Type',
      'KYC Document Number',
      'KYC Document URL',
      'KYC Status',
      'Is Active',
      'Created At',
      'Updated At'
    ];

    const rows = members.map(member => {
      // Check if KYC is complete (all 3 fields filled)
      const kycComplete = member.kyc_document_type && member.kyc_document_type.trim() !== '' &&
                          member.kyc_document_number && member.kyc_document_number.trim() !== '' &&
                          member.kyc_document_url && member.kyc_document_url.trim() !== '';
      
      // Create clickable link for KYC document
      const kycDocumentLink = member.kyc_document_url 
        ? `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/view-document?key=${encodeURIComponent(member.kyc_document_url)}`
        : '';

      // Format dates
      const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          return date.toISOString().replace('T', ' ').substring(0, 19);
        } catch {
          return dateString;
        }
      };

      const row = [
        member.id || '',
        member.event_id || '',
        member.employee_id || '',
        member.name || '',
        member.email || '',
        member.country_code || '+91',
        member.phone || '',
        member.kyc_document_type || '',
        member.kyc_document_number || '',
        kycDocumentLink,
        kycComplete ? 'Complete' : 'Incomplete',
        member.is_active ? 'Yes' : 'No',
        formatDate(member.created_at),
        formatDate(member.updated_at)
      ];

      // Wrap each cell in quotes and escape any quotes inside
      return row.map(cell => {
        const escaped = String(cell).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',');
    });

    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows
    ].join('\r\n'); // Use Windows line endings for better Excel compatibility

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `members_${eventId}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        alert('CSV file is empty or invalid');
        return;
      }

      // Parse CSV
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const expectedHeaders = ['Employee ID', 'Name', 'Email', 'Country Code', 'Phone'];
      
      // Validate headers
      const hasRequiredHeaders = expectedHeaders.every(h => 
        headers.some(header => header.toLowerCase().replace(' (optional)', '') === h.toLowerCase())
      );

      if (!hasRequiredHeaders) {
        alert('Invalid CSV format. Please use the template provided.');
        return;
      }

      // Get header indices
      const getHeaderIndex = (name: string) => {
        return headers.findIndex(h => h.toLowerCase().replace(' (optional)', '') === name.toLowerCase());
      };

      const empIdIdx = getHeaderIndex('Employee ID');
      const nameIdx = getHeaderIndex('Name');
      const emailIdx = getHeaderIndex('Email');
      const countryCodeIdx = getHeaderIndex('Country Code');
      const phoneIdx = getHeaderIndex('Phone');

      // Parse rows
      const newMembers = [];
      const errors = [];
      const skipped = [];

      // Helper function to parse CSV row with proper quote handling
      const parseCSVRow = (line: string): string[] => {
        const values: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            if (inQuotes && line[j + 1] === '"') {
              current += '"';
              j++; // Skip next quote
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim()); // Add last value
        return values.map(v => v.replace(/^"|"$/g, ''));
      };

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVRow(lines[i]);
        if (values.length < 5 || !values[empIdIdx]) continue; // Skip empty rows

        const memberData = {
          employee_id: values[empIdIdx],
          name: values[nameIdx],
          email: values[emailIdx],
          country_code: values[countryCodeIdx] || '+91',
          phone: values[phoneIdx],
          // KYC fields are not set via CSV - members must complete KYC through the member panel
          kyc_document_type: null,
          kyc_document_number: null,
          kyc_document_url: null,
        };

        // Check if employee_id or email already exists
        const existingMember = members.find(
          m => m.employee_id === memberData.employee_id || m.email === memberData.email
        );

        if (existingMember) {
          skipped.push(`Row ${i + 1}: ${memberData.employee_id} (already exists)`);
          continue;
        }

        newMembers.push(memberData);
      }

      // Upload new members
      if (newMembers.length > 0) {
        const successCount = await Promise.all(
          newMembers.map(async (memberData) => {
            try {
              const response = await fetch('/api/members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...memberData, event_id: eventId }),
              });

              if (response.ok) return true;
              return false;
            } catch (error) {
              return false;
            }
          })
        ).then(results => results.filter(Boolean).length);

        // Refresh members list
        fetchMembers();

        // Show summary
        let message = `Successfully imported ${successCount} member(s).`;
        if (skipped.length > 0) {
          message += `\n\nSkipped ${skipped.length} duplicate(s):\n${skipped.slice(0, 5).join('\n')}`;
          if (skipped.length > 5) {
            message += `\n... and ${skipped.length - 5} more`;
          }
        }
        alert(message);
      } else {
        alert('No new members to import. All entries already exist.');
      }
    } catch (error) {
      console.error('CSV upload error:', error);
      alert('Failed to process CSV file. Please check the format and try again.');
    }

    // Reset input
    e.target.value = '';
  };

  const registrationLink = `${window.location.origin}/register/${eventId}`;

  const handleDownloadQR = async () => {
    try {
      if (!qrCodeRef.current) return;

      // Get the SVG element from the ref
      const svgElement = qrCodeRef.current.querySelector('svg');
      if (!svgElement) {
        alert('QR code not found. Please try again.');
        return;
      }

      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      const padding = 40;
      const qrSize = 300;
      const textHeight = 60;
      const totalHeight = padding * 2 + textHeight * 2 + qrSize;
      const totalWidth = padding * 2 + qrSize;
      
      canvas.width = totalWidth;
      canvas.height = totalHeight;

      // Fill white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, totalWidth, totalHeight);

      // Draw company name
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const companyName = partner?.company_name || 'Company Name';
      ctx.fillText(companyName, totalWidth / 2, padding);

      // Draw event name
      ctx.font = '20px Arial, sans-serif';
      ctx.fillStyle = '#64748b';
      const eventName = event?.event_name || 'Event Name';
      ctx.fillText(eventName, totalWidth / 2, padding + textHeight);

      // Convert SVG to image
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.onload = () => {
        // Draw QR code
        ctx.drawImage(img, padding, padding + textHeight * 2, qrSize, qrSize);
        
        // Convert canvas to image and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${companyName.replace(/[^a-z0-9]/gi, '_')}_${eventName.replace(/[^a-z0-9]/gi, '_')}_QR.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
          URL.revokeObjectURL(svgUrl);
        }, 'image/png');
      };
      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        alert('Failed to load QR code image. Please try again.');
      };
      img.src = svgUrl;
    } catch (error) {
      console.error('Failed to download QR code:', error);
      alert('Failed to download QR code. Please try again.');
    }
  };

  const handleCopyLink = async () => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(registrationLink);
        alert("Registration link copied to clipboard!");
        return;
      }
    } catch (err) {
      console.error('Clipboard API failed:', err);
    }

    // Fallback: use execCommand with the input field
    try {
      const input = document.getElementById('registration-link-input') as HTMLInputElement;
      if (input) {
        input.select();
        input.setSelectionRange(0, 99999); // For mobile devices
        const successful = document.execCommand('copy');
        if (successful) {
          alert("Registration link copied to clipboard!");
        } else {
          throw new Error('execCommand failed');
        }
      }
    } catch (err) {
      // Final fallback: just select the text and ask user to copy manually
      const input = document.getElementById('registration-link-input') as HTMLInputElement;
      if (input) {
        input.select();
        input.setSelectionRange(0, 99999);
        alert("Please manually copy the link (Ctrl+C or Cmd+C)");
      }
    }
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
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Manage Data
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={handleDownloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Download Registration Template
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => document.getElementById('csv-upload')?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Registrations
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleDownloadData}>
                <Download className="mr-2 h-4 w-4" />
                Download All Data
              </DropdownMenuItem>
            </DropdownMenuContent>
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

      {/* Search Bar and Filters */}
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
        
        {/* KYC Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <FileCheck className="mr-2 h-4 w-4" />
              {kycFilter === "all" && "All Members"}
              {kycFilter === "completed" && "KYC Completed"}
              {kycFilter === "pending" && "KYC Pending"}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setKycFilter("all")}>
              All Members
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setKycFilter("completed")}>
              KYC Completed
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setKycFilter("pending")}>
              KYC Pending
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {(searchQuery || kycFilter !== "all") && (
          <Button variant="ghost" onClick={() => { setSearchQuery(""); setKycFilter("all"); }}>
            Clear
          </Button>
        )}
      </div>

      {/* Members Count with KYC Stats */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <User className="h-4 w-4" />
          <span>
            {filteredMembers.length} {filteredMembers.length === 1 ? "member" : "members"}
            {(searchQuery || kycFilter !== "all") && ` (filtered from ${members.length})`}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-green-600" />
            <span className="text-slate-600">
              KYC Completed: <span className="font-semibold text-green-600">{kycStats.completed}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <X className="h-4 w-4 text-orange-600" />
            <span className="text-slate-600">
              KYC Pending: <span className="font-semibold text-orange-600">{kycStats.pending}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Members Table */}
      {loading ? (
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-4" />
              <p className="text-slate-500">Loading members...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredMembers.length > 0 ? (
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
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      KYC Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredMembers.map((member) => (
                    <tr
                      key={member.id}
                      onClick={() => handleViewMember(member)}
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
                          {member.country_code} {member.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {member.kyc_document_type && member.kyc_document_type.trim() !== "" &&
                         member.kyc_document_number && member.kyc_document_number.trim() !== "" &&
                         member.kyc_document_url && member.kyc_document_url.trim() !== "" ? (
                          <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
                            <FileCheck className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                            <X className="h-3 w-3 mr-1" />
                            Incomplete
                          </Badge>
                        )}
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

      {/* Member Details Dialog */}
      <MemberDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        member={viewingMember}
        onEdit={handleEditFromDetails}
      />

      {/* Registration Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowLinkDialog(false)}>
          <Card className="w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="relative">
              <CardTitle>Registration Link</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 h-6 w-6"
                onClick={() => setShowLinkDialog(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                Share this link with attendees to let them self-register for the event.
              </p>
              
              {/* QR Code */}
              <div className="flex justify-center py-4 bg-slate-50 rounded-lg">
                <div className="bg-white p-4 rounded-lg">
                  <div ref={qrCodeRef}>
                    <QRCode
                      value={registrationLink}
                      size={200}
                      level="H"
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Input
                  id="registration-link-input"
                  value={registrationLink}
                  readOnly
                  className="font-mono text-sm cursor-text"
                  onFocus={(e) => e.target.select()}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <Button onClick={handleCopyLink}>
                  Copy
                </Button>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleDownloadQR}>
                  <Download className="mr-2 h-4 w-4" />
                  Download QR Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
