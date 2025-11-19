"use client";

import { MobileEmptyState } from "@/components/mobile";
import { Plane } from "lucide-react";

export default function MemberTravelPage() {
  return (
    <MobileEmptyState
      icon={Plane}
      title="Coming Soon"
      description="Travel information and arrangements will be available here soon"
    />
  );
}
