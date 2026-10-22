import React from 'react';
import {
  ShoppingBag,
  MessageCircle,
  PackageCheck,
  Boxes,
  ClipboardList,
  BookOpenCheck,
  UserCheck,
  Store,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Role } from '../types/index.ts';
import { PWAInstallButton } from './PWAInstallButton.tsx';

export const Navbar: React.FC = () => {
  const { role, setRole, activeView, setActiveView, cartTotalCount, lowStockProducts } = useApp();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as Role;
    setRole(newRole);
    // Switch to appropriate default view for that role
    if (newRole === 'pelanggan') {
      setActiveView('katalog');
    } else if (newRole === 'penjual') {
      setActiveView('pesanan_admin');
    } else if (newRole === 'staff_gudang') {
      setActiveView('gudang_admin');
    } else if (newRole === 'owner') {
      setActiveView('laporan_keuangan');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveView(role === 'pelanggan' ? 'katalog' : 'pesanan_admin')}
              className="flex items-center gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-stone-900 shadow-sm font-black text-lg">
                KK
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold tracking-tight text-stone-900 whitespace-nowrap block">
                  Kletak-Kletik Snack
                </span>
                <span className="text-[10px] text-amber-800/80 font-medium tracking-wider uppercase block -mt-1">
                  UMKM Snack Tradisional
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Single-Line, context-sensitive to role) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-stone-600">
            {role === 'pelanggan' ? (
              <>
                <button
                  onClick={() => setActiveView('katalog')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeView === 'katalog' ? 'bg-amber-100/80 text-amber-900 font-semibold' : 'hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  Katalog Snack
                </button>
                <button
                  onClick={() => setActiveView('lacak')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeView === 'lacak' ? 'bg-amber-100/80 text-amber-900 font-semibold' : 'hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  Lacak Pesanan
                </button>
                <button
                  onClick={() => setActiveView('chat')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeView === 'chat' ? 'bg-amber-100/80 text-amber-900 font-semibold' : 'hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  Tanya Penjual & Bot
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveView('pesanan_admin')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeView === 'pesanan_admin' ? 'bg-amber-100/80 text-amber-900 font-semibold' : 'hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  Kelola Pesanan
                </button>
                <button
                  onClick={() => setActiveView('produk_admin')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeView === 'produk_admin' ? 'bg-amber-100/80 text-amber-900 font-semibold' : 'hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  Kelola Produk
                </button>
                <button
                  onClick={() => setActiveView('gudang_admin')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer relative ${
                    activeView === 'gudang_admin' ? 'bg-amber-100/80 text-amber-900 font-semibold' : 'hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  Stok & Gudang
                  {lowStockProducts.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-rose-600 text-white rounded-full font-bold">
                      {lowStockProducts.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveView('laporan_keuangan')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeView === 'laporan_keuangan' ? 'bg-amber-100/80 text-amber-900 font-semibold' : 'hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  Akuntansi & Laporan
                </button>
                <button
                  onClick={() => setActiveView('chat')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeView === 'chat' ? 'bg-amber-100/80 text-amber-900 font-semibold' : 'hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  Chat Pelanggan
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: Actions & Role Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Role Switcher */}
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2 py-1 rounded-lg">
              <UserCheck className="w-3.5 h-3.5 text-amber-700 hidden lg:block" />
              <label htmlFor="role-selector" className="text-[11px] font-semibold text-amber-900 whitespace-nowrap hidden md:inline">
                Peran:
              </label>
              <select
                id="role-selector"
                value={role}
                onChange={handleRoleChange}
                aria-label="Pilih peran pengguna"
                className="bg-transparent text-[11px] sm:text-xs font-bold text-amber-950 focus:outline-none cursor-pointer max-w-[110px] sm:max-w-none truncate"
              >
                <option value="pelanggan">Pelanggan</option>
                <option value="penjual">Penjual / Admin</option>
                <option value="staff_gudang">Staff Gudang</option>
                <option value="owner">Owner</option>
              </select>
            </div>

            {/* PWA Install Button */}
            <div className="hidden sm:block">
              <PWAInstallButton />
            </div>

            {/* Cart Trigger (for Pelanggan) */}
            {role === 'pelanggan' && (
              <button
                onClick={() => setActiveView('keranjang')}
                aria-label={`Buka Keranjang (${cartTotalCount} item)`}
                className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                {cartTotalCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] flex items-center justify-center px-1 text-[9px] font-bold bg-amber-500 text-stone-950 rounded-full border-2 border-white">
                    {cartTotalCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
