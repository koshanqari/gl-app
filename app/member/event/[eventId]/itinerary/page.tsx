"use client";

import { useParams } from "next/navigation";
import { MobileEmptyState, MobileContainer } from "@/components/mobile";
import { KYCRequiredMessage } from "@/components/mobile/kyc-required-message";
import { useMemberEventData } from "@/contexts/member-event-data-context";
import { Calendar } from "lucide-react";

export default function MemberItineraryPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { isKYCComplete } = useMemberEventData();

  if (!isKYCComplete) {
    return (
      <MobileContainer>
        <KYCRequiredMessage eventId={eventId} />
      </MobileContainer>
    );
  }

  return (
    <MobileEmptyState
      icon={Calendar}
      title="Coming Soon"
      description="Event itinerary details will be available here soon"
    />
  );
}
