'use client';

import { useAuthStore } from '@/lib/auth-store';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Truck, Activity, ShoppingCart, Users, Scale, Package } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

export default function DashboardOverview() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [liveTrips, setLiveTrips] = useState<any[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (user?.unitId) {
      fetchDashboardStats();
      
      const newSocket = io('http://localhost:5000/trips');
      setSocket(newSocket);
      
      newSocket.on('connect', () => {
        newSocket.emit('subscribeUnit', user.unitId);
      });

      newSocket.on('tripUpdate', (data: any) => {
        if (data.action === 'CREATED') {
          setLiveTrips(prev => [data.trip, ...prev].slice(0, 5));
        } else if (data.action === 'UPDATED') {
          setLiveTrips(prev => prev.map(t => t.id === data.trip.id ? data.trip : t));
        }
      });

      fetchRecentTrips();

      return () => { newSocket.close(); };
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get(`/api/reports/dashboard-stats?unitId=${user!.unitId}`);
      setStats(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchRecentTrips = async () => {
    try {
      const res = await api.get(`/api/trips?unitId=${user!.unitId}`);
      setLiveTrips(res.data.slice(0, 5));
    } catch (err) { console.error(err); }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.name} 👋
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI Cards */}
        <div className="overflow-hidden rounded-lg bg-white shadow p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0"><ShoppingCart className="h-6 w-6 text-indigo-600" /></div>
            <div className="ml-5 w-0 flex-1"><dl><dt className="text-sm font-medium text-gray-500 truncate">Today's Orders</dt><dd className="text-3xl font-semibold text-gray-900">{stats?.todayOrders || 0}</dd></dl></div>
          </div>
        </div>
        
        <div className="overflow-hidden rounded-lg bg-white shadow p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0"><Scale className="h-6 w-6 text-green-600" /></div>
            <div className="ml-5 w-0 flex-1"><dl><dt className="text-sm font-medium text-gray-500 truncate">Weighbridge Hits</dt><dd className="text-3xl font-semibold text-gray-900">{stats?.todayWeighbridgeEntries || 0}</dd></dl></div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0"><Package className="h-6 w-6 text-orange-600" /></div>
            <div className="ml-5 w-0 flex-1"><dl><dt className="text-sm font-medium text-gray-500 truncate">Production (TON)</dt><dd className="text-3xl font-semibold text-gray-900">{stats?.todayProduction || 0}</dd></dl></div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0"><Activity className="h-6 w-6 text-purple-600" /></div>
            <div className="ml-5 w-0 flex-1"><dl><dt className="text-sm font-medium text-gray-500 truncate">Collections (₹)</dt><dd className="text-3xl font-semibold text-gray-900">{stats?.todayCollections.toLocaleString() || 0}</dd></dl></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Trips Feed */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            Live Dispatch Feed
          </h3>
          <div className="space-y-4">
            {liveTrips.length === 0 ? <p className="text-gray-500 text-sm">No recent trips.</p> : liveTrips.map(trip => (
              <div key={trip.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded border border-gray-100">
                <div className={`p-2 rounded-full ${trip.status === 'LOADING' ? 'bg-gray-200 text-gray-600' : trip.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                  <Truck className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Trip #{trip.tripNumber} • {trip.vehicle.vehicleNumber}</p>
                  <p className="text-xs text-gray-500">To: {trip.order.deliveryLocation}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trip.status === 'LOADING' ? 'bg-gray-200 text-gray-700' : trip.status === 'IN_TRANSIT' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'}`}>
                  {trip.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <a href="/dashboard/orders" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex flex-col items-center justify-center text-center">
              <ShoppingCart className="h-6 w-6 text-indigo-500 mb-2" />
              <span className="text-sm font-medium text-gray-900">New Order</span>
            </a>
            <a href="/dashboard/weighbridge" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex flex-col items-center justify-center text-center">
              <Scale className="h-6 w-6 text-green-500 mb-2" />
              <span className="text-sm font-medium text-gray-900">Weighbridge Entry</span>
            </a>
            <a href="/dashboard/production" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex flex-col items-center justify-center text-center">
              <Package className="h-6 w-6 text-orange-500 mb-2" />
              <span className="text-sm font-medium text-gray-900">Log Production</span>
            </a>
            <a href="/dashboard/customers" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex flex-col items-center justify-center text-center">
              <Users className="h-6 w-6 text-blue-500 mb-2" />
              <span className="text-sm font-medium text-gray-900">Add Customer</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
