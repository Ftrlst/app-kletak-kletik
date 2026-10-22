export type AccountType =
  | 'ASET_LANCAR'
  | 'ASET_TETAP'
  | 'KEWAJIBAN'
  | 'EKUITAS'
  | 'PENDAPATAN'
  | 'HPP'
  | 'BEBAN_OPERASIONAL';

export interface ChartOfAccount {
  code: string;
  name: string;
  type: AccountType;
  normalBalance: 'DEBIT' | 'KREDIT';
  description: string;
}

export interface JournalLine {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  description: string;
  referenceType: 'ORDER' | 'RESTOCK' | 'EXPENSE' | 'ADJUSTMENT' | 'INITIAL';
  referenceId?: string;
  lines: JournalLine[];
}

export interface SimpleOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  costPrice: number;
  subtotal: number;
}

export interface SimpleOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  orderDate: string;
  paymentMethod: string;
  items: SimpleOrderItem[];
  itemsSubtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
}

export const STANDARD_COA: ChartOfAccount[] = [
  {
    code: '1101',
    name: 'Kas di Tangan (Cash)',
    type: 'ASET_LANCAR',
    normalBalance: 'DEBIT',
    description: 'Uang kas operasional outlet dan penerimaan COD',
  },
  {
    code: '1102',
    name: 'Kas di Bank / Payment Gateway',
    type: 'ASET_LANCAR',
    normalBalance: 'DEBIT',
    description: 'Penerimaan via Virtual Account BCA, QRIS, & E-Wallet',
  },
  {
    code: '1103',
    name: 'Piutang Usaha',
    type: 'ASET_LANCAR',
    normalBalance: 'DEBIT',
    description: 'Tagihan penjualan yang belum lunas',
  },
  {
    code: '1104',
    name: 'Persediaan Barang Snack (Inventory)',
    type: 'ASET_LANCAR',
    normalBalance: 'DEBIT',
    description: 'Nilai persediaan snack keripik, peyek, rengginang siap jual',
  },
  {
    code: '2101',
    name: 'Hutang Usaha (Accounts Payable)',
    type: 'KEWAJIBAN',
    normalBalance: 'KREDIT',
    description: 'Kewajiban kepada supplier bahan baku singkong, pisang, minyak',
  },
  {
    code: '3101',
    name: 'Modal Usaha Fitriani',
    type: 'EKUITAS',
    normalBalance: 'KREDIT',
    description: 'Setoran modal pemilik awal usaha UMKM',
  },
  {
    code: '3201',
    name: 'Prive Pemilik',
    type: 'EKUITAS',
    normalBalance: 'DEBIT',
    description: 'Penarikan dana pribadi pemilik usaha',
  },
  {
    code: '4101',
    name: 'Pendapatan Penjualan Snack',
    type: 'PENDAPATAN',
    normalBalance: 'KREDIT',
    description: 'Omset kotor dari penjualan aneka snack Kletak-Kletik',
  },
  {
    code: '4102',
    name: 'Pendapatan Ongkos Kirim',
    type: 'PENDAPATAN',
    normalBalance: 'KREDIT',
    description: 'Penerimaan ongkir dari pemesanan mode delivery',
  },
  {
    code: '5101',
    name: 'Beban Pokok Penjualan (HPP)',
    type: 'HPP',
    normalBalance: 'DEBIT',
    description: 'Biaya pokok produksi snack yang telah terjual',
  },
  {
    code: '5201',
    name: 'Beban Kemasan & Standing Pouch',
    type: 'BEBAN_OPERASIONAL',
    normalBalance: 'DEBIT',
    description: 'Biaya plastik standing pouch, stiker label, kardus pengiriman',
  },
  {
    code: '5202',
    name: 'Beban Kurir & Ekspedisi',
    type: 'BEBAN_OPERASIONAL',
    normalBalance: 'DEBIT',
    description: 'Biaya bensin dan ongkos kirim ke kurir rekanan',
  },
  {
    code: '5203',
    name: 'Beban Kerusakan & Kadaluarsa Snack',
    type: 'BEBAN_OPERASIONAL',
    normalBalance: 'DEBIT',
    description: 'Penyesuaian stok snack rusak remuk atau melewati batas konsumsi',
  },
  {
    code: '5204',
    name: 'Beban Promosi & Diskon Kupon',
    type: 'BEBAN_OPERASIONAL',
    normalBalance: 'DEBIT',
    description: 'Potongan harga promosi dan kupon diskon pembeli',
  },
];

