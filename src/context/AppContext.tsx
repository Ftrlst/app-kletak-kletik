import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AuditLog,
  CartItem,
  ChatMessage,
  JournalEntry,
  Order,
  OrderStatus,
  Role,
  SnackProduct,
  StockMovement,
  StockMovementType,
} from '../types/index.ts';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_JOURNALS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_STOCK_MOVEMENTS,
} from '../data/initialData.ts';
import { canTransitionOrder } from '../modules/orderStateMachine.ts';
import { generateOrderSaleJournal } from '../modules/accountingEngine.ts';

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  products: SnackProduct[];
  addProduct: (product: Omit<SnackProduct, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<SnackProduct>) => void;
  deleteProduct: (id: string) => void;
  cart: CartItem[];
  addToCart: (product: SnackProduct, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTotalCount: number;
  appliedCoupon: string | null;
  discountAmount: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  orders: Order[];
  createOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    fulfillmentMethod: 'delivery' | 'pickup';
    customerAddress?: string;
    pickupLocation?: string;
    scheduledDate: string;
    paymentMethod: any;
    notes?: string;
  }) => Order;
  updateOrderStatus: (orderId: string, targetStatus: OrderStatus, actorName?: string, note?: string) => boolean;
  verifyOrderPayment: (orderId: string, actorName?: string) => boolean;
  cancelOrder: (orderId: string, reason: string) => boolean;
  stockMovements: StockMovement[];
  addStockMovement: (
    productId: string,
    movementType: StockMovementType,
    quantity: number,
    reason: string,
    staffName: string,
    unitCost?: number
  ) => boolean;
  journals: JournalEntry[];
  addManualJournal: (entry: Omit<JournalEntry, 'id'>) => boolean;
  chatMessages: ChatMessage[];
  sendMessage: (text: string, senderOverride?: 'customer' | 'seller') => void;
  auditLogs: AuditLog[];
  selectedTrackingOrderId: string | null;
  setSelectedTrackingOrderId: (id: string | null) => void;
  lowStockProducts: SnackProduct[];
  isOnline: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'kletak_kletik_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Failed to load ' + key + ' from storage', e);
  }
  return fallback;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('pelanggan');
  const [activeView, setActiveView] = useState<string>('katalog');
  const [products, setProducts] = useState<SnackProduct[]>(() =>
    loadFromStorage('products', INITIAL_PRODUCTS)
  );
  const [cart, setCart] = useState<CartItem[]>(() =>
    loadFromStorage('cart', [])
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    loadFromStorage('orders', INITIAL_ORDERS)
  );
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() =>
    loadFromStorage('stock_movements', INITIAL_STOCK_MOVEMENTS)
  );
  const [journals, setJournals] = useState<JournalEntry[]>(() =>
    loadFromStorage('journals', INITIAL_JOURNALS)
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() =>
    loadFromStorage('chat_messages', INITIAL_CHAT_MESSAGES)
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    loadFromStorage('audit_logs', INITIAL_AUDIT_LOGS)
  );
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [selectedTrackingOrderId, setSelectedTrackingOrderId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'products', JSON.stringify(products));
      localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'cart', JSON.stringify(cart));
      localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'orders', JSON.stringify(orders));
      localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'stock_movements', JSON.stringify(stockMovements));
      localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'journals', JSON.stringify(journals));
      localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'chat_messages', JSON.stringify(chatMessages));
      localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'audit_logs', JSON.stringify(auditLogs));
    } catch (e) {
      // quota or private mode fallback
    }
  }, [products, cart, orders, stockMovements, journals, chatMessages, auditLogs]);

  // Derived calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  let discountAmount = 0;
  if (appliedCoupon === 'KLETAK10') {
    discountAmount = Math.round(cartSubtotal * 0.1);
  } else if (appliedCoupon === 'DISKON5RB') {
    discountAmount = 5000;
  }

  const lowStockProducts = products.filter((p) => p.isActive && p.stock <= p.minStock);

  const addAudit = (action: string, entityType: any, entityId: string, details: string, actor: string) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      actor,
      action,
      entityType,
      entityId,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const addToCart = (product: SnackProduct, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(product.stock, i.quantity + quantity) }
            : i
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'KLETAK10') {
      setAppliedCoupon('KLETAK10');
      return { success: true, message: 'Kupon KLETAK10 aktif! Diskon 10% berhasil dipotong.' };
    }
    if (cleanCode === 'DISKON5RB') {
      setAppliedCoupon('DISKON5RB');
      return { success: true, message: 'Kupon DISKON5RB aktif! Potongan Rp 5.000 diterapkan.' };
    }
    return { success: false, message: 'Kode kupon tidak valid atau telah kadaluarsa.' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const createOrder = (orderData: {
    customerName: string;
    customerPhone: string;
    fulfillmentMethod: 'delivery' | 'pickup';
    customerAddress?: string;
    pickupLocation?: string;
    scheduledDate: string;
    paymentMethod: any;
    notes?: string;
  }): Order => {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const orderNumber = `KLTK-${todayStr}-${randomSuffix}`;
    const orderId = 'ord-' + Date.now();

    // Ongkir rule: delivery is Rp 10.000, free if subtotal >= 100.000
    const shippingFee =
      orderData.fulfillmentMethod === 'delivery'
        ? cartSubtotal >= 100000
          ? 0
          : 10000
        : 0;

    const totalAmount = Math.max(0, cartSubtotal + shippingFee - discountAmount);
    const isCod = orderData.paymentMethod === 'cod';

    const orderItems = cart.map((ci) => ({
      productId: ci.product.id,
      productName: ci.product.name,
      quantity: ci.quantity,
      price: ci.product.price,
      costPrice: ci.product.costPrice,
      subtotal: ci.product.price * ci.quantity,
    }));

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerAddress: orderData.customerAddress,
      pickupLocation: orderData.pickupLocation,
      orderDate: new Date().toISOString(),
      scheduledDate: orderData.scheduledDate,
      fulfillmentMethod: orderData.fulfillmentMethod,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: isCod ? 'PENDING' : 'PAID', // Non-COD simulator acts as successful payment
      orderStatus: isCod ? 'PENDING' : 'DIKONFIRMASI',
      items: orderItems,
      itemsSubtotal: cartSubtotal,
      shippingFee,
      discountAmount,
      couponCode: appliedCoupon || undefined,
      totalAmount,
      notes: orderData.notes,
      trackingHistory: [
        {
          status: 'PENDING',
          timestamp: new Date().toISOString(),
          note: 'Pesanan dibuat oleh pelanggan.',
          actor: orderData.customerName,
        },
        ...(isCod
          ? []
          : [
              {
                status: 'DIKONFIRMASI' as OrderStatus,
                timestamp: new Date().toISOString(),
                note: `Pembayaran ${orderData.paymentMethod.toUpperCase()} sukses diverifikasi.`,
                actor: 'Payment Gateway',
              },
            ]),
      ],
    };

    // Update product stock and record movements
    for (const item of orderItems) {
      const prod = products.find((p) => p.id === item.productId);
      const prevStock = prod ? prod.stock : 0;
      const newStock = Math.max(0, prevStock - item.quantity);

      updateProduct(item.productId, { stock: newStock });

      const movement: StockMovement = {
        id: 'sm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        productId: item.productId,
        productName: item.productName,
        movementType: 'OUT_SALE',
        quantity: -item.quantity,
        previousStock: prevStock,
        newStock,
        date: new Date().toISOString().split('T')[0],
        reason: `Penjualan order ${orderNumber}`,
        staffName: 'Sistem Pemesanan Web',
        referenceId: orderId,
      };
      setStockMovements((prev) => [movement, ...prev]);
    }

    // If paid immediately (non-COD), generate double-entry accounting journals!
    if (!isCod) {
      const newJournals = generateOrderSaleJournal(newOrder);
      setJournals((prev) => [...prev, ...newJournals]);
      addAudit(
        'POSTING_JURNAL_OTOMATIS',
        'ACCOUNTING',
        newOrder.id,
        `Jurnal pendapatan dan HPP untuk order ${orderNumber} berhasil dicatat.`,
        'Sistem Akuntansi'
      );
    }

    addAudit(
      'ORDER_BARU',
      'ORDER',
      newOrder.id,
      `Order ${orderNumber} dibuat oleh ${orderData.customerName} (Total: Rp ${totalAmount.toLocaleString('id-ID')}).`,
      orderData.customerName
    );

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setSelectedTrackingOrderId(orderId);

    // Send order confirmation bot message in chat
    const botConfirmation: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'bot',
      senderName: 'Sistem Kletak-Kletik',
      text: `🎉 Pesanan #${orderNumber} (${orderItems.length} snack) berhasil kami terima! Total: Rp ${totalAmount.toLocaleString('id-ID')}. Status saat ini: ${isCod ? 'Menunggu Konfirmasi' : 'Dikonfirmasi'}. Anda dapat memantau status secara langsung di menu Lacak Status.`,
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, botConfirmation]);

    return newOrder;
  };

  const updateOrderStatus = (
    orderId: string,
    targetStatus: OrderStatus,
    actorName = 'Staff Toko',
    note?: string
  ): boolean => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return false;

    if (!canTransitionOrder(order.orderStatus, targetStatus, order.fulfillmentMethod)) {
      console.warn(`Cannot transition from ${order.orderStatus} to ${targetStatus}`);
      return false;
    }

    const updatedHistory = [
      ...order.trackingHistory,
      {
        status: targetStatus,
        timestamp: new Date().toISOString(),
        note: note || `Status pesanan diperbarui menjadi ${targetStatus}.`,
        actor: actorName,
      },
    ];

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, orderStatus: targetStatus, trackingHistory: updatedHistory } : o
      )
    );

    addAudit(
      'UPDATE_STATUS_PESANAN',
      'ORDER',
      orderId,
      `Status pesanan ${order.orderNumber} diubah: ${order.orderStatus} -> ${targetStatus}.`,
      actorName
    );

    return true;
  };

  const verifyOrderPayment = (orderId: string, actorName = 'Penjual / Admin'): boolean => {
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.paymentStatus === 'PAID') return false;

    const updatedHistory = [
      ...order.trackingHistory,
      {
        status: 'DIKONFIRMASI' as OrderStatus,
        timestamp: new Date().toISOString(),
        note: 'Pembayaran telah diverifikasi secara manual oleh penjual.',
        actor: actorName,
      },
    ];

    const updatedOrder: Order = {
      ...order,
      paymentStatus: 'PAID',
      orderStatus: 'DIKONFIRMASI',
      trackingHistory: updatedHistory,
    };

    setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));

    // Generate accounting journals
    const newJournals = generateOrderSaleJournal(updatedOrder);
    setJournals((prev) => [...prev, ...newJournals]);

    addAudit(
      'VERIFIKASI_PEMBAYARAN_MANUAL',
      'PAYMENT',
      orderId,
      `Pembayaran pesanan ${order.orderNumber} senilai Rp ${order.totalAmount.toLocaleString('id-ID')} diverifikasi oleh ${actorName}.`,
      actorName
    );

    return true;
  };

  const cancelOrder = (orderId: string, reason: string): boolean => {
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.orderStatus === 'SELESAI' || order.orderStatus === 'DIBATALKAN') return false;

    // Return stock
    for (const item of order.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        const prevStock = prod.stock;
        const newStock = prevStock + item.quantity;
        updateProduct(item.productId, { stock: newStock });

        const movement: StockMovement = {
          id: 'sm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          productId: item.productId,
          productName: item.productName,
          movementType: 'ADJUSTMENT',
          quantity: item.quantity,
          previousStock: prevStock,
          newStock,
          date: new Date().toISOString().split('T')[0],
          reason: `Pengembalian stok pembatalan order ${order.orderNumber}: ${reason}`,
          staffName: 'Sistem Pembatalan',
          referenceId: orderId,
        };
        setStockMovements((prev) => [movement, ...prev]);
      }
    }

    const updatedHistory = [
      ...order.trackingHistory,
      {
        status: 'DIBATALKAN' as OrderStatus,
        timestamp: new Date().toISOString(),
        note: `Pesanan dibatalkan: ${reason}`,
        actor: role === 'pelanggan' ? 'Pelanggan' : 'Admin',
      },
    ];

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, orderStatus: 'DIBATALKAN', trackingHistory: updatedHistory } : o
      )
    );

    addAudit(
      'PEMBATALAN_PESANAN',
      'ORDER',
      orderId,
      `Pesanan ${order.orderNumber} dibatalkan. Alasan: ${reason}. Stok telah dikembalikan ke inventori.`,
      role
    );

    return true;
  };

  const addProduct = (product: Omit<SnackProduct, 'id'>) => {
    const newId = 'prod-' + Date.now();
    const newProduct: SnackProduct = { ...product, id: newId };
    setProducts((prev) => [...prev, newProduct]);

    addAudit(
      'TAMBAH_PRODUK',
      'PRODUCT',
      newId,
      `Produk snack baru ditambahkan: ${product.name} (Harga: Rp ${product.price.toLocaleString('id-ID')}).`,
      role
    );
  };

  const updateProduct = (id: string, updates: Partial<SnackProduct>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    addAudit(
      'UPDATE_PRODUK',
      'PRODUCT',
      id,
      `Data produk ${id} diperbarui: ${Object.keys(updates).join(', ')}.`,
      role
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: false } : p)));
    addAudit('NONAKTIFKAN_PRODUK', 'PRODUCT', id, `Produk dinonaktifkan dari katalog.`, role);
  };

  const addStockMovement = (
    productId: string,
    movementType: StockMovementType,
    quantity: number,
    reason: string,
    staffName: string,
    unitCost?: number
  ): boolean => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return false;

    const prevStock = prod.stock;
    const newStock = Math.max(0, prevStock + quantity);

    updateProduct(productId, { stock: newStock });

    const movement: StockMovement = {
      id: 'sm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      productId,
      productName: prod.name,
      movementType,
      quantity,
      previousStock: prevStock,
      newStock,
      date: new Date().toISOString().split('T')[0],
      reason,
      staffName,
    };

    setStockMovements((prev) => [movement, ...prev]);

    // If restock/purchase with cost, record to accounting journal!
    if ((movementType === 'IN_PURCHASE' || movementType === 'IN_PRODUCTION') && unitCost && quantity > 0) {
      const totalPurchase = unitCost * quantity;
      const journalEntry: JournalEntry = {
        id: 'jrn-restock-' + Date.now(),
        entryNumber: `JU-RESTOCK-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().split('T')[0],
        description: `Restock inventori ${prod.name} (${quantity} unit @ Rp ${unitCost.toLocaleString('id-ID')})`,
        referenceType: 'RESTOCK',
        referenceId: movement.id,
        lines: [
          {
            accountCode: '1104',
            accountName: 'Persediaan Barang Snack (Inventory)',
            debit: totalPurchase,
            credit: 0,
          },
          {
            accountCode: '1101',
            accountName: 'Kas di Tangan (Cash)',
            debit: 0,
            credit: totalPurchase,
          },
        ],
      };
      setJournals((prev) => [...prev, journalEntry]);
    } else if (movementType === 'OUT_DAMAGED' || movementType === 'OUT_EXPIRED') {
      const lossAmount = prod.costPrice * Math.abs(quantity);
      const journalEntry: JournalEntry = {
        id: 'jrn-loss-' + Date.now(),
        entryNumber: `JU-LOSS-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().split('T')[0],
        description: `Penyesuaian stok rusak/kadaluarsa ${prod.name} (${Math.abs(quantity)} unit)`,
        referenceType: 'ADJUSTMENT',
        referenceId: movement.id,
        lines: [
          {
            accountCode: '5203',
            accountName: 'Beban Kerusakan & Kadaluarsa Snack',
            debit: lossAmount,
            credit: 0,
          },
          {
            accountCode: '1104',
            accountName: 'Persediaan Barang Snack (Inventory)',
            debit: 0,
            credit: lossAmount,
          },
        ],
      };
      setJournals((prev) => [...prev, journalEntry]);
    }

    addAudit(
      'MUTASI_STOK',
      'STOCK',
      productId,
      `Mutasi stok ${prod.name}: ${quantity > 0 ? '+' : ''}${quantity} unit (${movementType}). Sisa stok: ${newStock}.`,
      staffName
    );

    return true;
  };

  const addManualJournal = (entry: Omit<JournalEntry, 'id'>): boolean => {
    const newEntry: JournalEntry = {
      ...entry,
      id: 'jrn-manual-' + Date.now(),
    };
    setJournals((prev) => [...prev, newEntry]);
    addAudit(
      'JURNAL_MANUAL',
      'ACCOUNTING',
      newEntry.id,
      `Jurnal manual dicatat: ${entry.description} (${entry.entryNumber}).`,
      role
    );
    return true;
  };

  const sendMessage = (text: string, senderOverride?: 'customer' | 'seller') => {
    const sender = senderOverride || (role === 'pelanggan' ? 'customer' : 'seller');
    const senderName =
      sender === 'customer' ? 'Pelanggan' : role === 'owner' ? 'Owner (Fitriani)' : 'Penjual Kletak-Kletik';

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender,
      senderName,
      text,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMsg]);

    // If sent by customer, trigger intelligent Auto-Reply Bot
    if (sender === 'customer') {
      setTimeout(() => {
        const lower = text.toLowerCase();
        let reply = '';

        if (lower.includes('buka') || lower.includes('jam') || lower.includes('operasional')) {
          reply =
            '⏰ Toko Kletak-Kletik Snack buka setiap hari:\n• Senin - Minggu: 08.00 - 20.00 WIB.\nPemesanan delivery dilayani sampai pukul 17.00 WIB setiap harinya!';
        } else if (lower.includes('ongkir') || lower.includes('kirim') || lower.includes('delivery')) {
          reply =
            '🛵 Info Pengiriman:\n• Ongkir flat Rp 10.000 untuk area kota Yogyakarta & Sleman.\n• GRATIS ONGKIR otomatis untuk total belanja snack minimal Rp 100.000!';
        } else if (lower.includes('rekomendasi') || lower.includes('best seller') || lower.includes('favorit')) {
          reply =
            '🌟 Snack paling favorit & laris:\n1. Keripik Pisang Karamel Madu (manis legit gurih)\n2. Peyek Kacang Daun Jeruk Purut (renyah berlimpah kacang)\n3. Rengginang Ketan Terasi Gurih.';
        } else if (lower.includes('bayar') || lower.includes('metode') || lower.includes('qris') || lower.includes('va')) {
          reply =
            '💳 Metode pembayaran lengkap yang kami dukung:\n• Virtual Account: BCA, BNI, Mandiri, BRI\n• QRIS instan\n• E-Wallet: GoPay, OVO, Dana\n• COD (Bayar di tempat saat snack diantar kurir).';
        } else if (lower.includes('stok') || lower.includes('ada') || lower.includes('ready')) {
          const availCount = products.filter((p) => p.stock > 0).length;
          reply = `📦 Saat ini ada ${availCount} varian snack yang ready stock dan baru digoreng/dikemas. Silakan cek langsung di tab Katalog ya kak!`;
        } else {
          reply =
            'Terima kasih telah menghubungi Kletak-Kletik Snack! Pertanyaan Anda telah diteruskan ke Penjual kami. Kami akan segera membalas, atau Anda juga dapat melihat info produk lengkap pada katalog kami.';
        }

        const botReply: ChatMessage = {
          id: 'msg-' + Date.now() + 1,
          sender: 'bot',
          senderName: 'Bot Kletak-Kletik',
          text: reply,
          timestamp: new Date().toISOString(),
        };

        setChatMessages((prev) => [...prev, botReply]);
      }, 600);
    }
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        activeView,
        setActiveView,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartTotalCount,
        appliedCoupon,
        discountAmount,
        applyCoupon,
        removeCoupon,
        orders,
        createOrder,
        updateOrderStatus,
        verifyOrderPayment,
        cancelOrder,
        stockMovements,
        addStockMovement,
        journals,
        addManualJournal,
        chatMessages,
        sendMessage,
        auditLogs,
        selectedTrackingOrderId,
        setSelectedTrackingOrderId,
        lowStockProducts,
        isOnline,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
