'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import api from '@/lib/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Vehicle {
  id: string; vehicleNumber: string; vehicleType: string; capacity: number;
  status: string; ownershipType: string; rentalRate?: number;
  driver?: { name: string }; isActive: boolean;
}

export default function VehiclesPage() {
  const { user } = useAuthStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ vehicleNumber: '', vehicleType: 'Truck', capacity: 0, ownershipType: 'OWNED', rentalRate: 0 });

  useEffect(() => { if (user?.unitId) fetchVehicles(); }, [user]);

  const fetchVehicles = async () => {
    try { const res = await api.get(`/api/vehicles?unitId=${user!.unitId}`); setVehicles(res.data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) { await api.put(`/api/vehicles/${editingId}`, formData); }
      else { await api.post('/api/vehicles', { ...formData, unitId: user!.unitId }); }
      resetForm(); fetchVehicles();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (v: Vehicle) => {
    setFormData({ vehicleNumber: v.vehicleNumber, vehicleType: v.vehicleType, capacity: v.capacity, ownershipType: v.ownershipType, rentalRate: v.rentalRate || 0 });
    setEditingId(v.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this vehicle?')) return;
    try { await api.delete(`/api/vehicles/${id}`); fetchVehicles(); } catch (err) { console.error(err); }
  };

  const resetForm = () => { setFormData({ vehicleNumber: '', vehicleType: 'Truck', capacity: 0, ownershipType: 'OWNED', rentalRate: 0 }); setEditingId(null); setShowForm(false); };

  const getStatusColor = (s: string) => {
    switch (s) { case 'AVAILABLE': return 'bg-green-100 text-green-800'; case 'ON_TRIP': return 'bg-blue-100 text-blue-800'; case 'MAINTENANCE': return 'bg-red-100 text-red-800'; default: return 'bg-gray-100 text-gray-800'; }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Vehicles</h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" /> {showForm ? 'Cancel' : 'Add Vehicle'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Vehicle' : 'Add Vehicle'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label><input type="text" value={formData.vehicleNumber} onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label><input type="text" value={formData.vehicleType} onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Capacity (TON)</label><input type="number" value={formData.capacity || ''} onChange={(e) => setFormData({ ...formData, capacity: parseFloat(e.target.value) })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Ownership</label>
              <select value={formData.ownershipType} onChange={(e) => setFormData({ ...formData, ownershipType: e.target.value })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option value="OWNED">OWNED</option><option value="RENTAL">RENTAL</option>
              </select>
            </div>
            {formData.ownershipType === 'RENTAL' && (
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Rental Rate (₹)</label><input type="number" value={formData.rentalRate || ''} onChange={(e) => setFormData({ ...formData, rentalRate: parseFloat(e.target.value) })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" /></div>
            )}
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">{editingId ? 'Update' : 'Create'}</button>
              <button type="button" onClick={resetForm} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <p className="text-gray-500">Loading...</p> : vehicles.length === 0 ? (
        <div className="rounded-lg bg-white p-12 shadow text-center"><p className="text-gray-500">No vehicles yet.</p></div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ownership</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{v.vehicleNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{v.vehicleType}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{v.capacity} T</td>
                  <td className="px-6 py-4"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(v.status)}`}>{v.status}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-600">{v.ownershipType}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{v.driver?.name || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(v)} className="text-indigo-600 hover:text-indigo-800"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(v.id)} className="text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4" /></button>
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
