export type FulfillmentMethod = 'delivery' | 'pickup';

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

export const ORDER_STATUS_LABELS: Record<OrderStatus, { label: string; badgeColor: string; description: string }> = {
  PENDING: {
    label: 'Menunggu Pembayaran',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Pesanan dibuat, menunggu verifikasi pembayaran pelanggan.',
  },
  DIKONFIRMASI: {
    label: 'Dikonfirmasi',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Pembayaran telah diverifikasi, pesanan masuk antrean dapur.',
  },
  DISIAPKAN: {
    label: 'Sedang Disiapkan',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Snack sedang dipersiapkan dan ditimbang oleh tim produksi.',
  },
  DIKEMAS: {
    label: 'Sedang Dikemas',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: 'Snack telah dibungkus rapi dalam pouch higienis dan disegel.',
  },
  SIAP_DIANTAR: {
    label: 'Siap Diantar',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    description: 'Paket snack siap diantarkan oleh kurir ke alamat pemesan.',
  },
  SIAP_DIAMBIL: {
    label: 'Siap Diambil',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    description: 'Paket snack siap diambil di lokasi outlet yang dipilih.',
  },
  SELESAI: {
    label: 'Pesanan Selesai',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Pesanan telah diterima oleh pelanggan dengan baik. Terima kasih!',
  },
  DIBATALKAN: {
    label: 'Dibatalkan',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    description: 'Pesanan telah dibatalkan oleh pembeli atau penjual.',
  },
  EXPIRED: {
    label: 'Kadaluarsa',
    badgeColor: 'bg-stone-100 text-stone-800 border-stone-200',
    description: 'Batas waktu pembayaran telah habis.',
  },
};

export function canTransitionOrder(
  currentStatus: OrderStatus,
  targetStatus: OrderStatus,
  fulfillment: FulfillmentMethod = 'delivery'
): boolean {
  if (currentStatus === targetStatus) return false;

  switch (currentStatus) {
    case 'PENDING':
      return targetStatus === 'DIKONFIRMASI' || targetStatus === 'DIBATALKAN' || targetStatus === 'EXPIRED';

    case 'DIKONFIRMASI':
      return targetStatus === 'DISIAPKAN' || targetStatus === 'DIBATALKAN';

    case 'DISIAPKAN':
      return targetStatus === 'DIKEMAS';

    case 'DIKEMAS':
      if (fulfillment === 'delivery') {
        return targetStatus === 'SIAP_DIANTAR';
      } else {
        return targetStatus === 'SIAP_DIAMBIL';
      }

    case 'SIAP_DIANTAR':
    case 'SIAP_DIAMBIL':
      return targetStatus === 'SELESAI';

    case 'SELESAI':
    case 'DIBATALKAN':
    case 'EXPIRED':
      return false; // Terminal states

    default:
      return false;
  }
}

export function getNextPossibleStates(
  currentStatus: OrderStatus,
  fulfillment: FulfillmentMethod = 'delivery'
): OrderStatus[] {
  const allStates: OrderStatus[] = [
    'PENDING',
    'DIKONFIRMASI',
    'DISIAPKAN',
    'DIKEMAS',
    'SIAP_DIANTAR',
    'SIAP_DIAMBIL',
    'SELESAI',
    'DIBATALKAN',
    'EXPIRED',
  ];

  return allStates.filter((s) => canTransitionOrder(currentStatus, s, fulfillment));
}
