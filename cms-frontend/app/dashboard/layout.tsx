'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';
import {
  LogOut, Home, ShoppingCart, Users, Box, Truck, Car, Package,
  Activity, Video, Scale, DollarSign, Factory, Store
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, logout } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  // Wait for Zustand to hydrate from localStorage before doing anything
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && (!token || !user)) {
      router.push('/auth/login');
    }
  }, [hydrated, token, user, router]);

  // Don't render anything until hydration is complete
  if (!hydrated) return null;
  if (!user || !token) return null;

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: Home, roles: ['OWNER', 'STAFF'] },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart, roles: ['OWNER', 'STAFF'] },
    { name: 'Customers', href: '/dashboard/customers', icon: Users, roles: ['OWNER', 'STAFF'] },
    { name: 'Products', href: '/dashboard/products', icon: Box, roles: ['OWNER', 'STAFF'] },
    { name: 'Weighbridge', href: '/dashboard/weighbridge', icon: Scale, roles: ['OWNER', 'STAFF'] },
    { name: 'Trips (Live)', href: '/dashboard/trips', icon: Truck, roles: ['OWNER', 'STAFF'] },
    { name: 'Vehicles', href: '/dashboard/vehicles', icon: Car, roles: ['OWNER', 'STAFF'] },
    { name: 'Drivers', href: '/dashboard/drivers', icon: Package, roles: ['OWNER', 'STAFF'] },
    { name: 'Vendors', href: '/dashboard/vendors', icon: Store, roles: ['OWNER'] },
    { name: 'Production', href: '/dashboard/production', icon: Factory, roles: ['OWNER', 'STAFF'] },
    { name: 'Payments', href: '/dashboard/payments', icon: DollarSign, roles: ['OWNER'] },
    { name: 'Reports', href: '/dashboard/reports', icon: Activity, roles: ['OWNER'] },
    { name: 'Cameras', href: '/dashboard/cameras', icon: Video, roles: ['OWNER', 'STAFF'] },
    { name: 'Settings', href: '/dashboard/settings', icon: Users, roles: ['OWNER'] },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="h-16 flex items-center px-6 font-bold text-xl border-b border-gray-800">
          CMS Admin
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {navItems
              .filter((item) => item.roles.includes(user.role))
              .map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || 
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center mb-4 px-2">
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-400">{user.role} • {user.unitName}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 z-10">
          <h1 className="text-xl font-semibold text-gray-800">
            {user.unitName || 'Crusher Unit'}
          </h1>
          <div className="flex items-center space-x-4">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500">
              <span className="text-sm font-medium leading-none text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