export function validateJournalEntry(entry: JournalEntry): { isValid: boolean; error?: string } {
  if (!entry.lines || entry.lines.length < 2) {
    return { isValid: false, error: 'Jurnal minimal harus memiliki 2 baris (Debit & Kredit)' };
  }

  const totalDebit = entry.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
  const totalCredit = entry.lines.reduce((sum, line) => sum + (line.credit || 0), 0);

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return {
      isValid: false,
      error: `Jurnal tidak seimbang! Total Debit (Rp ${totalDebit.toLocaleString('id-ID')}) != Total Kredit (Rp ${totalCredit.toLocaleString('id-ID')})`,
    };
  }

  return { isValid: true };
}

export function generateOrderSaleJournal(order: SimpleOrder): JournalEntry[] {
  const isCash = order.paymentMethod === 'cod';
  const cashAccount = isCash
    ? { code: '1101', name: 'Kas di Tangan (Cash)' }
    : { code: '1102', name: 'Kas di Bank / Payment Gateway' };

  const lines: JournalLine[] = [];

  // 1. Debit Kas/Bank sesuai total bayar
  lines.push({
    accountCode: cashAccount.code,
    accountName: cashAccount.name,
    debit: order.totalAmount,
    credit: 0,
  });

  // 2. Jika ada diskon kupon, catat sebagai Beban Promosi (Debit)
  if (order.discountAmount > 0) {
    lines.push({
      accountCode: '5204',
      accountName: 'Beban Promosi & Diskon Kupon',
      debit: order.discountAmount,
      credit: 0,
    });
  }

  // 3. Kredit Pendapatan Penjualan Snack
  lines.push({
    accountCode: '4101',
    accountName: 'Pendapatan Penjualan Snack',
    debit: 0,
    credit: order.itemsSubtotal,
  });

  // 4. Kredit Pendapatan Ongkir jika ada
  if (order.shippingFee > 0) {
    lines.push({
      accountCode: '4102',
      accountName: 'Pendapatan Ongkos Kirim',
      debit: 0,
      credit: order.shippingFee,
    });
  }

  const dateStr = order.orderDate.includes('T') ? order.orderDate.split('T')[0] : order.orderDate;

  const saleJournal: JournalEntry = {
    id: `JRN-SALE-${order.id}`,
    entryNumber: `JU-${order.orderNumber}-01`,
    date: dateStr,
    description: `Penjualan snack pesanan ${order.orderNumber} (${order.customerName})`,
    referenceType: 'ORDER',
    referenceId: order.id,
    lines,
  };

  // 5. Jurnal HPP & Pengurangan Persediaan
  const totalCost = order.items.reduce((sum, item) => sum + item.costPrice * item.quantity, 0);

  const costLines: JournalLine[] = [
    {
      accountCode: '5101',
      accountName: 'Beban Pokok Penjualan (HPP)',
      debit: totalCost,
      credit: 0,
    },
    {
      accountCode: '1104',
      accountName: 'Persediaan Barang Snack (Inventory)',
      debit: 0,
      credit: totalCost,
    },
  ];

  const cogsJournal: JournalEntry = {
    id: `JRN-COGS-${order.id}`,
    entryNumber: `JU-${order.orderNumber}-02`,
    date: dateStr,
    description: `Beban pokok penjualan & pengurangan stok untuk ${order.orderNumber}`,
    referenceType: 'ORDER',
    referenceId: order.id,
    lines: costLines,
  };

  return [saleJournal, cogsJournal];
}

