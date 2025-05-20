'use client';

import { useEffect, useState } from 'react';
import { supabase, SupplementDelivery } from '../utils/supabase';

export default function Home() {
  const [deliveries, setDeliveries] = useState<SupplementDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    delivered: 0,
    pending: 0
  });

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

        setDeliveries(data);
        
        // 통계 계산
        const total = data.length;
        const delivered = data.filter(item => item.is_send).length;
        const pending = total - delivered;
        
        setStats({
          total,
          delivered,
          pending
        });
      } catch (error: any) {
        console.error('Error details:', error);
        setError('배송 데이터를 가져오는데 실패했습니다. Supabase 연결을 확인하세요.');
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

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
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">영양제 배송 목록</h2>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <input
                    type="search"
                    placeholder="검색..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <button className="btn btn-secondary flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  필터
                </button>
              </div>
            </div>
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

          {!loading && !error && deliveries.length === 0 && (
            <div className="py-12 text-center">
              <svg className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 12H4M4 12V6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2v-2m8-10v10m-4-5h8" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">배송 데이터가 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">Supabase 데이터베이스에 데이터가 있는지 확인하세요.</p>
              <div className="mt-6">
                <button className="btn btn-primary">새 배송 추가</button>
              </div>
            </div>
          )}

          {!loading && !error && deliveries.length > 0 && (
            <div className="table-container">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">수령인</th>
                    <th scope="col">배송일</th>
                    <th scope="col">영양제 종류</th>
                    <th scope="col">수량</th>
                    <th scope="col">상태</th>
                    <th scope="col">송장번호</th>
                    <th scope="col" className="relative">
                      <span className="sr-only">수정</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((delivery, idx) => (
                    <tr key={delivery.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="font-medium text-gray-900">{delivery.id}</td>
                      <td>{delivery.recipient_name}</td>
                      <td>{formatDate(delivery.delivery_date)}</td>
                      <td>{delivery.supplement_type}</td>
                      <td className="text-center">{delivery.quantity}</td>
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
                      <td>{delivery.invoice_number || '-'}</td>
                      <td className="text-right text-sm font-medium">
                        <a href="#" className="text-indigo-600 hover:text-indigo-900">
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          <span className="sr-only">수정</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* 페이지네이션 */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      전체 <span className="font-medium">{deliveries.length}</span> 항목 중 <span className="font-medium">1</span> - <span className="font-medium">{deliveries.length}</span> 표시
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