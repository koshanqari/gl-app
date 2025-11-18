"use client";

import { Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function StayPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Stay Management</h1>
        <p className="text-slate-500 mt-1">
          Manage accommodations and hotel bookings
        </p>
      </div>

      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <Home className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Coming Soon
            </h3>
            <p className="text-slate-500">
              This feature will be implemented soon. Here you&apos;ll be able to manage hotel bookings, room allocations, and accommodation details.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