export interface LedgerAccount {
  account: ChartOfAccount;
  entries: {
    date: string;
    description: string;
    referenceNumber: string;
    debit: number;
    credit: number;
    balance: number;
  }[];
  totalDebit: number;
  totalCredit: number;
  endingBalance: number;
}

export function calculateLedgers(journals: JournalEntry[]): Record<string, LedgerAccount> {
  const ledgers: Record<string, LedgerAccount> = {};

  for (const account of STANDARD_COA) {
    ledgers[account.code] = {
      account,
      entries: [],
      totalDebit: 0,
      totalCredit: 0,
      endingBalance: 0,
    };
  }

  const sortedJournals = [...journals].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const journal of sortedJournals) {
    for (const line of journal.lines) {
      if (!ledgers[line.accountCode]) {
        ledgers[line.accountCode] = {
          account: {
            code: line.accountCode,
            name: line.accountName,
            type: 'BEBAN_OPERASIONAL',
            normalBalance: 'DEBIT',
            description: line.accountName,
          },
          entries: [],
          totalDebit: 0,
          totalCredit: 0,
          endingBalance: 0,
        };
      }

      const ledger = ledgers[line.accountCode];
      ledger.totalDebit += line.debit;
      ledger.totalCredit += line.credit;

      const isDebitNormal = ledger.account.normalBalance === 'DEBIT';
      const balanceChange = isDebitNormal
        ? line.debit - line.credit
        : line.credit - line.debit;

      const previousBalance =
        ledger.entries.length > 0
          ? ledger.entries[ledger.entries.length - 1].balance
          : 0;

      ledger.entries.push({
        date: journal.date,
        description: journal.description,
        referenceNumber: journal.entryNumber,
        debit: line.debit,
        credit: line.credit,
        balance: previousBalance + balanceChange,
      });

      ledger.endingBalance = previousBalance + balanceChange;
    }
  }

  return ledgers;
}

export interface TrialBalanceRow {
  accountCode: string;
  accountName: string;
  type: string;
  debit: number;
  credit: number;
}

