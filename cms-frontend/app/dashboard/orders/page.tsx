'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import api from '@/lib/api';
import { Plus, Eye, Trash2, ChevronDown } from 'lucide-react';

interface OrderItem {
  id: string;
  productId: string;
  product: { name: string };
  quantity: number;
  rate: number;
  amount: number;
}

interface Order {
  id: string;
  customer: { name: string; phone: string };
  status: string;
  deliveryLocation: string;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
}

interface Product {
  id: string;
  name: string;
  pricePerUnit: number;
}

export default function OrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    customerId: '',
    deliveryLocation: '',
    notes: '',
  });
  const [orderItems, setOrderItems] = useState<{ productId: string; quantity: number; rate: number }[]>([
    { productId: '', quantity: 0, rate: 0 },
  ]);

  useEffect(() => {
    if (user?.unitId) {
      fetchOrders();
      fetchCustomers();
      fetchProducts();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/api/orders?unitId=${user!.unitId}`);
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get(`/api/customers?unitId=${user!.unitId}`);
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get(`/api/products?unitId=${user!.unitId}`);
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/orders', {
        ...formData,
        unitId: user!.unitId,
        items: orderItems.filter((i) => i.productId && i.quantity > 0),
      });
      setShowForm(false);
      setFormData({ customerId: '', deliveryLocation: '', notes: '' });
      setOrderItems([{ productId: '', quantity: 0, rate: 0 }]);
      fetchOrders();
    } catch (err) {
      console.error('Failed to create order', err);
    }
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await api.put(`/api/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      await api.delete(`/api/orders/${orderId}`);
      fetchOrders();
    } catch (err) {
      console.error('Failed to delete order', err);
    }
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, { productId: '', quantity: 0, rate: 0 }]);
  };

  const updateOrderItem = (index: number, field: string, value: any) => {
    const updated = [...orderItems];
    (updated[index] as any)[field] = value;
    if (field === 'productId') {
      const product = products.find((p) => p.id === value);
      if (product) updated[index].rate = product.pricePerUnit;
    }
    setOrderItems(updated);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'DISPATCHED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'PAID': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusFlow = ['PENDING', 'CONFIRMED', 'DISPATCHED', 'DELIVERED', 'PAID'];

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </button>
      </div>

      {/* Create Order Form */}
      {showForm && (
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Create New Order</h3>
          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Location</label>
                <input
                  type="text"
                  value={formData.deliveryLocation}
                  onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Order Items */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order Items</label>
              {orderItems.map((item, index) => (
                <div key={index} className="flex gap-3 mb-2">
                  <select
                    value={item.productId}
                    onChange={(e) => updateOrderItem(index, 'productId', e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} (₹{p.pricePerUnit}/unit)</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity || ''}
                    onChange={(e) => updateOrderItem(index, 'quantity', parseFloat(e.target.value))}
                    className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Rate"
                    value={item.rate || ''}
                    onChange={(e) => updateOrderItem(index, 'rate', parseFloat(e.target.value))}
                    className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm"
                    required
                  />
                  <span className="flex items-center text-sm text-gray-600 w-24">
                    ₹{((item.quantity || 0) * (item.rate || 0)).toFixed(0)}
                  </span>
                </div>
              ))}
              <button type="button" onClick={addOrderItem} className="text-sm text-indigo-600 hover:text-indigo-800">
                + Add Item
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                rows={2}
              />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                Create Order
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <p className="text-gray-500">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="rounded-lg bg-white p-12 shadow text-center">
          <p className="text-gray-500">No orders yet. Create your first order!</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                    <div className="text-xs text-gray-500">{order.customer.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {order.items.map((i) => `${i.product.name} x${i.quantity}`).join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{order.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      {/* Status dropdown */}
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className="rounded border border-gray-300 px-2 py-1 text-xs"
                      >
                        {statusFlow.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
