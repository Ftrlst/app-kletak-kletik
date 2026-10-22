import React, { useState } from 'react';
import {
  PackageCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Store,
  Eye,
  AlertCircle,
  XCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { ORDER_STATUS_LABELS, canTransitionOrder, getNextPossibleStates } from '../modules/orderStateMachine.ts';
import { Order, OrderStatus } from '../types/index.ts';

export const OrdersManagementView: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    verifyOrderPayment,
    cancelOrder,
    setSelectedTrackingOrderId,
    setActiveView,
    role,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderModal, setSelectedOrderModal] = useState<Order | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchStatus = filterStatus === 'Semua' || o.orderStatus === filterStatus;
    const matchSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery);
    return matchStatus && matchSearch;
  });

  const handleAdvanceStatus = (order: Order, nextStatus: OrderStatus) => {
    const actorName =
      role === 'staff_gudang'
        ? 'Staff Gudang (Budi)'
        : role === 'owner'
        ? 'Owner (Fitriani)'
        : 'Penjual (Admin)';

    const ok = updateOrderStatus(order.id, nextStatus, actorName);
    if (ok) {
      setFeedback(`Status order #${order.orderNumber} berhasil diperbarui ke: ${ORDER_STATUS_LABELS[nextStatus].label}`);
      if (selectedOrderModal?.id === order.id) {
        const refreshed = orders.find((o) => o.id === order.id);
        if (refreshed) setSelectedOrderModal(refreshed);
      }
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleVerify = (order: Order) => {
    const ok = verifyOrderPayment(order.id, role === 'penjual' ? 'Penjual (Admin)' : 'Staff Kasir');
    if (ok) {
      setFeedback(`Pembayaran order #${order.orderNumber} berhasil diverifikasi! Jurnal akuntansi telah dibuat.`);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const statusTabs: { key: string; label: string }[] = [
    { key: 'Semua', label: 'Semua' },
    { key: 'PENDING', label: 'Menunggu Verifikasi' },
    { key: 'DIKONFIRMASI', label: 'Dikonfirmasi' },
    { key: 'DISIAPKAN', label: 'Disiapkan' },
    { key: 'DIKEMAS', label: 'Dikemas' },
    { key: 'SIAP_DIANTAR', label: 'Siap Diantar' },
    { key: 'SIAP_DIAMBIL', label: 'Siap Diambil' },
    { key: 'SELESAI', label: 'Selesai' },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Kelola Pesanan Masuk (Order Processing)
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Eksekusi alur pemesanan UMKM: verifikasi bayar, penyiapan snack, pengemasan, dan serah-terima kurir.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama, nomor order..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-stone-200 scrollbar-none">
        {statusTabs.map((tab) => {
          const count =
            tab.key === 'Semua' ? orders.length : orders.filter((o) => o.orderStatus === tab.key).length;

          return (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                filterStatus === tab.key
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  filterStatus === tab.key ? 'bg-amber-800 text-amber-100' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Order ID & Pemesan</th>
                <th className="py-3 px-4">Jadwal & Pengambilan</th>
                <th className="py-3 px-4">Item Snack</th>
                <th className="py-3 px-4">Total Bayar</th>
                <th className="py-3 px-4">Status Bayar</th>
                <th className="py-3 px-4">Status Pesanan</th>
                <th className="py-3 px-4 text-right">Aksi Tahapan Selanjutnya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    Tidak ada pesanan dengan filter ini.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const possibleNext = getNextPossibleStates(order.orderStatus, order.fulfillmentMethod);

                  return (
                    <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-stone-900 block font-mono text-[13px]">
                          #{order.orderNumber}
                        </span>
                        <span className="font-medium text-stone-700 block mt-0.5">
                          {order.customerName} · {order.customerPhone}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {new Date(order.orderDate).toLocaleString('id-ID')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-stone-800 block">
                          {order.scheduledDate}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-stone-500 mt-0.5">
                          {order.fulfillmentMethod === 'delivery' ? (
                            <>
                              <Truck className="w-3.5 h-3.5 text-amber-600" />
                              <span>Diantar Kurir</span>
                            </>
                          ) : (
                            <>
                              <Store className="w-3.5 h-3.5 text-amber-600" />
                              <span>Pickup Outlet</span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-[11px] text-stone-700 space-y-0.5">
                          {order.items.map((it, i) => (
                            <div key={i} className="truncate">
                              <strong>{it.quantity}x</strong> {it.productName}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-black tabular-nums text-stone-900">
                        Rp {order.totalAmount.toLocaleString('id-ID')}
                        <span className="block text-[10px] text-stone-400 font-normal">
                          via {order.paymentMethod.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {order.paymentStatus === 'PAID' ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            LUNAS
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            BELUM BAYAR
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            ORDER_STATUS_LABELS[order.orderStatus].badgeColor
                          }`}
                        >
                          {ORDER_STATUS_LABELS[order.orderStatus].label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* If pending payment */}
                          {order.paymentStatus !== 'PAID' && order.orderStatus === 'PENDING' && (
                            <button
                              onClick={() => handleVerify(order)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              Verifikasi Bayar
                            </button>
                          )}

                          {/* Advance state machine buttons */}
                          {possibleNext
                            .filter((s) => s !== 'DIBATALKAN' && s !== 'EXPIRED')
                            .map((nextSt) => (
                              <button
                                key={nextSt}
                                onClick={() => handleAdvanceStatus(order, nextSt)}
                                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-[11px] transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
                              >
                                <span>{ORDER_STATUS_LABELS[nextSt].label}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            ))}

                          <button
                            onClick={() => {
                              setSelectedTrackingOrderId(order.id);
                              setActiveView('lacak');
                            }}
                            aria-label={`Detail dan lacak order ${order.orderNumber}`}
                            className="p-1 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
