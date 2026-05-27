'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { Video, Maximize2 } from 'lucide-react';
import Hls from 'hls.js';

// Mock cameras list
const CAMERAS = [
  { id: 'cam1', name: 'Weighbridge Entry', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
  { id: 'cam2', name: 'Primary Crusher', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
  { id: 'cam3', name: 'Stockpile Area', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
  { id: 'cam4', name: 'Exit Gate', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
];

const CameraPlayer = ({ cam }: { cam: { name: string; url: string } }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(cam.url);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          // videoRef.current?.play().catch(() => console.log('Autoplay blocked'));
        });
        return () => hls.destroy();
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = cam.url;
      }
    }
  }, [cam.url]);

  return (
    <div className="bg-black rounded-lg overflow-hidden relative group aspect-video shadow-md border border-gray-700">
      <video ref={videoRef} className="w-full h-full object-cover" muted loop playsInline controls />
      <div className="absolute top-0 left-0 w-full p-3 bg-gradient-to-b from-black/70 to-transparent flex justify-between items-center z-10 pointer-events-none">
        <span className="text-white font-medium text-sm flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
          {cam.name}
        </span>
      </div>
    </div>
  );
};

export default function CamerasPage() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Video className="h-6 w-6 text-gray-600" /> Live Surveillance
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {CAMERAS.map(cam => (
          <CameraPlayer key={cam.id} cam={cam} />
        ))}
      </div>
    </div>
  );
}
