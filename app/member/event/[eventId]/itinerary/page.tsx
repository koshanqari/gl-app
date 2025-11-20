"use client";

import { useParams } from "next/navigation";
import { MobileEmptyState, MobileContainer, MobileCard, MobileCardHeader, MobileCardContent } from "@/components/mobile";
import { KYCRequiredMessage } from "@/components/mobile/kyc-required-message";
import { useMemberEventData } from "@/contexts/member-event-data-context";
import { Calendar, Clock, MapPin, ExternalLink } from "lucide-react";

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

export default function MemberItineraryPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { isKYCComplete, itineraryActivities } = useMemberEventData();
  const activities = itineraryActivities || [];

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
        {activities.map((activity) => {
          const fromDateTime = formatDateTime(activity.from_datetime);
          const toDateTime = activity.to_datetime ? formatDateTime(activity.to_datetime) : null;

          return (
            <MobileCard key={activity.id}>
              <MobileCardHeader>
                {activity.name}
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

                  {/* Venue */}
                  {activity.venue && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-slate-700 flex-1">
                        {activity.venue}
                      </p>
                    </div>
                  )}

                  {/* Description */}
                  {activity.description && (
                    <div>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">
                        {activity.description}
                      </p>
                    </div>
                  )}

                  {/* Links */}
                  {activity.links && activity.links.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 mb-2">Links:</p>
                      <div className="space-y-2">
                        {activity.links.map((link) => (
                          <a
                            key={link.id}
                            href={link.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>{link.link_text}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </MobileCardContent>
            </MobileCard>
          );
        })}
      </div>
    </MobileContainer>
  );
}
