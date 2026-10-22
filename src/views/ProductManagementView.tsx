import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Package,
  Star,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { SnackProduct } from '../types/index.ts';

export const ProductManagementView: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SnackProduct | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SnackProduct['category']>('Keripik');
  const [price, setPrice] = useState(20000);
  const [costPrice, setCostPrice] = useState(12000);
  const [stock, setStock] = useState(30);
  const [minStock, setMinStock] = useState(10);
  const [weightGrams, setWeightGrams] = useState(200);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('/src/assets/images/snack_keripik_pisang_1792116245406.jpg');
  const [ingredientsText, setIngredientsText] = useState('Bahan baku berkualitas, garam, minyak nabati');

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Keripik');
    setPrice(20000);
    setCostPrice(12000);
    setStock(30);
    setMinStock(10);
    setWeightGrams(200);
    setDescription('');
    setImage('/src/assets/images/snack_keripik_pisang_1792116245406.jpg');
    setIngredientsText('Bahan baku pilihan, bumbu rempah alami, garam gurih');
    setShowAddModal(true);
  };

  const openEditModal = (p: SnackProduct) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setPrice(p.price);
    setCostPrice(p.costPrice);
    setStock(p.stock);
    setMinStock(p.minStock);
    setWeightGrams(p.weightGrams);
    setDescription(p.description);
    setImage(p.image);
    setIngredientsText(p.ingredients.join(', '));
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ingredients = ingredientsText.split(',').map((s) => s.trim()).filter(Boolean);

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name,
        category,
        price,
        costPrice,
        stock,
        minStock,
        weightGrams,
        description,
        image,
        ingredients,
      });
    } else {
      addProduct({
        name,
        category,
        price,
        costPrice,
        stock,
        minStock,
        weightGrams,
        description,
        image,
        ingredients,
        crispinessRating: 5,
        isActive: true,
      });
    }
    setShowAddModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Kelola Master Produk Snack (CRUD)
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Tambah, perbarui harga, margin keuntungan HPP, foto produk, dan status aktif snack.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Varian Snack</span>
        </button>
      </div>

      {/* Grid of Product Cards for Admin */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
            className={`bg-white rounded-3xl border ${
              p.isActive ? 'border-stone-200/80' : 'border-stone-200 opacity-60'
            } overflow-hidden shadow-xs flex flex-col justify-between`}
          >
            <div>
              <div className="relative aspect-[4/3] bg-stone-100">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                <span className="absolute top-2.5 left-2.5 text-[10px] font-bold bg-stone-900/80 text-amber-300 px-2 py-0.5 rounded-md">
                  {p.category}
                </span>
                {!p.isActive && (
                  <span className="absolute top-2.5 right-2.5 text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-md">
                    Nonaktif
                  </span>
                )}
              </div>

              <div className="p-4 space-y-2">
                <h3 className="font-bold text-stone-900 text-sm line-clamp-1">{p.name}</h3>
                <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{p.description}</p>

                <div className="pt-2 border-t border-stone-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-stone-400 text-[10px] block">Harga Jual:</span>
                    <span className="font-bold text-stone-900 tabular-nums">
                      Rp {p.price.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] block">HPP Produksi:</span>
                    <span className="font-semibold text-stone-600 tabular-nums">
                      Rp {p.costPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs bg-amber-50/50 p-2 rounded-xl border border-amber-200/40">
                  <span className="text-stone-500">Stok: <strong>{p.stock}</strong> pouch</span>
                  <span className="text-emerald-700 font-bold">
                    Margin: Rp {(p.price - p.costPrice).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                onClick={() => openEditModal(p)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-200 text-stone-700 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              {p.isActive ? (
                <button
                  onClick={() => deleteProduct(p.id)}
                  className="px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Nonaktifkan
                </button>
              ) : (
                <button
                  onClick={() => updateProduct(p.id, { isActive: true })}
                  className="px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-50 text-emerald-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Aktifkan
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-lg font-bold text-stone-900">
                {editingProduct ? 'Edit Varian Snack' : 'Tambah Snack Baru ke Katalog'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Nama Produk Snack *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Keripik Tempe Crispy Daun Jeruk"
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Kategori Snack *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                  >
                    <option value="Keripik">Keripik</option>
                    <option value="Peyek">Peyek</option>
                    <option value="Rengginang">Rengginang</option>
                    <option value="Kering Pedas">Kering Pedas</option>
                    <option value="Stik Gurih">Stik Gurih</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Berat Bersih (gram) *</label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={weightGrams}
                    onChange={(e) => setWeightGrams(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Harga Jual (IDR) *</label>
                  <input
                    type="number"
                    min="1000"
                    required
                    value={price}
                    onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm font-bold tabular-nums"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">HPP / Biaya Pokok (IDR) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm font-bold tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Stok Saat Ini (pouch) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Batas Minimum Stok (Alert) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={minStock}
                    onChange={(e) => setMinStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Pilih Gambar Snack *</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    '/src/assets/images/snack_keripik_pisang_1792116245406.jpg',
                    '/src/assets/images/snack_peyek_kacang_1792116245713.jpg',
                    '/src/assets/images/snack_peyek_tempe_1792116246255.jpg',
                    '/src/assets/images/snack_rengginang_1792116246029.jpg',
                  ].map((imgUrl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setImage(imgUrl)}
                      className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 cursor-pointer ${
                        image === imgUrl ? 'border-amber-600 ring-2 ring-amber-400' : 'border-stone-200'
                      }`}
                    >
                      <img src={imgUrl} alt="Thumbnail pilihan" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Deskripsi Singkat *</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Karakteristik rasa, kerenyahan, kemasan ziplock..."
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Komposisi Bahan (pisahkan dengan koma) *
                </label>
                <input
                  type="text"
                  required
                  value={ingredientsText}
                  onChange={(e) => setIngredientsText(e.target.value)}
                  placeholder="Pisang kepok, gula aren, madu murni, minyak nabati"
                  className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs transition-colors shadow-sm cursor-pointer"
              >
                {editingProduct ? 'Perbarui Varian Snack' : 'Simpan Produk ke Katalog'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
