"use client";

import { MobileEmptyState } from "@/components/mobile";
import { Calendar } from "lucide-react";

export default function MemberItineraryPage() {
  return (
    <MobileEmptyState
      icon={Calendar}
      title="Coming Soon"
      description="Event itinerary details will be available here soon"
    />
  );
}
