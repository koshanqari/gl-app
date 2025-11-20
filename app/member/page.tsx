"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMemberSession, getLastVisitedPage } from "@/lib/auth-cookies";

export default function MemberPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if member is logged in
    const session = getMemberSession();
    
    if (session) {
      // Check for last visited page
      const lastVisitedPage = getLastVisitedPage('member');
      
      // Redirect to last visited page or default to events page
      router.push(lastVisitedPage || "/member/events");
    } else {
      // Not logged in, redirect to login
      router.push("/member/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto text-center">
        <p className="text-white">Loading...</p>
      </div>
    </div>
  );
}

