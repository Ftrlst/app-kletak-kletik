import React, { useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Plus,
  History,
  FileCheck2,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { StockMovementType } from '../types/index.ts';

export const InventoryView: React.FC = () => {
  const { products, stockMovements, addStockMovement, lowStockProducts, role } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'stok_produk' | 'stok_masuk' | 'stok_keluar' | 'stok_opname' | 'kartu_stok'>('stok_produk');

  // Form states for Stok Masuk
  const [inProductId, setInProductId] = useState(products[0]?.id || '');
  const [inQty, setInQty] = useState(20);
  const [inCost, setInCost] = useState(12000);
  const [inType, setInType] = useState<StockMovementType>('IN_PRODUCTION');
  const [inReason, setInReason] = useState('Batch penggorengan baru');

  // Form states for Stok Keluar
  const [outProductId, setOutProductId] = useState(products[0]?.id || '');
  const [outQty, setOutQty] = useState(2);
  const [outType, setOutType] = useState<StockMovementType>('OUT_DAMAGED');
  const [outReason, setOutReason] = useState('Plastik pouch bocor / keripik remuk');

  // Form states for Stok Opname
  const [opnameProductId, setOpnameProductId] = useState(products[0]?.id || '');
  const [physicalCount, setPhysicalCount] = useState(0);
  const [opnameReason, setOpnameReason] = useState('Pemeriksaan fisik mingguan rak gudang');

  const [alertFeedback, setAlertFeedback] = useState<string | null>(null);

  const selectedOpnameProduct = products.find((p) => p.id === opnameProductId);
  const systemStock = selectedOpnameProduct ? selectedOpnameProduct.stock : 0;
  const variance = physicalCount - systemStock;

  const handleStokMasukSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inProductId || inQty <= 0) return;
    const ok = addStockMovement(
      inProductId,
      inType,
      inQty,
      inReason,
      role === 'staff_gudang' ? 'Staff Gudang (Budi)' : 'Penjual (Admin)',
      inCost
    );
    if (ok) {
      setAlertFeedback(`Stok masuk berhasil dicatat! Persediaan bertambah +${inQty} unit.`);
      setTimeout(() => setAlertFeedback(null), 3000);
    }
  };

  const handleStokKeluarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outProductId || outQty <= 0) return;
    const ok = addStockMovement(
      outProductId,
      outType,
      -outQty,
      outReason,
      role === 'staff_gudang' ? 'Staff Gudang (Budi)' : 'Penjual (Admin)'
    );
    if (ok) {
      setAlertFeedback(`Stok keluar berhasil dicatat (-${outQty} unit). Beban penyesuaian dicatat di akuntansi.`);
      setTimeout(() => setAlertFeedback(null), 3000);
    }
  };

  const handleOpnameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opnameProductId) return;
    if (variance === 0) {
      setAlertFeedback('Stok fisik sama dengan stok sistem. Tidak ada selisih yang disesuaikan.');
      setTimeout(() => setAlertFeedback(null), 3000);
      return;
    }
    const ok = addStockMovement(
      opnameProductId,
      'ADJUSTMENT',
      variance,
      `Stok Opname: Fisik ${physicalCount} vs Sistem ${systemStock} (${opnameReason})`,
      role === 'staff_gudang' ? 'Staff Gudang (Budi)' : 'Penjual (Admin)'
    );
    if (ok) {
      setAlertFeedback(`Stok opname berhasil disesuaikan! Stok kini bernilai ${physicalCount} unit.`);
      setTimeout(() => setAlertFeedback(null), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-6">
      {/* Title & Low Stock Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Manajemen Inventori & Stok Gudang
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Pengendalian stok masuk, mutasi keluar, penyesuaian stok opname, dan kartu stok snack terintegrasi akuntansi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1.5 rounded-xl">
            Total Varian: <strong>{products.length} Snack</strong>
          </span>
        </div>
      </div>

      {/* Low Stock Warning Alert if any */}
      {lowStockProducts.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-800 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-sm font-bold text-rose-900 block">
              Peringatan Stok Minimum ({lowStockProducts.length} Varian Butuh Restock Segera!)
            </strong>
            <p className="text-rose-700">
              Varian berikut telah berada di bawah batas minimum stok:{' '}
              {lowStockProducts.map((p) => `${p.name} (Sisa: ${p.stock} pouch, Min: ${p.minStock})`).join(', ')}.
            </p>
          </div>
        </div>
      )}

      {/* Success / Feedback Banner */}
      {alertFeedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs flex items-center gap-2 font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{alertFeedback}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-stone-200 scrollbar-none">
        <button
          onClick={() => setActiveSubTab('stok_produk')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
            activeSubTab === 'stok_produk'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Daftar Stok Produk
        </button>
        <button
          onClick={() => setActiveSubTab('stok_masuk')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
            activeSubTab === 'stok_masuk'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          + Stok Masuk (Restock / Produksi)
        </button>
        <button
          onClick={() => setActiveSubTab('stok_keluar')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
            activeSubTab === 'stok_keluar'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          - Stok Keluar (Rusak / Expired)
        </button>
        <button
          onClick={() => setActiveSubTab('stok_opname')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
            activeSubTab === 'stok_opname'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Stok Opname (Penyesuaian Fisik)
        </button>
        <button
          onClick={() => setActiveSubTab('kartu_stok')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
            activeSubTab === 'kartu_stok'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Kartu Stok (Riwayat Mutasi)
        </button>
      </div>

      {/* Tab 1: Daftar Stok Produk */}
      {activeSubTab === 'stok_produk' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Snack & Kategori</th>
                  <th className="py-3 px-4">Harga Jual</th>
                  <th className="py-3 px-4">HPP (Biaya Pokok)</th>
                  <th className="py-3 px-4">Stok Saat Ini</th>
                  <th className="py-3 px-4">Min. Stok</th>
                  <th className="py-3 px-4">Status Stok</th>
                  <th className="py-3 px-4 text-right">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((p) => {
                  const isLow = p.stock <= p.minStock && p.stock > 0;
                  const isOut = p.stock <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-stone-900 block">{p.name}</span>
                            <span className="text-[10px] text-stone-400">{p.category} · {p.weightGrams}g</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold tabular-nums text-stone-800">
                        Rp {p.price.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4 text-stone-500 tabular-nums">
                        Rp {p.costPrice.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-base tabular-nums text-stone-900">
                          {p.stock}
                        </span>
                        <span className="text-stone-400 text-[10px] ml-1">pouch</span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-500 tabular-nums">
                        {p.minStock} pouch
                      </td>
                      <td className="py-3.5 px-4">
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-900 text-white">
                            HABIS
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            STOK MINIMUM
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            TERSEDIA
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setInProductId(p.id);
                            setActiveSubTab('stok_masuk');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 hover:bg-amber-100 font-bold text-[11px] border border-amber-200 transition-colors cursor-pointer"
                        >
                          + Restock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Form Stok Masuk */}
      {activeSubTab === 'stok_masuk' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 max-w-2xl shadow-xs space-y-5">
          <div className="border-b border-stone-100 pb-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <ArrowDownRight className="w-5 h-5 text-emerald-600" />
              <span>Input Stok Masuk (Restock / Batch Produksi)</span>
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Setiap penambahan stok otomatis menambah kuantitas inventori dan memposting jurnal akuntansi pembelian/HPP.
            </p>
          </div>

          <form onSubmit={handleStokMasukSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Pilih Varian Snack *
              </label>
              <select
                value={inProductId}
                onChange={(e) => setInProductId(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm font-medium"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stok Saat Ini: {p.stock} pouch)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Jumlah Pouch Masuk *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={inQty}
                  onChange={(e) => setInQty(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Biaya HPP per Unit (Rp) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={inCost}
                  onChange={(e) => setInCost(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Tipe Masuk *
              </label>
              <select
                value={inType}
                onChange={(e) => setInType(e.target.value as StockMovementType)}
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
              >
                <option value="IN_PRODUCTION">Hasil Produksi Baru Dapur</option>
                <option value="IN_PURCHASE">Pembelian Stok / Kulakan Supplier</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Catatan / Alasan Restock *
              </label>
              <input
                type="text"
                required
                value={inReason}
                onChange={(e) => setInReason(e.target.value)}
                placeholder="Contoh: Batch goreng pisang madu 20 kg"
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
              />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-stone-700">
              <span className="font-bold block">Ringkasan Nilai Persediaan Baru:</span>
              <span>
                {inQty} pouch @ Rp {inCost.toLocaleString('id-ID')} = <strong>Rp {(inQty * inCost).toLocaleString('id-ID')}</strong> (Debit Persediaan Snack, Kredit Kas)
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
            >
              Simpan Stok Masuk & Buat Jurnal
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Form Stok Keluar (Rusak/Expired) */}
      {activeSubTab === 'stok_keluar' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 max-w-2xl shadow-xs space-y-5">
          <div className="border-b border-stone-100 pb-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-rose-600" />
              <span>Input Stok Keluar Non-Penjualan (Rusak / Expired / Tester)</span>
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Catat snack yang rusak atau kadaluarsa untuk penyesuaian nilai buku akuntansi.
            </p>
          </div>

          <form onSubmit={handleStokKeluarSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Pilih Varian Snack *
              </label>
              <select
                value={outProductId}
                onChange={(e) => setOutProductId(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm font-medium"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stok: {p.stock} pouch)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Jumlah Pouch Keluar *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={outQty}
                  onChange={(e) => setOutQty(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Alasan Keluar *
                </label>
                <select
                  value={outType}
                  onChange={(e) => setOutType(e.target.value as StockMovementType)}
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                >
                  <option value="OUT_DAMAGED">Kemasan Rusak / Remuk</option>
                  <option value="OUT_EXPIRED">Melewati Batas Konsumsi (Expired)</option>
                  <option value="OUT_SAMPLE">Tester Pengunjung / Display Toko</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Keterangan Detail Kerusakan *
              </label>
              <input
                type="text"
                required
                value={outReason}
                onChange={(e) => setOutReason(e.target.value)}
                placeholder="Contoh: Terinjak saat bongkar muat rak display"
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
            >
              Kurangi Stok & Catat Beban Kerusakan
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Form Stok Opname (Penyesuaian Fisik) */}
      {activeSubTab === 'stok_opname' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 max-w-2xl shadow-xs space-y-5">
          <div className="border-b border-stone-100 pb-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-amber-600" />
              <span>Stok Opname (Penyesuaian Fisik vs Sistem)</span>
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Cocokkan jumlah fisik nyata di rak gudang dengan data sistem untuk menjaga akurasi laporan keuangan.
            </p>
          </div>

          <form onSubmit={handleOpnameSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Pilih Varian Snack *
              </label>
              <select
                value={opnameProductId}
                onChange={(e) => {
                  setOpnameProductId(e.target.value);
                  const p = products.find((item) => item.id === e.target.value);
                  if (p) setPhysicalCount(p.stock);
                }}
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm font-medium"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-stone-500 block mb-1">Stok Tercatat Sistem:</span>
                <span className="text-2xl font-black text-stone-900 tabular-nums">
                  {systemStock}
                </span>
                <span className="text-stone-500 text-xs ml-1">pouch</span>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Hitungan Fisik Nyata di Gudang *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={physicalCount}
                  onChange={(e) => setPhysicalCount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-base font-bold tabular-nums"
                />
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                variance === 0
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : variance < 0
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}
            >
              <span>Selisih Stok Opname:</span>
              <span className="font-bold text-sm tabular-nums">
                {variance > 0 ? `+${variance}` : variance} pouch
              </span>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Catatan Petugas Pemeriksa *
              </label>
              <input
                type="text"
                required
                value={opnameReason}
                onChange={(e) => setOpnameReason(e.target.value)}
                placeholder="Alasan selisih stok..."
                className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs transition-colors shadow-xs cursor-pointer"
            >
              Simpan Hasil Opname & Sinkronisasi Sistem
            </button>
          </form>
        </div>
      )}

      {/* Tab 5: Kartu Stok (Riwayat Mutasi Lengkap) */}
      {activeSubTab === 'kartu_stok' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-stone-900 text-sm">
                Kartu Stok (Log Pergerakan Barang Masuk & Keluar)
              </h2>
              <span className="text-[11px] text-stone-400">
                Semua transaksi order dan restock terdata secara audit-ready.
              </span>
            </div>
            <span className="text-xs text-stone-500">
              {stockMovements.length} riwayat mutasi
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Produk Snack</th>
                  <th className="py-3 px-4">Tipe Mutasi</th>
                  <th className="py-3 px-4">Kuantitas</th>
                  <th className="py-3 px-4">Sisa Stok</th>
                  <th className="py-3 px-4">Petugas / Aktor</th>
                  <th className="py-3 px-4">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {stockMovements.map((sm) => (
                  <tr key={sm.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3 px-4 text-stone-500 tabular-nums">{sm.date}</td>
                    <td className="py-3 px-4 font-bold text-stone-900">{sm.productName}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                        {sm.movementType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold tabular-nums">
                      <span className={sm.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {sm.quantity > 0 ? `+${sm.quantity}` : sm.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold tabular-nums text-stone-900">
                      {sm.newStock} pouch
                    </td>
                    <td className="py-3 px-4 text-stone-600">{sm.staffName}</td>
                    <td className="py-3 px-4 text-stone-500 max-w-xs truncate">{sm.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
