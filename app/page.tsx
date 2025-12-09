"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMemberSession, getLastVisitedPage } from "@/lib/auth-cookies";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if member is logged in
    const session = getMemberSession();
    
    if (session) {
      // User is logged in - check for last visited page or go to events
      const lastVisited = getLastVisitedPage('member');
      router.replace(lastVisited || "/member/events");
    } else {
      // Not logged in - go to login
      router.replace("/member/login");
    }
  }, [router]);

  // Show minimal loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

