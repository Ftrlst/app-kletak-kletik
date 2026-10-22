import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  TrendingUp,
  Scale,
  BookOpen,
  DollarSign,
  PieChart,
  ListOrdered,
  ShieldCheck,
  CheckCircle2,
  Printer,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import {
  STANDARD_COA,
  calculateLedgers,
  generateTrialBalance,
  generateIncomeStatement,
  generateBalanceSheet,
} from '../modules/accountingEngine.ts';

export const AccountingReportsView: React.FC = () => {
  const { journals, orders, auditLogs, role } = useApp();

  const [activeTab, setActiveTab] = useState<
    | 'ikhtisar'
    | 'laba_rugi'
    | 'neraca'
    | 'neraca_saldo'
    | 'perubahan_modal'
    | 'arus_kas'
    | 'buku_besar'
    | 'jurnal_umum'
    | 'coa'
    | 'penjualan'
    | 'audit_log'
  >('ikhtisar');

  const [selectedLedgerAccount, setSelectedLedgerAccount] = useState('1101');

  // Compute ledgers, trial balance, income statement, balance sheet
  const ledgers = useMemo(() => calculateLedgers(journals), [journals]);
  const trialBalance = useMemo(() => generateTrialBalance(ledgers), [ledgers]);
  const incomeStatement = useMemo(() => generateIncomeStatement(ledgers), [ledgers]);
  const balanceSheet = useMemo(
    () => generateBalanceSheet(ledgers, incomeStatement),
    [ledgers, incomeStatement]
  );

  // Sales report summary
  const salesSummary = useMemo(() => {
    let totalItemsSold = 0;
    const productStats: Record<string, { name: string; qty: number; revenue: number; cogs: number }> = {};

    for (const order of orders) {
      if (order.orderStatus === 'DIBATALKAN' || order.orderStatus === 'EXPIRED') continue;
      for (const item of order.items) {
        totalItemsSold += item.quantity;
        if (!productStats[item.productId]) {
          productStats[item.productId] = {
            name: item.productName,
            qty: 0,
            revenue: 0,
            cogs: 0,
          };
        }
        productStats[item.productId].qty += item.quantity;
        productStats[item.productId].revenue += item.subtotal;
        productStats[item.productId].cogs += item.costPrice * item.quantity;
      }
    }

    return {
      totalItemsSold,
      productStats: Object.values(productStats).sort((a, b) => b.revenue - a.revenue),
    };
  }, [orders]);

  const activeLedger = ledgers[selectedLedgerAccount];

  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Laporan Keuangan Standar Akuntansi
            </h1>
            <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-200">
              Double-Entry Bookkeeping
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Sistem akuntansi berstandar SAK EMKM: Jurnal Umum, Buku Besar, Neraca Saldo, Laba Rugi, dan Neraca Otomatis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-stone-200 scrollbar-none text-xs font-bold">
        {[
          { key: 'ikhtisar', label: 'Ringkasan KPI' },
          { key: 'laba_rugi', label: 'Laba Rugi (Income Statement)' },
          { key: 'neraca', label: 'Neraca (Balance Sheet)' },
          { key: 'neraca_saldo', label: 'Neraca Saldo (Trial Balance)' },
          { key: 'perubahan_modal', label: 'Perubahan Modal' },
          { key: 'arus_kas', label: 'Arus Kas (Cash Flow)' },
          { key: 'buku_besar', label: 'Buku Besar (Ledger)' },
          { key: 'jurnal_umum', label: 'Jurnal Umum' },
          { key: 'coa', label: 'Daftar Akun (COA)' },
          { key: 'penjualan', label: 'Laporan Penjualan' },
          { key: 'audit_log', label: 'Audit Log' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3 py-2 rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Ringkasan KPI Eksekutif */}
      {activeTab === 'ikhtisar' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                Total Omset Penjualan Snack
              </span>
              <span className="text-2xl font-black text-stone-900 tabular-nums">
                Rp {incomeStatement.totalRevenue.toLocaleString('id-ID')}
              </span>
              <span className="text-[11px] text-emerald-600 font-medium block">
                Dari {orders.filter((o) => o.orderStatus !== 'DIBATALKAN').length} pesanan berhasil
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                Beban Pokok Penjualan (HPP)
              </span>
              <span className="text-2xl font-black text-stone-700 tabular-nums">
                Rp {incomeStatement.totalCogs.toLocaleString('id-ID')}
              </span>
              <span className="text-[11px] text-stone-500 font-medium block">
                Biaya bahan baku snack terjual
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                Laba Kotor (Gross Profit)
              </span>
              <span className="text-2xl font-black text-amber-700 tabular-nums">
                Rp {incomeStatement.grossProfit.toLocaleString('id-ID')}
              </span>
              <span className="text-[11px] text-amber-800 font-medium block">
                Margin kotor:{' '}
                {incomeStatement.totalRevenue > 0
                  ? ((incomeStatement.grossProfit / incomeStatement.totalRevenue) * 100).toFixed(1)
                  : 0}
                %
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                Laba Bersih Usaha (Net Profit)
              </span>
              <span
                className={`text-2xl font-black tabular-nums ${
                  incomeStatement.netIncome >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                Rp {incomeStatement.netIncome.toLocaleString('id-ID')}
              </span>
              <span className="text-[11px] text-stone-500 font-medium block">
                Setelah beban operasional & kemasan
              </span>
            </div>
          </div>

          {/* Quick Double-Entry Integrity Status */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white ${
                  trialBalance.isBalanced && balanceSheet.isBalanced ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              >
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm">
                  Integritas Persamaan Dasar Akuntansi:{' '}
                  {trialBalance.isBalanced && balanceSheet.isBalanced ? 'SEIMBANG (BALANCED)' : 'PERLU PENYESUAIAN'}
                </h3>
                <p className="text-xs text-stone-500">
                  Total Debit (Rp {trialBalance.totalDebit.toLocaleString('id-ID')}) = Total Kredit (Rp {trialBalance.totalCredit.toLocaleString('id-ID')}).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right text-xs">
                <span className="text-stone-400 block">Total Aset Lancar:</span>
                <span className="font-bold text-stone-900 text-sm tabular-nums">
                  Rp {balanceSheet.totalAssets.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="text-right text-xs border-l border-stone-200 pl-3">
                <span className="text-stone-400 block">Kewajiban + Ekuitas:</span>
                <span className="font-bold text-stone-900 text-sm tabular-nums">
                  Rp {balanceSheet.totalLiabilitiesAndEquity.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Laporan Laba Rugi */}
      {activeTab === 'laba_rugi' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 max-w-3xl shadow-xs space-y-6">
          <div className="border-b border-stone-200 pb-4 text-center">
            <h2 className="text-lg font-black text-stone-900">KLETAK-KLETIK SNACK</h2>
            <h3 className="text-sm font-bold text-amber-800">LAPORAN LABA RUGI (INCOME STATEMENT)</h3>
            <span className="text-[11px] text-stone-400 block">
              Untuk Periode yang Berakhir pada 15 Oktober 2026 (Format Rupiah)
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Revenues */}
            <div>
              <span className="font-bold text-stone-900 uppercase tracking-wider block mb-2">
                Pendapatan Usaha (Revenue)
              </span>
              <div className="space-y-1.5 pl-4 border-l-2 border-stone-100">
                {incomeStatement.revenues.map((r) => (
                  <div key={r.code} className="flex justify-between text-stone-700">
                    <span>{r.code} - {r.name}</span>
                    <span className="font-semibold tabular-nums">Rp {r.amount.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-stone-900 pt-2 border-t border-stone-100 mt-2">
                <span>Total Pendapatan Usaha</span>
                <span className="tabular-nums">Rp {incomeStatement.totalRevenue.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* COGS */}
            <div>
              <span className="font-bold text-stone-900 uppercase tracking-wider block mb-2">
                Beban Pokok Penjualan (HPP)
              </span>
              <div className="space-y-1.5 pl-4 border-l-2 border-stone-100">
                {incomeStatement.cogs.map((c) => (
                  <div key={c.code} className="flex justify-between text-stone-700">
                    <span>{c.code} - {c.name}</span>
                    <span className="font-semibold tabular-nums">Rp {c.amount.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-stone-900 pt-2 border-t border-stone-100 mt-2">
                <span>Total Beban Pokok Penjualan (HPP)</span>
                <span className="tabular-nums">- Rp {incomeStatement.totalCogs.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="flex justify-between font-extrabold text-sm text-stone-900 bg-amber-50 p-3 rounded-xl border border-amber-200">
              <span>Laba Kotor (Gross Profit)</span>
              <span className="tabular-nums text-amber-800">
                Rp {incomeStatement.grossProfit.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Operating Expenses */}
            <div>
              <span className="font-bold text-stone-900 uppercase tracking-wider block mb-2">
                Beban Operasional Usaha
              </span>
              <div className="space-y-1.5 pl-4 border-l-2 border-stone-100">
                {incomeStatement.expenses.map((e) => (
                  <div key={e.code} className="flex justify-between text-stone-700">
                    <span>{e.code} - {e.name}</span>
                    <span className="font-semibold tabular-nums">Rp {e.amount.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-stone-900 pt-2 border-t border-stone-100 mt-2">
                <span>Total Beban Operasional</span>
                <span className="tabular-nums">- Rp {incomeStatement.totalExpenses.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Net Income */}
            <div className="flex justify-between font-black text-base text-stone-900 bg-emerald-50 p-4 rounded-xl border border-emerald-200">
              <span>Laba Bersih Bersih (Net Income)</span>
              <span className="tabular-nums text-emerald-800">
                Rp {incomeStatement.netIncome.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Neraca (Balance Sheet) */}
      {activeTab === 'neraca' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 max-w-4xl shadow-xs space-y-6">
          <div className="border-b border-stone-200 pb-4 text-center">
            <h2 className="text-lg font-black text-stone-900">KLETAK-KLETIK SNACK</h2>
            <h3 className="text-sm font-bold text-amber-800">NERACA KEUANGAN (BALANCE SHEET)</h3>
            <span className="text-[11px] text-stone-400 block">
              Per 15 Oktober 2026 (Persamaan: Aktiva = Kewajiban + Ekuitas)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            {/* Left: Aktiva / Aset */}
            <div className="space-y-4">
              <span className="font-extrabold text-stone-900 uppercase tracking-wider block pb-2 border-b border-stone-200">
                Aktiva / Aset
              </span>

              <div className="space-y-2">
                <span className="font-bold text-stone-700 block text-[11px]">Aset Lancar:</span>
                {balanceSheet.currentAssets.map((a) => (
                  <div key={a.code} className="flex justify-between text-stone-600 pl-3">
                    <span>{a.code} - {a.name}</span>
                    <span className="font-semibold tabular-nums text-stone-900">
                      Rp {a.amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-extrabold text-sm text-stone-900 pt-3 border-t-2 border-stone-200">
                <span>Total Aktiva (Aset)</span>
                <span className="tabular-nums text-amber-800">
                  Rp {balanceSheet.totalAssets.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Right: Pasiva / Kewajiban & Ekuitas */}
            <div className="space-y-4">
              <span className="font-extrabold text-stone-900 uppercase tracking-wider block pb-2 border-b border-stone-200">
                Kewajiban & Ekuitas
              </span>

              <div className="space-y-2">
                <span className="font-bold text-stone-700 block text-[11px]">Kewajiban / Hutang:</span>
                {balanceSheet.liabilities.length === 0 ? (
                  <span className="text-stone-400 pl-3 block">Tidak ada kewajiban jangka pendek</span>
                ) : (
                  balanceSheet.liabilities.map((l) => (
                    <div key={l.code} className="flex justify-between text-stone-600 pl-3">
                      <span>{l.code} - {l.name}</span>
                      <span className="font-semibold tabular-nums text-stone-900">
                        Rp {l.amount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2 pt-2">
                <span className="font-bold text-stone-700 block text-[11px]">Ekuitas Pemilik:</span>
                {balanceSheet.equity.map((eq) => (
                  <div key={eq.code} className="flex justify-between text-stone-600 pl-3">
                    <span>{eq.code} - {eq.name}</span>
                    <span className="font-semibold tabular-nums text-stone-900">
                      Rp {eq.amount.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-emerald-700 pl-3 font-semibold">
                  <span>Laba Bersih Berjalan</span>
                  <span className="tabular-nums">Rp {balanceSheet.netIncome.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="flex justify-between font-extrabold text-sm text-stone-900 pt-3 border-t-2 border-stone-200">
                <span>Total Kewajiban & Ekuitas</span>
                <span className="tabular-nums text-amber-800">
                  Rp {balanceSheet.totalLiabilitiesAndEquity.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Neraca Saldo (Trial Balance) */}
      {activeTab === 'neraca_saldo' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-stone-900 text-sm">
                Neraca Saldo Sebelum Penyesuaian (Trial Balance)
              </h2>
              <span className="text-[11px] text-stone-400">
                Memastikan seluruh saldo debit dan kredit akun COA dalam posisi seimbang.
              </span>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                trialBalance.isBalanced ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {trialBalance.isBalanced ? '✓ Seimbang (Balanced)' : '✕ Tidak Seimbang'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Kode Akun</th>
                  <th className="py-3 px-4">Nama Akun (Chart of Account)</th>
                  <th className="py-3 px-4">Klasifikasi</th>
                  <th className="py-3 px-4 text-right">Debit (Rp)</th>
                  <th className="py-3 px-4 text-right">Kredit (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono">
                {trialBalance.rows.map((row) => (
                  <tr key={row.accountCode} className="hover:bg-stone-50/50">
                    <td className="py-3 px-4 font-bold text-stone-900">{row.accountCode}</td>
                    <td className="py-3 px-4 font-sans font-medium text-stone-800">{row.accountName}</td>
                    <td className="py-3 px-4 font-sans text-stone-500 text-[11px]">{row.type}</td>
                    <td className="py-3 px-4 text-right font-semibold tabular-nums text-stone-900">
                      {row.debit > 0 ? row.debit.toLocaleString('id-ID') : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold tabular-nums text-stone-900">
                      {row.credit > 0 ? row.credit.toLocaleString('id-ID') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-stone-50 border-t-2 border-stone-300 font-bold font-mono">
                <tr>
                  <td colSpan={3} className="py-3 px-4 font-sans text-stone-900">
                    TOTAL KESEIMBANGAN
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums text-emerald-800 text-sm">
                    Rp {trialBalance.totalDebit.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums text-emerald-800 text-sm">
                    Rp {trialBalance.totalCredit.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Laporan Perubahan Modal */}
      {activeTab === 'perubahan_modal' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 max-w-2xl shadow-xs space-y-6">
          <div className="border-b border-stone-200 pb-4 text-center">
            <h2 className="text-lg font-black text-stone-900">KLETAK-KLETIK SNACK</h2>
            <h3 className="text-sm font-bold text-amber-800">LAPORAN PERUBAHAN MODAL (EQUITY STATEMENT)</h3>
            <span className="text-[11px] text-stone-400 block">
              Untuk Periode Berjalan Oktober 2026
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-stone-700">
              <span>Modal Awal Pemilik (Fitriani Lestari per 1 Okt 2026)</span>
              <span className="font-semibold tabular-nums">Rp 15.000.000</span>
            </div>
            <div className="flex justify-between text-emerald-700">
              <span>Ditambah: Laba Bersih Periode Berjalan</span>
              <span className="font-bold tabular-nums">Rp {incomeStatement.netIncome.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-stone-500">
              <span>Dikurangi: Prive Pemilik (Penarikan Pribadi)</span>
              <span className="tabular-nums">- Rp 0</span>
            </div>
            <div className="flex justify-between font-black text-sm text-stone-900 pt-3 border-t-2 border-stone-200 bg-amber-50/60 p-3 rounded-xl">
              <span>Modal Akhir Pemilik (15 Oktober 2026)</span>
              <span className="tabular-nums text-amber-800">
                Rp {(15000000 + incomeStatement.netIncome).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Arus Kas (Cash Flow) */}
      {activeTab === 'arus_kas' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 max-w-2xl shadow-xs space-y-6">
          <div className="border-b border-stone-200 pb-4 text-center">
            <h2 className="text-lg font-black text-stone-900">KLETAK-KLETIK SNACK</h2>
            <h3 className="text-sm font-bold text-amber-800">LAPORAN ARUS KAS (CASH FLOW STATEMENT)</h3>
            <span className="text-[11px] text-stone-400 block">Metode Langsung (Aktivitas Operasi, Investasi, Pendanaan)</span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <span className="font-bold text-stone-900 uppercase tracking-wider block mb-2">
                1. Arus Kas dari Aktivitas Operasi
              </span>
              <div className="space-y-1.5 pl-4 border-l-2 border-stone-100">
                <div className="flex justify-between text-stone-700">
                  <span>Penerimaan Kas dari Pelanggan Snack</span>
                  <span className="font-semibold tabular-nums text-emerald-700">
                    + Rp {incomeStatement.totalRevenue.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-stone-700">
                  <span>Pembayaran Beban Operasional & Kemasan</span>
                  <span className="font-semibold tabular-nums text-rose-700">
                    - Rp {incomeStatement.totalExpenses.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <span className="font-bold text-stone-900 uppercase tracking-wider block mb-2">
                2. Arus Kas dari Aktivitas Pendanaan
              </span>
              <div className="space-y-1.5 pl-4 border-l-2 border-stone-100">
                <div className="flex justify-between text-stone-700">
                  <span>Setoran Modal Awal Fitriani Lestari</span>
                  <span className="font-semibold tabular-nums text-emerald-700">+ Rp 13.000.000</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between font-black text-sm text-stone-900 pt-3 border-t-2 border-stone-200 bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
              <span>Total Saldo Kas & Bank Akhir Periode</span>
              <span className="tabular-nums text-emerald-800">
                Rp {((ledgers['1101']?.endingBalance || 0) + (ledgers['1102']?.endingBalance || 0)).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Buku Besar (General Ledger per Akun) */}
      {activeTab === 'buku_besar' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div>
              <h2 className="font-bold text-stone-900 text-sm">
                Buku Besar (General Ledger)
              </h2>
              <span className="text-[11px] text-stone-400">
                Pilih akun untuk melihat seluruh posting jurnal dan saldo berjalan.
              </span>
            </div>

            <select
              value={selectedLedgerAccount}
              onChange={(e) => setSelectedLedgerAccount(e.target.value)}
              className="px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {STANDARD_COA.map((acc) => (
                <option key={acc.code} value={acc.code}>
                  {acc.code} - {acc.name}
                </option>
              ))}
            </select>
          </div>

          {activeLedger ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-sans uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">No. Jurnal</th>
                    <th className="py-2.5 px-3">Keterangan Transaksi</th>
                    <th className="py-2.5 px-3 text-right">Debit (Rp)</th>
                    <th className="py-2.5 px-3 text-right">Kredit (Rp)</th>
                    <th className="py-2.5 px-3 text-right">Saldo Berjalan (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {activeLedger.entries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-400 font-sans">
                        Belum ada mutasi untuk akun ini.
                      </td>
                    </tr>
                  ) : (
                    activeLedger.entries.map((entry, idx) => (
                      <tr key={idx} className="hover:bg-stone-50/50">
                        <td className="py-2.5 px-3 text-stone-500">{entry.date}</td>
                        <td className="py-2.5 px-3 text-amber-700 font-bold">{entry.referenceNumber}</td>
                        <td className="py-2.5 px-3 font-sans text-stone-800">{entry.description}</td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-stone-900">
                          {entry.debit > 0 ? entry.debit.toLocaleString('id-ID') : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-stone-900">
                          {entry.credit > 0 ? entry.credit.toLocaleString('id-ID') : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold tabular-nums text-stone-900">
                          {entry.balance.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-stone-50 border-t border-stone-200 font-bold">
                  <tr>
                    <td colSpan={3} className="py-2.5 px-3 font-sans">Saldo Akhir Akun</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{activeLedger.totalDebit.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{activeLedger.totalCredit.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-amber-800 text-sm">
                      Rp {activeLedger.endingBalance.toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : null}
        </div>
      )}

      {/* Tab 8: Jurnal Umum (General Journal) */}
      {activeTab === 'jurnal_umum' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-stone-900 text-sm">
                Jurnal Umum Double-Entry (General Journal)
              </h2>
              <span className="text-[11px] text-stone-400">
                Semua transaksi order dan persediaan otomatis mencatat debit dan kredit seimbang.
              </span>
            </div>
            <span className="text-xs text-stone-500 font-semibold">
              {journals.length} bukti jurnal tercatat
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-sans uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Tanggal / No. Jurnal</th>
                  <th className="py-3 px-4">Akun & Keterangan</th>
                  <th className="py-3 px-4">Ref. Tipe</th>
                  <th className="py-3 px-4 text-right">Debit (Rp)</th>
                  <th className="py-3 px-4 text-right">Kredit (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {journals.map((j) => (
                  <React.Fragment key={j.id}>
                    {j.lines.map((line, lIdx) => (
                      <tr key={lIdx} className="hover:bg-stone-50/50">
                        {lIdx === 0 ? (
                          <td rowSpan={j.lines.length} className="py-3 px-4 align-top border-r border-stone-100 text-stone-600">
                            <span className="block font-bold text-stone-900">{j.date}</span>
                            <span className="text-[11px] text-amber-800">{j.entryNumber}</span>
                          </td>
                        ) : null}
                        <td className={`py-1.5 px-4 font-sans ${line.credit > 0 ? 'pl-8' : 'font-semibold text-stone-900'}`}>
                          <span>{line.accountCode} - {line.accountName}</span>
                          {lIdx === j.lines.length - 1 && (
                            <span className="block text-[11px] text-stone-400 italic mt-0.5">
                              ({j.description})
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-4 text-[10px] text-stone-400">
                          {lIdx === 0 ? j.referenceType : ''}
                        </td>
                        <td className="py-1.5 px-4 text-right tabular-nums text-stone-900">
                          {line.debit > 0 ? line.debit.toLocaleString('id-ID') : '-'}
                        </td>
                        <td className="py-1.5 px-4 text-right tabular-nums text-stone-900">
                          {line.credit > 0 ? line.credit.toLocaleString('id-ID') : '-'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-stone-50/40">
                      <td colSpan={5} className="h-1 p-0 border-b border-stone-200"></td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 9: Chart of Accounts (COA) */}
      {activeTab === 'coa' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-100">
            <h2 className="font-bold text-stone-900 text-sm">
              Chart of Accounts (COA) - Standar Akuntansi UMKM Kletak-Kletik
            </h2>
            <span className="text-[11px] text-stone-400">
              Daftar kode akun terstruktur untuk klasifikasi aset, kewajiban, ekuitas, omset, dan beban.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Kode Akun</th>
                  <th className="py-3 px-4">Nama Akun</th>
                  <th className="py-3 px-4">Tipe Akun</th>
                  <th className="py-3 px-4">Saldo Normal</th>
                  <th className="py-3 px-4">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono">
                {STANDARD_COA.map((acc) => (
                  <tr key={acc.code} className="hover:bg-stone-50/50">
                    <td className="py-3 px-4 font-bold text-amber-800">{acc.code}</td>
                    <td className="py-3 px-4 font-sans font-bold text-stone-900">{acc.name}</td>
                    <td className="py-3 px-4 font-sans">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                        {acc.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold">
                      <span className={acc.normalBalance === 'DEBIT' ? 'text-blue-700' : 'text-emerald-700'}>
                        {acc.normalBalance}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-stone-500">{acc.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 10: Laporan Penjualan */}
      {activeTab === 'penjualan' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-stone-900 text-sm">
                Laporan Penjualan per Varian Produk Snack
              </h2>
              <span className="text-[11px] text-stone-400">
                Peringkat omset, kuantitas terjual, dan margin laba kotor tiap produk.
              </span>
            </div>
            <span className="text-xs text-stone-600 font-bold">
              Total {salesSummary.totalItemsSold} pouch terjual
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Varian Snack</th>
                  <th className="py-3 px-4 text-right">Kuantitas Terjual</th>
                  <th className="py-3 px-4 text-right">Total Omset (Rp)</th>
                  <th className="py-3 px-4 text-right">Total HPP (Rp)</th>
                  <th className="py-3 px-4 text-right">Laba Kotor (Rp)</th>
                  <th className="py-3 px-4 text-right">Margin (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 tabular-nums">
                {salesSummary.productStats.map((st, i) => {
                  const profit = st.revenue - st.cogs;
                  const marginPct = st.revenue > 0 ? ((profit / st.revenue) * 100).toFixed(1) : 0;

                  return (
                    <tr key={i} className="hover:bg-stone-50/50">
                      <td className="py-3 px-4 font-bold text-stone-900 font-sans">{st.name}</td>
                      <td className="py-3 px-4 text-right font-semibold">{st.qty} pouch</td>
                      <td className="py-3 px-4 text-right font-bold text-stone-900">
                        Rp {st.revenue.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-right text-stone-500">
                        Rp {st.cogs.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">
                        Rp {profit.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-amber-800">
                        {marginPct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 11: Audit Log Sistem */}
      {activeTab === 'audit_log' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-stone-900 text-sm">
                Sistem Audit Log (Semua Perubahan Data Transaksi)
              </h2>
              <span className="text-[11px] text-stone-400">
                Pencatatan kepatuhan audit untuk setiap order, mutasi stok gudang, dan posting jurnal keuangan.
              </span>
            </div>
            <span className="text-xs text-stone-500 font-mono">
              {auditLogs.length} audit trail
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-sans uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Aktor</th>
                  <th className="py-3 px-4">Aksi</th>
                  <th className="py-3 px-4">Entitas</th>
                  <th className="py-3 px-4">Detail Perubahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/50">
                    <td className="py-2.5 px-4 text-stone-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-stone-800">{log.actor}</td>
                    <td className="py-2.5 px-4">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-stone-500 text-[11px]">{log.entityType}</td>
                    <td className="py-2.5 px-4 font-sans text-stone-700 max-w-md">{log.details}</td>
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
