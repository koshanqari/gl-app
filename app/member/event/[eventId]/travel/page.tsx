"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { MobileEmptyState, MobileContainer } from "@/components/mobile";
import { KYCRequiredMessage } from "@/components/mobile/kyc-required-message";
import { Plane } from "lucide-react";
import { getMemberSession } from "@/lib/auth-cookies";

export default function MemberTravelPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const [isKYCComplete, setIsKYCComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkKYC = async () => {
      const member = getMemberSession();
      if (!member) {
        setIsLoading(false);
        return;
      }

      try {
        const membersResponse = await fetch(`/api/members?event_id=${eventId}&email=${encodeURIComponent(member.email)}`);
        const membersData = await membersResponse.json();

        if (membersResponse.ok && membersData.members) {
          const memberRecord = membersData.members.find(
            (m: any) => m.email === member.email && m.event_id === eventId
          );

          if (memberRecord) {
            const kycComplete = !!(
              memberRecord.kyc_document_type &&
              memberRecord.kyc_document_number &&
              memberRecord.kyc_document_url
            );
            setIsKYCComplete(kycComplete);
          }
        }
      } catch (error) {
        console.error('Failed to check KYC status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkKYC();

    // Listen for KYC update events
    const handleKYCUpdate = () => {
      checkKYC();
    };

    window.addEventListener('kyc-updated', handleKYCUpdate);
    return () => window.removeEventListener('kyc-updated', handleKYCUpdate);
  }, [eventId]);

  if (isLoading) {
    return (
      <MobileContainer>
        <MobileEmptyState
          icon={Plane}
          title="Loading..."
          description="Please wait"
        />
      </MobileContainer>
    );
  }

  if (!isKYCComplete) {
    return (
      <MobileContainer>
        <KYCRequiredMessage eventId={eventId} />
      </MobileContainer>
    );
  }

  return (
    <MobileEmptyState
      icon={Plane}
      title="Coming Soon"
      description="Travel information and arrangements will be available here soon"
    />
  );
}
