'use client';

import { useEffect, useState } from 'react';
import { supabase, SupplementDelivery } from '../utils/supabase';

export default function Home() {
  const [deliveries, setDeliveries] = useState<SupplementDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('supplement_delivery')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setDeliveries(data || []);
      } catch (error) {
        setError('Failed to fetch deliveries. Please check your Supabase connection.');
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-8">Supplement Delivery Tracking</h1>

      {loading && <p className="text-center my-4">Loading...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <p className="text-sm">Make sure you've set up your Supabase environment variables.</p>
        </div>
      )}

      {!loading && !error && deliveries.length === 0 && (
        <p className="text-center my-4">No deliveries found. Make sure your Supabase database has records in the supplement_delivery table.</p>
      )}

      {deliveries.length > 0 && (
        <div className="w-full overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">ID</th>
                <th className="py-2 px-4 border-b text-left">Name</th>
                <th className="py-2 px-4 border-b text-left">Email</th>
                <th className="py-2 px-4 border-b text-left">Supplement</th>
                <th className="py-2 px-4 border-b text-left">Quantity</th>
                <th className="py-2 px-4 border-b text-left">Status</th>
                <th className="py-2 px-4 border-b text-left">Tracking #</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{delivery.id}</td>
                  <td className="py-2 px-4 border-b">{delivery.name}</td>
                  <td className="py-2 px-4 border-b">{delivery.email}</td>
                  <td className="py-2 px-4 border-b">{delivery.supplement_name}</td>
                  <td className="py-2 px-4 border-b">{delivery.quantity}</td>
                  <td className="py-2 px-4 border-b">
                    <span 
                      className={`inline-block px-2 py-1 rounded text-xs ${
                        delivery.delivery_status === 'delivered' 
                          ? 'bg-green-100 text-green-800' 
                          : delivery.delivery_status === 'in_transit' 
                          ? 'bg-blue-100 text-blue-800' 
                          : delivery.delivery_status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {delivery.delivery_status}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b">{delivery.tracking_number || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}