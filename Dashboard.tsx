import { Package, DollarSign, ShoppingCart, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Product, Category, Sale } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardProps {
  products: Product[];
  categories: Category[];
  sales: Sale[];
  onNavigate: (page: 'products' | 'sales' | 'inventory' | 'categories') => void;
}

export default function Dashboard({ products, categories, sales, onNavigate }: DashboardProps) {
  const { t, formatCurrency, formatDate } = useLanguage();
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  const totalStockValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalItemsSold = sales.reduce((sum, s) => s.items.reduce((iSum, i) => iSum + i.quantity, 0) + sum, 0);
  const totalProfit = products.reduce((sum, p) => {
    const soldItems = sales.flatMap(s => s.items).filter(i => i.productId === p.id);
    const qtySold = soldItems.reduce((s, i) => s + i.quantity, 0);
    return sum + (qtySold * (p.price - p.costPrice));
  }, 0);

  const recentSales = [...sales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  // Top selling products
  const productSalesMap = new Map<string, { name: string; qty: number; revenue: number }>();
  sales.forEach(s => {
    s.items.forEach(item => {
      const existing = productSalesMap.get(item.productId) || { name: item.productName, qty: 0, revenue: 0 };
      existing.qty += item.quantity;
      existing.revenue += item.total;
      productSalesMap.set(item.productId, existing);
    });
  });
  const topProducts = Array.from(productSalesMap.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Category distribution
  const categoryRevenue = categories.map(cat => {
    const catProducts = products.filter(p => p.categoryId === cat.id);
    const revenue = catProducts.reduce((sum, p) => {
      const soldItems = sales.flatMap(s => s.items).filter(i => i.productId === p.id);
      return sum + soldItems.reduce((s, i) => s + i.total, 0);
    }, 0);
    return { ...cat, revenue, productCount: catProducts.length };
  }).filter(c => c.revenue > 0).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">{t('dashboardTitle')}</h1>
        <p className="text-gray-500 mt-1">{t('dashboardSubtitle')}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={() => onNavigate('products')} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-left">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Package size={24} className="text-blue-600" />
            </div>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
            <p className="stat-value mt-4">{totalProducts}</p>
            <p className="text-sm text-gray-500 mt-1">{t('totalProducts')}</p>
        </button>

        <button onClick={() => onNavigate('sales')} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-left">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <DollarSign size={24} className="text-emerald-600" />
            </div>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <p className="stat-value mt-4">{formatCurrency(totalSalesRevenue)}</p>
          <p className="text-sm text-gray-500 mt-1">{t('totalRevenue')}</p>
        </button>

        <button onClick={() => onNavigate('sales')} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-left">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <ShoppingCart size={24} className="text-purple-600" />
            </div>
            <span className="text-sm text-gray-400">{sales.length} {t('orders')}</span>
          </div>
          <p className="stat-value mt-4">{totalItemsSold}</p>
          <p className="text-sm text-gray-500 mt-1">{t('itemsSold')}</p>
        </button>

        <button onClick={() => onNavigate('inventory')} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-left">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <TrendingDown size={16} className={lowStockProducts.length > 0 ? 'text-red-500' : 'text-emerald-500'} />
          </div>
          <p className="stat-value mt-4">{lowStockProducts.length}</p>
          <p className="text-sm text-gray-500 mt-1">{t('lowStockAlerts')}</p>
        </button>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">{t('estimatedProfit')}</p>
          <p className="text-2xl font-bold mt-2">{formatCurrency(totalProfit)}</p>
          <p className="text-xs opacity-75 mt-2">{t('basedOnSoldItems')}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">{t('stockValue')}</p>
          <p className="text-2xl font-bold mt-2">{formatCurrency(totalStockValue)}</p>
          <p className="text-xs opacity-75 mt-2">{t('atRetailPrices')}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
          <p className="text-sm opacity-90">{t('avgOrderValue')}</p>
          <p className="text-2xl font-bold mt-2">{sales.length > 0 ? formatCurrency(totalSalesRevenue / sales.length) : formatCurrency(0)}</p>
          <p className="text-xs opacity-75 mt-2">{t('perTransaction')}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">{t('topSellingProducts')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('byRevenue')}</p>
          </div>
          <div className="p-6 space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">{t('noSalesData')}</p>
            ) : (
              topProducts.map((product, idx) => {
                const maxRevenue = topProducts[0]?.revenue || 1;
                const widthPercent = (product.revenue / maxRevenue) * 100;
                return (
                  <div key={product.id} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-400 w-6">#{idx + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{product.name}</span>
                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(product.revenue)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full h-2 transition-all" style={{ width: `${widthPercent}%` }} />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{product.qty} {t('unitsSold')}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Category Revenue */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">{t('revenueByCategory')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('salesDistribution')}</p>
          </div>
          <div className="p-6 space-y-4">
            {categoryRevenue.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">{t('noSalesData')}</p>
            ) : (
              categoryRevenue.slice(0, 6).map((cat) => {
                const maxRev = categoryRevenue[0]?.revenue || 1;
                const widthPercent = (cat.revenue / maxRev) * 100;
                return (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(cat.revenue)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="rounded-full h-2 transition-all" style={{ width: `${widthPercent}%`, backgroundColor: cat.color }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{cat.productCount} {t('productsLabel')}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{t('recentTransactions')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('latestSalesActivity')}</p>
          </div>
          <button onClick={() => onNavigate('sales')} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            {t('viewAll')}
          </button>
        </div>
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">{t('transactionId')}</th>
                <th className="px-6 py-3">{t('items')}</th>
                <th className="px-6 py-3">{t('cashier')}</th>
                <th className="px-6 py-3">{t('payment')}</th>
                <th className="px-6 py-3">{t('total')}</th>
                <th className="px-6 py-3">{t('date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentSales.map(sale => (
                <tr key={sale.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">{sale.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{sale.items.length} {t('items')}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{sale.cashier}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      sale.paymentMethod === 'cash' ? 'bg-green-50 text-green-700' :
                      sale.paymentMethod === 'card' ? 'bg-blue-50 text-blue-700' :
                      'bg-purple-50 text-purple-700'
                    }`}>
                      {t(sale.paymentMethod)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatCurrency(sale.grandTotal)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(sale.createdAt, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alert Preview */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={20} className="text-red-500" />
            <h3 className="font-semibold text-red-800">{t('lowStockAlert')}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.slice(0, 6).map(p => {
              const category = categories.find(c => c.id === p.categoryId);
              return (
                <div key={p.id} className="bg-white rounded-xl p-4 border border-red-100">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{p.image}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-500">{category?.name}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-red-600 font-medium">
                      {p.stock} / {p.minStock} {p.unit}
                    </span>
                    <button onClick={() => onNavigate('inventory')} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                      {t('restock')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
