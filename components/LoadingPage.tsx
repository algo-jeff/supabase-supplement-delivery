'use client';

import { motion } from 'framer-motion';
import TextShimmer from './TextShimmer';

interface LoadingPageProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export default function LoadingPage({ isVisible, onComplete }: LoadingPageProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50"
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        scale: 0.95
      }}
      transition={{ 
        duration: 0.8,
        ease: "easeInOut" 
      }}
      onAnimationComplete={() => {
        if (!isVisible && onComplete) {
          onComplete();
        }
      }}
    >
      <div className="text-center space-y-8">
        {/* 로고 또는 아이콘 */}
        <motion.div
          className="mx-auto w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ 
            scale: 1, 
            rotate: 0,
            transition: {
              delay: 0.2,
              duration: 0.8,
              type: "spring",
              stiffness: 200
            }
          }}
        >
          <svg 
            className="w-10 h-10 text-white" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
            />
          </svg>
        </motion.div>

        {/* 메인 타이틀 */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ 
            y: 0, 
            opacity: 1,
            transition: {
              delay: 0.5,
              duration: 0.6
            }
          }}
          className="space-y-4"
        >
          <TextShimmer 
            duration={2.5} 
            spread={2}
            className="text-4xl md:text-5xl font-bold"
          >
            영양제 배송 관리
          </TextShimmer>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: 1,
              transition: {
                delay: 0.8,
                duration: 0.6
              }
            }}
            className="text-lg text-gray-600 max-w-md mx-auto"
          >
            효율적인 영양제 배송 관리 시스템에 오신 것을 환영합니다
          </motion.p>
        </motion.div>

        {/* 로딩 애니메이션 */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ 
            y: 0, 
            opacity: 1,
            transition: {
              delay: 1.1,
              duration: 0.6
            }
          }}
          className="flex justify-center space-x-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>

        {/* 진행률 바 */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ 
            width: "100%", 
            opacity: 1,
            transition: {
              delay: 1.4,
              duration: 2,
              ease: "easeInOut"
            }
          }}
          className="mx-auto max-w-xs"
          onAnimationComplete={() => {
            setTimeout(() => {
              if (onComplete) onComplete();
            }, 500);
          }}
        >
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
              initial={{ width: "0%" }}
              animate={{ 
                width: "100%",
                transition: {
                  delay: 1.4,
                  duration: 2,
                  ease: "easeInOut"
                }
              }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}