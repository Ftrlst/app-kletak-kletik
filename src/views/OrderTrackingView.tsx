import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Store,
  Printer,
  XCircle,
  MessageSquare,
  QrCode,
  CreditCard,
  Copy,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { ORDER_STATUS_LABELS } from '../modules/orderStateMachine.ts';
import { Order, OrderStatus } from '../types/index.ts';

export const OrderTrackingView: React.FC = () => {
  const {
    orders,
    selectedTrackingOrderId,
    setSelectedTrackingOrderId,
    cancelOrder,
    verifyOrderPayment,
    setActiveView,
    sendMessage,
  } = useApp();

  const [copiedVa, setCopiedVa] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [searchOrderNumber, setSearchOrderNumber] = useState('');

  // Default to the first order or selected one
  const activeOrder =
    orders.find((o) => o.id === selectedTrackingOrderId) ||
    orders.find((o) => o.orderNumber.toLowerCase() === searchOrderNumber.trim().toLowerCase()) ||
    orders[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVa(true);
    setTimeout(() => setCopiedVa(false), 2000);
  };

  const handleSimulatePayment = () => {
    if (activeOrder) {
      verifyOrderPayment(activeOrder.id, 'Simulasi Gateway Pembayaran');
    }
  };

  const handleContactSellerForOrder = () => {
    if (activeOrder) {
      sendMessage(
        `Halo penjual, saya ingin menanyakan pesanan #${activeOrder.orderNumber} atas nama ${activeOrder.customerName}. Apakah sudah diproses?`
      );
      setActiveView('chat');
    }
  };

  const stepsForOrder: { status: OrderStatus; label: string; icon: any }[] = [
    { status: 'PENDING', label: 'Pesanan Dibuat', icon: Clock },
    { status: 'DIKONFIRMASI', label: 'Pembayaran Dikonfirmasi', icon: CheckCircle2 },
    { status: 'DISIAPKAN', label: 'Snack Disiapkan', icon: Package },
    { status: 'DIKEMAS', label: 'Snack Dikemas', icon: Package },
    {
      status: activeOrder?.fulfillmentMethod === 'delivery' ? 'SIAP_DIANTAR' : 'SIAP_DIAMBIL',
      label: activeOrder?.fulfillmentMethod === 'delivery' ? 'Siap Diantar' : 'Siap Diambil',
      icon: activeOrder?.fulfillmentMethod === 'delivery' ? Truck : Store,
    },
    { status: 'SELESAI', label: 'Pesanan Selesai', icon: CheckCircle2 },
  ];

  const getCurrentStepIndex = () => {
    if (!activeOrder) return 0;
    if (activeOrder.orderStatus === 'DIBATALKAN' || activeOrder.orderStatus === 'EXPIRED') return -1;
    const idx = stepsForOrder.findIndex((s) => s.status === activeOrder.orderStatus);
    return idx >= 0 ? idx : 0;
  };

  const currentStepIdx = getCurrentStepIndex();

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      {/* Search Order Bar & Order Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Pelacakan Status Pesanan (Live Tracking)
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Pantau setiap tahapan pemesanan camilan Kletak-Kletik dari persiapan hingga siap dinikmati.
          </p>
        </div>

        {/* Quick order search */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari No. Order (mis: KLTK-...)"
              value={searchOrderNumber}
              onChange={(e) => setSearchOrderNumber(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 w-52 sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Orders Carousel / Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-stone-400 shrink-0">Daftar Pesanan:</span>
        {orders.map((ord) => (
          <button
            key={ord.id}
            onClick={() => setSelectedTrackingOrderId(ord.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              activeOrder?.id === ord.id
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            #{ord.orderNumber.slice(-8)} · {ord.customerName.split(' ')[0]}
          </button>
        ))}
      </div>

      {activeOrder ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: State Machine Timeline Card */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-extrabold text-stone-900">
                    Order #{activeOrder.orderNumber}
                  </h2>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                      ORDER_STATUS_LABELS[activeOrder.orderStatus].badgeColor
                    }`}
                  >
                    {ORDER_STATUS_LABELS[activeOrder.orderStatus].label}
                  </span>
                </div>
                <span className="text-xs text-stone-400 mt-1 block">
                  Dipesan pada: {new Date(activeOrder.orderDate).toLocaleString('id-ID')} · Jadwal:{' '}
                  <strong>{activeOrder.scheduledDate}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Lihat Invoice</span>
                </button>
                <button
                  onClick={handleContactSellerForOrder}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat Penjual</span>
                </button>
              </div>
            </div>

            {/* Visual State Machine Progress Bar */}
            {activeOrder.orderStatus !== 'DIBATALKAN' && activeOrder.orderStatus !== 'EXPIRED' ? (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Alur State Machine Pesanan
                </h3>

                <div className="relative">
                  {/* Connecting line */}
                  <div className="hidden sm:block absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-stone-100 -z-0" />

                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
                    {stepsForOrder.map((step, idx) => {
                      const isCompleted = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;
                      const IconComponent = step.icon;

                      return (
                        <div key={step.status} className="flex flex-col items-center text-center space-y-2">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                              isCurrent
                                ? 'bg-amber-500 text-stone-950 ring-4 ring-amber-100 shadow-md font-bold'
                                : isCompleted
                                ? 'bg-emerald-600 text-white'
                                : 'bg-stone-100 text-stone-400 border border-stone-200'
                            }`}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <span
                            className={`text-xs ${
                              isCurrent
                                ? 'font-bold text-amber-950'
                                : isCompleted
                                ? 'font-semibold text-stone-800'
                                : 'text-stone-400'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-800 text-xs flex items-center gap-3">
                <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                <div>
                  <strong className="block text-sm">Pesanan Ini Telah Dibatalkan / Kadaluarsa</strong>
                  <span>Stok snack telah dikembalikan ke sistem gudang dan jurnal keuangan disesuaikan.</span>
                </div>
              </div>
            )}

            {/* Detailed Tracking Event Log */}
            <div className="space-y-3 pt-4 border-t border-stone-100">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Riwayat Jejak Waktu & Log Aktivitas
              </h3>

              <div className="space-y-3 relative pl-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                {activeOrder.trackingHistory.map((item, idx) => (
                  <div key={idx} className="relative space-y-1">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-800">
                        {ORDER_STATUS_LABELS[item.status]?.label || item.status}
                      </span>
                      <span className="text-[11px] text-stone-400 tabular-nums">
                        {new Date(item.timestamp).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">{item.note}</p>
                    <span className="text-[10px] text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                      Oleh: {item.actor}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cancel Action if Pending */}
            {activeOrder.orderStatus === 'PENDING' && (
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  Ingin mengubah pesanan sebelum snack disiapkan?
                </span>
                <button
                  onClick={() => cancelOrder(activeOrder.id, 'Dibatalkan oleh pelanggan via web')}
                  className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer"
                >
                  Batalkan Pesanan
                </button>
              </div>
            )}
          </div>

          {/* Right: Payment Details & Items Ordered Summary */}
          <div className="lg:col-span-4 space-y-6">
            {/* Payment Verification / Instruction Box */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-stone-900 text-sm border-b border-stone-100 pb-2">
                Instruksi Pembayaran ({activeOrder.paymentMethod.toUpperCase()})
              </h3>

              {activeOrder.paymentStatus === 'PAID' ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Pembayaran Terverifikasi Lunas</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Jurnal penjualan dan HPP telah otomatis dibukukan ke sistem akuntansi.
                  </p>
                </div>
              ) : activeOrder.paymentMethod === 'cod' ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900 space-y-1 text-xs">
                  <span className="font-bold block">Cash on Delivery (COD)</span>
                  <p className="text-[11px] text-amber-800">
                    Siapkan uang pas senilai <strong>Rp {activeOrder.totalAmount.toLocaleString('id-ID')}</strong> saat kurir mengantarkan snack ke alamat Anda.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeOrder.paymentMethod === 'qris' ? (
                    <div className="text-center p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                      <div className="w-36 h-36 bg-white mx-auto p-2 rounded-xl border border-stone-300 flex items-center justify-center">
                        <QrCode className="w-28 h-28 text-stone-900" />
                      </div>
                      <span className="text-[11px] text-stone-500 block">
                        Scan QRIS dengan aplikasi BCA Mobile, GoPay, Dana, atau OVO Anda.
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                      <span className="text-[11px] text-stone-500 block">Nomor Virtual Account BCA:</span>
                      <div className="flex items-center justify-between font-mono font-bold text-sm text-stone-900">
                        <span>8802 9182 7364 001</span>
                        <button
                          onClick={() => handleCopy('880291827364001')}
                          className="p-1 rounded bg-stone-200 hover:bg-stone-300 text-stone-700"
                          aria-label="Salin nomor VA"
                        >
                          {copiedVa ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSimulatePayment}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                  >
                    Simulasi Konfirmasi Pembayaran Sukses
                  </button>
                </div>
              )}

              {/* Items in Order */}
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <span className="text-xs font-bold text-stone-800 block">Item Snack Dipesan:</span>
                <div className="space-y-2">
                  {activeOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-stone-900 block">{it.productName}</span>
                        <span className="text-[10px] text-stone-400">
                          {it.quantity}x @ Rp {it.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <span className="font-bold text-stone-900 tabular-nums">
                        Rp {it.subtotal.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-stone-100 space-y-1 text-xs">
                  <div className="flex justify-between text-stone-500">
                    <span>Subtotal Produk:</span>
                    <span className="tabular-nums">Rp {activeOrder.itemsSubtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Ongkir ({activeOrder.fulfillmentMethod}):</span>
                    <span className="tabular-nums">
                      {activeOrder.shippingFee === 0 ? 'GRATIS' : `Rp ${activeOrder.shippingFee.toLocaleString('id-ID')}`}
                    </span>
                  </div>
                  {activeOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Diskon Kupon:</span>
                      <span className="tabular-nums">- Rp {activeOrder.discountAmount.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-amber-700 pt-1 border-t border-stone-100">
                    <span>Total Pembayaran:</span>
                    <span className="tabular-nums">Rp {activeOrder.totalAmount.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-stone-500 bg-white rounded-3xl border border-stone-200">
          Pesanan tidak ditemukan. Silakan masukkan nomor order yang valid.
        </div>
      )}

      {/* Invoice Modal for Printing / Viewing */}
      {showInvoiceModal && activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-extrabold text-stone-900 text-lg">KLETAK-KLETIK SNACK</h3>
                <span className="text-[11px] text-stone-400">INVOICE PENJUALAN RESMI</span>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-1 text-stone-600">
              <div className="flex justify-between">
                <span>No. Invoice:</span>
                <span className="font-mono font-bold text-stone-900">INV/{activeOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal:</span>
                <span>{new Date(activeOrder.orderDate).toLocaleDateString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span className="font-semibold text-stone-900">{activeOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode Ambil:</span>
                <span className="capitalize">{activeOrder.fulfillmentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Status Bayar:</span>
                <span className="font-bold text-emerald-700">{activeOrder.paymentStatus}</span>
              </div>
            </div>

            <div className="border-t border-b border-stone-200 py-3 space-y-2">
              {activeOrder.items.map((it, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span>
                    {it.productName} x {it.quantity}
                  </span>
                  <span className="font-bold tabular-nums">
                    Rp {it.subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-xs space-y-1">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal:</span>
                <span>Rp {activeOrder.itemsSubtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Ongkir:</span>
                <span>Rp {activeOrder.shippingFee.toLocaleString('id-ID')}</span>
              </div>
              {activeOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Diskon Promo:</span>
                  <span>- Rp {activeOrder.discountAmount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-2 border-t border-stone-200">
                <span>Total:</span>
                <span>Rp {activeOrder.totalAmount.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <button
              onClick={() => {
                alert('Mencetak invoice #' + activeOrder.orderNumber);
                setShowInvoiceModal(false);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs transition-colors cursor-pointer"
            >
              Cetak / Simpan PDF Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
