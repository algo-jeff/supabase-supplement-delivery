'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TubelightNavbar from '@/components/TubelightNavbar';
import LoadingPage from '@/components/LoadingPage';
import FAQPage from '@/components/FAQPage';

// Mock data for demonstration
const mockDeliveries = [
  {
    id: 1,
    recipient_name: "김철수",
    delivery_date: "2025-05-30",
    supplement_type: "비타민 D",
    quantity: 30,
    is_send: false,
    invoice_number: "KR123456789"
  },
  {
    id: 2,
    recipient_name: "이영희",
    delivery_date: "2025-05-28",
    supplement_type: "오메가3",
    quantity: 60,
    is_send: true,
    invoice_number: "KR987654321"
  },
  {
    id: 3,
    recipient_name: "박민수",
    delivery_date: "2025-05-25",
    supplement_type: "종합비타민",
    quantity: 30,
    is_send: true,
    invoice_number: "KR456789123"
  }
];

type ViewType = 'dashboard' | 'deliveries' | 'faq';

interface SupplementDelivery {
  id: number;
  recipient_name: string;
  delivery_date: string;
  supplement_type: string;
  quantity: number;
  is_send: boolean;
  invoice_number?: string;
}

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [deliveries, setDeliveries] = useState<SupplementDelivery[]>(mockDeliveries);

  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    pending: 0
  });

  useEffect(() => {
    // 로딩 페이지 표시 시간
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // 통계 계산
    const total = deliveries.length;
    const delivered = deliveries.filter(item => item.is_send).length;
    const pending = total - delivered;
    
    setStats({
      total,
      delivered,
      pending
    });
  }, [deliveries]);

  const handleTabChange = (id: string) => {
    setCurrentView(id as ViewType);
  };

  const navItems = [
    {
      id: 'dashboard',
      label: '대시보드',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'deliveries',
      label: '배송 관리',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      id: 'faq',
      label: 'FAQ',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDateStatus = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.getTime() >= tomorrow.getTime()) return 'future';
    if (date.getTime() === today.getTime()) return 'today';
    return 'past';
  };

  if (isLoading) {
    return <LoadingPage isVisible={isLoading} onComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <AnimatePresence mode="wait">
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="pb-20 pt-20"
          >
            {/* 상단 토글 네비게이션 바 */}
            <TubelightNavbar
              items={navItems}
              onItemChange={handleTabChange}
              defaultActive="dashboard"
            />

            {/* 메인 콘텐츠 */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <AnimatePresence mode="wait">
                {currentView === 'dashboard' && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* 헤더 */}
                    <div className="text-center mb-12">
                      <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                      >
                        영양제 배송 관리
                      </motion.h1>
                      <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-gray-600"
                      >
                        효율적인 배송 현황 관리 시스템
                      </motion.p>
                    </div>

                    {/* 통계 카드 */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-12">
                      {[
                        {
                          title: '총 배송',
                          value: stats.total,
                          icon: '📦',
                          color: 'from-blue-500 to-indigo-600',
                          delay: 0.1
                        },
                        {
                          title: '배송 완료',
                          value: stats.delivered,
                          icon: '✅',
                          color: 'from-green-500 to-emerald-600',
                          delay: 0.2
                        },
                        {
                          title: '배송 대기',
                          value: stats.pending,
                          icon: '⏳',
                          color: 'from-yellow-500 to-orange-600',
                          delay: 0.3
                        }
                      ].map((stat, index) => (
                        <motion.div
                          key={stat.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: stat.delay }}
                          className="relative"
                        >
                          <div className={`bg-gradient-to-r ${stat.color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-white/80 text-sm font-medium">{stat.title}</p>
                                <p className="text-3xl font-bold mt-2">{stat.value}</p>
                              </div>
                              <div className="text-4xl opacity-80">{stat.icon}</div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* 최근 배송 목록 */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden"
                    >
                      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                        <h3 className="text-lg font-semibold text-gray-900">최근 배송 현황</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수령인</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">배송일</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">영양제</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {deliveries.map((delivery, index) => {
                              const dateStatus = getDateStatus(delivery.delivery_date);
                              return (
                                <motion.tr
                                  key={delivery.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.5 + index * 0.1 }}
                                  className="hover:bg-gray-50 transition-colors duration-150"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {delivery.recipient_name}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`
                                      ${dateStatus === 'future' ? 'text-blue-600 font-medium' : ''}
                                      ${dateStatus === 'today' ? 'text-green-600 font-medium' : ''}
                                      ${dateStatus === 'past' ? 'text-gray-500' : ''}
                                    `}>
                                      {formatDate(delivery.delivery_date)}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {delivery.supplement_type}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      delivery.is_send
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {delivery.is_send ? '배송 완료' : '배송 대기'}
                                    </span>
                                  </td>
                                </motion.tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {currentView === 'deliveries' && (
                  <motion.div
                    key="deliveries"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">배송 관리</h1>
                      <p className="text-lg text-gray-600">배송 현황을 상세히 관리하고 추적하세요</p>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                      <div className="text-center py-16">
                        <div className="mx-auto w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">배송 관리 기능</h3>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                          여기에서 전체 배송 관리 기능을 구현할 수 있습니다. 
                          필터링, 정렬, 검색, 배송 상태 변경 등의 기능이 포함됩니다.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentView === 'faq' && (
                  <motion.div
                    key="faq"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FAQPage />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}