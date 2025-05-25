'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface StatusToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StatusToggle = ({ 
  checked, 
  onChange, 
  disabled = false, 
  size = 'md' 
}: StatusToggleProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleChange = () => {
    if (disabled) return;
    
    setIsAnimating(true);
    onChange(!checked);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const sizeClasses = {
    sm: {
      switch: 'w-10 h-5',
      thumb: 'w-4 h-4',
      translate: 'translate-x-5',
      icon: 'w-3 h-3'
    },
    md: {
      switch: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7',
      icon: 'w-4 h-4'
    },
    lg: {
      switch: 'w-16 h-8',
      thumb: 'w-7 h-7',
      translate: 'translate-x-8',
      icon: 'w-5 h-5'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleChange}
      className={cn(
        "relative inline-flex items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
        currentSize.switch,
        checked ? "bg-green-500" : "bg-gray-300",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-lg",
        isAnimating && "scale-95"
      )}
    >
      <span className="sr-only">{checked ? '배송 완료' : '배송 대기'}</span>
      
      {/* Background gradient effect */}
      <div className={cn(
        "absolute inset-0 rounded-full transition-opacity duration-300",
        checked ? "bg-gradient-to-r from-green-400 to-green-600 opacity-100" : "opacity-0"
      )} />
      
      {/* Toggle thumb */}
      <span
        className={cn(
          "absolute left-0.5 inline-flex items-center justify-center rounded-full bg-white shadow-lg transform transition-all duration-300",
          currentSize.thumb,
          checked ? currentSize.translate : "translate-x-0.5",
          isAnimating && "scale-110"
        )}
      >
        {checked ? (
          <Check className={cn(currentSize.icon, "text-green-600 animate-in zoom-in duration-200")} />
        ) : (
          <X className={cn(currentSize.icon, "text-gray-400 animate-in zoom-in duration-200")} />
        )}
      </span>
    </button>
  );
};

export default StatusToggle;