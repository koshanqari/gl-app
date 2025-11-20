"use client";

import { useEffect, useState } from "react";
import { Shield, Lock, Zap, CheckCircle, ShieldCheck, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface LoadingScreenProps {
  onComplete?: () => void;
  progress?: number;
  showStartButton?: boolean;
}

export function LoadingScreen({ onComplete, progress, showStartButton: externalShowStartButton }: LoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [internalShowStartButton, setInternalShowStartButton] = useState(false);

  const steps = [
    { icon: Shield, text: "Securing your session...", color: "text-blue-500" },
    { icon: Lock, text: "Encrypting data...", color: "text-green-500" },
    { icon: Zap, text: "Initializing platform...", color: "text-purple-500" },
    { icon: CheckCircle, text: "Ready!", color: "text-emerald-500" },
  ];

  // Use external progress if provided, otherwise use step-based progress
  const displayProgress = progress !== undefined ? progress : (currentStep / (steps.length - 1)) * 100;
  const showButton = externalShowStartButton !== undefined ? externalShowStartButton : internalShowStartButton;

  useEffect(() => {
    // Only run auto-stepping if progress is not externally controlled
    if (progress === undefined) {
      const stepInterval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < steps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 900);

      const buttonTimeout = setTimeout(() => {
        setInternalShowStartButton(true);
      }, 2500);

      return () => {
        clearInterval(stepInterval);
        clearTimeout(buttonTimeout);
      };
    } else {
      // Update step based on progress
      const progressStep = Math.floor((progress / 100) * (steps.length - 1));
      setCurrentStep(progressStep);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const handleStart = () => {
    if (onComplete) {
      onComplete();
    }
  };

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center z-50 py-8">
      {/* Animated background grid */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, white 1px, transparent 1px),
            linear-gradient(to bottom, white 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 text-center px-4 pb-8">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <Image 
            src="https://iba-consulting-prod.b-cdn.net/Logos/Event central (Light) 2.png"
            alt="Event Central Logo"
            width={600}
            height={160}
            className="w-96 h-auto object-contain"
          />
        </div>

        {/* Main Icon Animation */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-primary/20 animate-ping" />
          </div>
          <div className="relative flex items-center justify-center">
            <div className={`w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center ${steps[currentStep].color} transition-all duration-500`}>
              <CurrentIcon className="w-10 h-10 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Status Text */}
        <div className="space-y-1 mt-4">
          <h2 className="text-2xl font-bold text-white animate-fade-in">
            {steps[currentStep].text}
          </h2>
          <p className="text-slate-400 text-sm">GoldenLotus MICE Management</p>
        </div>

        {/* Progress Steps or Bar */}
        {progress !== undefined ? (
          <div className="w-full max-w-md mx-auto mt-6 space-y-2">
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-300 ease-out rounded-full"
                style={{ width: `${displayProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 text-center font-medium">{Math.round(displayProgress)}% Complete</p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-500 ${
                  index <= currentStep
                    ? "w-12 bg-primary"
                    : "w-8 bg-slate-700"
                }`}
              />
            ))}
          </div>
        )}

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6 mx-auto max-w-2xl">
          <div className="w-48 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center gap-2">
            <Lock className="w-3 h-3 text-white" />
            <p className="text-xs text-white font-medium whitespace-nowrap">Enterprise Security</p>
          </div>
          <div className="w-48 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center gap-2">
            <Zap className="w-3 h-3 text-white" />
            <p className="text-xs text-white font-medium whitespace-nowrap">Advanced Platform</p>
          </div>
          <div className="w-48 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center gap-2">
            <ShieldCheck className="w-3 h-3 text-white" />
            <p className="text-xs text-white font-medium whitespace-nowrap">Encrypted</p>
          </div>
        </div>

        {/* Start Button */}
        {showButton && (
          <div className="mt-6 animate-fade-in-up">
            <Button
              onClick={handleStart}
              size="lg"
              className="bg-white hover:bg-white/90 text-slate-900 px-8 py-6 text-lg font-semibold rounded-full shadow-2xl shadow-white/20 transition-all duration-300 hover:scale-105 hover:shadow-white/30 animate-pulse-subtle"
            >
              Start
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Animated particles - fixed positions to avoid hydration mismatch */}
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
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes pulse-subtle {
          0%, 100% {
            box-shadow: 0 0 20px 0 rgba(255, 255, 255, 0.5);
          }
          50% {
            box-shadow: 0 0 30px 10px rgba(255, 255, 255, 0.2);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}


