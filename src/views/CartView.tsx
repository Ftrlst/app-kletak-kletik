import React, { useState } from 'react';
import {
  Trash2,
  Calendar,
  Truck,
  Store,
  CreditCard,
  QrCode,
  Wallet,
  Coins,
  Tag,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { FulfillmentMethod, PaymentMethod } from '../types/index.ts';

export const CartView: React.FC = () => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartTotalCount,
    appliedCoupon,
    discountAmount,
    applyCoupon,
    removeCoupon,
    createOrder,
    setActiveView,
  } = useApp();

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [scheduledDate, setScheduledDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>('delivery');
  const [customerAddress, setCustomerAddress] = useState('');
  const [pickupLocation, setPickupLocation] = useState('Outlet Utama Kletak-Kletik (Jl. Malioboro No. 45, Yogyakarta)');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qris');
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success?: boolean; message?: string } | null>(null);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Shipping calculation
  const shippingFee = fulfillmentMethod === 'delivery' ? (cartSubtotal >= 100000 ? 0 : 10000) : 0;
  const finalTotal = Math.max(0, cartSubtotal + shippingFee - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback(res);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (cart.length === 0) {
      setFormError('Keranjang belanja Anda masih kosong.');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setFormError('Mohon isi nama lengkap dan nomor WhatsApp pemesan.');
      return;
    }

    if (fulfillmentMethod === 'delivery' && !customerAddress.trim()) {
      setFormError('Mohon masukkan alamat lengkap pengantaran snack.');
      return;
    }

    // Process order
    const created = createOrder({
      customerName,
      customerPhone,
      fulfillmentMethod,
      customerAddress: fulfillmentMethod === 'delivery' ? customerAddress : undefined,
      pickupLocation: fulfillmentMethod === 'pickup' ? pickupLocation : undefined,
      scheduledDate,
      paymentMethod,
      notes,
    });

    // Go to order tracking view
    setActiveView('lacak');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Keranjang Belanja Kosong</h2>
        <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
          Belum ada snack yang Anda pilih. Silakan jelajahi aneka keripik pisang, peyek, dan rengginang renyah kami!
        </p>
        <button
          onClick={() => setActiveView('katalog')}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
        >
          Lihat Katalog Snack
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          Keranjang & Checkout Pemesanan
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Lengkapi detail pengiriman dan metode pembayaran sesuai instruksi blueprint.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Cart Items & Order Info Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Cart Item List */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="font-bold text-stone-900 text-sm">
                Daftar Snack ({cartTotalCount} bungkus)
              </span>
              <button
                onClick={clearCart}
                className="text-xs text-stone-400 hover:text-rose-600 transition-colors"
              >
                Kosongkan
              </button>
            </div>

            <div className="divide-y divide-stone-100">
              {cart.map(({ product, quantity }) => (
                <div key={product.id} className="py-3 flex items-center gap-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 bg-stone-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                      {product.name}
                    </h4>
                    <span className="text-[11px] text-stone-400 block">
                      Netto {product.weightGrams}g · @ Rp {product.price.toLocaleString('id-ID')}
                    </span>
                    <span className="text-xs font-bold text-amber-800 tabular-nums">
                      Rp {(product.price * quantity).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 border border-stone-200 rounded-lg p-0.5">
                    <button
                      onClick={() => updateCartQuantity(product.id, quantity - 1)}
                      className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-xs font-bold tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(product.id, Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center disabled:opacity-40 cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(product.id)}
                    aria-label={`Hapus ${product.name}`}
                    className="p-1.5 text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Information & Schedule Date Form */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-stone-900 text-sm border-b border-stone-100 pb-2">
              1. Data Pemesan & Tanggal Pesanan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Nama Lengkap Pemesan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Fitriani Lestari"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Nomor WhatsApp / Telp *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Pilih Tanggal Pengiriman / Pengambilan (Date Picker) *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Fulfillment Method Selection */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-stone-900 text-sm border-b border-stone-100 pb-2">
              2. Metode Pengambilan
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFulfillmentMethod('delivery')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                  fulfillmentMethod === 'delivery'
                    ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <Truck className={`w-5 h-5 shrink-0 ${fulfillmentMethod === 'delivery' ? 'text-amber-700' : 'text-stone-400'}`} />
                <div>
                  <span className="text-xs font-bold text-stone-900 block">Diantar (Delivery)</span>
                  <span className="text-[11px] text-stone-500">Kurir antar ke alamat Anda</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFulfillmentMethod('pickup')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                  fulfillmentMethod === 'pickup'
                    ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <Store className={`w-5 h-5 shrink-0 ${fulfillmentMethod === 'pickup' ? 'text-amber-700' : 'text-stone-400'}`} />
                <div>
                  <span className="text-xs font-bold text-stone-900 block">Diambil Sendiri (Pickup)</span>
                  <span className="text-[11px] text-stone-500">Ambil di outlet / dapur</span>
                </div>
              </button>
            </div>

            {fulfillmentMethod === 'delivery' ? (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-stone-700 block">
                  Alamat Lengkap Pengiriman *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, patokan..."
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[11px] text-amber-800">
                  {cartSubtotal >= 100000
                    ? '🎉 Selamat! Belanja di atas Rp 100.000 mendapatkan GRATIS ONGKIR.'
                    : '🛵 Ongkir flat Rp 10.000 (Tambah Rp ' + (100000 - cartSubtotal).toLocaleString('id-ID') + ' lagi untuk gratis ongkir).'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-stone-700 block">
                  Pilih Lokasi Outlet / Toko Pengambilan *
                </label>
                <select
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="Outlet Utama Kletak-Kletik (Jl. Malioboro No. 45, Yogyakarta)">
                    Outlet Utama (Jl. Malioboro No. 45, Yogyakarta)
                  </option>
                  <option value="Dapur Produksi Sleman (Jl. Kaliurang KM 9, Sleman)">
                    Dapur Produksi (Jl. Kaliurang KM 9, Sleman)
                  </option>
                  <option value="Cabang Bantul (Jl. Bantul KM 4, Bantul)">
                    Cabang Outlet Selatan (Jl. Bantul KM 4, Bantul)
                  </option>
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Catatan Tambahan untuk Penjual (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Packing kardus aman, kurir harap hubungi dulu..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-stone-900 text-sm border-b border-stone-100 pb-2">
              3. Metode Pembayaran (Sesuai Blueprint)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* QRIS */}
              <button
                type="button"
                onClick={() => setPaymentMethod('qris')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                  paymentMethod === 'qris'
                    ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <QrCode className="w-5 h-5 text-amber-700 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-stone-900 block">QRIS (Semua Bank / Dompet)</span>
                  <span className="text-[11px] text-stone-500">Scan instan via GoPay, BCA, Dana, dll.</span>
                </div>
              </button>

              {/* Virtual Account BCA */}
              <button
                type="button"
                onClick={() => setPaymentMethod('va_bca')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                  paymentMethod === 'va_bca'
                    ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <CreditCard className="w-5 h-5 text-amber-700 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-stone-900 block">Virtual Account BCA</span>
                  <span className="text-[11px] text-stone-500">Nomor VA otomatis verifikasi</span>
                </div>
              </button>

              {/* E-Wallet GoPay */}
              <button
                type="button"
                onClick={() => setPaymentMethod('gopay')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                  paymentMethod === 'gopay'
                    ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <Wallet className="w-5 h-5 text-amber-700 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-stone-900 block">E-Wallet (GoPay / OVO / Dana)</span>
                  <span className="text-[11px] text-stone-500">Notifikasi pembayaran digital</span>
                </div>
              </button>

              {/* COD */}
              <button
                type="button"
                disabled={fulfillmentMethod === 'pickup'}
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                  fulfillmentMethod === 'pickup'
                    ? 'opacity-40 cursor-not-allowed border-stone-200'
                    : paymentMethod === 'cod'
                    ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <Coins className="w-5 h-5 text-amber-700 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-stone-900 block">COD (Bayar di Tempat)</span>
                  <span className="text-[11px] text-stone-500">Khusus mode pengantaran kurir</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Summary & Voucher Box */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          {/* Coupon voucher input */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-stone-900 text-sm">Voucher Diskon Snack</h3>
            </div>

            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Coba: KLETAK10 atau DISKON5RB"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono uppercase"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Pakai
              </button>
            </form>

            {appliedCoupon && (
              <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-2 rounded-xl">
                <span>Voucher <strong>{appliedCoupon}</strong> aktif!</span>
                <button
                  onClick={removeCoupon}
                  className="text-stone-500 hover:text-stone-800 text-[11px] underline"
                >
                  Hapus
                </button>
              </div>
            )}

            {couponFeedback && !appliedCoupon && (
              <p className="text-xs text-rose-600">{couponFeedback.message}</p>
            )}
          </div>

          {/* Price Calculation & Checkout Button */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-stone-900 text-sm border-b border-stone-100 pb-2">
              Ringkasan Transaksi
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal Snack ({cartTotalCount} item)</span>
                <span className="font-semibold tabular-nums text-stone-900">
                  Rp {cartSubtotal.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex justify-between text-stone-600">
                <span>Biaya Pengiriman ({fulfillmentMethod === 'delivery' ? 'Kurir Lokal' : 'Pickup Sendiri'})</span>
                <span className="font-semibold tabular-nums text-stone-900">
                  {shippingFee === 0 ? 'GRATIS' : `Rp ${shippingFee.toLocaleString('id-ID')}`}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Potongan Voucher Promo</span>
                  <span className="tabular-nums">- Rp {discountAmount.toLocaleString('id-ID')}</span>
                </div>
              )}

              <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
                <span className="text-sm font-bold text-stone-900">Total Pembayaran</span>
                <span className="text-xl font-black text-amber-700 tabular-nums">
                  Rp {finalTotal.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {formError && (
              <div className="flex items-start gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <button
              onClick={handleCheckout}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Konfirmasi Pesanan Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-stone-400 text-center leading-relaxed">
              Setelah konfirmasi, sistem akan otomatis menerbitkan Order ID & Invoice serta mengarahkan ke halaman pelacakan status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
