'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sidebarVariants = {
  open: { width: '16rem' },
  closed: { width: '4rem' },
};

const contentVariants = {
  open: { opacity: 1, display: 'block' },
  closed: { opacity: 0, display: 'none' },
};

const iconVariants = {
  open: { rotate: 0 },
  closed: { rotate: 180 },
};

interface SidebarProps {
  userEmail?: string | null;
  onLogout: () => void;
}

export default function Sidebar({ userEmail, onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();

  const navigationItems = [
    {
      label: '대시보드',
      href: '/',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        </svg>
      ),
    },
    {
      label: '배송 관리',
      href: '/deliveries',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      label: '통계',
      href: '/stats',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      label: 'FAQ',
      href: '/faq',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <motion.div
      className="fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg z-40"
      initial="closed"
      animate={isCollapsed ? 'closed' : 'open'}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <div className="flex flex-col h-full">
        {/* 로고 섹션 */}
        <div className="flex items-center px-4 py-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6v-2zm0 4h8v2H6v-2zm10 0h2v2h-2v-2zm-10-8h12v2H6V6z" />
              </svg>
            </div>
            <motion.div
              variants={contentVariants}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-bold text-gray-900 whitespace-nowrap">
                영양제 배송
              </h2>
            </motion.div>
          </div>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center px-3 py-2 rounded-lg transition-colors duration-200
                  ${isActive 
                    ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <div className="flex-shrink-0">
                  {item.icon}
                </div>
                <motion.span
                  variants={contentVariants}
                  transition={{ duration: 0.3 }}
                  className="ml-3 text-sm font-medium whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              </Link>
            );
          })}
        </nav>

        {/* 사용자 정보 섹션 */}
        <div className="border-t border-gray-200 px-4 py-4">
          {userEmail && (
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="h-4 w-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <motion.div
                variants={contentVariants}
                transition={{ duration: 0.3 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userEmail}
                </p>
                <p className="text-xs text-gray-500">
                  관리자
                </p>
              </motion.div>
            </div>
          )}
          
          {/* 설정 및 로그아웃 */}
          <div className="space-y-1">
            <Link
              href="/settings"
              className="flex items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
            >
              <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <motion.span
                variants={contentVariants}
                transition={{ duration: 0.3 }}
                className="ml-3 whitespace-nowrap"
              >
                설정
              </motion.span>
            </Link>
            
            <button
              onClick={onLogout}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
            >
              <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <motion.span
                variants={contentVariants}
                transition={{ duration: 0.3 }}
                className="ml-3 whitespace-nowrap"
              >
                로그아웃
              </motion.span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}