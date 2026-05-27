'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import api from '@/lib/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  creditLimit: number;
  isActive: boolean;
  createdAt: string;
}

export default function CustomersPage() {
  const { user } = useAuthStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', creditLimit: 0 });

  useEffect(() => {
    if (user?.unitId) fetchCustomers();
  }, [user]);

  const fetchCustomers = async () => {
    try {
      const res = await api.get(`/api/customers?unitId=${user!.unitId}`);
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/customers/${editingId}`, formData);
      } else {
        await api.post('/api/customers', { ...formData, unitId: user!.unitId });
      }
      resetForm();
      fetchCustomers();
    } catch (err) {
      console.error('Failed to save customer', err);
    }
  };

  const handleEdit = (customer: Customer) => {
    setFormData({ name: customer.name, phone: customer.phone, address: customer.address, creditLimit: customer.creditLimit });
    setEditingId(customer.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this customer?')) return;
    try {
      await api.delete(`/api/customers/${id}`);
      fetchCustomers();
    } catch (err) {
      console.error('Failed to delete customer', err);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', phone: '', address: '', creditLimit: 0 });
    setEditingId(null);
    setShowForm(false);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
          <Plus className="mr-2 h-4 w-4" /> {showForm ? 'Cancel' : 'Add Customer'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Customer' : 'Add New Customer'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit (₹)</label>
              <input type="number" value={formData.creditLimit} onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">{editingId ? 'Update' : 'Create'}</button>
              <button type="button" onClick={resetForm} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading customers...</p>
      ) : customers.length === 0 ? (
        <div className="rounded-lg bg-white p-12 shadow text-center">
          <p className="text-gray-500">No customers yet. Add your first customer!</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credit Limit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{c.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">₹{c.creditLimit.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(c)} className="text-indigo-600 hover:text-indigo-800"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4" /></button>
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
