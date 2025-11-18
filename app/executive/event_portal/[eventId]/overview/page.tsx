"use client";

import { LayoutDashboard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function EventOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Event Overview</h1>
        <p className="text-slate-500 mt-1">
          Complete dashboard and summary of your event
        </p>
      </div>

      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <LayoutDashboard className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Coming Soon
            </h3>
                  <p className="text-slate-500">
                    This feature will be implemented soon. Here you&apos;ll see a comprehensive overview with event statistics, quick actions, and key metrics.
                  </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

