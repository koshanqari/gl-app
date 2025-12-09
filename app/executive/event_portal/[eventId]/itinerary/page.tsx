"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Calendar, Plus, Edit, Trash2, Clock, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ItineraryActivityDialog } from "@/components/itinerary-activity-dialog";
import { useEventData } from "@/lib/event-context";

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
  sequence_order: number;
  links: ItineraryLink[];
}

interface DayGroup {
  dayNumber: number;
  date: string;
  dateLabel: string;
  activities: ItineraryActivity[];
}

export default function ItineraryPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { permissions, event } = useEventData();
  const [activities, setActivities] = useState<ItineraryActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ItineraryActivity | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | 'all'>('all');

  // Check if user has itinerary permission
  const hasPermission = permissions?.itinerary ?? false;

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/itinerary?event_id=${eventId}`);
      const data = await response.json();

      if (response.ok && data.activities) {
        setActivities(data.activities);
      }
    } catch (error) {
      console.error('Failed to fetch itinerary activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasPermission) {
      setIsLoading(false);
      return;
    }

    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, hasPermission]);

  const handleAddActivity = () => {
    setEditingActivity(null);
    setIsDialogOpen(true);
  };

  const handleEditActivity = (activity: ItineraryActivity) => {
    setEditingActivity(activity);
    setIsDialogOpen(true);
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm("Are you sure you want to delete this activity?")) {
      return;
    }

    try {
      const response = await fetch(`/api/itinerary/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        fetchActivities();
      } else {
        alert(data.message || "Failed to delete activity");
      }
    } catch (error) {
      console.error('Failed to delete activity:', error);
      alert("Failed to delete activity");
    }
  };

  const handleSaveActivity = async (activityData: any) => {
    try {
      const url = editingActivity
        ? `/api/itinerary/${editingActivity.id}`
        : '/api/itinerary';
      const method = editingActivity ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityData),
      });

      const data = await response.json();

      if (response.ok) {
        fetchActivities();
      } else {
        alert(data.message || `Failed to ${editingActivity ? 'update' : 'create'} activity`);
      }
    } catch (error) {
      console.error('Failed to save activity:', error);
      alert(`Failed to ${editingActivity ? 'update' : 'create'} activity`);
    }
  };

  // Group activities by day
  const dayGroups = useMemo(() => {
    const groups: DayGroup[] = [];
    const eventStartDate = event?.start_date ? new Date(event.start_date) : null;
    
    // Group activities by date
    const activityByDate: Record<string, ItineraryActivity[]> = {};
    activities.forEach(activity => {
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
        // Calculate day number relative to event start
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
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
        activities: activityByDate[dateKey].sort((a, b) => a.sequence_order - b.sequence_order),
      });
    });

    return groups;
  }, [activities, event?.start_date]);

  // Filter activities based on search and day filter
  const filteredDayGroups = useMemo(() => {
    let filtered = dayGroups;

    // Filter by day
    if (selectedDayFilter !== 'all') {
      filtered = filtered.filter(group => group.dayNumber === selectedDayFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.map(group => ({
        ...group,
        activities: group.activities.filter(
          (activity) =>
            activity.name.toLowerCase().includes(query) ||
            (activity.venue && activity.venue.toLowerCase().includes(query)) ||
            (activity.description && activity.description.toLowerCase().includes(query))
        ),
      })).filter(group => group.activities.length > 0);
    }

    return filtered;
  }, [dayGroups, searchQuery, selectedDayFilter]);

  const totalActivities = filteredDayGroups.reduce((sum, group) => sum + group.activities.length, 0);

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    };
  };

  if (!hasPermission) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Itinerary & Activities</h1>
          <p className="text-slate-500 mt-1">
            Plan and manage event schedules and activities
          </p>
        </div>

        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Calendar className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Access Restricted
              </h3>
              <p className="text-slate-500">
                You don&apos;t have permission to view or manage itinerary activities.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Itinerary & Activities</h1>
          <p className="text-slate-500 mt-1">
            Plan and manage event schedules and activities
          </p>
        </div>
        <Button onClick={handleAddActivity}>
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <Input
              placeholder="Search activities by name, venue, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            {dayGroups.length > 0 && (
              <select
                value={selectedDayFilter}
                onChange={(e) => setSelectedDayFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="px-3 py-2 border border-slate-200 rounded-md text-sm"
              >
                <option value="all">All Days</option>
                {dayGroups.map(group => (
                  <option key={group.dayNumber} value={group.dayNumber}>
                    Day {group.dayNumber}
                  </option>
                ))}
              </select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activities List - Grouped by Day */}
      <Card>
        <CardHeader>
          <CardTitle>
            Activities ({totalActivities})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Loading activities...</p>
            </div>
          ) : filteredDayGroups.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No Activities
              </h3>
              <p className="text-slate-500 mb-4">
                {searchQuery ? "No activities match your search." : "Get started by adding your first activity."}
              </p>
              {!searchQuery && (
                <Button onClick={handleAddActivity}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Activity
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {filteredDayGroups.map((dayGroup) => (
                <div key={dayGroup.date} className="space-y-4">
                  {/* Day Header */}
                  <div className="flex items-center gap-3 pb-2 border-b-2 border-slate-200">
                    <div className="bg-slate-900 text-white px-4 py-2 rounded-lg">
                      <span className="text-lg font-bold">Day {dayGroup.dayNumber}</span>
                    </div>
                    <div>
                      <p className="text-slate-600 font-medium">{dayGroup.dateLabel}</p>
                    </div>
                  </div>

                  {/* Activities for this day */}
                  <div className="space-y-3 pl-4 border-l-2 border-slate-100">
                    {dayGroup.activities.map((activity, index) => {
                      const fromDateTime = formatDateTime(activity.from_datetime);
                      const toDateTime = activity.to_datetime ? formatDateTime(activity.to_datetime) : null;

                      return (
                        <div
                          key={activity.id}
                          className="relative border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors bg-white"
                        >
                          {/* Sequence indicator */}
                          <div className="absolute -left-[calc(1rem+11px)] top-4 w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-slate-600">{index + 1}</span>
                          </div>

                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900 mb-1">
                                {activity.name}
                              </h4>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                                {/* Time (if specific) */}
                                {fromDateTime.time !== '12:00 AM' && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {fromDateTime.time}
                                    {toDateTime && toDateTime.time !== '12:00 AM' && ` - ${toDateTime.time}`}
                                  </span>
                                )}
                                {/* Venue */}
                                {activity.venue && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {activity.venue}
                                  </span>
                                )}
                              </div>
                              {/* Description */}
                              {activity.description && (
                                <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">
                                  {activity.description}
                                </p>
                              )}
                              {/* Links */}
                              {activity.links && activity.links.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {activity.links.map((link) => (
                                    <a
                                      key={link.id}
                                      href={link.link_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      {link.link_text}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1 ml-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditActivity(activity)}
                                title="Edit Activity"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteActivity(activity.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Delete Activity"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <ItineraryActivityDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingActivity(null);
        }}
        activity={editingActivity}
        eventId={eventId}
        onSave={handleSaveActivity}
      />
    </div>
  );
}
