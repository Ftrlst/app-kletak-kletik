/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';
import { OfflineBanner } from './components/OfflineBanner.tsx';
import { CatalogView } from './views/CatalogView.tsx';
import { CartView } from './views/CartView.tsx';
import { OrderTrackingView } from './views/OrderTrackingView.tsx';
import { ChatView } from './views/ChatView.tsx';
import { OrdersManagementView } from './views/OrdersManagementView.tsx';
import { ProductManagementView } from './views/ProductManagementView.tsx';
import { InventoryView } from './views/InventoryView.tsx';
import { AccountingReportsView } from './views/AccountingReportsView.tsx';
import { Heart, Sparkles, MapPin, Phone, Clock } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeView, setActiveView } = useApp();

  const renderCurrentView = () => {
    switch (activeView) {
      case 'katalog':
        return <CatalogView />;
      case 'keranjang':
        return <CartView />;
      case 'lacak':
        return <OrderTrackingView />;
      case 'chat':
        return <ChatView />;
      case 'pesanan_admin':
        return <OrdersManagementView />;
      case 'produk_admin':
        return <ProductManagementView />;
      case 'gudang_admin':
        return <InventoryView />;
      case 'laporan_keuangan':
        return <AccountingReportsView />;
      default:
        return <CatalogView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/25 text-stone-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        {renderCurrentView()}
      </main>

      <MobileBottomNav />
      <OfflineBanner />

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 text-xs py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-stone-800">
            <div className="space-y-2">
              <span className="text-base font-bold text-white block">
                Kletak-Kletik Snack Tradisional
              </span>
              <p className="text-stone-400 leading-relaxed text-xs">
                Aplikasi Web PWA operasional UMKM snack tradisional terintegrasi: pemesanan online, manajemen persediaan gudang, live chat auto-reply bot, dan pembukuan double-entry akuntansi.
              </p>
            </div>

            <div className="space-y-2 text-stone-400 text-xs">
              <span className="font-bold text-white block">Outlet & Layanan</span>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Jl. Malioboro No. 45 & Dapur Produksi Sleman, Yogyakarta</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>WhatsApp: 0812-3456-7890</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Buka Setiap Hari: 08.00 - 20.00 WIB</span>
              </div>
            </div>

            <div className="space-y-2 text-stone-400 text-xs">
              <span className="font-bold text-white block">Informasi Blueprint Proyek</span>
              <p className="leading-relaxed">
                Tugas Blueprint Aplikasi Web Kletak-Kletik Snack<br />
                Nama: <strong>Fitriani Lestari</strong><br />
                NIM: <strong>60225030</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500 text-[11px]">
            <span>
              &copy; 2026 Kletak-Kletik Snack. Hak Cipta Dilindungi Undang-Undang.
            </span>
            <div className="flex items-center gap-1 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PWA Ready & Offline-Tolerant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
