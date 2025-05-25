'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface TubelightNavbarProps {
  items: NavItem[];
  onItemChange: (id: string) => void;
  defaultActive?: string;
}

export default function TubelightNavbar({ 
  items, 
  onItemChange, 
  defaultActive 
}: TubelightNavbarProps) {
  const [activeTab, setActiveTab] = useState(defaultActive || items[0]?.id);

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    onItemChange(id);
  };

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="relative flex items-center bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-full px-2 py-2 shadow-lg">
        {/* 활성 탭 배경 */}
        <motion.div
          className="absolute bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
          layoutId="active-tab"
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
          style={{
            width: `${100 / items.length}%`,
            height: '80%',
            left: `${(items.findIndex(item => item.id === activeTab) * 100) / items.length}%`,
            top: '10%'
          }}
        />
        
        {/* 네비게이션 아이템들 */}
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabClick(item.id)}
            className={`relative z-10 flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
              activeTab === item.id
                ? 'text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            style={{ minWidth: `${100 / items.length}%` }}
          >
            <span className="flex items-center justify-center w-5 h-5">
              {item.icon}
            </span>
            <span className="text-sm font-medium whitespace-nowrap">
              {item.label}
            </span>
          </button>
        ))}
        
        {/* 글로우 효과 */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-600/20 blur-xl"
          layoutId="glow"
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
          style={{
            width: `${120 / items.length}%`,
            height: '120%',
            left: `${(items.findIndex(item => item.id === activeTab) * 100) / items.length - 10}%`,
            top: '-10%'
          }}
        />
      </div>
    </nav>
  );
}