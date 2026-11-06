-- ==============================================================================
-- DATABASE KLETAK-KLETIK SNACK (MySQL / phpMyAdmin)
-- Berdasarkan Dokumen Blueprint Aplikasi Web Kletak-Kletik Snack
-- Nama Penyusun Blueprint: Fitriani Lestari (NIM: 60225030)
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `kletak_kletik_db` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `kletak_kletik_db`;

-- ------------------------------------------------------------------------------
-- 1. TABEL USERS & OTENTIKASI
-- Sesuai Bab 2 & Bab 9.1: Role Pelanggan, Penjual, Staff Gudang, Owner
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `chat_messages`;
DROP TABLE IF EXISTS `journal_lines`;
DROP TABLE IF EXISTS `journal_entries`;
DROP TABLE IF EXISTS `chart_of_accounts`;
DROP TABLE IF EXISTS `stock_movements`;
DROP TABLE IF EXISTS `order_tracking_history`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(25) NOT NULL,
  `role` ENUM('pelanggan', 'penjual', 'staff_gudang', 'owner') NOT NULL DEFAULT 'pelanggan',
  `address` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. TABEL PRODUCTS & INVENTORI MASTER
-- Sesuai Bab 3.4 & Bab 9.2: CRUD produk, harga, HPP, berat, stok minimum
-- ------------------------------------------------------------------------------
CREATE TABLE `products` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `category` ENUM('Keripik', 'Peyek', 'Rengginang', 'Kering Pedas', 'Stik Gurih') NOT NULL,
  `price` DECIMAL(12,2) NOT NULL, -- Harga Jual
  `cost_price` DECIMAL(12,2) NOT NULL, -- HPP Biaya Pokok Produksi
  `stock` INT NOT NULL DEFAULT 0,
  `min_stock` INT NOT NULL DEFAULT 10,
  `weight_grams` INT NOT NULL DEFAULT 200,
  `image_url` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `crispiness_rating` TINYINT NOT NULL DEFAULT 5,
  `ingredients` TEXT NULL, -- Disimpan sebagai JSON atau teks koma
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. TABEL ORDERS (PEMESANAN & CHECKOUT)
-- Sesuai Bab 3.1 & Bab 9.3: Order ID, tanggal, delivery/pickup, payment method
-- ------------------------------------------------------------------------------
CREATE TABLE `orders` (
  `id` VARCHAR(50) NOT NULL,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` VARCHAR(50) NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `customer_phone` VARCHAR(25) NOT NULL,
  `fulfillment_method` ENUM('delivery', 'pickup') NOT NULL DEFAULT 'delivery',
  `customer_address` TEXT NULL,
  `pickup_location` VARCHAR(255) NULL,
  `order_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `scheduled_date` DATE NOT NULL,
  `payment_method` ENUM('va_bca', 'va_bni', 'va_mandiri', 'va_bri', 'qris', 'gopay', 'ovo', 'dana', 'cod') NOT NULL DEFAULT 'qris',
  `payment_status` ENUM('UNPAID', 'PENDING', 'PAID', 'FAILED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
  `order_status` ENUM('PENDING', 'DIKONFIRMASI', 'DISIAPKAN', 'DIKEMAS', 'SIAP_DIANTAR', 'SIAP_DIAMBIL', 'SELESAI', 'DIBATALKAN', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
  `items_subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `shipping_fee` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `discount_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `coupon_code` VARCHAR(50) NULL,
  `total_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_number` (`order_number`),
  KEY `idx_order_status` (`order_status`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. TABEL ORDER ITEMS (RINCIAN PRODUK PESANAN)
-- ------------------------------------------------------------------------------
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `order_id` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `product_name` VARCHAR(150) NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(12,2) NOT NULL,
  `cost_price` DECIMAL(12,2) NOT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. TABEL ORDER TRACKING HISTORY (STATE MACHINE LOG)
-- Sesuai Bab 3.2: Pending -> Dikonfirmasi -> Disiapkan -> Dikemas -> Siap Diantar/Ambil -> Selesai
-- ------------------------------------------------------------------------------
CREATE TABLE `order_tracking_history` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `order_id` VARCHAR(50) NOT NULL,
  `status` ENUM('PENDING', 'DIKONFIRMASI', 'DISIAPKAN', 'DIKEMAS', 'SIAP_DIANTAR', 'SIAP_DIAMBIL', 'SELESAI', 'DIBATALKAN', 'EXPIRED') NOT NULL,
  `note` TEXT NOT NULL,
  `actor` VARCHAR(100) NOT NULL,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_tracking_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. TABEL STOCK MOVEMENTS (KARTU STOK GUDANG)
-- Sesuai Bab 3.4 & Bab 8.6: Mutasi restock, produksi, penjualan, rusak, expired, opname
-- ------------------------------------------------------------------------------
CREATE TABLE `stock_movements` (
  `id` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `product_name` VARCHAR(150) NOT NULL,
  `movement_type` ENUM('IN_PURCHASE', 'IN_PRODUCTION', 'OUT_SALE', 'OUT_DAMAGED', 'OUT_EXPIRED', 'OUT_SAMPLE', 'ADJUSTMENT') NOT NULL,
  `quantity` INT NOT NULL, -- Positif untuk masuk, negatif untuk keluar
  `previous_stock` INT NOT NULL,
  `new_stock` INT NOT NULL,
  `date` DATE NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `staff_name` VARCHAR(100) NOT NULL,
  `reference_id` VARCHAR(50) NULL, -- Order ID atau Dokumen Opname
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_stock_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. TABEL CHART OF ACCOUNTS / COA (BAGAN AKUN STANDAR)
-- Sesuai Bab 3.5 & Bab 9.6: Double-entry standard SAK EMKM
-- ------------------------------------------------------------------------------
CREATE TABLE `chart_of_accounts` (
  `code` VARCHAR(20) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `type` ENUM('ASET_LANCAR', 'ASET_TETAP', 'KEWAJIBAN', 'EKUITAS', 'PENDAPATAN', 'HPP', 'BEBAN_OPERASIONAL') NOT NULL,
  `normal_balance` ENUM('DEBIT', 'KREDIT') NOT NULL,
  `description` VARCHAR(255) NULL,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. TABEL JOURNAL ENTRIES & LINES (JURNAL UMUM & BUKU BESAR)
-- Sesuai Bab 3.5: Double-entry bookkeeping otomatis
-- ------------------------------------------------------------------------------
CREATE TABLE `journal_entries` (
  `id` VARCHAR(50) NOT NULL,
  `entry_number` VARCHAR(50) NOT NULL UNIQUE,
  `date` DATE NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `reference_type` ENUM('ORDER', 'RESTOCK', 'EXPENSE', 'ADJUSTMENT', 'INITIAL') NOT NULL,
  `reference_id` VARCHAR(50) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `journal_lines` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `journal_id` VARCHAR(50) NOT NULL,
  `account_code` VARCHAR(20) NOT NULL,
  `account_name` VARCHAR(150) NOT NULL,
  `debit` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `credit` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_journal_lines_entry` FOREIGN KEY (`journal_id`) REFERENCES `journal_entries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_journal_lines_account` FOREIGN KEY (`account_code`) REFERENCES `chart_of_accounts` (`code`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 9. TABEL CHAT MESSAGES (REAL-TIME CHAT & BOT)
-- Sesuai Bab 3.3 & Bab 9.5
-- ------------------------------------------------------------------------------
CREATE TABLE `chat_messages` (
  `id` VARCHAR(50) NOT NULL,
  `room_id` VARCHAR(50) NOT NULL DEFAULT 'room-general',
  `sender` ENUM('customer', 'seller', 'bot') NOT NULL,
  `sender_name` VARCHAR(100) NOT NULL,
  `text` TEXT NOT NULL,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 10. TABEL AUDIT LOGS (AUDIT-READY ASVS LEVEL 2)
-- Sesuai Bab 4 & Bab 10
-- ------------------------------------------------------------------------------
CREATE TABLE `audit_logs` (
  `id` VARCHAR(50) NOT NULL,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actor` VARCHAR(100) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` ENUM('ORDER', 'STOCK', 'ACCOUNTING', 'PRODUCT', 'PAYMENT') NOT NULL,
  `entity_id` VARCHAR(50) NOT NULL,
  `details` TEXT NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- SEED DATA AWAL (INITIAL DATA DARI BLUEPRINT)
-- ==============================================================================

-- A. Data Akun Pengguna (Users)
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `phone`, `role`, `address`) VALUES
('usr-001', 'Fitriani Lestari', 'owner@kletakkletik.com', '$2y$10$abcdefghijklmnopqrstuvwxyz123456', '081234567890', 'owner', 'Jl. Malioboro No. 45, Yogyakarta'),
('usr-002', 'Admin Penjual', 'admin@kletakkletik.com', '$2y$10$abcdefghijklmnopqrstuvwxyz123456', '081234567891', 'penjual', 'Outlet Kletak-Kletik Yogyakarta'),
('usr-003', 'Budi Santoso', 'gudang@kletakkletik.com', '$2y$10$abcdefghijklmnopqrstuvwxyz123456', '081234567892', 'staff_gudang', 'Dapur Produksi Sleman'),
('usr-004', 'Siti Rahmawati', 'siti@gmail.com', '$2y$10$abcdefghijklmnopqrstuvwxyz123456', '081234567893', 'pelanggan', 'Jl. Kaliurang KM 5, Gg. Megatruh No. 12, Sleman');

-- B. Data Master Chart of Accounts (COA) Standar Akuntansi
INSERT INTO `chart_of_accounts` (`code`, `name`, `type`, `normal_balance`, `description`) VALUES
('1101', 'Kas di Tangan (Cash)', 'ASET_LANCAR', 'DEBIT', 'Uang kas operasional outlet dan penerimaan COD'),
('1102', 'Kas di Bank / Payment Gateway', 'ASET_LANCAR', 'DEBIT', 'Penerimaan via Virtual Account BCA, QRIS, & E-Wallet'),
('1103', 'Piutang Usaha', 'ASET_LANCAR', 'DEBIT', 'Tagihan penjualan yang belum lunas'),
('1104', 'Persediaan Barang Snack (Inventory)', 'ASET_LANCAR', 'DEBIT', 'Nilai persediaan snack keripik, peyek, rengginang siap jual'),
('2101', 'Hutang Usaha (Accounts Payable)', 'KEWAJIBAN', 'KREDIT', 'Kewajiban kepada supplier bahan baku singkong, pisang, minyak'),
('3101', 'Modal Usaha Fitriani', 'EKUITAS', 'KREDIT', 'Setoran modal pemilik awal usaha UMKM'),
('3201', 'Prive Pemilik', 'EKUITAS', 'DEBIT', 'Penarikan dana pribadi pemilik usaha'),
('4101', 'Pendapatan Penjualan Snack', 'PENDAPATAN', 'KREDIT', 'Omset kotor dari penjualan aneka snack Kletak-Kletik'),
('4102', 'Pendapatan Ongkos Kirim', 'PENDAPATAN', 'KREDIT', 'Penerimaan ongkir dari pemesanan mode delivery'),
('5101', 'Beban Pokok Penjualan (HPP)', 'HPP', 'DEBIT', 'Biaya pokok produksi snack yang telah terjual'),
('5201', 'Beban Kemasan & Standing Pouch', 'BEBAN_OPERASIONAL', 'DEBIT', 'Biaya plastik standing pouch, stiker label, kardus pengiriman'),
('5202', 'Beban Kurir & Ekspedisi', 'BEBAN_OPERASIONAL', 'DEBIT', 'Biaya bensin dan ongkos kirim ke kurir rekanan'),
('5203', 'Beban Kerusakan & Kadaluarsa Snack', 'BEBAN_OPERASIONAL', 'DEBIT', 'Penyesuaian stok snack rusak remuk atau melewati batas konsumsi'),
('5204', 'Beban Promosi & Diskon Kupon', 'BEBAN_OPERASIONAL', 'DEBIT', 'Potongan harga promosi dan kupon diskon pembeli');

-- C. Data Master Produk Snack
INSERT INTO `products` (`id`, `name`, `category`, `price`, `cost_price`, `stock`, `min_stock`, `weight_grams`, `image_url`, `description`, `crispiness_rating`, `ingredients`, `is_active`) VALUES
('prod-1', 'Keripik Pisang Karamel Madu', 'Keripik', 22000.00, 13000.00, 45, 15, 200, '/src/assets/images/snack_keripik_pisang_1792116245406.jpg', 'Keripik pisang kepok pilihan dengan balutan karamel gula aren dan madu lebah hutan asli. Renyah, legit, dan tidak serik di tenggorokan.', 5, '["Pisang Kepok Kuning", "Gula Aren Organik", "Madu Hutan", "Minyak Nabati", "Garam Laut"]', 1),
('prod-2', 'Peyek Kacang Daun Jeruk Purut', 'Peyek', 18000.00, 10500.00, 30, 12, 180, '/src/assets/images/snack_peyek_kacang_1792116245713.jpg', 'Peyek renyah berlimpah kacang tanah sangrai gurih dengan rajangan daun jeruk purut segar dan rempah ketumbar khas Jawa.', 5, '["Tepung Beras", "Kacang Tanah", "Daun Jeruk Purut", "Ketumbar", "Bawang Putih", "Santan Segar"]', 1),
('prod-3', 'Peyek Tempe Renyah Rempah', 'Peyek', 17000.00, 9500.00, 24, 10, 160, '/src/assets/images/snack_peyek_tempe_1792116246255.jpg', 'Irisan tipis tempe kedelai fermentasi alami berbalut adonan tepung gurih kaya rempah kuning. Renyah hingga gigitan terakhir.', 5, '["Tempe Kedelai Asli", "Tepung Beras & Tapioka", "Ketumbar", "Bawang Putih", "Kunyit", "Garam"]', 1),
('prod-4', 'Rengginang Ketan Terasi Gurih', 'Rengginang', 20000.00, 11000.00, 35, 10, 200, '/src/assets/images/snack_rengginang_1792116246029.jpg', 'Rengginang ketan putih super mekar dengan aroma terasi udang juwana gurih, renyah mengembang tanpa pengawet sintesis.', 5, '["Beras Ketan Putih", "Terasi Udang Tradisional", "Bawang Putih Halus", "Garam", "Minyak Kelapa"]', 1),
('prod-5', 'Keripik Singkong Balado Pedas Manis', 'Kering Pedas', 19000.00, 11000.00, 7, 15, 200, '/src/assets/images/hero_kletak_kletik_1792116244718.jpg', 'Keripik singkong renyah dengan cabai balado pedas manis segar daun jeruk tanpa bahan pengawet sintetis.', 4, '["Singkong Mentega", "Cabai Merah Keriting", "Gula Tebu", "Bawang Merah", "Minyak Sawit"]', 1),
('prod-6', 'Basreng Crispy Pedas Daun Jeruk', 'Kering Pedas', 23000.00, 13500.00, 22, 10, 180, '/src/assets/images/snack_keripik_pisang_1792116245406.jpg', 'Bakso ikan tenggiri goreng renyah kriuk dengan bubuk cabai pedas nendang bertabur aroma daun jeruk purut cincang.', 5, '["Bakso Ikan Tenggiri", "Bubuk Cabai Rawit Merah", "Daun Jeruk", "Bawang Putih", "Garam Gurih"]', 1),
('prod-7', 'Stik Bawang Seledri Renyah', 'Stik Gurih', 16000.00, 9000.00, 28, 10, 150, '/src/assets/images/snack_peyek_tempe_1792116246255.jpg', 'Kudapan stik bawang klasik renyah empuk beraroma seledri segar, gurih pas untuk teman santai dan suguhan tamu.', 4, '["Tepung Terigu Protein Sedang", "Bawang Merah & Putih", "Daun Seledri Cincang", "Telur Ayam", "Mentega"]', 1);

-- D. Data Transaksi Orders & Rincian Items
INSERT INTO `orders` (`id`, `order_number`, `user_id`, `customer_name`, `customer_phone`, `fulfillment_method`, `customer_address`, `pickup_location`, `order_date`, `scheduled_date`, `payment_method`, `payment_status`, `order_status`, `items_subtotal`, `shipping_fee`, `discount_amount`, `coupon_code`, `total_amount`, `notes`) VALUES
('ord-101', 'KLTK-20261014-001', 'usr-004', 'Siti Rahmawati', '081234567891', 'delivery', 'Jl. Kaliurang KM 5, Gg. Megatruh No. 12, Sleman, DI Yogyakarta', NULL, '2026-10-14 09:30:00', '2026-10-14', 'qris', 'PAID', 'SELESAI', 80000.00, 10000.00, 0.00, NULL, 90000.00, 'Tolong packing bubble wrap aman ya mbak.'),
('ord-102', 'KLTK-20261015-002', NULL, 'Ahmad Fauzi', '085799881122', 'delivery', 'Perum Gamping Indah Blok C-5, Sleman', NULL, '2026-10-15 08:15:00', '2026-10-15', 'va_bca', 'PAID', 'SIAP_DIANTAR', 94000.00, 10000.00, 10000.00, 'KLETAK10', 94000.00, 'Kirim sebelum jam 3 sore ya kak.'),
('ord-103', 'KLTK-20261015-003', NULL, 'Dewi Lestari', '081399887766', 'pickup', NULL, 'Outlet Utama Kletak-Kletik (Jl. Malioboro No. 45, Yogyakarta)', '2026-10-15 10:00:00', '2026-10-15', 'gopay', 'PAID', 'DISIAPKAN', 66000.00, 0.00, 5000.00, 'DISKON5RB', 61000.00, 'Diambil jam 4 sore pulang kerja.');

INSERT INTO `order_items` (`order_id`, `product_id`, `product_name`, `quantity`, `price`, `cost_price`, `subtotal`) VALUES
('ord-101', 'prod-1', 'Keripik Pisang Karamel Madu', 2, 22000.00, 13000.00, 44000.00),
('ord-101', 'prod-2', 'Peyek Kacang Daun Jeruk Purut', 2, 18000.00, 10500.00, 36000.00),
('ord-102', 'prod-4', 'Rengginang Ketan Terasi Gurih', 3, 20000.00, 11000.00, 60000.00),
('ord-102', 'prod-3', 'Peyek Tempe Renyah Rempah', 2, 17000.00, 9500.00, 34000.00),
('ord-103', 'prod-1', 'Keripik Pisang Karamel Madu', 3, 22000.00, 13000.00, 66000.00);

-- E. Data Tracking History Pesanan
INSERT INTO `order_tracking_history` (`order_id`, `status`, `note`, `actor`, `timestamp`) VALUES
('ord-101', 'PENDING', 'Pesanan dibuat oleh pelanggan.', 'Pelanggan', '2026-10-14 09:30:00'),
('ord-101', 'DIKONFIRMASI', 'Pembayaran QRIS sukses terverifikasi otomatis.', 'Sistem Gateway', '2026-10-14 09:35:00'),
('ord-101', 'DISIAPKAN', 'Staff dapur menyiapkan snack segar dari rak display.', 'Staff Gudang', '2026-10-14 10:00:00'),
('ord-101', 'DIKEMAS', 'Pesanan dikemas dalam kardus ramah lingkungan.', 'Staff Gudang', '2026-10-14 10:45:00'),
('ord-101', 'SIAP_DIANTAR', 'Kurir Kletak-Kletik mengantar paket ke Sleman.', 'Kurir Rekanan', '2026-10-14 11:15:00'),
('ord-101', 'SELESAI', 'Paket telah diterima dengan baik oleh Ibu Siti.', 'Pelanggan', '2026-10-14 13:00:00');

-- F. Data Jurnal Keuangan Double-Entry
INSERT INTO `journal_entries` (`id`, `entry_number`, `date`, `description`, `reference_type`, `reference_id`, `created_at`) VALUES
('jrn-01', 'JU-20261001-001', '2026-10-01', 'Penyetoran modal awal UMKM Kletak-Kletik oleh Fitriani Lestari', 'INITIAL', NULL, '2026-10-01 08:00:00'),
('jrn-02', 'JU-KLTK-20261014-001-01', '2026-10-14', 'Penjualan snack pesanan KLTK-20261014-001 (Siti Rahmawati)', 'ORDER', 'ord-101', '2026-10-14 09:35:00'),
('jrn-03', 'JU-KLTK-20261014-001-02', '2026-10-14', 'HPP penjualan pesanan KLTK-20261014-001', 'ORDER', 'ord-101', '2026-10-14 09:35:00');

INSERT INTO `journal_lines` (`journal_id`, `account_code`, `account_name`, `debit`, `credit`) VALUES
('jrn-01', '1101', 'Kas di Tangan (Cash)', 5000000.00, 0.00),
('jrn-01', '1102', 'Kas di Bank / Payment Gateway', 8000000.00, 0.00),
('jrn-01', '1104', 'Persediaan Barang Snack (Inventory)', 2000000.00, 0.00),
('jrn-01', '3101', 'Modal Usaha Fitriani', 0.00, 15000000.00),

('jrn-02', '1102', 'Kas di Bank / Payment Gateway', 90000.00, 0.00),
('jrn-02', '4101', 'Pendapatan Penjualan Snack', 0.00, 80000.00),
('jrn-02', '4102', 'Pendapatan Ongkos Kirim', 0.00, 10000.00),

('jrn-03', '5101', 'Beban Pokok Penjualan (HPP)', 47000.00, 0.00),
('jrn-03', '1104', 'Persediaan Barang Snack (Inventory)', 0.00, 47000.00);

-- G. Data Chat Messages
INSERT INTO `chat_messages` (`id`, `room_id`, `sender`, `sender_name`, `text`, `timestamp`) VALUES
('msg-1', 'room-general', 'bot', 'Asisten Kletak-Kletik', 'Halo! Selamat datang di Kletak-Kletik Snack Tradisional 👋. Ada yang bisa kami bantu seputar snack gurih renyah kami?', '2026-10-15 10:00:00'),
('msg-2', 'room-general', 'customer', 'Pelanggan', 'Halo kak, peyek kacang nya tahan berapa lama ya kalau disimpan?', '2026-10-15 10:01:00'),
('msg-3', 'room-general', 'bot', 'Asisten Kletak-Kletik', 'Peyek kacang kami menggunakan kemasan standing pouch ziplock kedap udara kak! Dalam kondisi tersegel rapat bisa tahan renyah hingga 3 bulan tanpa pengawet.', '2026-10-15 10:01:05');

-- H. Data Audit Logs
INSERT INTO `audit_logs` (`id`, `timestamp`, `actor`, `action`, `entity_type`, `entity_id`, `details`) VALUES
('log-1', '2026-10-14 09:35:00', 'Sistem Gateway', 'VERIFIKASI_PEMBAYARAN', 'PAYMENT', 'ord-101', 'Pembayaran QRIS Rp 90.000 diverifikasi lunas.'),
('log-2', '2026-10-14 09:35:05', 'Sistem Akuntansi', 'POSTING_JURNAL_OTOMATIS', 'ACCOUNTING', 'JU-KLTK-20261014-001-01', 'Jurnal penjualan & HPP berhasil diposting ke Buku Besar.');
