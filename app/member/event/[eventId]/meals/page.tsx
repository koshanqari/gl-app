"use client";

import { MobileEmptyState } from "@/components/mobile";
import { UtensilsCrossed } from "lucide-react";

export default function MemberMealsPage() {
  return (
    <MobileEmptyState
      icon={UtensilsCrossed}
      title="Coming Soon"
      description="Meal plans and preferences will be available here soon"
    />
  );
}
