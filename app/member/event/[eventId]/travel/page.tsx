"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { MobileEmptyState, MobileContainer, MobileCard, MobileCardHeader, MobileCardContent } from "@/components/mobile";
import { KYCRequiredMessage } from "@/components/mobile/kyc-required-message";
import { useMemberEventData } from "@/contexts/member-event-data-context";
import { Plane, Clock, MapPin, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMemberSession } from "@/lib/auth-cookies";

interface TravelSchedule {
  id: string;
  name: string;
  from_datetime: string;
  to_datetime: string | null;
  pickup_location: string | null;
  dropoff_location: string | null;
  vehicle_type: string | null;
  description: string | null;
  rsvp?: {
    response: 'yes' | 'maybe' | 'no';
    responded_at?: string;
  } | null; // null means no RSVP yet
}

export default function MemberTravelPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { isKYCComplete, memberData, travelSchedules, travelRsvps } = useMemberEventData();
  const [localRsvps, setLocalRsvps] = useState<Record<string, string | null>>({});
  const [updatingRsvp, setUpdatingRsvp] = useState<string | null>(null);
  
  // Fallback KYC check from memberData if context doesn't have it
  const kycComplete = isKYCComplete || !!(
    memberData?.kyc_document_type &&
    memberData?.kyc_document_number &&
    memberData?.kyc_document_url
  );

  // Initialize local RSVPs from context
  useEffect(() => {
    if (travelRsvps) {
      setLocalRsvps(travelRsvps);
    }
  }, [travelRsvps]);

  // Merge schedules with RSVP data
  const schedules: TravelSchedule[] = useMemo(() => {
    return (travelSchedules || []).map((schedule: any) => ({
      ...schedule,
      rsvp: localRsvps[schedule.id] 
        ? { response: localRsvps[schedule.id] as 'yes' | 'maybe' | 'no' }
        : null
    }));
  }, [travelSchedules, localRsvps]);

  const handleRsvp = async (scheduleId: string, response: 'yes' | 'maybe' | 'no') => {
    const member = getMemberSession();
    if (!member) return;

    try {
      setUpdatingRsvp(scheduleId);
      const rsvpResponse = await fetch(`/api/travel/${scheduleId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: member.id,
          response,
        }),
      });

      const rsvpData = await rsvpResponse.json();

      if (rsvpResponse.ok) {
        // Update local RSVP state
        setLocalRsvps(prev => ({
          ...prev,
          [scheduleId]: response
        }));
      } else {
        alert(rsvpData.message || 'Failed to update RSVP');
      }
    } catch (error) {
      console.error('Failed to update RSVP:', error);
      alert('Failed to update RSVP');
    } finally {
      setUpdatingRsvp(null);
    }
  };

  if (!kycComplete) {
    return (
      <MobileContainer>
        <KYCRequiredMessage eventId={eventId} />
      </MobileContainer>
    );
  }

  if (schedules.length === 0) {
    return (
      <MobileContainer>
        <MobileEmptyState
          icon={Plane}
          title="No Travel Schedules"
          description="Travel arrangements will appear here once they are added"
        />
      </MobileContainer>
    );
  }

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
    };
  };

  return (
    <MobileContainer>
      <div className="space-y-4">
        {schedules.map((schedule) => {
          const fromDateTime = formatDateTime(schedule.from_datetime);
          const toDateTime = schedule.to_datetime ? formatDateTime(schedule.to_datetime) : null;
          const currentResponse = schedule.rsvp?.response || null; // No default - null means not responded
          const isUpdating = updatingRsvp === schedule.id;

          return (
            <MobileCard key={schedule.id}>
              <MobileCardHeader>
                {schedule.name}
              </MobileCardHeader>
              <MobileCardContent>
                <div className="space-y-3">
                  {/* Date and Time */}
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {fromDateTime.date}
                      </p>
                      <p className="text-xs text-slate-500">
                        {fromDateTime.time}
                        {toDateTime && ` - ${toDateTime.time}`}
                      </p>
                    </div>
                  </div>

                  {/* Vehicle Type */}
                  {schedule.vehicle_type && (
                    <div className="flex items-start gap-3">
                      <Plane className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-slate-700 flex-1">
                        {schedule.vehicle_type}
                      </p>
                    </div>
                  )}

                  {/* Pickup Location */}
                  {schedule.pickup_location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-slate-500">Pickup</p>
                        <p className="text-sm text-slate-700">
                          {schedule.pickup_location}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Dropoff Location */}
                  {schedule.dropoff_location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-slate-500">Dropoff</p>
                        <p className="text-sm text-slate-700">
                          {schedule.dropoff_location}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {schedule.description && (
                    <div>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">
                        {schedule.description}
                      </p>
                    </div>
                  )}

                  {/* Current RSVP Status */}
                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-slate-900">Your Response</p>
                      {currentResponse ? (
                        <Badge
                          variant={
                            currentResponse === 'yes'
                              ? 'default'
                              : currentResponse === 'no'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className={
                            currentResponse === 'yes'
                              ? 'bg-green-100 text-green-700'
                              : currentResponse === 'no'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }
                        >
                          {currentResponse === 'yes' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : currentResponse === 'no' ? (
                            <XCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <AlertCircle className="h-3 w-3 mr-1" />
                          )}
                          {currentResponse === 'yes' ? 'Yes' : currentResponse === 'no' ? 'No' : 'Maybe'}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-slate-100 text-slate-600">
                          Not Responded
                        </Badge>
                      )}
                    </div>

                    {/* RSVP Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant={currentResponse === 'yes' ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1"
                        onClick={() => handleRsvp(schedule.id, 'yes')}
                        disabled={isUpdating}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {isUpdating && currentResponse !== 'yes' ? 'Updating...' : 'Yes'}
                      </Button>
                      <Button
                        variant={currentResponse === 'maybe' ? 'default' : 'outline'}
                        size="sm"
                        className={`flex-1 ${currentResponse === 'maybe' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : ''}`}
                        onClick={() => handleRsvp(schedule.id, 'maybe')}
                        disabled={isUpdating}
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {isUpdating && currentResponse !== 'maybe' ? 'Updating...' : 'Maybe'}
                      </Button>
                      <Button
                        variant={currentResponse === 'no' ? 'destructive' : 'outline'}
                        size="sm"
                        className="flex-1"
                        onClick={() => handleRsvp(schedule.id, 'no')}
                        disabled={isUpdating}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {isUpdating && currentResponse !== 'no' ? 'Updating...' : 'No'}
                      </Button>
                    </div>
                  </div>
                </div>
              </MobileCardContent>
            </MobileCard>
          );
        })}
      </div>
    </MobileContainer>
  );
}
