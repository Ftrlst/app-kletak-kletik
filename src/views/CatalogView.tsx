import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Plus,
  Check,
  Star,
  Info,
  ShieldCheck,
  Truck,
  Clock,
  Flame,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { SnackProduct } from '../types/index.ts';

export const CatalogView: React.FC = () => {
  const { products, addToCart, cart, setActiveView } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalProduct, setActiveModalProduct] = useState<SnackProduct | null>(null);
  const [modalQty, setModalQty] = useState<number>(1);
  const [addedNoticeId, setAddedNoticeId] = useState<string | null>(null);

  const categories = ['Semua', 'Keripik', 'Peyek', 'Rengginang', 'Kering Pedas', 'Stik Gurih'];

  const filteredProducts = products.filter((p) => {
    if (!p.isActive) return false;
    const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleQuickAdd = (e: React.MouseEvent, product: SnackProduct) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    addToCart(product, 1);
    setAddedNoticeId(product.id);
    setTimeout(() => {
      setAddedNoticeId(null);
    }, 1200);
  };

  const handleOpenDetail = (product: SnackProduct) => {
    setActiveModalProduct(product);
    setModalQty(1);
  };

  const handleModalAddToCart = () => {
    if (activeModalProduct && activeModalProduct.stock > 0) {
      addToCart(activeModalProduct, modalQty);
      setActiveModalProduct(null);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Showcase Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-amber-950 text-white shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center space-y-4 z-10">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-300 uppercase">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Kelezatan Warisan Resep Tradisional</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Renyahnya Asli, <span className="text-amber-400">Gurihnya Bikin Nagih!</span>
            </h1>
            <p className="text-sm sm:text-base text-amber-100/90 max-w-xl leading-relaxed">
              Kletak-Kletik Snack menghadirkan aneka keripik pisang karamel madu, peyek kacang tanah, kacang hijau, kedelai dengan tambahan daun jeruk, dan keripik tempe yang digoreng higienis dengan minyak kelapa pilihan.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="#katalog-snack"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-md transition-all active:scale-95"
              >
                Pesan Snack Sekarang
              </a>
              <button
                onClick={() => setActiveView('chat')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm backdrop-blur-xs border border-white/10 transition-colors"
              >
                Tanya Stok & Ongkir
              </button>
            </div>

            {/* Trust Markers */}
            <div className="pt-4 grid grid-cols-3 gap-2 sm:gap-4 border-t border-amber-900/60 text-xs text-amber-200/90">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>100% Bahan Alami</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Selalu Fresh Goreng</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Delivery & Pickup</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full">
            <img
              src="/src/assets/images/hero_kletak_kletik_1792116244718.jpg"
              alt="Aneka Snack Tradisional Kletak-Kletik"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center absolute inset-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-amber-950 via-amber-950/20 to-transparent" />
          </div>
        </div>
      </section>

      {/* Catalog & Filter Header */}
      <section id="katalog-snack" className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              Pilihan Snack Tradisional
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Pilih camilan favorit Anda dalam kemasan standing pouch ziplock kedap udara.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari peyek, pisang, rengginang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Cari produk snack"
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-stone-400"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Product Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
        {filteredProducts.map((product) => {
          const inCartItem = cart.find((c) => c.product.id === product.id);
          const isOutOfStock = product.stock <= 0;
          const isLowStock = product.stock > 0 && product.stock <= product.minStock;

          return (
            <div
              key={product.id}
              onClick={() => handleOpenDetail(product)}
              className="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer"
            >
              {/* Product Image */}
              <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                  <span className="text-[10px] font-semibold bg-stone-900/80 text-amber-300 backdrop-blur-xs px-2 py-0.5 rounded-md">
                    {product.category}
                  </span>
                  {isLowStock && (
                    <span className="text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-md">
                      Sisa {product.stock}
                    </span>
                  )}
                  {isOutOfStock && (
                    <span className="text-[10px] font-bold bg-stone-800 text-stone-300 px-2 py-0.5 rounded-md">
                      Habis
                    </span>
                  )}
                </div>

                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-white/90 backdrop-blur-xs px-1.5 py-0.5 rounded-md shadow-xs">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-[11px] font-bold text-stone-800">{product.crispinessRating}.0</span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-stone-900 text-sm sm:text-base group-hover:text-amber-700 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-stone-400 font-medium">
                      Netto {product.weightGrams}g
                    </div>
                    <div className="text-base font-extrabold text-stone-900 tabular-nums">
                      Rp {product.price.toLocaleString('id-ID')}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleQuickAdd(e, product)}
                    disabled={isOutOfStock}
                    aria-label={`Tambah ${product.name} ke keranjang`}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                      isOutOfStock
                        ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                        : addedNoticeId === product.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 hover:bg-amber-600 text-stone-950 active:scale-95'
                    }`}
                  >
                    {addedNoticeId === product.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Masuk!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>{inCartItem ? `(${inCartItem.quantity})` : 'Pesan'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Product Detail Modal */}
      {activeModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200">
            <div className="relative aspect-[16/9] bg-stone-100">
              <img
                src={activeModalProduct.image}
                alt={activeModalProduct.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setActiveModalProduct(null)}
                aria-label="Tutup detail snack"
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 bg-amber-500 text-stone-950 text-xs font-bold px-2.5 py-1 rounded-md">
                Kategori: {activeModalProduct.category}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-stone-900">
                    {activeModalProduct.name}
                  </h3>
                  <span className="text-lg font-black text-amber-700 tabular-nums">
                    Rp {activeModalProduct.price.toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  {activeModalProduct.description}
                </p>
              </div>

              {/* Specs */}
              <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-200/60 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-stone-500 block">Tingkat Kerenyahan:</span>
                  <div className="flex items-center gap-1 font-bold text-stone-800 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{activeModalProduct.crispinessRating} dari 5 (Ekstra Renyah)</span>
                  </div>
                </div>
                <div>
                  <span className="text-stone-500 block">Stok Tersedia:</span>
                  <span className="font-bold text-stone-800 mt-0.5 block">
                    {activeModalProduct.stock > 0
                      ? `${activeModalProduct.stock} Pouch Siap Kirim`
                      : 'Habis (Dalam Proses Goreng)'}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-stone-900 mb-1.5 uppercase tracking-wide">
                  Komposisi Bahan Pilihan:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeModalProduct.ingredients.map((ing, i) => (
                    <span
                      key={i}
                      className="text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quantity Selector & Add */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 border border-stone-200 rounded-xl p-1">
                  <button
                    onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                    disabled={modalQty <= 1}
                    className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center justify-center disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-bold tabular-nums">
                    {modalQty}
                  </span>
                  <button
                    onClick={() => setModalQty((q) => Math.min(activeModalProduct.stock, q + 1))}
                    disabled={modalQty >= activeModalProduct.stock}
                    className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center justify-center disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleModalAddToCart}
                  disabled={activeModalProduct.stock <= 0}
                  className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  Tambah {modalQty} ke Keranjang (Rp {(activeModalProduct.price * modalQty).toLocaleString('id-ID')})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
