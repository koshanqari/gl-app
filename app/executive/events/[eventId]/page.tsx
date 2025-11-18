"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  useEffect(() => {
    // Redirect to overview page by default
    router.replace(`/executive/events/${eventId}/overview`);
  }, [eventId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-muted-foreground">Redirecting...</div>
    </div>
  );
}

