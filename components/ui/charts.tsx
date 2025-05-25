'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface SimpleChartProps {
  data: ChartData[];
  title?: string;
  height?: number;
  showValues?: boolean;
  animate?: boolean;
}

export const BarChart = ({ 
  data, 
  title, 
  height = 200, 
  showValues = true,
  animate = true 
}: SimpleChartProps) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div className="relative" style={{ height: `${height}px` }}>
        <div className="absolute inset-0 flex items-end justify-between space-x-2">
          {data.map((item, index) => {
            const heightPercentage = (item.value / maxValue) * 100;
            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center justify-end"
              >
                {showValues && (
                  <span className="text-sm font-medium text-gray-700 mb-1">
                    {item.value}
                  </span>
                )}
                <div
                  className={cn(
                    "w-full rounded-t-lg transition-all duration-700 hover:opacity-80",
                    item.color || "bg-indigo-500",
                    animate && "animate-grow-up"
                  )}
                  style={{
                    height: `${heightPercentage}%`,
                    animationDelay: `${index * 100}ms`
                  }}
                />
                <span className="text-xs text-gray-600 mt-2 text-center">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const PieChart = ({ 
  data, 
  title, 
  height = 200,
  animate = true 
}: SimpleChartProps) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = -90; // Start from top

  const colors = [
    'fill-indigo-500',
    'fill-green-500',
    'fill-yellow-500',
    'fill-purple-500',
    'fill-pink-500',
    'fill-blue-500'
  ];

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
        <div className="relative">
          <svg
            width={height}
            height={height}
            viewBox={`0 0 ${height} ${height}`}
            className={cn(animate && "animate-spin-once")}
          >
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const angle = (percentage / 100) * 360;
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const startX = height / 2 + (height / 2 - 20) * Math.cos((currentAngle * Math.PI) / 180);
              const startY = height / 2 + (height / 2 - 20) * Math.sin((currentAngle * Math.PI) / 180);
              
              currentAngle += angle;
              
              const endX = height / 2 + (height / 2 - 20) * Math.cos((currentAngle * Math.PI) / 180);
              const endY = height / 2 + (height / 2 - 20) * Math.sin((currentAngle * Math.PI) / 180);

              return (
                <path
                  key={index}
                  d={`M ${height / 2} ${height / 2} L ${startX} ${startY} A ${height / 2 - 20} ${height / 2 - 20} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                  className={cn(
                    item.color || colors[index % colors.length],
                    "hover:opacity-80 transition-opacity cursor-pointer"
                  )}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{total}</p>
              <p className="text-sm text-gray-600">전체</p>
            </div>
          </div>
        </div>
        <div className="ml-8 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className={cn(
                "w-3 h-3 rounded-full",
                item.color?.replace('fill-', 'bg-') || colors[index % colors.length].replace('fill-', 'bg-')
              )} />
              <span className="text-sm text-gray-600">{item.label}</span>
              <span className="text-sm font-medium text-gray-900">({item.value})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const LineChart = ({ 
  data, 
  title, 
  height = 200,
  animate = true 
}: SimpleChartProps) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = ((maxValue - item.value) / range) * 80 + 10;
    return { x, y, value: item.value, label: item.label };
  });

  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div className="relative" style={{ height: `${height}px` }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="0.5"
            />
          ))}
          
          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2"
            className={cn(animate && "animate-draw-line")}
          />
          
          {/* Points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="1.5"
              fill="#6366f1"
              className={cn(
                "hover:r-2.5 transition-all cursor-pointer",
                animate && "animate-fade-in"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <title>{`${point.label}: ${point.value}`}</title>
            </circle>
          ))}
        </svg>
        
        {/* Labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-600 mt-2">
          {data.map((item, index) => (
            <span key={index}>{item.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
};