"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

interface KYCRequiredMessageProps {
  eventId: string;
}

export function KYCRequiredMessage({ eventId }: KYCRequiredMessageProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 min-h-[60vh]">
      <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-5">
        <User className="h-10 w-10 text-amber-600" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">KYC Required</h3>
      <p className="text-base text-slate-500 text-center max-w-xs mb-6">
        Please complete your KYC first to continue
      </p>
      <Button
        onClick={() => router.push(`/member/event/${eventId}/profile`)}
        className="bg-slate-900 text-white hover:bg-slate-800"
      >
        Complete KYC
      </Button>
    </div>
  );
}

