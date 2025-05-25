'use client';

import { useEffect, useState } from 'react';
import { supabase, SupplementDelivery } from '../utils/supabase';
import AddDeliveryModal from '@/components/AddDeliveryModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import Sidebar from '@/components/ui/sidebar';
import AnimatedNavbar from '@/components/ui/animated-navbar';
import AdvancedFilter from '@/components/ui/advanced-filter';
import StatusToggle from '@/components/ui/status-toggle';
import WelcomeLoader from '@/components/ui/welcome-loader';
import { updateDeliveryStatus, logout, getSession } from './actions';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Calendar, Package, TrendingUp, ChevronUp, ChevronDown } from 'lucide-react';

export default function Home() {
  const [deliveries, setDeliveries] = useState<SupplementDelivery[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<SupplementDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showLoader, setShowLoader] = useState(true);
  const router = useRouter();
  
  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    pending: 0
  });

  // 모달 상태
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{id: number; name: string} | null>(null);

  // 필터 상태
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'all',
    supplementType: 'all',
    dateFrom: '',
    dateTo: ''
  });

  // 정렬 상태
  const [sortConfig, setSortConfig] = useState({
    key: 'delivery_date',
    direction: 'asc'
  });

  // 고유한 영양제 타입 목록
  const [supplementTypes, setSupplementTypes] = useState<string[]>([]);

  // 세션 확인
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        setUserEmail(session.email);
      }
    };
    checkSession();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      
      const { data: tableData, error: tableError } = await supabase
        .from('supplement_delivery')
        .select('*');

      let data = tableData || [];
      if (tableError) {
        console.error('Error:', tableError);
        data = [];
      }

      // 기본 정렬
      const sortedData = sortDeliveries(data, 'delivery_date', 'asc');
      
      setDeliveries(sortedData);
      setFilteredDeliveries(sortedData);
      
      // 통계 계산
      const total = data.length;
      const delivered = data.filter((item: SupplementDelivery) => item.is_send).length;
      const pending = total - delivered;
      
      setStats({
        total,
        delivered,
        pending
      });

      // 고유한 영양제 타입 추출
      const types: string[] = Array.from(new Set(data.map((item: SupplementDelivery) => item.supplement_type)));
      setSupplementTypes(types);
    } catch (error: any) {
      console.error('Error details:', error);
      setError('배송 데이터를 가져오는데 실패했습니다. Supabase 연결을 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showLoader) {
      fetchDeliveries();
    }
  }, [showLoader]);

  // 로그아웃 핸들러
  const handleLogout = async () => {
    await logout();
  };

  // 정렬 함수
  const sortDeliveries = (data: SupplementDelivery[], key: string, direction: string) => {
    return [...data].sort((a: any, b: any) => {
      if (key === 'delivery_date') {
        if (!a[key] && !b[key]) return 0;
        if (!a[key]) return 1;
        if (!b[key]) return -1;
        
        const dateA = new Date(a[key]);
        const dateB = new Date(b[key]);
        
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        
        return direction === 'asc' 
          ? dateA.getTime() - dateB.getTime() 
          : dateB.getTime() - dateA.getTime();
      }
      
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // 정렬 핸들러
  const handleSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
    setFilteredDeliveries(sortDeliveries(filteredDeliveries, key, direction));
  };

  // 상태 토글 핸들러
  const handleStatusToggle = async (id: number, currentStatus: boolean) => {
    try {
      await updateDeliveryStatus(id, !currentStatus);
      await fetchDeliveries();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  // 삭제 핸들러
  const handleDeleteClick = (id: number, name: string) => {
    setDeleteTarget({ id, name });
    setShowDeleteModal(true);
  };

  // 필터 초기화 함수
  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      status: 'all',
      supplementType: 'all',
      dateFrom: '',
      dateTo: ''
    });
  };

  // 필터 적용 함수
  useEffect(() => {
    let result = deliveries;
    
    // 검색어 필터
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(item => 
        (item.recipient_name && item.recipient_name.toLowerCase().includes(searchLower)) ||
        (item.supplement_type && item.supplement_type.toLowerCase().includes(searchLower)) ||
        (item.invoice_number && item.invoice_number.toLowerCase().includes(searchLower))
      );
    }
    
    // 상태 필터
    if (filters.status !== 'all') {
      const isDelivered = filters.status === 'delivered';
      result = result.filter(item => item.is_send === isDelivered);
    }
    
    // 영양제 타입 필터
    if (filters.supplementType !== 'all') {
      result = result.filter(item => item.supplement_type === filters.supplementType);
    }
    
    // 날짜 범위 필터
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      result = result.filter(item => {
        if (!item.delivery_date) return false;
        const itemDate = new Date(item.delivery_date);
        return itemDate >= fromDate;
      });
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(item => {
        if (!item.delivery_date) return false;
        const itemDate = new Date(item.delivery_date);
        return itemDate <= toDate;
      });
    }
    
    // 정렬 적용
    const sortedResult = sortDeliveries(result, sortConfig.key, sortConfig.direction);
    
    setFilteredDeliveries(sortedResult);
  }, [filters, deliveries, sortConfig]);

  // 날짜 포맷팅
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return isNaN(date.getTime()) 
      ? dateString 
      : date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
  };

  // 날짜 상태 계산
  const getDateStatus = (dateString?: string) => {
    if (!dateString) return 'none';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'none';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.getTime() >= tomorrow.getTime()) return 'future';
    if (date.getTime() === today.getTime()) return 'today';
    return 'past';
  };

  if (showLoader) {
    return <WelcomeLoader onComplete={() => setShowLoader(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar userEmail={userEmail} onLogout={handleLogout} />
      
      {/* Main Content Area */}
      <div className="md:ml-64 transition-all duration-300">
        {/* Top Navigation */}
        <AnimatedNavbar 
          userEmail={userEmail} 
          onLogout={handleLogout}
        />
        
        {/* Content */}
        <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-10">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-lg bg-indigo-100 p-3">
                  <Package className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5">
                  <div className="text-sm font-medium text-gray-500">총 배송</div>
                  <div className="mt-1 text-3xl font-semibold text-gray-900">{stats.total}</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-lg bg-green-100 p-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5">
                  <div className="text-sm font-medium text-gray-500">배송 완료</div>
                  <div className="mt-1 text-3xl font-semibold text-gray-900">{stats.delivered}</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-lg bg-yellow-100 p-3">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5">
                  <div className="text-sm font-medium text-gray-500">배송 대기</div>
                  <div className="mt-1 text-3xl font-semibold text-gray-900">{stats.pending}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Filter */}
          <div className="mb-6">
            <AdvancedFilter
              filters={filters}
              setFilters={setFilters}
              supplementTypes={supplementTypes}
              onReset={resetFilters}
            />
          </div>

          {/* Add Button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              <span>새 배송 추가</span>
            </button>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {loading && (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 m-6">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && filteredDeliveries.length === 0 && (
              <div className="py-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">검색 조건에 맞는 배송 데이터가 없습니다</h3>
                <p className="mt-1 text-sm text-gray-500">필터를 조정하거나 새 배송을 추가하세요.</p>
              </div>
            )}

            {!loading && !error && filteredDeliveries.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('id')}
                      >
                        <div className="flex items-center">
                          ID
                          {sortConfig.key === 'id' && (
                            sortConfig.direction === 'asc' ? 
                              <ChevronUp className="ml-1 h-4 w-4" /> : 
                              <ChevronDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('recipient_name')}
                      >
                        <div className="flex items-center">
                          수령인
                          {sortConfig.key === 'recipient_name' && (
                            sortConfig.direction === 'asc' ? 
                              <ChevronUp className="ml-1 h-4 w-4" /> : 
                              <ChevronDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('delivery_date')}
                      >
                        <div className="flex items-center">
                          배송일
                          {sortConfig.key === 'delivery_date' && (
                            sortConfig.direction === 'asc' ? 
                              <ChevronUp className="ml-1 h-4 w-4" /> : 
                              <ChevronDown className="ml-1 h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        영양제 종류
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        수량
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        송장번호
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">작업</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDeliveries.map((delivery) => {
                      const dateStatus = getDateStatus(delivery.delivery_date);
                      return (
                        <tr key={delivery.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {delivery.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {delivery.recipient_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={
                              dateStatus === 'future' ? 'text-blue-700 font-medium' :
                              dateStatus === 'today' ? 'text-green-700 font-medium' :
                              dateStatus === 'past' ? 'text-gray-500' : ''
                            }>
                              {formatDate(delivery.delivery_date)}
                              {dateStatus === 'future' && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  예정
                                </span>
                              )}
                              {dateStatus === 'today' && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  오늘
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {delivery.supplement_type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {delivery.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <StatusToggle
                              checked={delivery.is_send}
                              onChange={() => handleStatusToggle(delivery.id, delivery.is_send)}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {delivery.invoice_number || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleDeleteClick(delivery.id, delivery.recipient_name)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Modals */}
      <AddDeliveryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchDeliveries}
      />
      
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        deliveryId={deleteTarget?.id || null}
        recipientName={deleteTarget?.name || ''}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
        onSuccess={fetchDeliveries}
      />
    </div>
  );
}