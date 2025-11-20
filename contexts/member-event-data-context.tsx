"use client";

import { createContext, useContext, ReactNode } from "react";

interface MemberEventData {
  memberData: any;
  hotel: any;
  hotelImageUrl: string;
  roomAssignment: any;
  roommates: any[];
  isKYCComplete: boolean;
  itineraryActivities: any[];
}

const MemberEventDataContext = createContext<MemberEventData | null>(null);

export function MemberEventDataProvider({
  children,
  data,
}: {
  children: ReactNode;
  data: MemberEventData;
}) {
  return (
    <MemberEventDataContext.Provider value={data}>
      {children}
    </MemberEventDataContext.Provider>
  );
}

export function useMemberEventData() {
  const context = useContext(MemberEventDataContext);
  if (!context) {
    throw new Error("useMemberEventData must be used within MemberEventDataProvider");
  }
  return context;
}

