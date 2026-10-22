import React from 'react';
import { WifiOff } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export const OfflineBanner: React.FC = () => {
  const { isOnline } = useApp();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-stone-900/90 text-amber-300 px-4 py-2.5 text-xs font-medium shadow-xl border border-stone-800 backdrop-blur-md animate-fade-in"
    >
      <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
      <span>Mode Offline — Menampilkan katalog & status tersimpan di perangkat.</span>
    </div>
  );
};
