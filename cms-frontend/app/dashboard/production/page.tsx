'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import api from '@/lib/api';
import { Plus, Factory, Package } from 'lucide-react';

interface ProductionBatch {
  id: string;
  shift: string;
  rawMaterialUsed: number;
  wastage: number;
  notes: string;
  date: string;
  outputs: { productId: string; quantityProduced: number; product: { name: string } }[];
}

export default function ProductionPage() {
  const { user } = useAuthStore();
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({ shift: 'MORNING', rawMaterialUsed: 0, notes: '' });
  const [outputs, setOutputs] = useState<{ productId: string; quantityProduced: number }[]>([{ productId: '', quantityProduced: 0 }]);

  useEffect(() => {
    if (user?.unitId) {
      fetchBatches();
      fetchProducts();
    }
  }, [user]);

  const fetchBatches = async () => {
    try {
      const res = await api.get(`/api/production?unitId=${user!.unitId}`);
      setBatches(res.data);
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
      await api.post('/api/production', {
        ...formData,
        unitId: user!.unitId,
        outputs: outputs.filter(o => o.productId && o.quantityProduced > 0),
      });
      setShowForm(false);
      setFormData({ shift: 'MORNING', rawMaterialUsed: 0, notes: '' });
      setOutputs([{ productId: '', quantityProduced: 0 }]);
      fetchBatches();
    } catch (err) { console.error(err); }
  };

  const addOutput = () => setOutputs([...outputs, { productId: '', quantityProduced: 0 }]);
  const updateOutput = (idx: number, field: string, val: any) => {
    const newOutputs = [...outputs];
    (newOutputs[idx] as any)[field] = val;
    setOutputs(newOutputs);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Production Batches</h2>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" /> {showForm ? 'Cancel' : 'New Batch'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg bg-white p-6 shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Factory className="h-5 w-5 text-gray-500"/> Start Production Batch</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
                <select value={formData.shift} onChange={(e) => setFormData({ ...formData, shift: e.target.value })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required>
                  <option value="MORNING">MORNING</option><option value="AFTERNOON">AFTERNOON</option><option value="NIGHT">NIGHT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Raw Material Used (TONs)</label>
                <input type="number" step="0.01" value={formData.rawMaterialUsed || ''} onChange={(e) => setFormData({ ...formData, rawMaterialUsed: parseFloat(e.target.value) })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required />
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2"><Package className="h-4 w-4"/> Finished Goods Produced</label>
              {outputs.map((out, idx) => (
                <div key={idx} className="flex gap-3 mb-3">
                  <select value={out.productId} onChange={(e) => updateOutput(idx, 'productId', e.target.value)} className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm" required>
                    <option value="">Select Product...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input type="number" step="0.01" placeholder="Qty Produced" value={out.quantityProduced || ''} onChange={(e) => updateOutput(idx, 'quantityProduced', parseFloat(e.target.value))} className="w-40 rounded-md border border-gray-300 px-3 py-2 text-sm" required />
                </div>
              ))}
              <button type="button" onClick={addOutput} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">+ Add Another Output</button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" rows={2}></textarea>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Save Batch & Update Stock</button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <p className="text-gray-500">Loading batches...</p> : batches.length === 0 ? (
        <div className="rounded-lg bg-white p-12 shadow text-center"><p className="text-gray-500">No production batches recorded yet.</p></div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Shift</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Input Material</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Finished Output</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wastage (Dust)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{new Date(b.date).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">{b.shift} Shift</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                    {b.rawMaterialUsed} T
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <ul className="list-disc pl-4">
                      {b.outputs.map((o, i) => (
                        <li key={i}>{o.product.name}: <span className="font-medium text-gray-900">{o.quantityProduced} T</span></li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="text-red-500 font-medium">{b.wastage.toFixed(2)} T</span>
                    <span className="text-xs ml-1">({((b.wastage / b.rawMaterialUsed) * 100).toFixed(1)}%)</span>
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
