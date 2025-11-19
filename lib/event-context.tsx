"use client";

import React, { createContext, useContext, ReactNode } from "react";

interface CollaboratorPermissions {
  overview: boolean;
  members: boolean;
  stay: boolean;
  crew: boolean;
  itinerary: boolean;
  travel: boolean;
  meals: boolean;
  event_profile: boolean;
}

interface EventContextType {
  eventId: string;
  event: any;
  partner: any;
  members: any[];
  hotels: any[];
  roomAssignments: any[];
  user: any;
  userRole: "executive" | "collaborator";
  permissions: CollaboratorPermissions;
}

const EventDataContext = createContext<EventContextType | null>(null);

export function EventDataProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: EventContextType;
}) {
  return (
    <EventDataContext.Provider value={value}>
      {children}
    </EventDataContext.Provider>
  );
}

export function useEventData() {
  const context = useContext(EventDataContext);
  if (!context) {
    throw new Error("useEventData must be used within EventDataProvider");
  }
  return context;
}

