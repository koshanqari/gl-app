"use client";

import { useParams } from "next/navigation";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Home, Building2, Users, Bed, CheckCircle, Search, Plus, X, FileText, Upload, Download, ChevronDown, Loader2, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RoomAssignmentDialog, CheckInRecord } from "@/components/room-assignment-dialog";
import { AddressInput } from "@/components/ui/address-input";
import { FileUpload } from "@/components/ui/file-upload";
import { useRefresh } from "@/contexts/refresh-context";

type Tab = "assignments" | "hotel";

interface HotelPOC {
  name: string;
  phone: string;
  email: string;
  poc_for: string;
  display_for_members: boolean;
}

export default function StayManagementPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { refreshKey } = useRefresh();

  const [activeTab, setActiveTab] = useState<Tab>("assignments");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [kycFilter, setKycFilter] = useState<"all" | "completed" | "pending">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "assigned" | "unassigned">("all");
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>("all");
  const [sharingFilter, setSharingFilter] = useState<string>("all");
  const [checkedInMembers, setCheckedInMembers] = useState<Set<string>>(new Set());
  const [checkInRecords, setCheckInRecords] = useState<Map<string, CheckInRecord[]>>(new Map());
  const [members, setMembers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [hotel, setHotel] = useState<any>(null);
  const [loadingHotel, setLoadingHotel] = useState(true);

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

  // Fetch room assignments from API
  const fetchRoomAssignments = useCallback(async () => {
    try {
      setLoadingAssignments(true);
      const response = await fetch(`/api/room-assignments?event_id=${eventId}`);
      const data = await response.json();
      
      if (response.ok) {
        setAssignments(data.assignments);
      } else {
        console.error('Failed to fetch room assignments:', data.message);
      }
    } catch (error) {
      console.error('Failed to fetch room assignments:', error);
    } finally {
      setLoadingAssignments(false);
    }
  }, [eventId]);

  // Fetch hotel from API
  const fetchHotel = useCallback(async () => {
    try {
      setLoadingHotel(true);
      const response = await fetch(`/api/hotels?event_id=${eventId}`);
      const data = await response.json();
      
      if (response.ok) {
        setHotel(data.hotel);
        // Update form data when hotel is loaded
        if (data.hotel) {
          setHotelData({
            hotel_name: data.hotel.hotel_name || "",
            star_rating: data.hotel.star_rating || 3,
            image_url: data.hotel.image_url || "",
            website: data.hotel.website || "",
            address_street: data.hotel.address_street || "",
            city: data.hotel.city || "",
            state: data.hotel.state || "",
            country: data.hotel.country || "IN",
            pincode: data.hotel.pincode || "",
            maps_link: data.hotel.maps_link || "",
            additional_details: data.hotel.additional_details || "",
          });
          setHotelPOCs(
            data.hotel.pocs && data.hotel.pocs.length > 0
              ? data.hotel.pocs.map((poc: any) => ({
                  name: poc.name || "",
                  phone: poc.phone || "",
                  email: poc.email || "",
                  poc_for: poc.poc_for || "",
                  display_for_members: poc.display_for_members || false,
                }))
              : [{ name: "", phone: "", email: "", poc_for: "", display_for_members: false }]
          );
          setServices(
            data.hotel.amenities && data.hotel.amenities.length > 0
              ? data.hotel.amenities
              : [""]
          );
        }
      } else {
        console.error('Failed to fetch hotel:', data.message);
      }
    } catch (error) {
      console.error('Failed to fetch hotel:', error);
    } finally {
      setLoadingHotel(false);
    }
  }, [eventId]);

  // Fetch members and assignments on mount and when refresh is triggered
  useEffect(() => {
    fetchMembers();
    fetchRoomAssignments();
    fetchHotel();
  }, [fetchMembers, fetchRoomAssignments, fetchHotel, refreshKey]);

  // Hotel form state
  const [hotelData, setHotelData] = useState({
    hotel_name: "",
    star_rating: 3,
    image_url: "",
    website: "",
    address_street: "",
    city: "",
    state: "",
    country: "IN",
    pincode: "",
    maps_link: "",
    additional_details: "",
  });

  const [hotelPOCs, setHotelPOCs] = useState<HotelPOC[]>([
    { name: "", phone: "", email: "", poc_for: "", display_for_members: false }
  ]);

  const [services, setServices] = useState<string[]>([""]);
  const [savingHotel, setSavingHotel] = useState(false);

  const handleAddService = () => {
    setServices([...services, ""]);
  };

  const handleRemoveService = (index: number) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index));
    }
  };

  const handleServiceChange = (index: number, value: string) => {
    const newServices = [...services];
    newServices[index] = value;
    setServices(newServices);
  };

  const handleAddPOC = () => {
    setHotelPOCs([...hotelPOCs, { name: "", phone: "", email: "", poc_for: "", display_for_members: false }]);
  };

  const handleRemovePOC = (index: number) => {
    if (hotelPOCs.length > 1) {
      setHotelPOCs(hotelPOCs.filter((_, i) => i !== index));
    }
  };

  const handlePOCChange = (index: number, field: keyof HotelPOC, value: string | boolean) => {
    const newPOCs = [...hotelPOCs];
    (newPOCs[index] as any)[field] = value;
    setHotelPOCs(newPOCs);
  };

  const handleSaveHotel = async () => {
    if (!hotelData.hotel_name) {
      alert("Hotel name is required");
      return;
    }

    const filteredServices = services.filter(service => service.trim() !== "");
    
    setSavingHotel(true);
    try {
      const payload = {
        event_id: eventId,
        ...hotelData,
        pocs: hotelPOCs,
        amenities: filteredServices,
      };
      
      console.log('Saving hotel with image_url:', hotelData.image_url);
      
      const response = await fetch('/api/hotels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Save failed:', data);
        alert(data.message || "Failed to save hotel details");
        setSavingHotel(false);
        return;
      }

      console.log('Hotel saved successfully, refreshing...');
      
      // Refresh hotel data to show updated image
      await fetchHotel();
      
      alert("Hotel details saved successfully!");
    } catch (error) {
      console.error('Failed to save hotel:', error);
      alert("Failed to save hotel details. Please try again.");
    } finally {
      setSavingHotel(false);
    }
  };

  const handleMemberClick = (member: any) => {
    setSelectedMember(member);
    setIsDialogOpen(true);
  };

  const handleCheckInToggle = (memberId: string, currentState: boolean) => {
    // Record the action with timestamp
    const action: 'check-in' | 'check-out' = currentState ? 'check-out' : 'check-in';
    
    setCheckInRecords((prevRecords) => {
      const newRecords = new Map(prevRecords);
      const existingRecords = newRecords.get(memberId) || [];
      const updatedRecords = [
        ...existingRecords,
        {
          timestamp: new Date().toISOString(),
          action: action,
        },
      ];
      newRecords.set(memberId, updatedRecords);
      return newRecords;
    });

    // Update checked-in state
    setCheckedInMembers((prev) => {
      const newSet = new Set(prev);
      if (currentState) {
        // Currently checked in, so check out
        newSet.delete(memberId);
      } else {
        // Currently checked out, so check in
        newSet.add(memberId);
      }
      return newSet;
    });
  };

  const handleDownloadCSV = () => {
    // Create CSV content with headers
    const headers = [
      "Check-in",
      "Time",
      "Member",
      "Employee ID",
      "KYC Status",
      "KYC Type",
      "KYC Number",
      "KYC Document Link",
      "Room Number",
      "Room Type"
    ];
    
    // Create rows from member assignments
    const rows = memberAssignments.map((member) => {
      const isCheckedIn = checkedInMembers.has(member.id);
      const records = checkInRecords.get(member.id) || [];
      const lastCheckInRecord = records.filter(r => r.action === 'check-in').pop();
      const checkInTime = lastCheckInRecord 
        ? new Date(lastCheckInRecord.timestamp).toLocaleString('en-US', {
            dateStyle: 'short',
            timeStyle: 'short',
          })
        : '';
      
      // Check if KYC is complete (all 3 fields filled)
      const kycComplete = member.kyc_document_type && member.kyc_document_type.trim() !== '' &&
                          member.kyc_document_number && member.kyc_document_number.trim() !== '' &&
                          member.kyc_document_url && member.kyc_document_url.trim() !== '';
      
      // Create clickable link for KYC document
      const kycDocumentLink = member.kyc_document_url 
        ? `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/view-document?key=${encodeURIComponent(member.kyc_document_url)}`
        : '';
      
      return [
        isCheckedIn ? 'Yes' : 'No',
        checkInTime,
        member.name || '',
        member.employee_id || '',
        kycComplete ? 'Complete' : 'Incomplete',
        member.kyc_document_type || '',
        member.kyc_document_number || '',
        kycDocumentLink,
        member.room_number || '',
        member.room_type || '',
      ].map(cell => {
        const escaped = String(cell).replace(/"/g, '""');
        return `"${escaped}"`;
      });
    });

    // Combine headers and rows with Windows line endings
    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.join(','))
    ].join('\r\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `room_assignments_${eventId}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadCSV = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const lines = text.split(/\r?\n/).filter((line: string) => line.trim());
        
        if (lines.length < 2) {
          alert('CSV file is empty or invalid');
          return;
        }

        // Parse header row
        const headers = lines[0].split(',').map((h: string) => h.trim().replace(/^"|"$/g, ''));
        
        // Find column indices
        const getHeaderIndex = (name: string) => {
          return headers.findIndex((h: string) => h.toLowerCase().replace(' (optional)', '') === name.toLowerCase());
        };

        const checkInIdx = getHeaderIndex('Check-in');
        const timeIdx = getHeaderIndex('Time');
        const memberIdx = getHeaderIndex('Member');
        const empIdIdx = getHeaderIndex('Employee ID');
        const roomNumberIdx = getHeaderIndex('Room Number');
        const roomTypeIdx = getHeaderIndex('Room Type');

        if (empIdIdx === -1) {
          alert('Invalid CSV format. Employee ID column is required.');
          return;
        }

        let updatedCount = 0;
        const errors: string[] = [];

        // Parse data rows
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line.trim()) continue;

          // Parse CSV row (handle quoted values)
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

          if (values.length < headers.length) {
            errors.push(`Row ${i + 1}: Not enough columns`);
            continue;
          }

          const empId = values[empIdIdx]?.replace(/^"|"$/g, '') || '';
          if (!empId) continue;

          const member = members.find(m => m.employee_id === empId);
          if (!member) {
            errors.push(`Row ${i + 1}: Member with Employee ID "${empId}" not found`);
            continue;
          }

          try {
            // Update room assignment
            const roomNumber = roomNumberIdx >= 0 ? (values[roomNumberIdx]?.replace(/^"|"$/g, '') || '') : '';
            const roomType = roomTypeIdx >= 0 ? (values[roomTypeIdx]?.replace(/^"|"$/g, '') || '') : '';

            if (roomNumber || roomType) {
              const response = await fetch('/api/room-assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  member_id: member.id,
                  event_id: eventId,
                  room_number: roomNumber || null,
                  room_type: roomType || null,
                }),
              });

              if (!response.ok) {
                errors.push(`Row ${i + 1}: Failed to update room assignment for ${empId}`);
                continue;
              }
            }

            // Update check-in status
            const checkInStatus = checkInIdx >= 0 ? (values[checkInIdx]?.replace(/^"|"$/g, '').toLowerCase() || '') : '';
            if (checkInStatus === 'yes') {
              setCheckedInMembers(prev => {
                const newSet = new Set(prev);
                newSet.add(member.id);
                return newSet;
              });

              const checkInTime = timeIdx >= 0 ? (values[timeIdx]?.replace(/^"|"$/g, '') || '') : '';
              if (checkInTime) {
                setCheckInRecords(prev => {
                  const newRecords = new Map(prev);
                  const existing = newRecords.get(member.id) || [];
                  if (existing.length === 0) {
                    newRecords.set(member.id, [{
                      timestamp: new Date().toISOString(),
                      action: 'check-in',
                    }]);
                  }
                  return newRecords;
                });
              }
            } else if (checkInStatus === 'no') {
              setCheckedInMembers(prev => {
                const newSet = new Set(prev);
                newSet.delete(member.id);
                return newSet;
              });
            }

            updatedCount++;
          } catch (error) {
            errors.push(`Row ${i + 1}: Error processing ${empId} - ${error}`);
          }
        }

        // Refresh data
        await fetchRoomAssignments();
        await fetchMembers();

        // Show summary
        let message = `Successfully processed ${updatedCount} record(s).`;
        if (errors.length > 0) {
          message += `\n\nErrors (${errors.length}):\n${errors.slice(0, 5).join('\n')}`;
          if (errors.length > 5) {
            message += `\n... and ${errors.length - 5} more errors.`;
          }
        }
        alert(message);
      } catch (error) {
        console.error('CSV upload error:', error);
        alert('Failed to process CSV file. Please check the format and try again.');
      }
    };
    input.click();
  };

  const handleSaveRoomAssignment = async (assignment: any) => {
    if (!selectedMember) return;

    try {
      const response = await fetch('/api/room-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          member_id: selectedMember.id,
          room_number: assignment.room_number,
          room_type: assignment.room_type,
          special_requests: assignment.special_requests || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh room assignments to get updated sharing_with
        await fetchRoomAssignments();
        setIsDialogOpen(false);
      } else {
        alert(data.message || 'Failed to save room assignment');
      }
    } catch (error) {
      console.error('Failed to save room assignment:', error);
      alert('Failed to save room assignment. Please try again.');
    }
  };

  // Stats
  const totalMembers = members.length;
  const kycCompletedCount = members.filter((m) => m.kyc_document_type).length;
  const roomAssignedCount = assignments.length;
  const checkedInCount = checkedInMembers.size;

  // Member assignments with details
  const memberAssignments = useMemo(() => {
    return members.map((member) => {
      const assignment = assignments.find((a) => a.member_id === member.id);
      
      // Find all roommates (members with the same room number, excluding current member)
      let roommates: string[] = [];
      if (assignment?.room_number) {
        const roommateMembers = assignments
          .filter(
            (a) =>
              a.room_number === assignment.room_number &&
              a.member_id !== member.id
          )
          .map((a) => {
            const roommateMember = members.find((m) => m.id === a.member_id);
            return roommateMember?.name || "";
          })
          .filter((name) => name !== "");
        
        roommates = roommateMembers;
      }

      return {
        ...member,
        room_number: assignment?.room_number || null,
        room_type: assignment?.room_type || null,
        check_in_date: assignment?.check_in_date || (event as any)?.start_date || "",
        check_out_date: assignment?.check_out_date || (event as any)?.end_date || "",
        sharing_with: roommates.length > 0 ? roommates.join(", ") : "Solo",
        sharing_count: assignment?.room_number ? roommates.length + 1 : 1, // Include current member in count only if assigned
        special_requests: assignment?.special_requests || "",
        is_assigned: !!assignment,
      };
    });
  }, [members, assignments, event]);

  // Get unique sharing counts from actual data
  const uniqueSharingCounts = useMemo(() => {
    const counts = new Set<number>();
    memberAssignments.forEach((member) => {
      if (member.sharing_count) {
        counts.add(member.sharing_count);
      }
    });
    return Array.from(counts).sort((a, b) => a - b);
  }, [memberAssignments]);

  // Filtered members
  const filteredMembers = useMemo(() => {
    let filtered = memberAssignments;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (member) =>
          member.name.toLowerCase().includes(query) ||
          member.employee_id.toLowerCase().includes(query) ||
          (member.room_number && member.room_number.toLowerCase().includes(query))
      );
    }

    // Apply KYC filter - ALL 3 fields required for completed
    if (kycFilter !== "all") {
      filtered = filtered.filter((member) =>
        kycFilter === "completed" 
          ? (member.kyc_document_type && member.kyc_document_number && member.kyc_document_url)
          : (!member.kyc_document_type || !member.kyc_document_number || !member.kyc_document_url)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((member) =>
        statusFilter === "assigned" ? member.is_assigned : !member.is_assigned
      );
    }

    // Apply room type filter
    if (roomTypeFilter !== "all") {
      filtered = filtered.filter((member) => member.room_type === roomTypeFilter);
    }

    // Apply sharing count filter
    if (sharingFilter !== "all") {
      const sharingCount = parseInt(sharingFilter);
      filtered = filtered.filter((member) => member.sharing_count === sharingCount);
    }

    return filtered;
  }, [memberAssignments, searchQuery, kycFilter, statusFilter, roomTypeFilter, sharingFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Stay Management</h1>
        <p className="text-slate-500 mt-1">
          Manage hotel accommodation and room assignments for event attendees
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("assignments")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "assignments"
                ? "border-primary text-primary"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <Bed className="h-4 w-4" />
              Room Assignments
            </div>
          </button>
          <button
            onClick={() => setActiveTab("hotel")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "hotel"
                ? "border-primary text-primary"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Hotel Details
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "assignments" && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total Members</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{totalMembers}</p>
                  </div>
                  <Users className="h-8 w-8 text-slate-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">KYC Completed</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{kycCompletedCount}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Room Assigned Members</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{roomAssignedCount}</p>
                  </div>
                  <Bed className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Checked In</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">{checkedInCount}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

                 {/* Search and Actions */}
                 <Card>
                   <CardHeader>
                     <div className="flex items-center justify-between">
                       <CardTitle>Room Assignments</CardTitle>
                       <div className="flex items-center gap-3">
                         <div className="relative">
                           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                           <Input
                             placeholder="Search by name, emp ID, room..."
                             value={searchQuery}
                             onChange={(e) => setSearchQuery(e.target.value)}
                             className="pl-9 w-64"
                           />
                         </div>
                         
                        {/* CSV Management Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                              <Upload className="mr-2 h-4 w-4" />
                              Manage Data
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={handleDownloadCSV}>
                              <Download className="mr-2 h-4 w-4" />
                              Download CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={handleUploadCSV}>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload CSV
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                       </div>
                     </div>
                   </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700">KYC:</label>
                  <select
                    value={kycFilter}
                    onChange={(e) => setKycFilter(e.target.value as any)}
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700">Status:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="assigned">Assigned</option>
                    <option value="unassigned">Unassigned</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700">Room Type:</label>
                  <select
                    value={roomTypeFilter}
                    onChange={(e) => setRoomTypeFilter(e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Triple">Triple</option>
                    <option value="Suite">Suite</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700">Sharing:</label>
                  <select
                    value={sharingFilter}
                    onChange={(e) => setSharingFilter(e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  >
                    <option value="all">All</option>
                    {uniqueSharingCounts.map((count) => (
                      <option key={count} value={count.toString()}>
                        {count === 1 ? "1 (Solo)" : count.toString()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-4" />
                  <p className="text-slate-500">Loading members...</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-3 text-xs font-semibold text-slate-600 uppercase">Check-in</th>
                        <th className="text-left p-3 text-xs font-semibold text-slate-600 uppercase">Member</th>
                        <th className="text-left p-3 text-xs font-semibold text-slate-600 uppercase">Employee ID</th>
                        <th className="text-left p-3 text-xs font-semibold text-slate-600 uppercase">Contact</th>
                        <th className="text-left p-3 text-xs font-semibold text-slate-600 uppercase">KYC</th>
                        <th className="text-left p-3 text-xs font-semibold text-slate-600 uppercase">Room No.</th>
                        <th className="text-left p-3 text-xs font-semibold text-slate-600 uppercase">Room Type</th>
                        <th className="text-left p-3 text-xs font-semibold text-slate-600 uppercase">Sharing With</th>
                        <th className="text-left p-3 text-xs font-semibold text-slate-600 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredMembers.map((member) => (
                      <tr 
                        key={member.id} 
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => handleMemberClick(member)}
                      >
                             <td className="p-3">
                               <Checkbox
                                 checked={checkedInMembers.has(member.id)}
                                 onCheckedChange={() => handleCheckInToggle(member.id, checkedInMembers.has(member.id))}
                                 onClick={(e) => e.stopPropagation()}
                                 disabled={!member.is_assigned}
                               />
                             </td>
                        <td className="p-3">
                          <p className="text-sm font-medium text-slate-900">{member.name}</p>
                        </td>
                        <td className="p-3 text-sm text-slate-700">{member.employee_id}</td>
                        <td className="p-3">
                          <div className="text-xs text-slate-600 space-y-0.5">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-slate-400" />
                              <span>{member.country_code} {member.phone}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-slate-400" />
                              <span className="truncate max-w-[200px]" title={member.email}>{member.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          {member.kyc_document_type && member.kyc_document_number && member.kyc_document_url ? (
                            <Badge 
                              variant="default" 
                              className="bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer"
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  const response = await fetch(`/api/file-url?key=${encodeURIComponent(member.kyc_document_url)}`);
                                  const data = await response.json();
                                  if (response.ok) {
                                    window.open(data.url, '_blank');
                                  }
                                } catch (error) {
                                  console.error('Failed to open file:', error);
                                }
                              }}
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                              Incomplete
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 text-sm text-slate-700">
                          {member.room_number || <span className="text-slate-400">—</span>}
                        </td>
                        <td className="p-3 text-sm text-slate-700">
                          {member.room_type || <span className="text-slate-400">—</span>}
                        </td>
                        <td className="p-3 text-sm text-slate-700">
                          {member.sharing_with === "Solo" ? (
                            <span className="text-slate-400">Solo</span>
                          ) : (
                            member.sharing_with
                          )}
                        </td>
                        <td className="p-3">
                          {member.is_assigned ? (
                            <Badge variant="default" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                              Assigned
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                              Unassigned
                            </Badge>
                          )}
                        </td>
                      </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "hotel" && (
        <Card>
          <CardHeader>
            <CardTitle>Hotel Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hotel_name">Hotel Name *</Label>
                  <Input
                    id="hotel_name"
                    value={hotelData.hotel_name}
                    onChange={(e) => setHotelData({ ...hotelData, hotel_name: e.target.value })}
                    placeholder="Grand Plaza Hotel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="star_rating">Star Rating *</Label>
                  <select
                    id="star_rating"
                    value={hotelData.star_rating}
                    onChange={(e) => setHotelData({ ...hotelData, star_rating: parseInt(e.target.value) })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value={1}>1 Star</option>
                    <option value={2}>2 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={5}>5 Stars</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Hotel Image & Website */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Hotel Image & Website</h3>
              <div className="grid grid-cols-1 gap-4">
                {/* Hotel Image */}
                <div className="space-y-2">
                  <Label>Hotel Image</Label>
                  <FileUpload
                    value={hotelData.image_url}
                    onChange={(url) => setHotelData({ ...hotelData, image_url: url })}
                    folder="hotels"
                    accept="image/*"
                    maxSize={5 * 1024 * 1024}
                    fileType="image"
                  />
                  <p className="text-xs text-slate-500">Upload JPG, PNG (max 5MB)</p>
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={hotelData.website}
                    onChange={(e) => setHotelData({ ...hotelData, website: e.target.value })}
                    placeholder="https://www.hotelwebsite.com"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Address</h3>
              <div className="space-y-4">
                <AddressInput
                  country={hotelData.country}
                  pincode={hotelData.pincode}
                  state={hotelData.state}
                  city={hotelData.city}
                  addressLane={hotelData.address_street}
                  onCountryChange={(value) => setHotelData(prev => ({ ...prev, country: value }))}
                  onPincodeChange={(value) => setHotelData(prev => ({ ...prev, pincode: value }))}
                  onStateChange={(value) => setHotelData(prev => ({ ...prev, state: value }))}
                  onCityChange={(value) => setHotelData(prev => ({ ...prev, city: value }))}
                  onAddressLaneChange={(value) => setHotelData(prev => ({ ...prev, address_street: value }))}
                />
                
                <div className="space-y-2">
                  <Label htmlFor="maps_link">Maps Link</Label>
                  <Input
                    id="maps_link"
                    value={hotelData.maps_link}
                    onChange={(e) => setHotelData({ ...hotelData, maps_link: e.target.value })}
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>
            </div>

            {/* Contact Information - Multiple POCs */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">Points of Contact</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddPOC}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add POC
                </Button>
              </div>

              <div className="space-y-6">
                {hotelPOCs.map((poc, index) => (
                  <div key={index} className="p-4 border border-slate-200 rounded-lg relative">
                    {hotelPOCs.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePOC(index)}
                        className="absolute top-2 right-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`poc_name_${index}`}>Name *</Label>
                        <Input
                          id={`poc_name_${index}`}
                          value={poc.name}
                          onChange={(e) => handlePOCChange(index, "name", e.target.value)}
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`poc_phone_${index}`}>Phone (10 digits) *</Label>
                        <Input
                          id={`poc_phone_${index}`}
                          type="tel"
                          value={poc.phone}
                          onChange={(e) => handlePOCChange(index, "phone", e.target.value)}
                          placeholder="1234567890"
                          maxLength={10}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`poc_email_${index}`}>Email *</Label>
                        <Input
                          id={`poc_email_${index}`}
                          type="email"
                          value={poc.email}
                          onChange={(e) => handlePOCChange(index, "email", e.target.value)}
                          placeholder="contact@hotel.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`poc_for_${index}`}>POC for</Label>
                        <Input
                          id={`poc_for_${index}`}
                          value={poc.poc_for}
                          onChange={(e) => handlePOCChange(index, "poc_for", e.target.value)}
                          placeholder="e.g., Reservations, Events, Catering"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`display_for_members_${index}`}
                            checked={poc.display_for_members}
                            onCheckedChange={(checked) => handlePOCChange(index, "display_for_members", checked as boolean)}
                          />
                          <Label htmlFor={`display_for_members_${index}`} className="cursor-pointer">
                            Display for members also
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Services & Amenities */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">Services & Amenities</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddService}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Service
                </Button>
              </div>

              <div className="space-y-3">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={service}
                      onChange={(e) => handleServiceChange(index, e.target.value)}
                      placeholder="e.g., WiFi, Swimming Pool, Gym, Restaurant"
                      className="flex-1"
                    />
                    {services.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveService(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Additional Details</h3>
              <Textarea
                value={hotelData.additional_details}
                onChange={(e) => setHotelData({ ...hotelData, additional_details: e.target.value })}
                placeholder="Any additional information about the hotel (policies, special notes, etc.)"
                rows={4}
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={handleSaveHotel} disabled={savingHotel}>
                {savingHotel ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Home className="mr-2 h-4 w-4" />
                    Save Hotel Details
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Room Assignment Dialog */}
      <RoomAssignmentDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        member={selectedMember}
        roomAssignment={
          selectedMember
            ? {
                room_number: selectedMember.room_number,
                room_type: selectedMember.room_type,
              }
            : null
        }
        checkInRecords={selectedMember ? checkInRecords.get(selectedMember.id) : undefined}
        isCheckedIn={selectedMember ? checkedInMembers.has(selectedMember.id) : false}
        onCheckInToggle={handleCheckInToggle}
        onSave={handleSaveRoomAssignment}
      />
    </div>
  );
}
