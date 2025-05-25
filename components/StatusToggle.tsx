'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface StatusToggleProps {
  isDelivered: boolean;
  onToggle: () => void;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusToggle({ 
  isDelivered, 
  onToggle, 
  loading = false,
  size = 'md'
}: StatusToggleProps) {
  const [isOptimistic, setIsOptimistic] = useState(isDelivered);

  const handleToggle = async () => {
    // 낙관적 업데이트
    setIsOptimistic(!isOptimistic);
    
    try {
      await onToggle();
    } catch (error) {
      // 실패시 롤백
      setIsOptimistic(isOptimistic);
    }
  };

  const sizeClasses = {
    sm: {
      toggle: 'h-5 w-9',
      thumb: 'h-4 w-4',
      translate: 'translate-x-4'
    },
    md: {
      toggle: 'h-6 w-11',
      thumb: 'h-5 w-5',
      translate: 'translate-x-5'
    },
    lg: {
      toggle: 'h-7 w-12',
      thumb: 'h-6 w-6',
      translate: 'translate-x-5'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className="flex items-center space-x-2">
      {/* 토글 스위치 */}
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`
          relative inline-flex ${currentSize.toggle} shrink-0 cursor-pointer rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          ${isOptimistic 
            ? 'bg-green-600' 
            : 'bg-gray-200'
          }
        `}
      >
        <span className="sr-only">배송 상태 변경</span>
        
        {/* 토글 버튼 내부의 움직이는 원 */}
        <motion.span
          animate={{
            x: isOptimistic ? currentSize.translate.replace('translate-x-', '') + 'px' : '0px'
          }}
          transition={{
            type: 'spring',
            stiffness: 700,
            damping: 30
          }}
          className={`
            ${currentSize.thumb} inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
            flex items-center justify-center
          `}
        >
          {loading ? (
            <svg className="h-3 w-3 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : isOptimistic ? (
            <svg className="h-3 w-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-3 w-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </motion.span>
      </button>

      {/* 상태 라벨 */}
      <div className="flex items-center space-x-2">
        <motion.div
          initial={false}
          animate={{
            scale: isOptimistic ? 1.05 : 1,
            color: isOptimistic ? '#059669' : '#d97706'
          }}
          transition={{ duration: 0.2 }}
          className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
            ${isOptimistic 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
            }
          `}
        >
          <motion.div
            initial={false}
            animate={{ rotate: isOptimistic ? 360 : 0 }}
            transition={{ duration: 0.3 }}
            className="mr-1"
          >
            {isOptimistic ? (
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </motion.div>
          
          <span>
            {isOptimistic ? '배송 완료' : '배송 대기'}
          </span>
        </motion.div>
      </div>
    </div>
  );
}

// 간단한 배지 스타일 컴포넌트 (기존 호환성을 위해)
export function StatusBadge({ 
  isDelivered, 
  onClick,
  className = ""
}: { 
  isDelivered: boolean; 
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 hover:scale-105
        ${isDelivered 
          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
        }
        ${className}
      `}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDelivered ? 360 : 0 }}
        transition={{ duration: 0.3 }}
        className="mr-1.5"
      >
        {isDelivered ? (
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )}
      </motion.div>
      {isDelivered ? '배송 완료' : '배송 대기'}
    </button>
  );
}