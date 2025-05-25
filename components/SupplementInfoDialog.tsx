'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SupplementInfo {
  name: string;
  dosage: number;
  weight100pills: number;
  bottleWeight: number;
}

const supplementData: SupplementInfo[] = [
  { name: '비타민 B', dosage: 1448, weight100pills: 4.5, bottleWeight: 71 },
  { name: '비타민 C', dosage: 2000, weight100pills: 4.5, bottleWeight: 99 },
  { name: '비타민 D', dosage: 600, weight100pills: 4.0, bottleWeight: 26 },
  { name: '아연미네랄8', dosage: 1029, weight100pills: 4.5, bottleWeight: 51 },
  { name: '마그네슘', dosage: 1170, weight100pills: 5.5, bottleWeight: 70 },
  { name: '밀크씨슬', dosage: 900, weight100pills: 4.5, bottleWeight: 44 },
  { name: '홍경천테아닌', dosage: 1429, weight100pills: 4.2, bottleWeight: 66 },
  { name: '오메가3', dosage: 4145, weight100pills: 3.3, bottleWeight: 150 },
  { name: '종합비타민미네랄', dosage: 1080, weight100pills: 4.6, bottleWeight: 55 },
  { name: '유산균', dosage: 1200, weight100pills: 4.7, bottleWeight: 62 },
  { name: '바나바잎', dosage: 260, weight100pills: 4.7, bottleWeight: 13 },
  { name: '카테킨', dosage: 780, weight100pills: 4.4, bottleWeight: 38 },
  { name: '콜라겐', dosage: 1500, weight100pills: 4.7, bottleWeight: 78 },
  { name: '칼슘', dosage: 1200, weight100pills: 4.6, bottleWeight: 61 },
  { name: '멜라토닌', dosage: 600, weight100pills: 4.6, bottleWeight: 30 }
];

interface SupplementInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupplementInfoDialog({ isOpen, onClose }: SupplementInfoDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          
          {/* 다이얼로그 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* 헤더 */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">영양제 정보</h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 테이블 콘텐츠 */}
              <div className="overflow-auto max-h-[calc(90vh-120px)]">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        영양제
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                        충전량(조정 반영)
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                        100알 무게(g)
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                        보틀 충전 무게(g)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {supplementData.map((supplement, index) => (
                      <motion.tr
                        key={supplement.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {supplement.name}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-700">
                          {supplement.dosage.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-700">
                          {supplement.weight100pills}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-700">
                          {supplement.bottleWeight}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 푸터 */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}