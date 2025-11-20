"use client";

import { useParams } from "next/navigation";
import { MobileEmptyState, MobileContainer } from "@/components/mobile";
import { KYCRequiredMessage } from "@/components/mobile/kyc-required-message";
import { useMemberEventData } from "@/contexts/member-event-data-context";
import { UtensilsCrossed } from "lucide-react";

export default function MemberMealsPage() {
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
      icon={UtensilsCrossed}
      title="Coming Soon"
      description="Meal plans and preferences will be available here soon"
    />
  );
}
