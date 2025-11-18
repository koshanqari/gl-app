"use client";

import { useEffect, useState } from "react";
import { Shield, Lock, Zap, CheckCircle, ShieldCheck, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showStartButton, setShowStartButton] = useState(false);

  const steps = [
    { icon: Shield, text: "Securing your session...", color: "text-blue-500" },
    { icon: Lock, text: "Encrypting data...", color: "text-green-500" },
    { icon: Zap, text: "Initializing platform...", color: "text-purple-500" },
    { icon: CheckCircle, text: "Ready!", color: "text-emerald-500" },
  ];

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 900);

    const buttonTimeout = setTimeout(() => {
      setShowStartButton(true);
    }, 2500);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(buttonTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = () => {
    onComplete();
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
        <div className="flex items-center justify-center">
          <Image 
            src="https://cdn-sleepyhug-prod.b-cdn.net/media/intellsys-logo.webp"
            alt="Logo"
            width={240}
            height={240}
            className="w-60 h-60 object-contain"
          />
        </div>

        {/* Main Icon Animation */}
        <div className="relative -mt-12">
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

        {/* Progress Steps */}
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
        {showStartButton && (
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

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
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


