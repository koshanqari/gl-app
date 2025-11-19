"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getExecutiveSession, getLastVisitedPage } from "@/lib/auth-cookies";

export default function ExecutivePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const session = getExecutiveSession();
    
    if (session) {
      // Check for last visited page
      const lastVisitedPage = getLastVisitedPage('executive');
      
      // Redirect to last visited page or default to partners page
      router.replace(lastVisitedPage || "/executive/executive_portal/partners");
    } else {
      // Redirect to login if not logged in
      router.replace("/executive/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-muted-foreground">Redirecting...</div>
    </div>
  );
}

