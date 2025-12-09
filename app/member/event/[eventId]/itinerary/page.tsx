"use client";

import { useParams } from "next/navigation";
import { useMemo, useState, useEffect, useRef } from "react";
import { MobileEmptyState, MobileContainer, MobileCard, MobileCardHeader, MobileCardContent } from "@/components/mobile";
import { KYCRequiredMessage } from "@/components/mobile/kyc-required-message";
import { useMemberEventData } from "@/contexts/member-event-data-context";
import { Calendar, Clock, MapPin, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

interface ItineraryLink {
  id: string;
  link_text: string;
  link_url: string;
}

interface ItineraryActivity {
  id: string;
  name: string;
  from_datetime: string;
  to_datetime: string | null;
  venue: string | null;
  description: string | null;
  sequence_order?: number;
  links: ItineraryLink[];
}

interface DayGroup {
  dayNumber: number;
  date: string;
  dateLabel: string;
  activities: ItineraryActivity[];
}

export default function MemberItineraryPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { isKYCComplete, itineraryActivities } = useMemberEventData();
  const activities = itineraryActivities || [];
  const [event, setEvent] = useState<any>(null);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());
  const hasInitialized = useRef(false);

  // Fetch event data for start date
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        const data = await response.json();
        if (response.ok && data.event) {
          setEvent(data.event);
        }
      } catch (error) {
        console.error('Failed to fetch event:', error);
      }
    };
    fetchEvent();
  }, [eventId]);

  // Group activities by day
  const dayGroups = useMemo(() => {
    const groups: DayGroup[] = [];
    const eventStartDate = event?.start_date ? new Date(event.start_date) : null;
    
    // Group activities by date
    const activityByDate: Record<string, ItineraryActivity[]> = {};
    activities.forEach((activity: ItineraryActivity) => {
      const dateKey = new Date(activity.from_datetime).toISOString().split('T')[0];
      if (!activityByDate[dateKey]) {
        activityByDate[dateKey] = [];
      }
      activityByDate[dateKey].push(activity);
    });

    // Sort dates and create day groups
    const sortedDates = Object.keys(activityByDate).sort();
    sortedDates.forEach((dateKey) => {
      const date = new Date(dateKey);
      let dayNumber = 1;
      
      if (eventStartDate) {
        const startDateOnly = new Date(eventStartDate.toISOString().split('T')[0]);
        const activityDateOnly = new Date(dateKey);
        const diffTime = activityDateOnly.getTime() - startDateOnly.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        dayNumber = diffDays + 1;
      }

      groups.push({
        dayNumber,
        date: dateKey,
        dateLabel: date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        activities: activityByDate[dateKey].sort((a, b) => (a.sequence_order || 0) - (b.sequence_order || 0)),
      });
    });

    return groups;
  }, [activities, event?.start_date]);

  // Initialize expanded days (expand all days by default) - only once when dayGroups first loads
  useEffect(() => {
    if (dayGroups.length > 0 && !hasInitialized.current) {
      // Expand all days by default on first load
      setExpandedDays(new Set(dayGroups.map(g => g.dayNumber)));
      hasInitialized.current = true;
    }
  }, [dayGroups]);

  const toggleDay = (dayNumber: number) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dayNumber)) {
        newSet.delete(dayNumber);
      } else {
        newSet.add(dayNumber);
      }
      return newSet;
    });
  };

  if (!isKYCComplete) {
    return (
      <MobileContainer>
        <KYCRequiredMessage eventId={eventId} />
      </MobileContainer>
    );
  }


  if (activities.length === 0) {
  return (
      <MobileContainer>
    <MobileEmptyState
      icon={Calendar}
          title="No Activities Scheduled"
          description="Event itinerary will appear here once activities are added"
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
        {dayGroups.map((dayGroup) => {
          const isExpanded = expandedDays.has(dayGroup.dayNumber);
          
          return (
            <div key={dayGroup.date} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Day Header - Clickable */}
              <button
                onClick={() => toggleDay(dayGroup.dayNumber)}
                className="w-full flex items-center justify-between p-4 bg-slate-900 text-white"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold">Day {dayGroup.dayNumber}</span>
                  <span className="text-slate-300 text-sm">{dayGroup.dateLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300">{dayGroup.activities.length} activities</span>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </button>

              {/* Activities - Collapsible */}
              {isExpanded && (
                <div className="divide-y divide-slate-100">
                  {dayGroup.activities.map((activity, index) => {
                    const fromDateTime = formatDateTime(activity.from_datetime);
                    const toDateTime = activity.to_datetime ? formatDateTime(activity.to_datetime) : null;
                    const showTime = fromDateTime.time !== '12:00 AM';

                    return (
                      <div key={activity.id} className="p-4">
                        <div className="flex gap-3">
                          {/* Sequence number */}
                          <div className="flex-shrink-0 w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-slate-600">{index + 1}</span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            {/* Activity name */}
                            <h4 className="font-semibold text-slate-900 mb-1">
                              {activity.name}
                            </h4>

                            {/* Time and Venue */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mb-2">
                              {showTime && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {fromDateTime.time}
                                  {toDateTime && toDateTime.time !== '12:00 AM' && ` - ${toDateTime.time}`}
                                </span>
                              )}
                              {activity.venue && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {activity.venue}
                                </span>
                              )}
                            </div>

                            {/* Description */}
                            {activity.description && (
                              <p className="text-sm text-slate-600 whitespace-pre-wrap">
                                {activity.description}
                              </p>
                            )}

                            {/* Links */}
                            {activity.links && activity.links.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {activity.links.map((link: ItineraryLink) => (
                                  <a
                                    key={link.id}
                                    href={link.link_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    {link.link_text}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </MobileContainer>
  );
}
