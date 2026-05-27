'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import api from '@/lib/api';
import { Activity, TrendingUp, Package, Truck, DollarSign } from 'lucide-react';

export default function ReportsPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.unitId) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [statsRes, salesRes] = await Promise.all([
        api.get(`/api/reports/dashboard-stats?unitId=${user!.unitId}`),
        api.get(`/api/reports/sales-data?unitId=${user!.unitId}`)
      ]);
      setStats(statsRes.data);
      setSales(salesRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (!user || user.role !== 'OWNER') return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="h-6 w-6 text-indigo-600" /> Analytics & Reports
        </h2>
      </div>

      {loading ? <p className="text-gray-500">Loading reports...</p> : (
        <>
          {/* Top KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600"><Package className="h-6 w-6"/></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Today's Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.todayOrders}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full text-green-600"><Truck className="h-6 w-6"/></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Weighbridge Entries</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.todayWeighbridgeEntries}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-full text-orange-600"><TrendingUp className="h-6 w-6"/></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Production (TON)</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.todayProduction}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full text-purple-600"><DollarSign className="h-6 w-6"/></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Collections (₹)</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.todayCollections.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Simple CSS Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">
            <h3 className="text-lg font-semibold mb-6">Sales Trend (Last 7 Days)</h3>
            <div className="h-64 flex items-end justify-between gap-2 px-2">
              {sales.map((item, idx) => {
                const maxSales = Math.max(...sales.map(s => s.sales), 1);
                const heightPercentage = (item.sales / maxSales) * 100;
                
                return (
                  <div key={idx} className="flex flex-col items-center w-full group">
                    <div className="opacity-0 group-hover:opacity-100 mb-2 text-xs font-semibold bg-gray-800 text-white px-2 py-1 rounded transition-opacity">
                      ₹{item.sales.toLocaleString()}
                    </div>
                    <div 
                      className="w-full bg-indigo-500 rounded-t-sm transition-all duration-500 ease-out hover:bg-indigo-600" 
                      style={{ height: `${heightPercentage}%`, minHeight: '10%' }}
                    ></div>
                    <div className="mt-2 text-xs text-gray-500 truncate w-full text-center">
                      {item.date.split('/')[0]}/{item.date.split('/')[1]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
