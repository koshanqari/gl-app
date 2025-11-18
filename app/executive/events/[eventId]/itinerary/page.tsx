"use client";

import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ItineraryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Itinerary & Activities</h1>
        <p className="text-slate-500 mt-1">
          Plan and manage event schedules and activities
        </p>
      </div>

      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <FileText className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Itinerary Management
            </h3>
            <p className="text-slate-500">
              This feature will be implemented soon. Here you&apos;ll be able to create and manage event schedules, activities, and timelines.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

