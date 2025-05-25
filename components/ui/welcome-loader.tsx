'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface WelcomeLoaderProps {
  onComplete?: () => void;
  duration?: number;
}

const WelcomeLoader = ({ onComplete, duration = 2000 }: WelcomeLoaderProps) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            onComplete?.();
          }, 300);
        }, 500);
      }
    }, 10);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 transition-opacity duration-300",
      !isVisible && "opacity-0"
    )}>
      <div className="relative">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-200 rounded-xl animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="inline-block animate-text-shimmer bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white bg-[length:200%_100%]">
              영양제 배송 관리
            </span>
          </h1>
          <p className="text-purple-200 animate-pulse">시스템을 준비하고 있습니다...</p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="mt-4 text-center">
          <span className="text-white/80 text-sm font-medium">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 -z-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes text-shimmer {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-20px) scale(1.1);
            opacity: 0.8;
          }
        }

        .animate-text-shimmer {
          animation: text-shimmer 3s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 1.5s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default WelcomeLoader;