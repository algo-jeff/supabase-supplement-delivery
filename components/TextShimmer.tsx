'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface TextShimmerProps {
  children: ReactNode;
  duration?: number;
  spread?: number;
  className?: string;
}

export default function TextShimmer({ 
  children, 
  duration = 3, 
  spread = 3,
  className = "" 
}: TextShimmerProps) {
  return (
    <motion.div
      className={`relative inline-block ${className}`}
      style={{
        background: `linear-gradient(110deg, transparent 40%, rgba(255, 255, 255, 0.6) 50%, transparent 60%)`,
        backgroundSize: `${spread * 100}% 100%`,
      }}
      animate={{
        backgroundPosition: ['200% 0', '-200% 0'],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <span className="relative z-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
        {children}
      </span>
    </motion.div>
  );
}