export function generateTrialBalance(ledgers: Record<string, LedgerAccount>): {
  rows: TrialBalanceRow[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
} {
  const rows: TrialBalanceRow[] = [];
  let totalDebit = 0;
  let totalCredit = 0;

  for (const code of Object.keys(ledgers).sort()) {
    const item = ledgers[code];
    if (item.totalDebit === 0 && item.totalCredit === 0) continue;

    const netDebit = item.totalDebit - item.totalCredit;
    const isDebitNormal = item.account.normalBalance === 'DEBIT';

    let rowDebit = 0;
    let rowCredit = 0;

    if (isDebitNormal) {
      if (netDebit >= 0) {
        rowDebit = netDebit;
      } else {
        rowCredit = Math.abs(netDebit);
      }
    } else {
      const netCredit = item.totalCredit - item.totalDebit;
      if (netCredit >= 0) {
        rowCredit = netCredit;
      } else {
        rowDebit = Math.abs(netCredit);
      }
    }

    rows.push({
      accountCode: item.account.code,
      accountName: item.account.name,
      type: item.account.type,
      debit: rowDebit,
      credit: rowCredit,
    });

    totalDebit += rowDebit;
    totalCredit += rowCredit;
  }

  return {
    rows,
    totalDebit,
    totalCredit,
    isBalanced: Math.abs(totalDebit - totalCredit) < 1,
  };
}

export interface IncomeStatement {
  revenues: { code: string; name: string; amount: number }[];
  totalRevenue: number;
  cogs: { code: string; name: string; amount: number }[];
  totalCogs: number;
  grossProfit: number;
  expenses: { code: string; name: string; amount: number }[];
  totalExpenses: number;
  netIncome: number;
}

export function generateIncomeStatement(ledgers: Record<string, LedgerAccount>): IncomeStatement {
  const revenues: { code: string; name: string; amount: number }[] = [];
  let totalRevenue = 0;

  const cogs: { code: string; name: string; amount: number }[] = [];
  let totalCogs = 0;

  const expenses: { code: string; name: string; amount: number }[] = [];
  let totalExpenses = 0;

  for (const item of Object.values(ledgers)) {
    if (item.account.type === 'PENDAPATAN') {
      const amount = item.totalCredit - item.totalDebit;
      if (amount !== 0) {
        revenues.push({ code: item.account.code, name: item.account.name, amount });
        totalRevenue += amount;
      }
    } else if (item.account.type === 'HPP') {
      const amount = item.totalDebit - item.totalCredit;
      if (amount !== 0) {
        cogs.push({ code: item.account.code, name: item.account.name, amount });
        totalCogs += amount;
      }
    } else if (item.account.type === 'BEBAN_OPERASIONAL') {
      const amount = item.totalDebit - item.totalCredit;
      if (amount !== 0) {
        expenses.push({ code: item.account.code, name: item.account.name, amount });
        totalExpenses += amount;
      }
    }
  }

  const grossProfit = totalRevenue - totalCogs;
  const netIncome = grossProfit - totalExpenses;

  return {
    revenues,
    totalRevenue,
    cogs,
    totalCogs,
    grossProfit,
    expenses,
    totalExpenses,
    netIncome,
  };
}

export interface BalanceSheet {
  currentAssets: { code: string; name: string; amount: number }[];
  totalCurrentAssets: number;
  totalAssets: number;
  liabilities: { code: string; name: string; amount: number }[];
  totalLiabilities: number;
  equity: { code: string; name: string; amount: number }[];
  netIncome: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
}

export function generateBalanceSheet(
  ledgers: Record<string, LedgerAccount>,
  incomeStatement: IncomeStatement
): BalanceSheet {
  const currentAssets: { code: string; name: string; amount: number }[] = [];
  let totalCurrentAssets = 0;

  const liabilities: { code: string; name: string; amount: number }[] = [];
  let totalLiabilities = 0;

  const equity: { code: string; name: string; amount: number }[] = [];
  let baseEquity = 0;

  for (const item of Object.values(ledgers)) {
    if (item.account.type === 'ASET_LANCAR' || item.account.type === 'ASET_TETAP') {
      const amount = item.totalDebit - item.totalCredit;
      if (amount !== 0) {
        currentAssets.push({ code: item.account.code, name: item.account.name, amount });
        totalCurrentAssets += amount;
      }
    } else if (item.account.type === 'KEWAJIBAN') {
      const amount = item.totalCredit - item.totalDebit;
      if (amount !== 0) {
        liabilities.push({ code: item.account.code, name: item.account.name, amount });
        totalLiabilities += amount;
      }
    } else if (item.account.type === 'EKUITAS') {
      const isCreditNormal = item.account.normalBalance === 'KREDIT';
      const amount = isCreditNormal
        ? item.totalCredit - item.totalDebit
        : item.totalDebit - item.totalCredit;
      if (amount !== 0) {
        equity.push({ code: item.account.code, name: item.account.name, amount: isCreditNormal ? amount : -amount });
        baseEquity += isCreditNormal ? amount : -amount;
      }
    }
  }

  const totalAssets = totalCurrentAssets;
  const totalEquity = baseEquity + incomeStatement.netIncome;
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  return {
    currentAssets,
    totalCurrentAssets,
    totalAssets,
    liabilities,
    totalLiabilities,
    equity,
    netIncome: incomeStatement.netIncome,
    totalEquity,
    totalLiabilitiesAndEquity,
    isBalanced: Math.abs(totalAssets - totalLiabilitiesAndEquity) < 1,
  };
}
