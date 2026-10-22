export type Role = 'pelanggan' | 'penjual' | 'staff_gudang' | 'owner';

export type OrderStatus =
  | 'PENDING'
  | 'DIKONFIRMASI'
  | 'DISIAPKAN'
  | 'DIKEMAS'
  | 'SIAP_DIANTAR'
  | 'SIAP_DIAMBIL'
  | 'SELESAI'
  | 'DIBATALKAN'
  | 'EXPIRED';

export type PaymentMethod =
  | 'va_bca'
  | 'va_bni'
  | 'va_mandiri'
  | 'va_bri'
  | 'qris'
  | 'gopay'
  | 'ovo'
  | 'dana'
  | 'cod';

export type PaymentStatus = 'UNPAID' | 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';

export type FulfillmentMethod = 'delivery' | 'pickup';

export interface SnackProduct {
  id: string;
  name: string;
  category: 'Keripik' | 'Peyek' | 'Rengginang' | 'Kering Pedas' | 'Stik Gurih';
  price: number; // Harga jual (IDR)
  costPrice: number; // HPP per unit (IDR)
  stock: number;
  minStock: number;
  weightGrams: number;
  image: string;
  description: string;
  crispinessRating: number; // 1-5
  ingredients: string[];
  isActive: boolean;
}

export interface CartItem {
  product: SnackProduct;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  costPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  pickupLocation?: string;
  orderDate: string; // ISO string
  scheduledDate: string; // YYYY-MM-DD
  fulfillmentMethod: FulfillmentMethod;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  items: OrderItem[];
  itemsSubtotal: number;
  shippingFee: number;
  discountAmount: number;
  couponCode?: string;
  totalAmount: number;
  notes?: string;
  trackingHistory: {
    status: OrderStatus;
    timestamp: string;
    note: string;
    actor: string;
  }[];
  invoiceUrl?: string;
}

export type StockMovementType =
  | 'IN_PURCHASE' // Restock / Pembelian bahan
  | 'IN_PRODUCTION' // Hasil produksi baru
  | 'OUT_SALE' // Penjualan order
  | 'OUT_DAMAGED' // Rusak / Remuk
  | 'OUT_EXPIRED' // Kadaluarsa
  | 'OUT_SAMPLE' // Tester / display
  | 'ADJUSTMENT'; // Stok opname

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  movementType: StockMovementType;
  quantity: number; // Positif untuk masuk, negatif untuk keluar
  previousStock: number;
  newStock: number;
  date: string;
  reason: string;
  staffName: string;
  referenceId?: string; // Order ID or Opname ID
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'seller' | 'bot';
  senderName: string;
  text: string;
  timestamp: string;
  isQuickReply?: boolean;
}

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

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entityType: 'ORDER' | 'STOCK' | 'ACCOUNTING' | 'PRODUCT' | 'PAYMENT';
  entityId: string;
  details: string;
}
