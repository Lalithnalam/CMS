'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import api from '@/lib/api';
import { Plus } from 'lucide-react';

interface WeighbridgeEntry {
  id: string;
  shift: string;
  vehicleNumber: string;
  driverName: string;
  product: { name: string };
  weight: number;
  rate: number;
  materialAmount: number;
  transportCharge: number;
  gst: number;
  paymentType: string;
  date: string;
}

export default function WeighbridgePage() {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<WeighbridgeEntry[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    shift: 'MORNING', vehicleNumber: '', driverName: '', productId: '',
    weight: 0, rate: 0, transportCharge: 0, gst: 0, paymentType: 'CASH',
  });

  useEffect(() => {
    if (user?.unitId) { fetchEntries(); fetchProducts(); }
  }, [user, selectedDate]);

  const fetchEntries = async () => {
    try {
      const res = await api.get(`/api/weighbridge?unitId=${user!.unitId}&date=${selectedDate}`);
      setEntries(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get(`/api/products?unitId=${user!.unitId}`);
      setProducts(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/weighbridge', { ...formData, unitId: user!.unitId });
      setShowForm(false);
      setFormData({ shift: 'MORNING', vehicleNumber: '', driverName: '', productId: '', weight: 0, rate: 0, transportCharge: 0, gst: 0, paymentType: 'CASH' });
      fetchEntries();
    } catch (err) { console.error(err); }
  };

  const totalWeight = entries.reduce((s, e) => s + e.weight, 0);
  const totalAmount = entries.reduce((s, e) => s + e.materialAmount, 0);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Weighbridge</h2>
        <div className="flex items-center gap-3">
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
          <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            <Plus className="mr-2 h-4 w-4" /> New Entry
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-5 shadow"><p className="text-sm text-gray-500">Total Entries</p><p className="text-2xl font-bold text-gray-900">{entries.length}</p></div>
        <div className="rounded-lg bg-white p-5 shadow"><p className="text-sm text-gray-500">Total Weight</p><p className="text-2xl font-bold text-gray-900">{totalWeight.toFixed(1)} TON</p></div>
        <div className="rounded-lg bg-white p-5 shadow"><p className="text-sm text-gray-500">Total Amount</p><p className="text-2xl font-bold text-green-600">₹{totalAmount.toLocaleString()}</p></div>
      </div>

      {showForm && (
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">New Weighbridge Entry</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
              <select value={formData.shift} onChange={(e) => setFormData({ ...formData, shift: e.target.value })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option value="MORNING">MORNING</option><option value="AFTERNOON">AFTERNOON</option><option value="NIGHT">NIGHT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
              <input type="text" value={formData.vehicleNumber} onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
              <input type="text" value={formData.driverName} onChange={(e) => setFormData({ ...formData, driverName: e.target.value })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
              <select value={formData.productId} onChange={(e) => { const p = products.find((x: any) => x.id === e.target.value); setFormData({ ...formData, productId: e.target.value, rate: p?.pricePerUnit || 0 }); }} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required>
                <option value="">Select Product</option>
                {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (TON)</label>
              <input type="number" step="0.01" value={formData.weight || ''} onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rate (₹)</label>
              <input type="number" value={formData.rate || ''} onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transport Charge</label>
              <input type="number" value={formData.transportCharge || ''} onChange={(e) => setFormData({ ...formData, transportCharge: parseFloat(e.target.value) })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
              <select value={formData.paymentType} onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option value="CASH">CASH</option><option value="BANK_TRANSFER">BANK TRANSFER</option><option value="CREDIT">CREDIT</option>
              </select>
            </div>
            <div className="flex items-end">
              <p className="text-lg font-bold text-green-600">Total: ₹{((formData.weight || 0) * (formData.rate || 0)).toLocaleString()}</p>
            </div>
            <div className="sm:col-span-3 flex gap-3">
              <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Save Entry</button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <p className="text-gray-500">Loading...</p> : entries.length === 0 ? (
        <div className="rounded-lg bg-white p-12 shadow text-center"><p className="text-gray-500">No entries for {selectedDate}</p></div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{e.shift}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{e.vehicleNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{e.driverName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{e.product.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{e.weight} T</td>
                  <td className="px-4 py-3 text-sm text-gray-600">₹{e.rate}</td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600">₹{e.materialAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm"><span className="rounded-full bg-gray-100 px-2 py-1 text-xs">{e.paymentType}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
