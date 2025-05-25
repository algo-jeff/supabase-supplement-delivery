'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterPopoverProps {
  filters: {
    searchTerm: string;
    status: string;
    supplementType: string;
    dateFrom: string;
    dateTo: string;
  };
  setFilters: (filters: any) => void;
  supplementTypes: string[];
  onClear: () => void;
  activeCount: number;
}

export default function FilterPopover({
  filters,
  setFilters,
  supplementTypes,
  onClear,
  activeCount,
}: FilterPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters = activeCount > 0;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium transition-colors duration-200
          ${isOpen 
            ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
            : hasActiveFilters
              ? 'border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }
        `}
      >
        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
        </svg>
        필터
        {hasActiveFilters && (
          <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-600 text-white">
            {activeCount}
          </span>
        )}
        <svg className={`h-4 w-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">필터 설정</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={onClear}
                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    초기화
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* 검색어 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    검색어
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="이름, 영양제, 송장번호 검색..."
                      value={filters.searchTerm}
                      onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* 배송 상태 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    배송 상태
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'all', label: '전체', color: 'bg-gray-100 text-gray-700' },
                      { value: 'pending', label: '대기', color: 'bg-yellow-100 text-yellow-700' },
                      { value: 'delivered', label: '완료', color: 'bg-green-100 text-green-700' },
                    ].map((status) => (
                      <button
                        key={status.value}
                        onClick={() => setFilters({...filters, status: status.value})}
                        className={`
                          px-3 py-2 rounded-md text-xs font-medium transition-colors duration-200 border
                          ${filters.status === status.value 
                            ? `${status.color} border-current` 
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }
                        `}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 영양제 종류 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    영양제 종류
                  </label>
                  <select
                    value={filters.supplementType}
                    onChange={(e) => setFilters({...filters, supplementType: e.target.value})}
                    className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">모든 영양제</option>
                    {supplementTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* 날짜 범위 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      시작일
                    </label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                      className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      종료일
                    </label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                      className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <span className="text-xs text-gray-500">
                  {hasActiveFilters ? `${activeCount}개 필터 적용됨` : '필터가 적용되지 않음'}
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors duration-200"
                >
                  적용
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 배경 오버레이 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40"
          />
        )}
      </AnimatePresence>
    </div>
  );
}