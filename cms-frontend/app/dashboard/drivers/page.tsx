'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import api from '@/lib/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Driver {
  id: string; name: string; phone: string; paymentType: string; rate: number; isActive: boolean;
  vehicle?: { vehicleNumber: string }[];
}

export default function DriversPage() {
  const { user } = useAuthStore();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', paymentType: 'TRIP_BASED', rate: 0 });

  useEffect(() => { if (user?.unitId) fetchDrivers(); }, [user]);

  const fetchDrivers = async () => {
    try { const res = await api.get(`/api/drivers?unitId=${user!.unitId}`); setDrivers(res.data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) { await api.put(`/api/drivers/${editingId}`, formData); }
      else { await api.post('/api/drivers', { ...formData, unitId: user!.unitId }); }
      resetForm(); fetchDrivers();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (d: Driver) => {
    setFormData({ name: d.name, phone: d.phone, paymentType: d.paymentType, rate: d.rate });
    setEditingId(d.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this driver?')) return;
    try { await api.delete(`/api/drivers/${id}`); fetchDrivers(); } catch (err) { console.error(err); }
  };

  const resetForm = () => { setFormData({ name: '', phone: '', paymentType: 'TRIP_BASED', rate: 0 }); setEditingId(null); setShowForm(false); };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Drivers</h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" /> {showForm ? 'Cancel' : 'Add Driver'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Driver' : 'Add Driver'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
              <select value={formData.paymentType} onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option value="TRIP_BASED">Trip Based</option><option value="WEEKLY">Weekly</option><option value="MONTHLY">Monthly</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Rate (₹)</label><input type="number" value={formData.rate || ''} onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required /></div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">{editingId ? 'Update' : 'Create'}</button>
              <button type="button" onClick={resetForm} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <p className="text-gray-500">Loading...</p> : drivers.length === 0 ? (
        <div className="rounded-lg bg-white p-12 shadow text-center"><p className="text-gray-500">No drivers yet.</p></div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {drivers.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{d.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{d.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{d.paymentType}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">₹{d.rate}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{d.vehicle?.map((v) => v.vehicleNumber).join(', ') || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(d)} className="text-indigo-600 hover:text-indigo-800"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(d.id)} className="text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
