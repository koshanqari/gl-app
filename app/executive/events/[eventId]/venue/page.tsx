"use client";

import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function VenuePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Venue Management</h1>
        <p className="text-slate-500 mt-1">
          Manage event venues, rooms, and facilities
        </p>
      </div>

      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <MapPin className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Venue Management
            </h3>
            <p className="text-slate-500">
              This feature will be implemented soon. Here you&apos;ll be able to manage venues, room allocations, and facility bookings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

