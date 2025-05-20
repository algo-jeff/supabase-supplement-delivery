'use client';

import { useEffect, useState } from 'react';
import { supabase, SupplementDelivery } from '../utils/supabase';

export default function Home() {
  const [deliveries, setDeliveries] = useState<SupplementDelivery[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<SupplementDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    pending: 0
  });

  // 필터 상태
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'all', // 'all', 'delivered', 'pending'
    supplementType: 'all',
    dateFrom: '',
    dateTo: ''
  });

  // 정렬 상태 - 기본값을 미래 날짜가 위로 오도록 변경
  const [sortConfig, setSortConfig] = useState({
    key: 'delivery_date',
    direction: 'asc' // asc: 미래 날짜가 위로, desc: 과거 날짜가 위로
  });

  // 필터 표시 여부
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // 모바일 필터 패널 표시 여부
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // 고유한 영양제 타입 목록
  const [supplementTypes, setSupplementTypes] = useState<string[]>([]);

  useEffect(() => {
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

        // 기본 정렬: 배송일 미래 우선 (날짜가 없는 항목은 맨 아래로)
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

    fetchDeliveries();
  }, []);

  // 정렬 함수
  const sortDeliveries = (data: SupplementDelivery[], key: string, direction: string) => {
    return [...data].sort((a: any, b: any) => {
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
      
      // 일반 필드 정렬
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
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* 네비게이션 바 */}
      <header className="bg-white shadow-sm">
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
            <div className="flex items-center">
              <button className="btn btn-primary">새 배송 추가</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-indigo-100 p-3">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="ml-5">
                <div className="text-sm font-medium text-gray-500">총 배송</div>
                <div className="mt-1 text-3xl font-semibold text-gray-900">{stats.total}</div>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-green-100 p-3">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-5">
                <div className="text-sm font-medium text-gray-500">배송 완료</div>
                <div className="mt-1 text-3xl font-semibold text-gray-900">{stats.delivered}</div>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-yellow-100 p-3">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5">
                <div className="text-sm font-medium text-gray-500">배송 대기</div>
                <div className="mt-1 text-3xl font-semibold text-gray-900">{stats.pending}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
              <h2 className="text-lg font-medium text-gray-900">영양제 배송 목록</h2>
              
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
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex space-x-2 w-full sm:w-auto">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="form-select block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="all">모든 상태</option>
                    <option value="delivered">배송 완료</option>
                    <option value="pending">배송 대기</option>
                  </select>
                  <select
                    value={filters.supplementType}
                    onChange={(e) => setFilters({...filters, supplementType: e.target.value})}
                    className="form-select block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="all">모든 영양제</option>
                    {supplementTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* 고급 필터 토글 버튼 - 데스크톱 */}
            <div className="hidden md:flex justify-between mt-4">
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
              
              <button
                type="button"
                onClick={resetFilters}
                className="text-gray-600 hover:text-gray-800 text-sm flex items-center"
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                필터 초기화
              </button>
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
                      className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                      className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* 모바일용 필터 패널 */}
            {showMobileFilters && (
              <div className="md:hidden mt-4 filter-panel">
                <div className="form-group">
                  <label htmlFor="mobileSearch" className="form-label">검색어</label>
                  <input
                    id="mobileSearch"
                    type="search"
                    placeholder="이름, 영양제, 송장번호 검색..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                    className="form-control"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="mobileStatus" className="form-label">배송 상태</label>
                  <select
                    id="mobileStatus"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="form-select"
                  >
                    <option value="all">모든 상태</option>
                    <option value="delivered">배송 완료</option>
                    <option value="pending">배송 대기</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="mobileType" className="form-label">영양제 종류</label>
                  <select
                    id="mobileType"
                    value={filters.supplementType}
                    onChange={(e) => setFilters({...filters, supplementType: e.target.value})}
                    className="form-select"
                  >
                    <option value="all">모든 영양제</option>
                    {supplementTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="mobileDateFrom" className="form-label">시작일</label>
                  <input
                    type="date"
                    id="mobileDateFrom"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                    className="form-control"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="mobileDateTo" className="form-label">종료일</label>
                  <input
                    type="date"
                    id="mobileDateTo"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                    className="form-control"
                  />
                </div>
                
                <div className="flex justify-between mt-4">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="btn btn-secondary btn-sm"
                  >
                    필터 초기화
                  </button>
                  <button
                    type="button"
                    onClick={toggleMobileFilters}
                    className="btn btn-primary btn-sm"
                  >
                    필터 적용
                  </button>
                </div>
              </div>
            )}
            
            {/* 활성 필터 태그 */}
            {getActiveFilterCount() > 0 && (
              <div className="mt-4 flex flex-wrap">
                {filters.searchTerm && (
                  <div className="chip">
                    검색어: {filters.searchTerm}
                    <button 
                      onClick={() => removeFilter('searchTerm')}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {filters.status !== 'all' && (
                  <div className="chip">
                    상태: {filters.status === 'delivered' ? '배송 완료' : '배송 대기'}
                    <button 
                      onClick={() => removeFilter('status')}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {filters.supplementType !== 'all' && (
                  <div className="chip">
                    영양제: {filters.supplementType}
                    <button 
                      onClick={() => removeFilter('supplementType')}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {filters.dateFrom && (
                  <div className="chip">
                    시작일: {new Date(filters.dateFrom).toLocaleDateString()}
                    <button 
                      onClick={() => removeFilter('dateFrom')}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {filters.dateTo && (
                  <div className="chip">
                    종료일: {new Date(filters.dateTo).toLocaleDateString()}
                    <button 
                      onClick={() => removeFilter('dateTo')}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
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
              <div className="mt-6">
                <button className="btn btn-primary">새 배송 추가</button>
              </div>
            </div>
          )}

          {!loading && !error && filteredDeliveries.length > 0 && (
            <div className="table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th scope="col" onClick={() => handleSort('id')} className="cursor-pointer hover:bg-gray-100">
                      <div className="flex items-center">
                        ID
                        {sortConfig.key === 'id' && (
                          <svg className={`h-4 w-4 ml-1 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th scope="col" onClick={() => handleSort('recipient_name')} className="cursor-pointer hover:bg-gray-100">
                      <div className="flex items-center">
                        수령인
                        {sortConfig.key === 'recipient_name' && (
                          <svg className={`h-4 w-4 ml-1 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th scope="col" onClick={() => handleSort('delivery_date')} className="cursor-pointer hover:bg-gray-100">
                      <div className="flex items-center">
                        배송일
                        {sortConfig.key === 'delivery_date' && (
                          <svg className={`h-4 w-4 ml-1 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th scope="col" onClick={() => handleSort('supplement_type')} className="cursor-pointer hover:bg-gray-100 hidden sm:table-cell">
                      <div className="flex items-center">
                        영양제 종류
                        {sortConfig.key === 'supplement_type' && (
                          <svg className={`h-4 w-4 ml-1 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th scope="col" onClick={() => handleSort('quantity')} className="cursor-pointer hover:bg-gray-100 hidden sm:table-cell">
                      <div className="flex items-center">
                        수량
                        {sortConfig.key === 'quantity' && (
                          <svg className={`h-4 w-4 ml-1 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th scope="col" onClick={() => handleSort('is_send')} className="cursor-pointer hover:bg-gray-100">
                      <div className="flex items-center">
                        상태
                        {sortConfig.key === 'is_send' && (
                          <svg className={`h-4 w-4 ml-1 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th scope="col" onClick={() => handleSort('invoice_number')} className="cursor-pointer hover:bg-gray-100 hidden sm:table-cell">
                      <div className="flex items-center">
                        송장번호
                        {sortConfig.key === 'invoice_number' && (
                          <svg className={`h-4 w-4 ml-1 ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="relative">
                      <span className="sr-only">수정</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeliveries.map((delivery, idx) => {
                    const dateStatus = getDateStatus(delivery.delivery_date);
                    return (
                      <tr key={delivery.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="font-medium text-gray-900">{delivery.id}</td>
                        <td>{delivery.recipient_name}</td>
                        <td>
                          <span className={`
                            ${dateStatus === 'future' ? 'text-blue-700 font-medium' : ''}
                            ${dateStatus === 'today' ? 'text-green-700 font-medium' : ''}
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
                        <td className="hidden sm:table-cell">{delivery.supplement_type}</td>
                        <td className="text-center hidden sm:table-cell">{delivery.quantity}</td>
                        <td>
                          <span 
                            className={`status-badge ${
                              delivery.is_send 
                                ? 'status-badge-delivered' 
                                : 'status-badge-pending'
                            }`}
                          >
                            {delivery.is_send ? '배송 완료' : '배송 대기'}
                          </span>
                        </td>
                        <td className="hidden sm:table-cell">{delivery.invoice_number || '-'}</td>
                        <td className="text-right text-sm font-medium">
                          <a href="#" className="text-indigo-600 hover:text-indigo-900">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            <span className="sr-only">수정</span>
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {/* 페이지네이션 */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      전체 <span className="font-medium">{deliveries.length}</span> 항목 중 <span className="font-medium">{filteredDeliveries.length}</span> 항목 표시
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        <span className="sr-only">이전</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </a>
                      <a href="#" aria-current="page" className="z-10 bg-indigo-50 border-indigo-500 text-indigo-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                        1
                      </a>
                      <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        <span className="sr-only">다음</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </a>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* 푸터 */}
      <footer className="bg-white mt-10">
        <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; 2025 영양제 배송 관리 시스템. 모든 권리 보유.
          </p>
        </div>
      </footer>
    </div>
  );
}