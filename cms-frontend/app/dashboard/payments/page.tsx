'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import api from '@/lib/api';
import { DollarSign, Download } from 'lucide-react';

export default function PaymentsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'customers' | 'vendors' | 'drivers'>('customers');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.unitId) fetchData();
  }, [user, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/payments/${activeTab}?unitId=${user!.unitId}`);
      setData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (!user || user.role !== 'OWNER') return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-green-600" /> Payments Central
        </h2>
        <button className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Download className="mr-2 h-4 w-4" /> Export Report
        </button>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['customers', 'vendors', 'drivers'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`${activeTab === tab ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
            >
              {tab} Payments
            </button>
          ))}
        </nav>
      </div>

      {loading ? <p className="text-gray-500">Loading {activeTab} payments...</p> : data.length === 0 ? (
        <div className="rounded-lg bg-white p-12 shadow text-center"><p className="text-gray-500">No {activeTab} payment records found.</p></div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{activeTab === 'customers' ? 'Customer' : activeTab === 'vendors' ? 'Vendor' : 'Driver'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(p.date || p.createdAt || Date.now()).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {activeTab === 'customers' ? p.customer?.name : activeTab === 'vendors' ? p.vendor?.name : p.driver?.name}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${activeTab === 'customers' ? 'text-green-600' : 'text-red-600'}`}>
                    {activeTab === 'customers' ? '+' : '-'}₹{(p.amount || p.earningAmount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{p.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
