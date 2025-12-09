"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAndClearRedirectUrl, setMemberSession, getLastVisitedPage } from "@/lib/auth-cookies";
import Image from "next/image";

export default function MemberLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendOTP = async () => {
    if (!email || !email.includes('@')) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setSendingOTP(true);

    try {
      const response = await fetch('/api/member/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to send OTP");
        if (data.remainingSeconds) {
          setResendTimer(data.remainingSeconds);
        }
        setSendingOTP(false);
        return;
      }

      setOtpSent(true);
      setResendTimer(120); // 2 minutes
      setSendingOTP(false);
    } catch (error) {
      console.error('Send OTP error:', error);
      setError("Failed to send OTP. Please try again.");
      setSendingOTP(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/member/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
        credentials: 'include', // Ensure cookies are sent and received
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid OTP");
        setLoading(false);
        return;
      }

      console.log('[Member Login] OTP verified successfully, setting session...');

      // Set session cookie client-side (same pattern as executive login)
      // This ensures the cookie is set reliably across all browsers
      setMemberSession({
        id: data.member.id,
        email: data.member.email,
        employee_id: data.member.employee_id,
        name: data.member.name,
        event_id: data.member.event_id,
      });

      // Small delay to ensure cookie is set before navigation
      await new Promise(resolve => setTimeout(resolve, 100));

      // Priority: 1. Explicit redirect URL, 2. Last visited page, 3. Default to events
      const explicitRedirect = getAndClearRedirectUrl();
      const lastVisited = getLastVisitedPage('member');
      const redirectUrl = explicitRedirect || lastVisited || "/member/events";
      
      console.log('[Member Login] Redirecting to:', redirectUrl);
      
      // Use window.location for full page reload to ensure session is read
      window.location.href = redirectUrl;
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
              src="https://iba-consulting-prod.b-cdn.net/Logos/Event central (Light) 2.png"
              alt="Event Central Logo"
              width={300}
              height={80}
              className="h-16 w-auto object-contain"
              unoptimized
            />
          </div>

          {/* Login Card */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-6">
              <p className="text-sm text-slate-400">
                Member Portal
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
                  Email Address
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="member@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (otpSent) {
                        setOtpSent(false);
                        setOtp("");
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !otpSent && !sendingOTP && email && email.includes('@')) {
                        e.preventDefault();
                        handleSendOTP();
                      }
                    }}
                    required
                    disabled={loading || sendingOTP || otpSent}
                    className="h-12 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-slate-600 focus:ring-slate-600"
                  />
                  <Button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={loading || sendingOTP || !email || resendTimer > 0}
                    className="h-12 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium whitespace-nowrap"
                  >
                    {sendingOTP ? (
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-200" />
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-400" />
                      </span>
                    ) : resendTimer > 0 ? (
                      `Resend (${Math.floor(resendTimer / 60)}:${String(resendTimer % 60).padStart(2, '0')})`
                    ) : otpSent ? (
                      "Resend OTP"
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                </div>
                {otpSent && (
                  <p className="text-xs text-green-400">
                    OTP sent to your email and SMS.
                  </p>
                )}
              </div>
              
              {otpSent && (
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-slate-300 text-sm font-medium">
                    Enter OTP <span className="text-slate-500">(6 digits)</span>
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(value);
                    }}
                    required
                    disabled={loading}
                    className="h-12 bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-slate-600 focus:ring-slate-600 text-center text-2xl tracking-widest font-mono"
                  />
                </div>
              )}
              
              {error && (
                <div className="text-sm text-red-400 bg-red-950/50 border border-red-900 p-3 rounded-lg">
                  {error}
                </div>
              )}
              
              {otpSent && (
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-white text-slate-900 hover:bg-slate-100 font-semibold text-base rounded-lg transition-all" 
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-2 h-2 bg-slate-900 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-slate-900 rounded-full animate-bounce animation-delay-200" />
                      <span className="w-2 h-2 bg-slate-900 rounded-full animate-bounce animation-delay-400" />
                    </span>
                  ) : (
                    "Verify & Sign In"
                  )}
                </Button>
              )}
              
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

