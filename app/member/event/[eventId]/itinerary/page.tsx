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
  group_id?: string;
  group_name?: string;
  group_order?: number;
  links: ItineraryLink[];
}

interface ItineraryGroup {
  id: string;
  group_name: string;
  group_order: number;
  activities: ItineraryActivity[];
}

export default function MemberItineraryPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { isKYCComplete, itineraryActivities, itineraryGroups } = useMemberEventData();
  const activities = itineraryActivities || [];
  const groups = itineraryGroups || [];
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const hasInitialized = useRef(false);

  // Group activities when both groups and activities are available
  const groupedActivities = useMemo(() => {
    if (groups.length === 0) return [];
    
    // Create a map of activities by group_id
    const activitiesByGroup: Record<string, ItineraryActivity[]> = {};
    const ungrouped: ItineraryActivity[] = [];
    
    activities.forEach((activity: ItineraryActivity) => {
      if (activity.group_id) {
        if (!activitiesByGroup[activity.group_id]) {
          activitiesByGroup[activity.group_id] = [];
        }
        activitiesByGroup[activity.group_id].push(activity);
      } else {
        ungrouped.push(activity);
      }
    });
    
    // Create grouped array from API groups
    const grouped: ItineraryGroup[] = groups.map((group: any) => ({
      id: group.id,
      group_name: group.group_name,
      group_order: group.group_order,
      activities: (activitiesByGroup[group.id] || []).sort((a, b) => (a.sequence_order || 0) - (b.sequence_order || 0)),
    }));
    
    // Add ungrouped activities if any exist
    if (ungrouped.length > 0) {
      grouped.push({
        id: 'ungrouped',
        group_name: 'Other Activities',
        group_order: 999,
        activities: ungrouped.sort((a, b) => (a.sequence_order || 0) - (b.sequence_order || 0)),
      });
    }
    
    return grouped;
  }, [groups, activities]);

  // Initialize expanded groups (expand all groups by default) - only once when groupedActivities first load
  useEffect(() => {
    if (groupedActivities.length > 0 && !hasInitialized.current) {
      // Expand all groups by default on first load
      setExpandedGroups(new Set(groupedActivities.map(g => g.id)));
      hasInitialized.current = true;
    }
  }, [groupedActivities.length]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
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


  if (groupedActivities.length === 0 && activities.length === 0) {
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
        {groupedActivities.map((group) => {
          const isExpanded = expandedGroups.has(group.id);
          
          return (
            <div key={group.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Group Header - Clickable */}
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between p-4 bg-slate-900 text-white"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold">{group.group_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300">{group.activities.length} activities</span>
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
                  {group.activities.map((activity, index) => {
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
