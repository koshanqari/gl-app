"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Calendar, Plus, Edit, Trash2, Clock, MapPin, ExternalLink, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ItineraryActivityDialog } from "@/components/itinerary-activity-dialog";
import { ItineraryGroupDialog } from "@/components/itinerary-group-dialog";
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
  group_id?: string;
  group_name?: string;
  group_order?: number;
  links: ItineraryLink[];
}

interface ItineraryGroup {
  id: string;
  event_id: string;
  group_name: string;
  group_order: number;
  start_date?: string;
  end_date?: string;
  description?: string;
}

interface GroupedActivities {
  group: ItineraryGroup;
  activities: ItineraryActivity[];
}

export default function ItineraryPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { permissions, event } = useEventData();
  const [activities, setActivities] = useState<ItineraryActivity[]>([]);
  const [groups, setGroups] = useState<ItineraryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ItineraryActivity | null>(null);
  const [editingGroup, setEditingGroup] = useState<ItineraryGroup | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string | 'all'>('all');

  // Check if user has itinerary permission
  const hasPermission = permissions?.itinerary ?? false;

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const [activitiesResponse, groupsResponse] = await Promise.all([
        fetch(`/api/itinerary?event_id=${eventId}`),
        fetch(`/api/itinerary-groups?event_id=${eventId}`),
      ]);

      const activitiesData = await activitiesResponse.json();
      const groupsData = await groupsResponse.json();

      if (activitiesResponse.ok && activitiesData.activities) {
        setActivities(activitiesData.activities);
      }
      if (groupsResponse.ok && groupsData.groups) {
        setGroups(groupsData.groups);
      }
    } catch (error) {
      console.error('Failed to fetch itinerary data:', error);
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

  // Group activities by itinerary group
  const groupedActivities = useMemo(() => {
    const grouped: GroupedActivities[] = [];
    
    // Create a map of activities by group_id
    const activitiesByGroup: Record<string, ItineraryActivity[]> = {};
    const ungroupedActivities: ItineraryActivity[] = [];

    activities.forEach(activity => {
      if (activity.group_id) {
        if (!activitiesByGroup[activity.group_id]) {
          activitiesByGroup[activity.group_id] = [];
        }
        activitiesByGroup[activity.group_id].push(activity);
      } else {
        ungroupedActivities.push(activity);
      }
    });

    // Sort groups by group_order
    const sortedGroups = [...groups].sort((a, b) => a.group_order - b.group_order);

    // Add all groups (even if they have no activities)
    sortedGroups.forEach(group => {
      const groupActivities = activitiesByGroup[group.id] || [];
      grouped.push({
        group,
        activities: groupActivities.sort((a, b) => a.sequence_order - b.sequence_order),
      });
    });

    // Add ungrouped activities if any (show even if groups exist)
    if (ungroupedActivities.length > 0) {
      grouped.push({
        group: {
          id: 'ungrouped',
          event_id: eventId,
          group_name: 'Ungrouped',
          group_order: 999,
        },
        activities: ungroupedActivities.sort((a, b) => a.sequence_order - b.sequence_order),
      });
    }

    return grouped;
  }, [activities, groups, eventId]);

  // Filter activities based on search and group filter
  const filteredGroups = useMemo(() => {
    let filtered = groupedActivities;

    // Filter by group
    if (selectedGroupFilter !== 'all') {
      filtered = filtered.filter(item => item.group.id === selectedGroupFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.map(item => ({
        ...item,
        activities: item.activities.filter(
          (activity) =>
            activity.name.toLowerCase().includes(query) ||
            (activity.venue && activity.venue.toLowerCase().includes(query)) ||
            (activity.description && activity.description.toLowerCase().includes(query))
        ),
      })).filter(item => item.activities.length > 0);
    }

    return filtered;
  }, [groupedActivities, searchQuery, selectedGroupFilter]);

  const totalActivities = filteredGroups.reduce((sum, item) => sum + item.activities.length, 0);

  const handleAddGroup = () => {
    setEditingGroup(null);
    setIsGroupDialogOpen(true);
  };

  const handleEditGroup = (group: ItineraryGroup) => {
    setEditingGroup(group);
    setIsGroupDialogOpen(true);
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm("Are you sure you want to delete this group? Activities in this group will become ungrouped.")) {
      return;
    }

    try {
      const response = await fetch(`/api/itinerary-groups/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        fetchActivities();
      } else {
        alert(data.message || "Failed to delete group");
      }
    } catch (error) {
      console.error('Failed to delete group:', error);
      alert("Failed to delete group");
    }
  };

  const handleSaveGroup = async (groupData: any) => {
    try {
      const url = editingGroup
        ? `/api/itinerary-groups/${editingGroup.id}`
        : '/api/itinerary-groups';
      const method = editingGroup ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData),
      });

      const data = await response.json();

      if (response.ok) {
        fetchActivities();
      } else {
        alert(data.message || `Failed to ${editingGroup ? 'update' : 'create'} group`);
      }
    } catch (error) {
      console.error('Failed to save group:', error);
      alert(`Failed to ${editingGroup ? 'update' : 'create'} group`);
    }
  };

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
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAddGroup}>
            <Layers className="h-4 w-4 mr-2" />
            Manage Groups
          </Button>
          <Button onClick={handleAddActivity}>
            <Plus className="h-4 w-4 mr-2" />
            Add Activity
          </Button>
        </div>
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
            {groups.length > 0 && (
              <select
                value={selectedGroupFilter}
                onChange={(e) => setSelectedGroupFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-md text-sm"
              >
                <option value="all">All Groups</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.group_name}
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
          ) : filteredGroups.length === 0 ? (
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
              {filteredGroups.map((item) => (
                <div key={item.group.id} className="space-y-4">
                  {/* Group Header */}
                  <div className="flex items-center justify-between pb-2 border-b-2 border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-900 text-white px-4 py-2 rounded-lg">
                        <span className="text-lg font-bold">{item.group.group_name}</span>
                      </div>
                      {item.group.description && (
                        <p className="text-slate-600 text-sm">{item.group.description}</p>
                      )}
                      <span className="text-xs text-slate-500">
                        {item.activities.length} {item.activities.length === 1 ? 'activity' : 'activities'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditGroup(item.group)}
                        title="Edit Group"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {item.group.id !== 'ungrouped' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGroup(item.group.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete Group"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Activities for this group */}
                  <div className="space-y-3 pl-4 border-l-2 border-slate-100">
                    {item.activities.map((activity, index) => {
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

      {/* Add/Edit Activity Dialog */}
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

      {/* Add/Edit Group Dialog */}
      <ItineraryGroupDialog
        isOpen={isGroupDialogOpen}
        onClose={() => {
          setIsGroupDialogOpen(false);
          setEditingGroup(null);
        }}
        group={editingGroup}
        eventId={eventId}
        onSave={handleSaveGroup}
      />
    </div>
  );
}
