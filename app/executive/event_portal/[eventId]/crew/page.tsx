"use client";

import { UserCog } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function CrewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Crew Management</h1>
        <p className="text-slate-500 mt-1">
          Manage event staff and crew members
        </p>
      </div>

      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <UserCog className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Coming Soon
            </h3>
            <p className="text-slate-500">
              This feature will be implemented soon. Here you&apos;ll be able to manage event crew, staff assignments, and team coordination.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

