"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockExecutive } from "@/lib/mock-data";
import { LoadingScreen } from "@/components/loading-screen";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Validate credentials
    if (email === mockExecutive.email && otp === "7274") {
      // Store session in localStorage (mock authentication)
      localStorage.setItem("executive-session", JSON.stringify({
        ...mockExecutive,
        loginTime: new Date().toISOString(),
      }));
      
      // Show loading screen animation
      setShowLoadingScreen(true);
    } else {
      setError("Invalid email or OTP. Please try again.");
      setLoading(false);
    }
  };

  // Handle loading screen completion
  const handleLoadingComplete = () => {
    router.push("/executive/executive_portal/partners");
  };

  // Show loading screen if authenticated
  if (showLoadingScreen) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">
            GoldenLotus
          </CardTitle>
          <CardDescription className="text-center">
            MICE Management Portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otp">OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                disabled={loading}
                maxLength={4}
              />
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Enter your email and OTP to access the executive panel
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

