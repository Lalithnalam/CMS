'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import api from '@/lib/api';
import { Plus, Pencil, Trash2, ArrowRightLeft } from 'lucide-react';

interface Vendor {
  id: string; name: string; phone: string; quarryLocation: string; materialType: string; purchaseRate: number; paymentTerms: string;
}

export default function VendorsPage() {
  const { user } = useAuthStore();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', quarryLocation: '', materialType: 'Raw Stone', purchaseRate: 0, paymentTerms: 'Net 30' });
  
  const [ledgerVendor, setLedgerVendor] = useState<string | null>(null);
  const [ledgerData, setLedgerData] = useState<any>(null);

  useEffect(() => { if (user?.unitId) fetchVendors(); }, [user]);

  const fetchVendors = async () => {
    try { const res = await api.get(`/api/vendors?unitId=${user!.unitId}`); setVendors(res.data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchLedger = async (vendorId: string) => {
    try {
      const res = await api.get(`/api/vendors/${vendorId}/ledger`);
      setLedgerData(res.data);
      setLedgerVendor(vendorId);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) { await api.put(`/api/vendors/${editingId}`, formData); }
      else { await api.post('/api/vendors', { ...formData, unitId: user!.unitId }); }
      resetForm(); fetchVendors();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (v: Vendor) => {
    setFormData({ name: v.name, phone: v.phone, quarryLocation: v.quarryLocation, materialType: v.materialType, purchaseRate: v.purchaseRate, paymentTerms: v.paymentTerms || '' });
    setEditingId(v.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this vendor?')) return;
    try { await api.delete(`/api/vendors/${id}`); fetchVendors(); } catch (err) { console.error(err); }
  };

  const resetForm = () => { setFormData({ name: '', phone: '', quarryLocation: '', materialType: 'Raw Stone', purchaseRate: 0, paymentTerms: 'Net 30' }); setEditingId(null); setShowForm(false); };

  if (!user || user.role !== 'OWNER') return (
    <div className="p-8 text-center text-gray-500">You do not have permission to view this page.</div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Vendors</h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm); setLedgerVendor(null); }} className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" /> {showForm ? 'Cancel' : 'Add Vendor'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Vendor' : 'Add Vendor'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Quarry Location</label><input type="text" value={formData.quarryLocation} onChange={(e) => setFormData({ ...formData, quarryLocation: e.target.value })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Material Type</label><input type="text" value={formData.materialType} onChange={(e) => setFormData({ ...formData, materialType: e.target.value })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Purchase Rate (₹)</label><input type="number" value={formData.purchaseRate || ''} onChange={(e) => setFormData({ ...formData, purchaseRate: parseFloat(e.target.value) })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label><input type="text" value={formData.paymentTerms} onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" /></div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">{editingId ? 'Update' : 'Create'}</button>
              <button type="button" onClick={resetForm} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {ledgerVendor && ledgerData && (
        <div className="rounded-lg bg-white p-6 shadow-md mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Ledger: {vendors.find(v => v.id === ledgerVendor)?.name}</h3>
            <button onClick={() => setLedgerVendor(null)} className="text-gray-500 hover:text-gray-700">Close</button>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded"><p className="text-sm text-gray-500">Total Purchased</p><p className="text-lg font-semibold">₹{ledgerData.totalPurchased.toLocaleString()}</p></div>
            <div className="p-4 bg-gray-50 rounded"><p className="text-sm text-gray-500">Total Paid</p><p className="text-lg font-semibold text-green-600">₹{ledgerData.totalPaid.toLocaleString()}</p></div>
            <div className="p-4 bg-gray-50 rounded border-2 border-indigo-100"><p className="text-sm text-gray-500">Balance Due</p><p className="text-lg font-semibold text-red-600">₹{ledgerData.balance.toLocaleString()}</p></div>
          </div>
          <p className="text-sm text-gray-500 mb-2">Recent Transactions (Purchases & Payments combined view logic would go here)</p>
        </div>
      )}

      {loading ? <p className="text-gray-500">Loading...</p> : vendors.length === 0 ? (
        <div className="rounded-lg bg-white p-12 shadow text-center"><p className="text-gray-500">No vendors yet.</p></div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Terms</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vendors.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{v.name}</div>
                    <div className="text-xs text-gray-500">{v.phone} • {v.quarryLocation}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{v.materialType}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{v.purchaseRate}/T</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{v.paymentTerms}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-3">
                      <button onClick={() => fetchLedger(v.id)} className="text-blue-600 hover:text-blue-800" title="View Ledger"><ArrowRightLeft className="h-4 w-4" /></button>
                      <button onClick={() => handleEdit(v)} className="text-indigo-600 hover:text-indigo-800" title="Edit"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(v.id)} className="text-red-600 hover:text-red-800" title="Delete"><Trash2 className="h-4 w-4" /></button>
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
