'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import api from '@/lib/api';
import { Truck, MapPin, CheckCircle2, Clock } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

export default function TripsPage() {
  const { user } = useAuthStore();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (user?.unitId) {
      fetchTrips();
      // Initialize Socket
      const newSocket = io('http://localhost:5000/trips');
      setSocket(newSocket);
      
      newSocket.on('connect', () => {
        newSocket.emit('subscribeUnit', user.unitId);
      });

      newSocket.on('tripUpdate', (data: any) => {
        console.log('Real-time trip update:', data);
        if (data.action === 'CREATED') {
          setTrips(prev => [data.trip, ...prev]);
        } else if (data.action === 'UPDATED') {
          setTrips(prev => prev.map(t => t.id === data.trip.id ? data.trip : t));
        }
      });

      return () => { newSocket.close(); };
    }
  }, [user]);

  const fetchTrips = async () => {
    try {
      const res = await api.get(`/api/trips?unitId=${user!.unitId}`);
      setTrips(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const updateTripStatus = async (id: string, status: string) => {
    try {
      await api.put(`/api/trips/${id}/status`, { status });
      // The socket event will update the UI for all connected clients, including this one.
    } catch (err) { console.error(err); }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Truck className="h-6 w-6 text-indigo-600" /> Live Dispatch & Trips
          <span className="relative flex h-3 w-3 ml-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        </h2>
      </div>

      {loading ? <p className="text-gray-500">Loading live trips...</p> : trips.length === 0 ? (
        <div className="rounded-lg bg-white p-12 shadow text-center"><p className="text-gray-500">No active trips found.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className={`px-4 py-3 border-b border-gray-100 flex justify-between items-center ${trip.status === 'DELIVERED' ? 'bg-green-50' : trip.status === 'IN_TRANSIT' ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <span className="font-bold text-gray-800">Trip #{trip.tripNumber}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  trip.status === 'LOADING' ? 'bg-gray-200 text-gray-700' :
                  trip.status === 'IN_TRANSIT' ? 'bg-blue-200 text-blue-800' :
                  'bg-green-200 text-green-800'
                }`}>
                  {trip.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Vehicle</p>
                  <p className="text-sm font-medium text-gray-900">{trip.vehicle.vehicleNumber}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Driver</p>
                  <p className="text-sm font-medium text-gray-900">{trip.driver.name}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Destination</p>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]" title={trip.order.deliveryLocation}>{trip.order.deliveryLocation}</p>
                </div>
                
                <div className="pt-3 border-t border-gray-100 flex justify-between gap-2 mt-4">
                  {trip.status === 'LOADING' && (
                    <button onClick={() => updateTripStatus(trip.id, 'IN_TRANSIT')} className="w-full flex items-center justify-center gap-1 bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                      <Truck className="h-4 w-4" /> Dispatch
                    </button>
                  )}
                  {trip.status === 'IN_TRANSIT' && (
                    <button onClick={() => updateTripStatus(trip.id, 'DELIVERED')} className="w-full flex items-center justify-center gap-1 bg-green-600 text-white py-2 rounded-md text-sm font-medium hover:bg-green-700">
                      <CheckCircle2 className="h-4 w-4" /> Mark Delivered
                    </button>
                  )}
                  {trip.status === 'DELIVERED' && (
                    <div className="w-full flex items-center justify-center gap-1 text-gray-500 py-2 text-sm font-medium">
                      <Clock className="h-4 w-4" /> Delivered at {new Date(trip.deliveredAt).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
