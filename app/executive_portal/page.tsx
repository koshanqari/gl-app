"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ExecutivePortalPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to partners page by default
    router.replace("/executive/executive_portal/partners");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-muted-foreground">Redirecting...</div>
    </div>
  );
}

