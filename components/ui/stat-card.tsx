'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  iconBgColor = 'bg-indigo-100',
  trend = 'neutral'
}: StatCardProps) => {
  const getTrendIcon = () => {
    if (!change) return null;
    
    if (trend === 'up' || change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (trend === 'down' || change < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = () => {
    if (!change) return 'text-gray-600';
    if (trend === 'up' || change > 0) return 'text-green-600';
    if (trend === 'down' || change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="relative overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 group">
      {/* Background Pattern */}
      <div className="absolute -right-4 -top-4 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity">
        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full" />
      </div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "p-3 rounded-lg",
            iconBgColor
          )}>
            {icon}
          </div>
          {change !== undefined && (
            <div className={cn("flex items-center space-x-1", getTrendColor())}>
              {getTrendIcon()}
              <span className="text-sm font-medium">
                {change > 0 ? '+' : ''}{change}%
              </span>
            </div>
          )}
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {changeLabel && (
            <p className="text-xs text-gray-500 mt-1">{changeLabel}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;