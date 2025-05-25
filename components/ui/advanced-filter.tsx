'use client';

import React, { useState } from 'react';
import {
  Filter,
  X,
  Calendar,
  Package,
  User,
  CheckCircle,
  Circle,
  Search,
  SlidersHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterOption {
  id: string;
  label: string;
  value: string;
  count?: number;
}

interface AdvancedFilterProps {
  filters: {
    searchTerm: string;
    status: string;
    supplementType: string;
    dateFrom: string;
    dateTo: string;
  };
  setFilters: (filters: any) => void;
  supplementTypes: string[];
  onReset: () => void;
}

const AdvancedFilter = ({
  filters,
  setFilters,
  supplementTypes,
  onReset
}: AdvancedFilterProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('status');

  const statusOptions: FilterOption[] = [
    { id: 'all', label: '전체', value: 'all' },
    { id: 'delivered', label: '배송 완료', value: 'delivered' },
    { id: 'pending', label: '배송 대기', value: 'pending' }
  ];

  const handleStatusChange = (value: string) => {
    setFilters({ ...filters, status: value });
  };

  const handleSupplementChange = (value: string) => {
    setFilters({ ...filters, supplementType: value });
  };

  const activeFilterCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.status !== 'all') count++;
    if (filters.supplementType !== 'all') count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    return count;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Filter Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="검색어를 입력하세요..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all",
              isExpanded
                ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>고급 필터</span>
            {activeFilterCount() > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                {activeFilterCount()}
              </span>
            )}
          </button>
          {activeFilterCount() > 0 && (
            <button
              onClick={onReset}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="h-4 w-4" />
              <span>초기화</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 animate-in slide-in-from-top-2 duration-200">
          {/* Filter Tabs */}
          <div className="flex space-x-1 mb-4">
            <button
              onClick={() => setActiveTab('status')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === 'status'
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              상태
            </button>
            <button
              onClick={() => setActiveTab('type')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === 'type'
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              영양제 종류
            </button>
            <button
              onClick={() => setActiveTab('date')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === 'date'
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              날짜
            </button>
          </div>

          {/* Filter Content */}
          <div className="min-h-[120px]">
            {activeTab === 'status' && (
              <div className="grid grid-cols-3 gap-3 animate-in fade-in duration-200">
                {statusOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleStatusChange(option.value)}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all duration-200",
                      filters.status === option.value
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center justify-center mb-2">
                      {option.value === 'delivered' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : option.value === 'pending' ? (
                        <Circle className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <Package className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div className="text-sm font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'type' && (
              <div className="grid grid-cols-4 gap-3 animate-in fade-in duration-200">
                <button
                  onClick={() => handleSupplementChange('all')}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all duration-200",
                    filters.supplementType === 'all'
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <div className="text-sm font-medium">전체</div>
                </button>
                {supplementTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleSupplementChange(type)}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all duration-200",
                      filters.supplementType === type
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <div className="text-sm font-medium">{type}</div>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'date' && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시작일
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    종료일
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilter;