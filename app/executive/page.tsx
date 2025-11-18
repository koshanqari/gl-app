"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ExecutivePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const session = localStorage.getItem("executive-session");
    
    if (session) {
      // Redirect to executive portal if logged in
      router.replace("/executive/executive_portal/partners");
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

