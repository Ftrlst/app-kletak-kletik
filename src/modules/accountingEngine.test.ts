import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateJournalEntry,
  generateOrderSaleJournal,
  calculateLedgers,
  generateTrialBalance,
  generateIncomeStatement,
  generateBalanceSheet,
} from './accountingEngine.ts';
import type { JournalEntry, SimpleOrder } from './accountingEngine.ts';

test('Accounting Engine - Validates journal balance (Debit equals Credit)', () => {
  const balancedEntry: JournalEntry = {
    id: '1',
    entryNumber: 'JU-001',
    date: '2026-10-15',
    description: 'Initial balance',
    referenceType: 'INITIAL',
    lines: [
      { accountCode: '1101', accountName: 'Kas di Tangan', debit: 5000000, credit: 0 },
      { accountCode: '3101', accountName: 'Modal Usaha Fitriani', debit: 0, credit: 5000000 },
    ],
  };

  const validation = validateJournalEntry(balancedEntry);
  assert.equal(validation.isValid, true);

  const unbalancedEntry: JournalEntry = {
    id: '2',
    entryNumber: 'JU-002',
    date: '2026-10-15',
    description: 'Unbalanced entry',
    referenceType: 'EXPENSE',
    lines: [
      { accountCode: '5201', accountName: 'Beban Kemasan', debit: 100000, credit: 0 },
      { accountCode: '1101', accountName: 'Kas di Tangan', debit: 0, credit: 80000 },
    ],
  };

  const failedValidation = validateJournalEntry(unbalancedEntry);
  assert.equal(failedValidation.isValid, false);
});

test('Accounting Engine - Generates balanced journals from snack order sale and HPP', () => {
  const dummyOrder: SimpleOrder = {
    id: 'ord-123',
    orderNumber: 'KLTK-20261015-001',
    customerName: 'Budi Santoso',
    orderDate: '2026-10-15T10:00:00Z',
    paymentMethod: 'qris',
    items: [
      {
        productId: 'prod-1',
        productName: 'Keripik Pisang Karamel Madu',
        quantity: 2,
        price: 25000,
        costPrice: 15000,
        subtotal: 50000,
      },
    ],
    itemsSubtotal: 50000,
    shippingFee: 10000,
    discountAmount: 5000,
    totalAmount: 55000,
  };

  const journals = generateOrderSaleJournal(dummyOrder);
  assert.equal(journals.length, 2);

  // Both journals must be perfectly balanced
  for (const j of journals) {
    const val = validateJournalEntry(j);
    assert.equal(val.isValid, true, val.error);
  }
});

test('Accounting Engine - End-to-end ledger, trial balance, and balance sheet equation', () => {
  const initialCapitalJournal: JournalEntry = {
    id: 'init-1',
    entryNumber: 'JU-INIT-01',
    date: '2026-10-01',
    description: 'Setoran Modal Awal Usaha',
    referenceType: 'INITIAL',
    lines: [
      { accountCode: '1101', accountName: 'Kas di Tangan (Cash)', debit: 10000000, credit: 0 },
      { accountCode: '1104', accountName: 'Persediaan Barang Snack (Inventory)', debit: 5000000, credit: 0 },
      { accountCode: '3101', accountName: 'Modal Usaha Fitriani', debit: 0, credit: 15000000 },
    ],
  };

  const saleOrder: SimpleOrder = {
    id: 'ord-01',
    orderNumber: 'ORD-01',
    customerName: 'Ani',
    orderDate: '2026-10-02T10:00:00Z',
    paymentMethod: 'va_bca',
    items: [
      {
        productId: 'p1',
        productName: 'Peyek Kacang Daun Jeruk',
        quantity: 10,
        price: 20000,
        costPrice: 12000,
        subtotal: 200000,
      },
    ],
    itemsSubtotal: 200000,
    shippingFee: 0,
    discountAmount: 0,
    totalAmount: 200000,
  };

  const saleJournals = generateOrderSaleJournal(saleOrder);
  const allJournals = [initialCapitalJournal, ...saleJournals];

  const ledgers = calculateLedgers(allJournals);
  const trialBalance = generateTrialBalance(ledgers);

  assert.equal(trialBalance.isBalanced, true, 'Trial balance must be balanced');
  assert.equal(trialBalance.totalDebit, trialBalance.totalCredit);

  const incomeStatement = generateIncomeStatement(ledgers);
  // Revenue: 200,000, COGS: 120,000 => Net Income: 80,000
  assert.equal(incomeStatement.totalRevenue, 200000);
  assert.equal(incomeStatement.totalCogs, 120000);
  assert.equal(incomeStatement.netIncome, 80000);

  const balanceSheet = generateBalanceSheet(ledgers, incomeStatement);
  // Assets must equal Liabilities + Equity
  assert.equal(balanceSheet.isBalanced, true, 'Balance sheet must balance: Assets = Liabilities + Equity');
  assert.equal(balanceSheet.totalAssets, balanceSheet.totalLiabilitiesAndEquity);
});
