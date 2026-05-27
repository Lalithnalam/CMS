'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import api from '@/lib/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description?: string;
  unitType: string;
  pricePerUnit: number;
  stock?: { quantity: number; lowStockThreshold: number };
}

export default function ProductsPage() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', unitType: 'TON', pricePerUnit: 0 });

  useEffect(() => {
    if (user?.unitId) fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    try {
      const res = await api.get(`/api/products?unitId=${user!.unitId}`);
      setProducts(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/products/${editingId}`, formData);
      } else {
        await api.post('/api/products', { ...formData, unitId: user!.unitId });
      }
      resetForm();
      fetchProducts();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (p: Product) => {
    setFormData({ name: p.name, description: p.description || '', unitType: p.unitType, pricePerUnit: p.pricePerUnit });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try { await api.delete(`/api/products/${id}`); fetchProducts(); } catch (err) { console.error(err); }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', unitType: 'TON', pricePerUnit: 0 });
    setEditingId(null);
    setShowForm(false);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Products & Stock</h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" /> {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Product' : 'Add Product'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Type</label>
              <select value={formData.unitType} onChange={(e) => setFormData({ ...formData, unitType: e.target.value })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option value="TON">TON</option>
                <option value="LOAD">LOAD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Unit (₹)</label>
              <input type="number" value={formData.pricePerUnit} onChange={(e) => setFormData({ ...formData, pricePerUnit: parseFloat(e.target.value) })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">{editingId ? 'Update' : 'Create'}</button>
              <button type="button" onClick={resetForm} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading products...</p>
      ) : products.length === 0 ? (
        <div className="rounded-lg bg-white p-12 shadow text-center"><p className="text-gray-500">No products yet. Add your first product!</p></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div key={p.id} className="rounded-lg bg-white p-5 shadow hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-semibold text-gray-900">{p.name}</h4>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(p)} className="text-indigo-600 hover:text-indigo-800"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <p className="text-sm text-gray-500">{p.description || 'No description'}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-lg font-bold text-indigo-600">₹{p.pricePerUnit}/{p.unitType}</span>
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  (p.stock?.quantity || 0) <= (p.stock?.lowStockThreshold || 10) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  Stock: {p.stock?.quantity || 0} {p.unitType}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
