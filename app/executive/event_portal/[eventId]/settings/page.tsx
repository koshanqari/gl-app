"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Settings, Bell, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEventData } from "@/lib/event-context";

interface EventSettings {
  send_registration_notification: boolean;
}

export default function SettingsPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { permissions } = useEventData();
  const [settings, setSettings] = useState<EventSettings>({
    send_registration_notification: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<EventSettings | null>(null);

  // Check if user has permission (use event_profile permission)
  const hasPermission = permissions?.event_profile ?? false;

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/events/${eventId}/settings`);
      const data = await response.json();

      if (response.ok && data.settings) {
        setSettings(data.settings);
        setOriginalSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasPermission) {
      setIsLoading(false);
      return;
    }
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, hasPermission]);

  // Check for changes
  useEffect(() => {
    if (originalSettings) {
      const changed = 
        settings.send_registration_notification !== originalSettings.send_registration_notification;
      setHasChanges(changed);
    }
  }, [settings, originalSettings]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/events/${eventId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (response.ok) {
        setOriginalSettings(settings);
        setHasChanges(false);
        alert('Settings saved successfully');
      } else {
        alert(data.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (!hasPermission) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Event Settings</h1>
          <p className="text-slate-500 mt-1">
            Configure event notifications and preferences
          </p>
        </div>

        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Settings className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Access Restricted
              </h3>
              <p className="text-slate-500">
                You don&apos;t have permission to view or manage event settings.
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
          <h1 className="text-3xl font-bold text-slate-900">Event Settings</h1>
          <p className="text-slate-500 mt-1">
            Configure event notifications and preferences
          </p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        )}
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 mx-auto text-slate-400 animate-spin mb-4" />
              <p className="text-slate-500">Loading settings...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Bell className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Control how notifications are sent for this event
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Registration Notification Toggle */}
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="registration-notification" className="text-base font-medium">
                    Registration Notifications
                  </Label>
                  <p className="text-sm text-slate-500">
                    Send a notification via SMS, WhatsApp, and email when a new member registers for this event
                  </p>
                </div>
                <Switch
                  id="registration-notification"
                  checked={settings.send_registration_notification}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, send_registration_notification: checked })
                  }
                />
              </div>

              {/* Info Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="font-medium text-slate-900 mb-2">About Notifications</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Notifications will be sent via SMS, WhatsApp, and email</li>
                  <li>• Registration notifications include member name, email, phone, and event details</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Future Settings Placeholder */}
          <Card className="border-dashed">
            <CardContent className="p-8">
              <div className="text-center text-slate-400">
                <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">More settings coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

