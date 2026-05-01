import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Filter, ChevronDown } from 'lucide-react';
import { Product, Category } from '../types';
import Modal from './Modal';
import { useLanguage } from '../contexts/LanguageContext';

interface ProductsProps {
  products: Product[];
  categories: Category[];
  onAdd: (product: Product) => void;
  onUpdate: (product: Product) => void;
  onDelete: (id: string) => void;
}

const emptyProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '', categoryId: '', sku: '', price: 0, costPrice: 0, stock: 0, minStock: 10, unit: 'piece', image: '📦', expiryDate: '', supplier: '',
};

export default function Products({ products, categories, onAdd, onUpdate, onDelete }: ProductsProps) {
  const { t, formatCurrency } = useLanguage();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState(emptyProduct);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || p.categoryId === categoryFilter;
    const matchesStock = !stockFilter ||
      (stockFilter === 'low' && p.stock <= p.minStock) ||
      (stockFilter === 'normal' && p.stock > p.minStock && p.stock <= p.minStock * 3) ||
      (stockFilter === 'high' && p.stock > p.minStock * 3);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || t('unknown');
  const getCategoryColor = (id: string) => categories.find(c => c.id === id)?.color || '#6b7280';

  const openAdd = () => {
    setEditingProduct(null);
    setFormData(emptyProduct);
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name, categoryId: product.categoryId, sku: product.sku, price: product.price,
      costPrice: product.costPrice, stock: product.stock, minStock: product.minStock, unit: product.unit,
      image: product.image, expiryDate: product.expiryDate, supplier: product.supplier,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      onUpdate({
        ...editingProduct,
        ...formData,
        updatedAt: new Date().toISOString(),
      });
    } else {
      onAdd({
        ...formData,
        id: `prod-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="section-title">{t('productsTitle')}</h1>
          <p className="text-gray-500 mt-1">{t('productsSubtitle', products.length)}</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm">
          <Plus size={18} /> {t('addProduct')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchProducts')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="">{t('allCategories')}</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={stockFilter}
              onChange={e => setStockFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="">{t('allStockLevels')}</option>
              <option value="low">{t('lowStock')}</option>
              <option value="normal">{t('normalStock')}</option>
              <option value="high">{t('highStock')}</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        {(search || categoryFilter || stockFilter) && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
            <Filter size={14} />
            <span>{t('resultsFound', filteredProducts.length)}</span>
          </div>
        )}
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-gray-400 text-lg">{t('noProductsFound')}</p>
          <p className="text-gray-400 text-sm mt-1">{t('adjustSearch')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map(product => {
            const isLowStock = product.stock <= product.minStock;
            return (
              <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{product.image}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{product.name}</h3>
                        <span className="inline-flex items-center gap-1 text-xs mt-1" style={{ color: getCategoryColor(product.categoryId) }}>
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getCategoryColor(product.categoryId) }} />
                          {getCategoryName(product.categoryId)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(product)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit2 size={14} className="text-gray-400" />
                      </button>
                      <button onClick={() => setDeleteConfirm(product.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                      <p className="text-xs text-gray-400">{t('price')}</p>
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(product.price)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t('sku')}</p>
                      <p className="text-sm font-mono text-gray-600">{product.sku}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t('stock')}</p>
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>{product.stock} {product.unit}</p>
                        {isLowStock && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t('supplier')}</p>
                      <p className="text-sm text-gray-600 truncate">{product.supplier}</p>
                    </div>
                  </div>

                  {/* Stock bar */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          isLowStock ? 'bg-red-400' : product.stock > product.minStock * 3 ? 'bg-emerald-400' : 'bg-blue-400'
                        }`}
                        style={{ width: `${Math.min((product.stock / (product.minStock * 5)) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-400">{t('minStock')}: {product.minStock}</span>
                      <span className="text-xs text-gray-400">{t('productMargin')}: {((product.price - product.costPrice) / product.price * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title={`${t('delete')} ${t('product')}`} size="sm">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={24} className="text-red-500" />
          </div>
          <p className="text-gray-600 mb-6">{t('confirmDelete')} {t('deleteWarning')}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">{t('cancel')}</button>
            <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium">{t('delete')}</button>
          </div>
        </div>
      </Modal>

      {/* Add/Edit Product Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingProduct ? t('editProduct') : t('addNewProduct')} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('productName')} *</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder={t('placeholderName')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('sku')} *</label>
              <input type="text" required value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder={t('placeholderSKU')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('category')} *</label>
              <select required value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                <option value="">{t('placeholderCategory')}</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('supplier')}</label>
              <input type="text" value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder={t('placeholderSupplier')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('sellingPrice')} *</label>
              <input type="number" step="0.01" required value={formData.price || ''} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('costPrice')} *</label>
              <input type="number" step="0.01" required value={formData.costPrice || ''} onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('currentStock')} *</label>
              <input type="number" required value={formData.stock || ''} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('minimumStock')} *</label>
              <input type="number" required value={formData.minStock || ''} onChange={e => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('unit')}</label>
              <input type="text" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder={t('placeholderUnit')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('expiryDate')}</label>
              <input type="date" value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('emojiIcon')}</label>
              <input type="text" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="e.g. 🍌" />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">{t('cancel')}</button>
            <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors">
              {editingProduct ? t('updateProduct') : t('addProduct')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
