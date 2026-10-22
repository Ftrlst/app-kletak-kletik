import React from 'react';
import {
  ShoppingBag,
  Store,
  Compass,
  MessageCircle,
  Package,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export const MobileBottomNav: React.FC = () => {
  const { role, activeView, setActiveView, cartTotalCount } = useApp();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200">
      <div className="grid grid-cols-4 items-center h-14 px-2">
        {role === 'pelanggan' ? (
          <>
            <button
              onClick={() => setActiveView('katalog')}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                activeView === 'katalog' ? 'text-amber-700 font-bold' : 'text-stone-500'
              }`}
            >
              <Store className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Katalog</span>
            </button>
            <button
              onClick={() => setActiveView('keranjang')}
              className={`flex flex-col items-center justify-center py-1 transition-colors relative ${
                activeView === 'keranjang' ? 'text-amber-700 font-bold' : 'text-stone-500'
              }`}
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {cartTotalCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-amber-500 text-stone-900 font-bold text-[9px] flex items-center justify-center">
                    {cartTotalCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5">Keranjang</span>
            </button>
            <button
              onClick={() => setActiveView('lacak')}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                activeView === 'lacak' ? 'text-amber-700 font-bold' : 'text-stone-500'
              }`}
            >
              <Compass className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Lacak</span>
            </button>
            <button
              onClick={() => setActiveView('chat')}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                activeView === 'chat' ? 'text-amber-700 font-bold' : 'text-stone-500'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Chat</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveView('pesanan_admin')}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                activeView === 'pesanan_admin' ? 'text-amber-700 font-bold' : 'text-stone-500'
              }`}
            >
              <Package className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Pesanan</span>
            </button>
            <button
              onClick={() => setActiveView('gudang_admin')}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                activeView === 'gudang_admin' ? 'text-amber-700 font-bold' : 'text-stone-500'
              }`}
            >
              <Layers className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Gudang</span>
            </button>
            <button
              onClick={() => setActiveView('laporan_keuangan')}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                activeView === 'laporan_keuangan' ? 'text-amber-700 font-bold' : 'text-stone-500'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Akuntansi</span>
            </button>
            <button
              onClick={() => setActiveView('chat')}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                activeView === 'chat' ? 'text-amber-700 font-bold' : 'text-stone-500'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Chat</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
