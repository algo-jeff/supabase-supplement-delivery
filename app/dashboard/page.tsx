'use client';

import React, { useEffect, useState } from 'react';
import { supabase, SupplementDelivery } from '@/utils/supabase';
import Sidebar from '@/components/ui/sidebar';
import AnimatedNavbar from '@/components/ui/animated-navbar';
import StatCard from '@/components/ui/stat-card';
import { BarChart, PieChart, LineChart } from '@/components/ui/charts';
import { getSession, logout } from '../actions';
import { 
  Package, 
  TrendingUp, 
  Calendar, 
  Users,
  DollarSign,
  ShoppingCart,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<SupplementDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        setUserEmail(session.email);
      }
    };
    checkSession();
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('supplement_delivery')
        .select('*');
      
      if (data) {
        setDeliveries(data);
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // 통계 계산
  const stats = {
    total: deliveries.length,
    delivered: deliveries.filter(d => d.is_send).length,
    pending: deliveries.filter(d => !d.is_send).length,
    todayDeliveries: deliveries.filter(d => {
      const today = new Date();
      const deliveryDate = new Date(d.delivery_date || '');
      return deliveryDate.toDateString() === today.toDateString();
    }).length,
    totalQuantity: deliveries.reduce((sum, d) => sum + (d.quantity || 0), 0),
    uniqueRecipients: new Set(deliveries.map(d => d.recipient_name)).size
  };

  // 영양제별 통계
  const supplementStats = deliveries.reduce((acc, delivery) => {
    const type = delivery.supplement_type || '기타';
    if (!acc[type]) {
      acc[type] = 0;
    }
    acc[type]++;
    return acc;
  }, {} as Record<string, number>);

  const supplementChartData = Object.entries(supplementStats).map(([label, value]) => ({
    label,
    value
  }));

  // 월별 배송 통계 (최근 6개월)
  const monthlyStats = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.toLocaleDateString('ko-KR', { month: 'short' });
    
    const count = deliveries.filter(d => {
      const deliveryDate = new Date(d.delivery_date || '');
      return deliveryDate.getMonth() === date.getMonth() && 
             deliveryDate.getFullYear() === date.getFullYear();
    }).length;

    return { label: month, value: count };
  }).reverse();

  // 상태별 통계
  const statusChartData = [
    { label: '배송 완료', value: stats.delivered, color: 'fill-green-500' },
    { label: '배송 대기', value: stats.pending, color: 'fill-yellow-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar userEmail={userEmail} onLogout={handleLogout} />
      
      <div className="md:ml-64 transition-all duration-300">
        <AnimatedNavbar 
          userEmail={userEmail} 
          onLogout={handleLogout}
        />
        
        <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-10">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
            <p className="text-gray-600 mt-2">영양제 배송 현황을 한눈에 확인하세요</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="총 배송"
              value={stats.total}
              icon={<Package className="h-6 w-6 text-indigo-600" />}
              iconBgColor="bg-indigo-100"
              change={12}
              changeLabel="지난달 대비"
              trend="up"
            />
            <StatCard
              title="배송 완료"
              value={stats.delivered}
              icon={<CheckCircle className="h-6 w-6 text-green-600" />}
              iconBgColor="bg-green-100"
              change={8}
              changeLabel="지난주 대비"
              trend="up"
            />
            <StatCard
              title="배송 대기"
              value={stats.pending}
              icon={<Clock className="h-6 w-6 text-yellow-600" />}
              iconBgColor="bg-yellow-100"
              change={-5}
              changeLabel="지난주 대비"
              trend="down"
            />
            <StatCard
              title="오늘 배송"
              value={stats.todayDeliveries}
              icon={<Calendar className="h-6 w-6 text-purple-600" />}
              iconBgColor="bg-purple-100"
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="총 수량"
              value={stats.totalQuantity}
              icon={<ShoppingCart className="h-6 w-6 text-blue-600" />}
              iconBgColor="bg-blue-100"
            />
            <StatCard
              title="고객 수"
              value={stats.uniqueRecipients}
              icon={<Users className="h-6 w-6 text-pink-600" />}
              iconBgColor="bg-pink-100"
            />
            <StatCard
              title="평균 배송량"
              value={(stats.totalQuantity / stats.total || 0).toFixed(1)}
              icon={<TrendingUp className="h-6 w-6 text-cyan-600" />}
              iconBgColor="bg-cyan-100"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <BarChart
                data={monthlyStats}
                title="월별 배송 현황"
                height={250}
              />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <PieChart
                data={statusChartData}
                title="배송 상태 분포"
                height={250}
              />
            </div>
          </div>

          {/* Supplement Types Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <BarChart
              data={supplementChartData}
              title="영양제별 배송 통계"
              height={300}
            />
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 배송 활동</h3>
            <div className="space-y-4">
              {deliveries.slice(0, 5).map((delivery) => (
                <div key={delivery.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Package className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{delivery.recipient_name}</p>
                      <p className="text-sm text-gray-600">{delivery.supplement_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">수량: {delivery.quantity}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(delivery.delivery_date || '').toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}