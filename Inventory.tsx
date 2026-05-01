import { useState } from 'react';
import { AlertTriangle, CheckCircle, ArrowUpDown, RefreshCw, Search } from 'lucide-react';
import { Product, Category } from '../types';
import Modal from './Modal';
import { useLanguage } from '../contexts/LanguageContext';

interface InventoryProps {
  products: Product[];
  categories: Category[];
  onUpdate: (product: Product) => void;
}

export default function Inventory({ products, categories, onUpdate }: InventoryProps) {
  const { t, formatCurrency, formatDate, formatNumber } = useLanguage();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'critical' | 'ok'>('all');
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState(0);
  const [sortBy, setSortBy] = useState<'stock' | 'name' | 'value'>('stock');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || t('unknown');
  const getCategoryColor = (id: string) => categories.find(c => c.id === id)?.color || '#6b7280';

  const getStatus = (product: Product) => {
    if (product.stock === 0) return 'out';
    if (product.stock <= product.minStock * 0.5) return 'critical';
    if (product.stock <= product.minStock) return 'low';
    return 'ok';
  };

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      const status = getStatus(p);
      const matchesFilter = filter === 'all' ||
        (filter === 'low' && (status === 'low' || status === 'critical')) ||
        (filter === 'critical' && status === 'critical') ||
        (filter === 'ok' && status === 'ok');
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'stock') return (a.stock - b.stock) * dir;
      if (sortBy === 'name') return a.name.localeCompare(b.name) * dir;
      return ((a.price * a.stock) - (b.price * b.stock)) * dir;
    });

  const toggleSort = (col: 'stock' | 'name' | 'value') => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const lowStockCount = products.filter(p => getStatus(p) === 'low' || getStatus(p) === 'critical' || getStatus(p) === 'out').length;
  const totalStockValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  const handleRestock = () => {
    if (restockProduct && restockQty > 0) {
      onUpdate({
        ...restockProduct,
        stock: restockProduct.stock + restockQty,
        updatedAt: new Date().toISOString(),
      });
      setRestockProduct(null);
      setRestockQty(0);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">{t('inventoryTitle')}</h1>
        <p className="text-gray-500 mt-1">{t('inventorySubtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500">{t('totalItems')}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(products.reduce((s, p) => s + p.stock, 0))}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500">{t('stockValue')}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalStockValue)}</p>
        </div>
        <div className="bg-red-50 rounded-2xl border border-red-100 p-5">
          <p className="text-sm text-red-600">{t('lowStockItems')}</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{lowStockCount}</p>
        </div>
        <div className="bg-orange-50 rounded-2xl border border-orange-100 p-5">
          <p className="text-sm text-orange-600">{t('outOfStock')}</p>
          <p className="text-2xl font-bold text-orange-700 mt-1">{outOfStockCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder={t('searchProducts')} value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
          </div>
          <div className="flex gap-2">
            {[
              { key: 'all', label: t('all'), count: products.length },
              { key: 'low', label: t('low'), count: lowStockCount },
              { key: 'critical', label: t('critical'), count: products.filter(p => getStatus(p) === 'critical').length },
              { key: 'ok', label: t('inStock'), count: products.filter(p => getStatus(p) === 'ok').length },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key as typeof filter)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  filter === f.key ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden table-container">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">{t('product')}</th>
                <th className="px-6 py-3">{t('category')}</th>
                <th className="px-6 py-3">{t('sku')}</th>
                <th className="px-6 py-3 cursor-pointer select-none hover:text-gray-700" onClick={() => toggleSort('stock')}>
                  <div className="flex items-center gap-1">{t('stock')} <ArrowUpDown size={12} /></div>
                </th>
                <th className="px-6 py-3">{t('minStock')}</th>
                <th className="px-6 py-3">{t('status')}</th>
                <th className="px-6 py-3 cursor-pointer select-none hover:text-gray-700" onClick={() => toggleSort('value')}>
                  <div className="flex items-center gap-1">{t('value')} <ArrowUpDown size={12} /></div>
                </th>
                <th className="px-6 py-3">{t('expiry')}</th>
                <th className="px-6 py-3">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map(product => {
                const status = getStatus(product);
                const stockPercent = Math.min((product.stock / (product.minStock * 5)) * 100, 100);
                return (
                  <tr key={product.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{product.image}</span>
                        <span className="text-sm font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-xs" style={{ color: getCategoryColor(product.categoryId) }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getCategoryColor(product.categoryId) }} />
                        {getCategoryName(product.categoryId)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">{product.sku}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-900 w-12">{product.stock}</span>
                        <div className="w-20 bg-gray-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full transition-all ${
                            status === 'out' ? 'bg-gray-300' : status === 'critical' ? 'bg-red-400' : status === 'low' ? 'bg-yellow-400' : 'bg-emerald-400'
                          }`} style={{ width: `${stockPercent}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{product.minStock}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        status === 'out' ? 'bg-gray-100 text-gray-600' :
                        status === 'critical' ? 'bg-red-50 text-red-700' :
                        status === 'low' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-emerald-50 text-emerald-700'
                      }`}>
                        {status === 'ok' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                        {status === 'out' ? t('outOfStockStatus') : status === 'critical' ? t('critical') : status === 'low' ? t('low') : t('inStock')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(product.price * product.stock)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{product.expiryDate ? formatDate(product.expiryDate, { month: 'short', day: 'numeric' }) : '—'}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => { setRestockProduct(product); setRestockQty(Math.max(product.minStock - product.stock, 10)); }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                        <RefreshCw size={12} /> {t('restockTitle')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-400">{t('noMatchingProducts')}</p>
          </div>
        )}
      </div>

      {/* Restock Modal */}
      <Modal isOpen={!!restockProduct} onClose={() => setRestockProduct(null)} title={t('restockTitle')} size="sm">
        {restockProduct && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
              <span className="text-2xl">{restockProduct.image}</span>
              <div>
                <p className="font-medium text-gray-900">{restockProduct.name}</p>
                <p className="text-sm text-gray-500">{t('currentStockLabel')}: <span className="font-semibold text-gray-700">{restockProduct.stock} {restockProduct.unit}</span></p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('quantityToAdd')}</label>
              <input type="number" min="1" value={restockQty} onChange={e => setRestockQty(parseInt(e.target.value) || 0)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              <p className="text-xs text-gray-400 mt-1">{t('newStockWillBe', restockProduct.stock, restockQty, restockProduct.unit)}</p>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setRestockProduct(null)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">{t('cancel')}</button>
              <button onClick={handleRestock} disabled={restockQty <= 0}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors">
                {t('restockTitle')}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
