'use client';

import { useEffect, useState } from 'react';
import { supabase, SupplementDelivery } from '../utils/supabase';

export default function Home() {
  const [deliveries, setDeliveries] = useState<SupplementDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        setLoading(true);
        setDebugInfo('Fetching data from Supabase...');
        
        // 방법 1: 직접 테이블 쿼리
        const { data: tableData, error: tableError } = await supabase
          .from('supplement_delivery')
          .select('*');

        // 방법 2: RPC 함수 호출
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_supplement_deliveries');
        
        // 방법 3: SQL 직접 실행
        const { data: sqlData, error: sqlError } = await supabase
          .from('supplement_delivery')
          .select('id, recipient_name, delivery_date, supplement_type, quantity, is_send, invoice_number');

        let data;
        if (tableData && tableData.length > 0) {
          data = tableData;
          setDebugInfo('Data fetched from table directly');
        } else if (rpcData && rpcData.length > 0) {
          data = rpcData;
          setDebugInfo('Data fetched from RPC function');
        } else if (sqlData && sqlData.length > 0) {
          data = sqlData;
          setDebugInfo('Data fetched from specific SQL query');
        } else {
          if (tableError) setDebugInfo(`Table error: ${tableError.message}`);
          else if (rpcError) setDebugInfo(`RPC error: ${rpcError.message}`);
          else if (sqlError) setDebugInfo(`SQL error: ${sqlError.message}`);
          else setDebugInfo('No data found with any method');
          
          if (tableError) throw tableError;
          if (rpcError) throw rpcError;
          if (sqlError) throw sqlError;
          throw new Error('No data found and no specific error');
        }

        setDeliveries(data || []);
      } catch (error: any) {
        console.error('Error details:', error);
        setError('배송 데이터를 가져오는데 실패했습니다. Supabase 연결을 확인하세요.');
        if (error && error.message) {
          setDebugInfo(`Error message: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-8">영양제 배송 추적</h1>

      {loading && <p className="text-center my-4">로딩 중...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <p className="text-sm">Supabase 환경 변수 설정을 확인하세요.</p>
          <p className="text-xs mt-2">{debugInfo}</p>
        </div>
      )}

      {!loading && !error && deliveries.length === 0 && (
        <div className="text-center my-4">
          <p>배송 데이터가 없습니다. Supabase 데이터베이스에 데이터가 있는지 확인하세요.</p>
          <p className="text-xs mt-2">{debugInfo}</p>
        </div>
      )}

      {deliveries.length > 0 && (
        <>
          <div className="mb-4 text-sm text-gray-500">{debugInfo}</div>
          <div className="w-full overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-left">ID</th>
                  <th className="py-2 px-4 border-b text-left">수령인</th>
                  <th className="py-2 px-4 border-b text-left">배송일</th>
                  <th className="py-2 px-4 border-b text-left">영양제 종류</th>
                  <th className="py-2 px-4 border-b text-left">수량</th>
                  <th className="py-2 px-4 border-b text-left">상태</th>
                  <th className="py-2 px-4 border-b text-left">송장번호</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{delivery.id}</td>
                    <td className="py-2 px-4 border-b">{delivery.recipient_name}</td>
                    <td className="py-2 px-4 border-b">{delivery.delivery_date || '-'}</td>
                    <td className="py-2 px-4 border-b">{delivery.supplement_type}</td>
                    <td className="py-2 px-4 border-b">{delivery.quantity}</td>
                    <td className="py-2 px-4 border-b">
                      <span 
                        className={`inline-block px-2 py-1 rounded text-xs ${
                          delivery.is_send 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {delivery.is_send ? '배송 완료' : '배송 대기'}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">{delivery.invoice_number || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}