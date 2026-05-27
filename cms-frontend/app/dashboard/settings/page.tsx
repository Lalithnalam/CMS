'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import api from '@/lib/api';
import { Plus, Pencil, Trash2, ShieldCheck, Cog } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  phone: string;
  role: string;
  isActive: boolean;
}

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [usersList, setUsersList] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', password: '', role: 'STAFF', isActive: true });

  useEffect(() => { if (user?.unitId) fetchUsers(); }, [user]);

  const fetchUsers = async () => {
    try { const res = await api.get(`/api/users?unitId=${user!.unitId}`); setUsersList(res.data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) { await api.put(`/api/users/${editingId}`, formData); }
      else { await api.post('/api/users', { ...formData, unitId: user!.unitId }); }
      resetForm(); fetchUsers();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (u: UserData) => {
    setFormData({ name: u.name, phone: u.phone, password: '', role: u.role, isActive: u.isActive });
    setEditingId(u.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff account?')) return;
    try { await api.delete(`/api/users/${id}`); fetchUsers(); } catch (err) { console.error(err); }
  };

  const resetForm = () => { setFormData({ name: '', phone: '', password: '', role: 'STAFF', isActive: true }); setEditingId(null); setShowForm(false); };

  if (!user || user.role !== 'OWNER') return (
    <div className="p-8 text-center text-gray-500">You do not have permission to view this page.</div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Cog className="h-6 w-6 text-gray-600" /> Admin Settings
        </h2>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" /> Staff Accounts Management
            </h3>
            <p className="text-sm text-gray-500 mt-1">Add or remove staff accounts. Only Owners can manage accounts.</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            <Plus className="mr-2 h-4 w-4" /> {showForm ? 'Cancel' : 'Add Staff Account'}
          </button>
        </div>

        {showForm && (
          <div className="rounded-lg bg-gray-50 p-6 border border-gray-200 mb-6">
            <h3 className="text-md font-semibold mb-4">{editingId ? 'Edit Staff Account' : 'Create New Staff Account'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Login ID)</label><input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Password {editingId && <span className="text-xs text-gray-400">(Leave blank to keep current)</span>}</label><input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required={!editingId} minLength={6} /></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Permissions</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                  <option value="STAFF">STAFF (Limited access)</option>
                  <option value="OWNER">OWNER (Full admin access)</option>
                </select>
              </div>
              <div className="sm:col-span-2 flex gap-3 mt-2">
                <button type="submit" className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700">{editingId ? 'Update Account' : 'Create Account'}</button>
                <button type="button" onClick={resetForm} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? <p className="text-gray-500 p-4">Loading accounts...</p> : usersList.length === 0 ? (
          <div className="p-12 text-center border rounded-lg bg-gray-50"><p className="text-gray-500">No staff accounts found.</p></div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Login Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name} {user.id === u.id && <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full ml-2">You</span>}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'OWNER' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${u.isActive ? 'bg-green-600' : 'bg-red-600'}`}></span>
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {u.id !== user.id && (
                        <div className="flex justify-end gap-3">
                          <button onClick={() => handleEdit(u)} className="text-indigo-600 hover:text-indigo-900 font-medium flex items-center gap-1"><Pencil className="h-3 w-3" /> Edit</button>
                          <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-900 font-medium flex items-center gap-1"><Trash2 className="h-3 w-3" /> Remove</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
