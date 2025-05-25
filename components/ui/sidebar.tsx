'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Users,
  TrendingUp,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  userEmail?: string | null;
  onLogout?: () => void;
}

const Sidebar = ({ userEmail, onLogout }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    {
      title: '대시보드',
      icon: LayoutDashboard,
      href: '/',
      badge: null
    },
    {
      title: '배송 관리',
      icon: Package,
      href: '/deliveries',
      badge: null
    },
    {
      title: '일정',
      icon: Calendar,
      href: '/calendar',
      badge: null
    },
    {
      title: '고객 관리',
      icon: Users,
      href: '/customers',
      badge: null
    },
    {
      title: '리포트',
      icon: FileText,
      href: '/reports',
      badge: null
    },
    {
      title: '분석',
      icon: TrendingUp,
      href: '/analytics',
      badge: null
    },
    {
      title: '알림',
      icon: Bell,
      href: '/notifications',
      badge: '3'
    },
    {
      title: '설정',
      icon: Settings,
      href: '/settings',
      badge: null
    }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-50",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">배송 관리</span>
              </div>
            )}
            <button
              onClick={() => {
                setIsCollapsed(!isCollapsed);
                setIsMobileOpen(false);
              }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isCollapsed ? (
                <Menu className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    isCollapsed && "justify-center"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className={cn(
                      "h-5 w-5",
                      isActive ? "text-indigo-600" : "text-gray-400"
                    )} />
                    {!isCollapsed && (
                      <span className="font-medium">{item.title}</span>
                    )}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-3 border-t border-gray-200">
            {userEmail && (
              <div className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-50",
                isCollapsed && "justify-center px-0"
              )}>
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-gray-600">
                    {userEmail.charAt(0).toUpperCase()}
                  </span>
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userEmail}
                    </p>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={onLogout}
              className={cn(
                "mt-2 w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors",
                isCollapsed && "justify-center"
              )}
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span>로그아웃</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Close Button */}
      {isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(false)}
          className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-white shadow-md md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </>
  );
};

export default Sidebar;