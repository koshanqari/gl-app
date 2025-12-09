"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, XCircle, AlertCircle, Save, Clock } from "lucide-react";

interface RSVP {
  id?: string;
  member_id: string;
  member_name: string;
  employee_id: string;
  email: string;
  phone?: string;
  response: 'yes' | 'maybe' | 'no' | null; // null means pending
  responded_at?: string;
}

interface TravelSchedule {
  id: string;
  name: string;
}

interface TravelRsvpManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: TravelSchedule | null;
  eventId: string;
  onUpdate?: () => void;
}

export function TravelRsvpManagementDialog({
  isOpen,
  onClose,
  schedule,
  eventId,
  onUpdate,
}: TravelRsvpManagementDialogProps) {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'yes' | 'maybe' | 'no' | 'pending'>('all');
  const [changes, setChanges] = useState<Record<string, 'yes' | 'maybe' | 'no'>>({});

  // Fetch all members and existing RSVPs
  useEffect(() => {
    if (!isOpen || !schedule) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all members for this event
        const membersResponse = await fetch(`/api/members?event_id=${eventId}`);
        const membersData = await membersResponse.json();
        
        if (membersData.members) {
          setAllMembers(membersData.members);
        }

        // Fetch existing RSVPs for this schedule
        const scheduleResponse = await fetch(`/api/travel/${schedule.id}`);
        const scheduleData = await scheduleResponse.json();

        if (scheduleData.schedule && scheduleData.schedule.rsvps) {
          const existingRsvps = scheduleData.schedule.rsvps;
          
          // Create a map of member_id -> RSVP
          const rsvpMap = new Map<string, RSVP>();
          existingRsvps.forEach((rsvp: RSVP) => {
            rsvpMap.set(rsvp.member_id, rsvp);
          });

          // Merge all members with their RSVP status
          const mergedRsvps: RSVP[] = (membersData.members || []).map((member: any) => {
            const existingRsvp = rsvpMap.get(member.id);
            return existingRsvp || {
              member_id: member.id,
              member_name: member.name,
              employee_id: member.employee_id,
              email: member.email,
              phone: member.phone,
              response: null, // null means pending - no response yet
            };
          });

          setRsvps(mergedRsvps);
        } else {
          // No RSVPs yet, create pending entries for all members
          const pendingRsvps: RSVP[] = (membersData.members || []).map((member: any) => ({
            member_id: member.id,
            member_name: member.name,
            employee_id: member.employee_id,
            email: member.email,
            phone: member.phone,
            response: null, // null means pending - no response yet
          }));
          setRsvps(pendingRsvps);
        }
      } catch (error) {
        console.error('Failed to fetch RSVP data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen, schedule, eventId]);

  const handleResponseChange = (memberId: string, newResponse: 'yes' | 'maybe' | 'no') => {
    setChanges(prev => ({
      ...prev,
      [memberId]: newResponse,
    }));

    // Update local state immediately for UI feedback
    setRsvps(prev => prev.map(rsvp => 
      rsvp.member_id === memberId 
        ? { ...rsvp, response: newResponse }
        : rsvp
    ));
  };

  const handleSave = async () => {
    if (!schedule || Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    try {
      setIsSaving(true);
      
      // Update all changed RSVPs
      const updatePromises = Object.entries(changes).map(async ([memberId, newResponse]) => {
        const response = await fetch(`/api/travel/${schedule.id}/rsvp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            member_id: memberId,
            response: newResponse,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to update RSVP');
        }
      });

      await Promise.all(updatePromises);
      
      setChanges({});
      if (onUpdate) {
        onUpdate();
      }
      onClose();
    } catch (error: any) {
      console.error('Failed to save RSVPs:', error);
      alert(error.message || 'Failed to save RSVP changes');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredRsvps = rsvps.filter(rsvp => {
    const matchesSearch = 
      rsvp.member_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rsvp.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rsvp.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' || 
      (filterStatus === 'pending' && rsvp.response === null) ||
      (filterStatus !== 'pending' && rsvp.response === filterStatus);
    
    return matchesSearch && matchesFilter;
  });

  const hasChanges = Object.keys(changes).length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Manage RSVPs - {schedule?.name}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-500">Loading RSVPs...</p>
          </div>
        ) : (
          <>
            {/* Search and Filter */}
            <div className="flex gap-4 mb-4">
              <Input
                placeholder="Search by name, employee ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Responses</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="maybe">Maybe</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* RSVP List */}
            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-lg">
              <div className="divide-y divide-slate-200">
                {filteredRsvps.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    No members found matching your search.
                  </div>
                ) : (
                  filteredRsvps.map((rsvp) => {
                    const hasChange = changes[rsvp.member_id] !== undefined;
                    const currentResponse = changes[rsvp.member_id] !== undefined 
                      ? changes[rsvp.member_id] 
                      : rsvp.response;

                    return (
                      <div
                        key={rsvp.member_id}
                        className={`p-4 hover:bg-slate-50 transition-colors ${
                          hasChange ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-medium text-slate-900">{rsvp.member_name}</p>
                                <p className="text-sm text-slate-500">
                                  {rsvp.employee_id} • {rsvp.email}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Current Status Badge */}
                            {!hasChange && (
                              <Badge
                                variant={
                                  rsvp.response === 'yes'
                                    ? 'default'
                                    : rsvp.response === 'no'
                                    ? 'destructive'
                                    : rsvp.response === null
                                    ? 'outline'
                                    : 'secondary'
                                }
                          className={
                            rsvp.response === 'yes'
                              ? 'bg-green-100 text-green-700'
                              : rsvp.response === 'no'
                              ? 'bg-red-100 text-red-700'
                              : rsvp.response === null
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-yellow-100 text-yellow-700'
                          }
                              >
                                {rsvp.response === 'yes' ? (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                ) : rsvp.response === 'no' ? (
                                  <XCircle className="h-3 w-3 mr-1" />
                                ) : rsvp.response === null ? (
                                  <Clock className="h-3 w-3 mr-1" />
                                ) : (
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                )}
                                {rsvp.response === 'yes' ? 'Yes' : rsvp.response === 'no' ? 'No' : rsvp.response === null ? 'Pending' : 'Maybe'}
                              </Badge>
                            )}

                            {/* Response Selector */}
                            <Select
                              value={currentResponse || ''}
                              onValueChange={(value: 'yes' | 'maybe' | 'no') => 
                                handleResponseChange(rsvp.member_id, value)
                              }
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Pending" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    Yes
                                  </div>
                                </SelectItem>
                                <SelectItem value="maybe">
                                  <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                                    Maybe
                                  </div>
                                </SelectItem>
                                <SelectItem value="no">
                                  <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    No
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Footer with Save Button */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div className="text-sm text-slate-500">
                {hasChanges && (
                  <span className="text-blue-600 font-medium">
                    {Object.keys(changes).length} change{Object.keys(changes).length !== 1 ? 's' : ''} pending
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} disabled={isSaving}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={!hasChanges || isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

