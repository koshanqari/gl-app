"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Plane, Plus, Edit, Trash2, Clock, MapPin, Users, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TravelScheduleDialog } from "@/components/travel-schedule-dialog";
import { TravelRsvpManagementDialog } from "@/components/travel-rsvp-management-dialog";
import { useEventData } from "@/lib/event-context";

interface TravelSchedule {
  id: string;
  name: string;
  from_datetime: string;
  to_datetime: string | null;
  pickup_location: string | null;
  dropoff_location: string | null;
  vehicle_type: string | null;
  description: string | null;
  rsvp_counts?: {
    yes: number;
    maybe: number;
    no: number;
    pending: number;
  };
}

export default function TravelPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { permissions } = useEventData();
  const [schedules, setSchedules] = useState<TravelSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TravelSchedule | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState<TravelSchedule | null>(null);
  const [showRsvpManagement, setShowRsvpManagement] = useState(false);

  // Check if user has travel permission
  const hasPermission = permissions?.travel ?? false;

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/travel?event_id=${eventId}`);
      const data = await response.json();

      console.log('Travel API Response:', { eventId, response: response.ok, data });
      
      if (response.ok && data.schedules) {
        setSchedules(data.schedules);
      } else {
        console.error('Failed to fetch schedules:', data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Failed to fetch travel schedules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasPermission) {
      setIsLoading(false);
      return;
    }

    fetchSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, hasPermission]);

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setIsDialogOpen(true);
  };

  const handleEditSchedule = (schedule: TravelSchedule) => {
    setEditingSchedule(schedule);
    setIsDialogOpen(true);
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this travel schedule?")) {
      return;
    }

    try {
      const response = await fetch(`/api/travel/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        fetchSchedules();
      } else {
        alert(data.message || "Failed to delete travel schedule");
      }
    } catch (error) {
      console.error('Failed to delete travel schedule:', error);
      alert("Failed to delete travel schedule");
    }
  };

  const handleSaveSchedule = async (scheduleData: any) => {
    try {
      const url = editingSchedule
        ? `/api/travel/${editingSchedule.id}`
        : '/api/travel';
      const method = editingSchedule ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData),
      });

      const data = await response.json();

      if (response.ok) {
        fetchSchedules();
        setIsDialogOpen(false);
      } else {
        alert(data.message || `Failed to ${editingSchedule ? 'update' : 'create'} travel schedule`);
      }
    } catch (error) {
      console.error('Failed to save travel schedule:', error);
      alert(`Failed to ${editingSchedule ? 'update' : 'create'} travel schedule`);
    }
  };

  const handleManageRsvps = (schedule: TravelSchedule) => {
    setSelectedSchedule(schedule);
    setShowRsvpManagement(true);
  };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return {
      date: date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
    };
  };

  const filteredSchedules = useMemo(() => {
    if (!searchQuery.trim()) return schedules;
    
    const query = searchQuery.toLowerCase();
    return schedules.filter(
      (schedule) =>
        schedule.name.toLowerCase().includes(query) ||
        schedule.pickup_location?.toLowerCase().includes(query) ||
        schedule.dropoff_location?.toLowerCase().includes(query) ||
        schedule.vehicle_type?.toLowerCase().includes(query) ||
        schedule.description?.toLowerCase().includes(query)
    );
  }, [schedules, searchQuery]);

  if (!hasPermission) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Travel Management</h1>
          <p className="text-slate-500 mt-1">
            You don&apos;t have permission to access this page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Travel Management</h1>
          <p className="text-slate-500 mt-1">
            Manage travel schedules and track member RSVPs
          </p>
        </div>
        <Button onClick={handleAddSchedule}>
          <Plus className="h-4 w-4 mr-2" />
          Add Schedule
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Search schedules by name, location, vehicle type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Schedules List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Travel Schedules ({filteredSchedules.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Loading schedules...</p>
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="text-center py-12">
              <Plane className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No Travel Schedules
              </h3>
              <p className="text-slate-500 mb-4">
                {searchQuery ? "No schedules match your search." : "Get started by adding your first travel schedule."}
              </p>
              {!searchQuery && (
                <Button onClick={handleAddSchedule}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Schedule
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSchedules.map((schedule) => {
                const fromDateTime = formatDateTime(schedule.from_datetime);
                const toDateTime = schedule.to_datetime ? formatDateTime(schedule.to_datetime) : null;
                const rsvpCounts = schedule.rsvp_counts || { yes: 0, maybe: 0, no: 0, pending: 0 };
                const totalResponses = rsvpCounts.yes + rsvpCounts.maybe + rsvpCounts.no;

                return (
                  <div
                    key={schedule.id}
                    className="border border-slate-200 rounded-lg p-6 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          {schedule.name}
                        </h3>
                        <div className="space-y-2">
                          {/* Date and Time */}
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <span className="font-medium">{fromDateTime.date}</span>
                            <span>{fromDateTime.time}</span>
                            {toDateTime && (
                              <>
                                <span>-</span>
                                <span>{toDateTime.time}</span>
                              </>
                            )}
                          </div>

                          {/* Vehicle Type */}
                          {schedule.vehicle_type && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Plane className="h-4 w-4 text-slate-400" />
                              <span>{schedule.vehicle_type}</span>
                            </div>
                          )}

                          {/* Pickup Location */}
                          {schedule.pickup_location && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              <span><strong>Pickup:</strong> {schedule.pickup_location}</span>
                            </div>
                          )}

                          {/* Dropoff Location */}
                          {schedule.dropoff_location && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              <span><strong>Dropoff:</strong> {schedule.dropoff_location}</span>
                            </div>
                          )}

                          {/* Description */}
                          {schedule.description && (
                            <p className="text-sm text-slate-600 mt-2">
                              {schedule.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageRsvps(schedule)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Manage RSVPs ({totalResponses})
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSchedule(schedule)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* RSVP Summary */}
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="flex items-center gap-4 text-sm flex-wrap">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-700 font-medium">{rsvpCounts.yes} Yes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-red-700 font-medium">{rsvpCounts.no} No</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                          <span className="text-yellow-700 font-medium">{rsvpCounts.maybe} Maybe</span>
                        </div>
                        {rsvpCounts.pending > 0 && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-600 font-medium">{rsvpCounts.pending} Pending</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Travel Schedule Dialog */}
      <TravelScheduleDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        schedule={editingSchedule}
        eventId={eventId}
        onSave={handleSaveSchedule}
      />

      {/* RSVP Management Dialog */}
      <TravelRsvpManagementDialog
        isOpen={showRsvpManagement}
        onClose={() => {
          setShowRsvpManagement(false);
          setSelectedSchedule(null);
        }}
        schedule={selectedSchedule}
        eventId={eventId}
        onUpdate={() => {
          fetchSchedules();
        }}
      />
    </div>
  );
}
