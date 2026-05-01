import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, Receipt, Search } from 'lucide-react';
import { Product, Sale, SaleItem, Category } from '../types';
import Modal from './Modal';
import { useLanguage } from '../contexts/LanguageContext';

interface SalesProps {
  products: Product[];
  categories: Category[];
  sales: Sale[];
  onNewSale: (sale: Sale) => void;
}

export default function Sales({ products, categories, sales, onNewSale }: SalesProps) {
  const { t, formatCurrency, formatDate } = useLanguage();
  const [cart, setCart] = useState<(SaleItem & { maxStock: number })[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('card');
  const [showReceipt, setShowReceipt] = useState<Sale | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const TAX_RATE = 0.08;

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || p.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      if (existing.quantity < product.stock) {
        setCart(cart.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
            : item
        ));
      }
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.price,
        total: product.price,
        maxStock: product.stock,
      }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return item;
        if (newQty > item.maxStock) return item;
        return { ...item, quantity: newQty, total: newQty * item.unitPrice };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const tax = (subtotal - discount) * TAX_RATE;
  const grandTotal = subtotal - discount + tax;

  const completeSale = () => {
    if (cart.length === 0) return;
    const sale: Sale = {
      id: `sale-${Date.now()}`,
      items: cart.map(({ maxStock, ...rest }) => rest),
      total: subtotal,
      discount,
      tax: Math.round(tax * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100,
      paymentMethod,
      cashier: t('cashier'),
      createdAt: new Date().toISOString(),
    };
    onNewSale(sale);
    setShowReceipt(sale);
    setCart([]);
    setDiscount(0);
  };

  const recentSales = [...sales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="section-title">{t('salesTitle')}</h1>
          <p className="text-gray-500 mt-1">{t('salesSubtitle')}</p>
        </div>
        <button onClick={() => setShowHistory(!showHistory)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors border ${
            showHistory ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}>
          <Receipt size={18} /> {showHistory ? t('newSale') : t('history')}
        </button>
      </div>

      {showHistory ? (
        /* Transaction History */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">{t('transactionHistory')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('totalTransactions', sales.length)}</p>
          </div>
          <div className="table-container">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">{t('id')}</th>
                  <th className="px-6 py-3">{t('items')}</th>
                  <th className="px-6 py-3">{t('subtotal')}</th>
                  <th className="px-6 py-3">{t('tax')}</th>
                  <th className="px-6 py-3">{t('discount')}</th>
                  <th className="px-6 py-3">{t('total')}</th>
                  <th className="px-6 py-3">{t('payment')}</th>
                  <th className="px-6 py-3">{t('date')}</th>
                  <th className="px-6 py-3">{t('receipt')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{sale.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {sale.items.map(i => `${i.productName} x${i.quantity}`).join(', ')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(sale.total)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(sale.tax)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sale.discount > 0 ? formatCurrency(sale.discount) : '—'}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatCurrency(sale.grandTotal)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        sale.paymentMethod === 'cash' ? 'bg-green-50 text-green-700' :
                        sale.paymentMethod === 'card' ? 'bg-blue-50 text-blue-700' :
                        'bg-purple-50 text-purple-700'
                      }`}>
                        {sale.paymentMethod === 'cash' ? <Banknote size={12} /> : sale.paymentMethod === 'card' ? <CreditCard size={12} /> : <Smartphone size={12} />}
                        {t(sale.paymentMethod)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(sale.createdAt, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => setShowReceipt(sale)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">{t('view')}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* POS Interface */
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
          {/* Product Selection */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder={t('searchProducts')} value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setCategoryFilter('')} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${!categoryFilter ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {t('all')}
                  </button>
                  {categories.slice(0, 6).map(cat => (
                    <button key={cat.id} onClick={() => setCategoryFilter(categoryFilter === cat.id ? '' : cat.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${categoryFilter === cat.id ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      style={categoryFilter === cat.id ? { backgroundColor: cat.color } : {}}>
                      {cat.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.map(product => {
                const inCart = cart.find(item => item.productId === product.id);
                const isLow = product.stock <= product.minStock;
                return (
                  <button key={product.id} onClick={() => addToCart(product)} disabled={product.stock === 0}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-left hover:shadow-md hover:border-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative">
                    {inCart && (
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 text-white rounded-full text-xs font-bold flex items-center justify-center">
                        {inCart.quantity}
                      </span>
                    )}
                    <span className="text-2xl">{product.image}</span>
                    <p className="text-xs font-medium text-gray-900 mt-2 truncate">{product.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm font-bold text-emerald-600">{formatCurrency(product.price)}</p>
                      <p className={`text-xs ${isLow ? 'text-red-500' : 'text-gray-400'}`}>{product.stock} {t('left')}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-fit sticky top-4">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-emerald-600" />
                <h3 className="font-semibold text-gray-900">{t('currentOrder')}</h3>
                <span className="ml-auto text-sm text-gray-400">{cart.length} {t('items')}</span>
              </div>
            </div>

            <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">{t('cartEmpty')}</p>
              ) : (
                cart.map(item => (
                  <div key={item.productId} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                      <p className="text-xs text-gray-500">{formatCurrency(item.unitPrice)} {t('each')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.productId, -1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100">
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, 1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100">
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="text-right min-w-[60px]">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.total)}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.productId)} className="p-1 hover:bg-red-50 rounded">
                      <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Totals */}
            {cart.length > 0 && (
              <div className="border-t border-gray-100 p-4 space-y-3">
                <div>
                  <label className="text-xs text-gray-500">{t('discount')}</label>
                  <input type="number" step="0.01" min="0" value={discount || ''} onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="0.00" />
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>{t('subtotal')}</span><span>{formatCurrency(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-red-500">
                      <span>{t('discount')}</span><span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>{t('tax')}</span><span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
                    <span>{t('total')}</span><span>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="text-xs text-gray-500">{t('paymentMethod')}</label>
                  <div className="flex gap-2 mt-2">
                    {[
                      { method: 'cash' as const, icon: <Banknote size={16} />, label: t('cash') },
                      { method: 'card' as const, icon: <CreditCard size={16} />, label: t('card') },
                      { method: 'mobile' as const, icon: <Smartphone size={16} />, label: t('mobile') },
                    ].map(({ method, icon, label }) => (
                      <button key={method} onClick={() => setPaymentMethod(method)}
                        className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                          paymentMethod === method ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200'
                        }`}>
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={completeSale}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors">
                  {t('completeSale')} - {formatCurrency(grandTotal)}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <Modal isOpen={!!showReceipt} onClose={() => setShowReceipt(null)} title={t('receiptTitle')} size="sm">
        {showReceipt && (
          <div className="space-y-4">
            <div className="text-center border-b border-dashed border-gray-300 pb-4">
              <h3 className="text-xl font-bold text-gray-900">🛒 {t('appName')}</h3>
              <p className="text-xs text-gray-500 mt-1">{t('storeAddress')}</p>
              <p className="text-xs text-gray-400 mt-1">{formatDate(showReceipt.createdAt, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              <p className="text-xs text-gray-400 font-mono">{showReceipt.id}</p>
            </div>

            <div className="space-y-2">
              {showReceipt.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <div>
                    <span className="text-gray-700">{item.productName}</span>
                    <span className="text-gray-400 ml-2">x{item.quantity}</span>
                  </div>
                  <span className="font-medium text-gray-900">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-gray-300 pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>{t('subtotal')}</span><span>{formatCurrency(showReceipt.total)}</span>
              </div>
              {showReceipt.discount > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>{t('discount')}</span><span>-{formatCurrency(showReceipt.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>{t('tax')}</span><span>{formatCurrency(showReceipt.tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2">
                <span>{t('total')}</span><span>{formatCurrency(showReceipt.grandTotal)}</span>
              </div>
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-gray-400">{t('payment')}: {t(showReceipt.paymentMethod)}</p>
              <p className="text-xs text-gray-400 mt-1">{t('cashier')}: {showReceipt.cashier}</p>
              <p className="text-xs text-gray-400 mt-3">{t('thankYou')}</p>
            </div>

            <button onClick={() => setShowReceipt(null)} className="w-full py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
              {t('close')}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
