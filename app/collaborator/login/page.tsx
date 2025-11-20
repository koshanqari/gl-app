"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setCollaboratorSession, getAndClearRedirectUrl } from "@/lib/auth-cookies";
import Image from "next/image";

function CollaboratorLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validate event ID is provided
  useEffect(() => {
    if (!eventId) {
      setError("Invalid login link. Please contact your administrator for the correct link.");
    }
  }, [eventId]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Check if event ID is provided
    if (!eventId) {
      setError("Invalid login link. Please contact your administrator for the correct link.");
      setLoading(false);
      return;
    }

    try {
      // Authenticate collaborator via API
      const response = await fetch('/api/collaborator/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, event_id: eventId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid email, password, or you don't have access to this event");
        setLoading(false);
        return;
      }

      const collaborator = data.collaborator;

      // Parse permissions if it's a string
      const permissions = typeof collaborator.permissions === 'string'
        ? JSON.parse(collaborator.permissions)
        : collaborator.permissions;

      // Store collaborator info in cookie
      setCollaboratorSession({
        id: collaborator.id,
        email: email,
        eventId: eventId,
        permissions: permissions,
      });

      // Check for redirect URL first
      const redirectUrl = getAndClearRedirectUrl();
      
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        // Redirect to first available page based on permissions
        const firstAvailableRoute = permissions.stay
          ? "stay"
          : permissions.members
          ? "members"
          : permissions.overview
          ? "overview"
          : permissions.event_profile
          ? "profile"
          : permissions.crew
          ? "crew"
          : permissions.itinerary
          ? "itinerary"
          : permissions.travel
          ? "travel"
          : permissions.meals
          ? "meals"
          : "overview";

        router.push(`/executive/event_portal/${eventId}/${firstAvailableRoute}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("Failed to authenticate. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, white 1px, transparent 1px),
            linear-gradient(to bottom, white 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { left: 10, top: 20, delay: 0 },
          { left: 85, top: 15, delay: 0.5 },
          { left: 25, top: 70, delay: 1 },
          { left: 60, top: 40, delay: 0.3 },
          { left: 45, top: 85, delay: 0.8 },
          { left: 75, top: 60, delay: 0.2 },
          { left: 15, top: 50, delay: 1.2 },
          { left: 90, top: 75, delay: 0.6 },
          { left: 35, top: 25, delay: 0.9 },
          { left: 55, top: 10, delay: 0.4 },
          { left: 20, top: 90, delay: 1.5 },
          { left: 70, top: 30, delay: 0.7 },
          { left: 40, top: 55, delay: 1.1 },
          { left: 80, top: 45, delay: 0.1 },
          { left: 30, top: 65, delay: 1.3 },
          { left: 65, top: 20, delay: 0.4 },
          { left: 50, top: 80, delay: 0.9 },
          { left: 95, top: 50, delay: 1.4 },
          { left: 5, top: 35, delay: 0.6 },
          { left: 42, top: 12, delay: 1.0 },
        ].map((particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animation: `float ${4 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <Image
              src="https://cdn-sleepyhug-prod.b-cdn.net/media/intellsys-logo.webp"
              alt="Intellsys Logo"
              width={200}
              height={60}
              className="h-12 w-auto object-contain"
              unoptimized
            />
          </div>

          {/* Login Card */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-6">
              <p className="text-sm text-slate-400">
                Collaborator Portal
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="collaborator@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-12 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-slate-600 focus:ring-slate-600"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-12 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-slate-600 focus:ring-slate-600"
                />
              </div>
              
              {error && (
                <div className="text-sm text-red-400 bg-red-950/50 border border-red-900 p-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-white text-slate-900 hover:bg-slate-100 font-semibold text-base rounded-lg transition-all" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-slate-900 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-slate-900 rounded-full animate-bounce animation-delay-200" />
                    <span className="w-2 h-2 bg-slate-900 rounded-full animate-bounce animation-delay-400" />
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
              
              <p className="text-xs text-slate-500 text-center pt-2">
                Protected by enterprise-grade security
              </p>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.3;
          }
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
}

export default function CollaboratorLogin() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CollaboratorLoginContent />
    </Suspense>
  );
}

