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
  links: ItineraryLink[];
}

export default function ItineraryPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { permissions } = useEventData();
  const [activities, setActivities] = useState<ItineraryActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ItineraryActivity | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filter activities based on search
  const filteredActivities = useMemo(() => {
    if (!searchQuery.trim()) {
      return activities;
    }

    const query = searchQuery.toLowerCase();
    return activities.filter(
      (activity) =>
        activity.name.toLowerCase().includes(query) ||
        (activity.venue && activity.venue.toLowerCase().includes(query)) ||
        (activity.description && activity.description.toLowerCase().includes(query))
    );
  }, [activities, searchQuery]);

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

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Search activities by name, venue, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Activities List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Activities ({filteredActivities.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Loading activities...</p>
            </div>
          ) : filteredActivities.length === 0 ? (
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
            <div className="space-y-4">
              {filteredActivities.map((activity) => {
                const fromDateTime = formatDateTime(activity.from_datetime);
                const toDateTime = activity.to_datetime ? formatDateTime(activity.to_datetime) : null;

                return (
                  <div
                    key={activity.id}
                    className="border border-slate-200 rounded-lg p-6 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          {activity.name}
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

                          {/* Venue */}
                          {activity.venue && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              <span>{activity.venue}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
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

                    {/* Description */}
                    {activity.description && (
                      <div className="mb-4">
                        <p className="text-sm text-slate-600 whitespace-pre-wrap">
                          {activity.description}
                        </p>
                      </div>
                    )}

                    {/* Links */}
                    {activity.links && activity.links.length > 0 && (
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 mb-2">Links:</p>
                        <div className="flex flex-wrap gap-2">
                          {activity.links.map((link) => (
                            <a
                              key={link.id}
                              href={link.link_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              <span>{link.link_text}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
