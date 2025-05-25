'use client';

import { useEffect, useState } from 'react';
import { supabase, SupplementDelivery } from '../utils/supabase';
import AddDeliveryModal from '@/components/AddDeliveryModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import { updateDeliveryStatus, logout, getSession } from './actions';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [deliveries, setDeliveries] = useState<SupplementDelivery[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<SupplementDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('admin'); // 사용자 역할 상태 추가
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
    status: 'all', // 'all', 'delivered', 'pending'
    supplementType: 'all',
    dateFrom: '',
    dateTo: ''
  });

  // 정렬 상태 - 기본값을 ID 내림차순으로 변경 (최신 순)
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'desc' // desc: 큰 ID가 위로 (최신 순)
  });

  // 필터 표시 여부
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // 모바일 필터 패널 표시 여부
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // 고유한 영양제 타입 목록
  const [supplementTypes, setSupplementTypes] = useState<string[]>([]);

  // 세션 확인
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        setUserEmail(session.email);
        setUserRole(session.role || 'admin'); // 역할 설정 (기본값: admin)
      }
    };
    checkSession();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      
      // 3가지 방법으로 데이터 가져오기 시도
      const { data: tableData, error: tableError } = await supabase
        .from('supplement_delivery')
        .select('*');

      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_supplement_deliveries');
      
      const { data: sqlData, error: sqlError } = await supabase
        .from('supplement_delivery')
        .select('id, recipient_name, delivery_date, supplement_type, quantity, is_send, invoice_number');

      let data;
      if (tableData && tableData.length > 0) {
        data = tableData;
      } else if (rpcData && rpcData.length > 0) {
        data = rpcData;
      } else if (sqlData && sqlData.length > 0) {
        data = sqlData;
      } else {
        if (tableError) throw tableError;
        if (rpcError) throw rpcError;
        if (sqlError) throw sqlError;
        throw new Error('데이터를 찾을 수 없습니다');
      }

      // 기본 정렬: ID 내림차순 (최신 순)
      const sortedData = sortDeliveries(data, 'id', 'desc');
      
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
    fetchDeliveries();
  }, []);

  // 로그아웃 핸들러 개선
  const handleLogout = async () => {
    try {
      // 로그아웃 처리
      await logout();
      
      // 강제로 페이지 새로고침하여 완전한 로그아웃 보장
      window.location.href = '/login';
    } catch (error) {
      console.error('로그아웃 오류:', error);
      // 에러가 발생해도 로그인 페이지로 리다이렉트
      window.location.href = '/login';
    }
  };

  // 정렬 함수
  const sortDeliveries = (data: SupplementDelivery[], key: string, direction: string) => {
    return [...data].sort((a: any, b: any) => {
      // ID 필드에 대한 특별 처리 (숫자 정렬)
      if (key === 'id') {
        const idA = Number(a[key]) || 0;
        const idB = Number(b[key]) || 0;
        return direction === 'asc' ? idA - idB : idB - idA;
      }
      
      // 날짜 필드에 대한 특별 처리
      if (key === 'delivery_date') {
        // null 또는 undefined 값을 처리
        if (!a[key] && !b[key]) return 0;
        if (!a[key]) return 1; // null 값은 항상 아래로
        if (!b[key]) return -1; // null 값은 항상 아래로
        
        const dateA = new Date(a[key]);
        const dateB = new Date(b[key]);
        
        // 유효하지 않은 날짜 처리
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
        if (isNaN(dateA.getTime())) return 1; // 유효하지 않은 날짜는 아래로
        if (isNaN(dateB.getTime())) return -1; // 유효하지 않은 날짜는 아래로
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const diffA = dateA.getTime() - today.getTime();
        const diffB = dateB.getTime() - today.getTime();
        
        // 미래 날짜와 과거 날짜 구분
        if (diffA >= 0 && diffB < 0) return direction === 'asc' ? -1 : 1; // 미래 vs 과거
        if (diffA < 0 && diffB >= 0) return direction === 'asc' ? 1 : -1; // 과거 vs 미래
        
        // 둘 다 미래면, 가까운 날짜가 위로
        if (diffA >= 0 && diffB >= 0) {
          return direction === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        }
        
        // 둘 다 과거면, 최근 날짜가 위로
        return direction === 'asc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
      }
      
      // 수량 필드에 대한 특별 처리 (숫자 정렬)
      if (key === 'quantity') {
        const qtyA = Number(a[key]) || 0;
        const qtyB = Number(b[key]) || 0;
        return direction === 'asc' ? qtyA - qtyB : qtyB - qtyA;
      }
      
      // 불린 필드에 대한 특별 처리 (is_send)
      if (key === 'is_send') {
        const boolA = a[key] ? 1 : 0;
        const boolB = b[key] ? 1 : 0;
        return direction === 'asc' ? boolA - boolB : boolB - boolA;
      }
      
      // 일반 문자열 필드 정렬
      const valueA = (a[key] || '').toString().toLowerCase();
      const valueB = (b[key] || '').toString().toLowerCase();
      
      if (valueA < valueB) {
        return direction === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
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

  // 상태 토글 핸들러 (읽기 전용 사용자 제한)
  const handleStatusToggle = async (id: number, currentStatus: boolean) => {
    if (userRole === 'readonly') {
      alert('읽기 전용 사용자는 데이터를 수정할 수 없습니다.');
      return;
    }
    
    try {
      await updateDeliveryStatus(id, !currentStatus);
      await fetchDeliveries();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('상태 업데이트에 실패했습니다.');
    }
  };

  // 삭제 핸들러 (읽기 전용 사용자 제한)
  const handleDeleteClick = (id: number, name: string) => {
    if (userRole === 'readonly') {
      alert('읽기 전용 사용자는 데이터를 삭제할 수 없습니다.');
      return;
    }
    
    setDeleteTarget({ id, name });
    setShowDeleteModal(true);
  };

  // 새 배송 추가 버튼 핸들러 (읽기 전용 사용자 제한)
  const handleAddDeliveryClick = () => {
    if (userRole === 'readonly') {
      alert('읽기 전용 사용자는 데이터를 추가할 수 없습니다.');
      return;
    }
    
    setShowAddModal(true);
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

  // 모바일 필터 토글
  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
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
    
    // 날짜 범위 필터 (시작일)
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      result = result.filter(item => {
        if (!item.delivery_date) return false;
        const itemDate = new Date(item.delivery_date);
        return itemDate >= fromDate;
      });
    }
    
    // 날짜 범위 필터 (종료일)
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

  // 날짜 상태 계산 (미래/과거)
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

  // 필터 칩 제거
  const removeFilter = (filterType: string) => {
    switch (filterType) {
      case 'searchTerm':
        setFilters({...filters, searchTerm: ''});
        break;
      case 'status':
        setFilters({...filters, status: 'all'});
        break;
      case 'supplementType':
        setFilters({...filters, supplementType: 'all'});
        break;
      case 'dateFrom':
        setFilters({...filters, dateFrom: ''});
        break;
      case 'dateTo':
        setFilters({...filters, dateTo: ''});
        break;
      default:
        break;
    }
  };

  // 활성 필터 수 계산
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.status !== 'all') count++;
    if (filters.supplementType !== 'all') count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-10">
      {/* 네비게이션 바 */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <svg className="h-8 w-8 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6v-2zm0 4h8v2H6v-2zm10 0h2v2h-2v-2zm-10-8h12v2H6V6z" />
                </svg>
                <span className="ml-2 text-xl font-bold text-gray-900">영양제 배송 관리</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {userEmail && (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{userEmail}</span>
                    {userRole === 'readonly' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        읽기 전용
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              )}
              {/* 읽기 전용 사용자는 추가 버튼 비활성화 */}
              <button 
                onClick={handleAddDeliveryClick}
                disabled={userRole === 'readonly'}
                className={`px-4 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 ${
                  userRole === 'readonly' 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
                }`}
                title={userRole === 'readonly' ? '읽기 전용 사용자는 데이터를 추가할 수 없습니다.' : ''}
              >
                새 배송 추가
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-12">
          <div className="relative">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">총 배송</p>
                  <p className="text-3xl font-bold mt-2">{stats.total}</p>
                </div>
                <div className="text-4xl opacity-80">📦</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">배송 완료</p>
                  <p className="text-3xl font-bold mt-2">{stats.delivered}</p>
                </div>
                <div className="text-4xl opacity-80">✅</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">배송 대기</p>
                  <p className="text-3xl font-bold mt-2">{stats.pending}</p>
                </div>
                <div className="text-4xl opacity-80">⏳</div>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
              <h2 className="text-lg font-semibold text-gray-900">영양제 배송 목록</h2>
              
              {/* 모바일용 필터 버튼 */}
              <div className="flex md:hidden">
                <button
                  onClick={toggleMobileFilters}
                  className="btn btn-secondary btn-sm flex items-center space-x-1"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <span>필터 {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}</span>
                </button>
              </div>
              
              {/* 데스크톱용 필터 */}
              <div className="hidden md:flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="relative w-full sm:w-64">
                  <input
                    type="search"
                    placeholder="검색..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 고급 필터 토글 버튼과 필터 드롭다운 - 데스크톱 */}
            <div className="hidden md:flex justify-between items-center mt-4">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
              >
                {showAdvancedFilters ? (
                  <>
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    고급 필터 숨기기
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    고급 필터 표시
                  </>
                )}
              </button>
              
              {/* 필터 드롭다운을 오른쪽에 배치 */}
              <div className="flex space-x-3 items-center">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                >
                  <option value="all">모든 상태</option>
                  <option value="delivered">배송 완료</option>
                  <option value="pending">배송 대기</option>
                </select>
                <select
                  value={filters.supplementType}
                  onChange={(e) => setFilters({...filters, supplementType: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                >
                  <option value="all">모든 영양제</option>
                  {supplementTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-gray-600 hover:text-gray-800 text-sm flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  필터 초기화
                </button>
              </div>
            </div>
            
            {/* 고급 필터 패널 - 데스크톱 */}
            {showAdvancedFilters && (
              <div className="hidden md:block mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
                      시작일
                    </label>
                    <input
                      type="date"
                      id="dateFrom"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
                      종료일
                    </label>
                    <input
                      type="date"
                      id="dateTo"
                      value={filters.dateTo}
                      onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* 모바일용 필터 패널 */}
            {showMobileFilters && (
              <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="mobileSearch" className="block text-sm font-medium text-gray-700 mb-1">검색어</label>
                    <input
                      id="mobileSearch"
                      type="search"
                      placeholder="이름, 영양제, 송장번호 검색..."
                      value={filters.searchTerm}
                      onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="mobileStatus" className="block text-sm font-medium text-gray-700 mb-1">배송 상태</label>
                    <select
                      id="mobileStatus"
                      value={filters.status}
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="all">모든 상태</option>
                      <option value="delivered">배송 완료</option>
                      <option value="pending">배송 대기</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="mobileType" className="block text-sm font-medium text-gray-700 mb-1">영양제 종류</label>
                    <select
                      id="mobileType"
                      value={filters.supplementType}
                      onChange={(e) => setFilters({...filters, supplementType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="all">모든 영양제</option>
                      {supplementTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="mobileDateFrom" className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
                    <input
                      type="date"
                      id="mobileDateFrom"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="mobileDateTo" className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
                    <input
                      type="date"
                      id="mobileDateTo"
                      value={filters.dateTo}
                      onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      필터 초기화
                    </button>
                    <button
                      type="button"
                      onClick={toggleMobileFilters}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
                    >
                      필터 적용
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* 활성 필터 태그 */}
            {getActiveFilterCount() > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {filters.searchTerm && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    검색어: {filters.searchTerm}
                    <button 
                      onClick={() => removeFilter('searchTerm')}
                      className="ml-2 text-indigo-600 hover:text-indigo-800"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {filters.status !== 'all' && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    상태: {filters.status === 'delivered' ? '배송 완료' : '배송 대기'}
                    <button 
                      onClick={() => removeFilter('status')}
                      className="ml-2 text-indigo-600 hover:text-indigo-800"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {filters.supplementType !== 'all' && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    영양제: {filters.supplementType}
                    <button 
                      onClick={() => removeFilter('supplementType')}
                      className="ml-2 text-indigo-600 hover:text-indigo-800"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {filters.dateFrom && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    시작일: {new Date(filters.dateFrom).toLocaleDateString()}
                    <button 
                      onClick={() => removeFilter('dateFrom')}
                      className="ml-2 text-indigo-600 hover:text-indigo-800"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {filters.dateTo && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    종료일: {new Date(filters.dateTo).toLocaleDateString()}
                    <button 
                      onClick={() => removeFilter('dateTo')}
                      className="ml-2 text-indigo-600 hover:text-indigo-800"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {loading && (
            <div className="flex justify-center items-center h-64">
              <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-3 text-gray-600">로딩 중...</span>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 m-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                  <p className="mt-1 text-xs text-red-600">Supabase 환경 변수 설정을 확인하세요.</p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && filteredDeliveries.length === 0 && (
            <div className="py-12 text-center">
              <svg className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 12H4M4 12V6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2v-2m8-10v10m-4-5h8" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">검색 조건에 맞는 배송 데이터가 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">필터를 조정하거나 새 배송을 추가하세요.</p>
              {userRole !== 'readonly' && (
                <div className="mt-6">
                  <button 
                    onClick={handleAddDeliveryClick}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
                  >
                    새 배송 추가
                  </button>
                </div>
              )}
            </div>
          )}

          {!loading && !error && filteredDeliveries.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" onClick={() => handleSort('id')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                      <div className="flex items-center">
                        ID
                        {sortConfig.key === 'id' && (
                          <svg className={`h-4 w-4 ml-1 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th scope="col" onClick={() => handleSort('recipient_name')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                      <div className="flex items-center">
                        수령인
                        {sortConfig.key === 'recipient_name' && (
                          <svg className={`h-4 w-4 ml-1 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th scope="col" onClick={() => handleSort('delivery_date')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                      <div className="flex items-center">
                        배송일
                        {sortConfig.key === 'delivery_date' && (
                          <svg className={`h-4 w-4 ml-1 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th scope="col" onClick={() => handleSort('supplement_type')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hidden sm:table-cell">
                      <div className="flex items-center">
                        영양제 종류
                        {sortConfig.key === 'supplement_type' && (
                          <svg className={`h-4 w-4 ml-1 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th scope="col" onClick={() => handleSort('quantity')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hidden sm:table-cell">
                      <div className="flex items-center">
                        수량
                        {sortConfig.key === 'quantity' && (
                          <svg className={`h-4 w-4 ml-1 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th scope="col" onClick={() => handleSort('is_send')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                      <div className="flex items-center">
                        상태
                        {sortConfig.key === 'is_send' && (
                          <svg className={`h-4 w-4 ml-1 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th scope="col" onClick={() => handleSort('invoice_number')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hidden sm:table-cell">
                      <div className="flex items-center">
                        송장번호
                        {sortConfig.key === 'invoice_number' && (
                          <svg className={`h-4 w-4 ml-1 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    {userRole !== 'readonly' && (
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">작업</span>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDeliveries.map((delivery, idx) => {
                    const dateStatus = getDateStatus(delivery.delivery_date);
                    return (
                      <tr key={delivery.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{delivery.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{delivery.recipient_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`
                            ${dateStatus === 'future' ? 'text-blue-600 font-medium' : ''}
                            ${dateStatus === 'today' ? 'text-green-600 font-medium' : ''}
                            ${dateStatus === 'past' ? 'text-gray-500' : ''}
                          `}>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{delivery.supplement_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center hidden sm:table-cell">{delivery.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {userRole === 'readonly' ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              delivery.is_send 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {delivery.is_send ? '배송 완료' : '배송 대기'}
                            </span>
                          ) : (
                            <button
                              onClick={() => handleStatusToggle(delivery.id, delivery.is_send)}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors duration-200 ${
                                delivery.is_send 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              }`}
                            >
                              {delivery.is_send ? '배송 완료' : '배송 대기'}
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{delivery.invoice_number || '-'}</td>
                        {userRole !== 'readonly' && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => handleDeleteClick(delivery.id, delivery.recipient_name)}
                              className="text-red-600 hover:text-red-900 transition-colors duration-200"
                            >
                              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <span className="sr-only">삭제</span>
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      
      {/* 모달 - 읽기 전용 사용자에게는 표시하지 않음 */}
      {userRole !== 'readonly' && (
        <>
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
        </>
      )}
      
      {/* 푸터 */}
      <footer className="bg-white/80 backdrop-blur-md mt-10 border-t border-gray-200/50">
        <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; 2025 영양제 배송 관리 시스템. 모든 권리 보유.
          </p>
        </div>
      </footer>
    </div>
  );
}