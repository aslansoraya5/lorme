import { DollarSign, TrendingUp, ShoppingCart, Calendar, Download } from 'lucide-react';
import { Product, Category, Sale } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ReportsProps {
  products: Product[];
  categories: Category[];
  sales: Sale[];
}

export default function Reports({ products, categories, sales }: ReportsProps) {
  const { t, formatCurrency, formatDate, formatNumber } = useLanguage();

  // Revenue summary
  const totalRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalTax = sales.reduce((sum, s) => sum + s.tax, 0);
  const totalDiscount = sales.reduce((sum, s) => sum + s.discount, 0);
  const avgOrderValue = sales.length > 0 ? totalRevenue / sales.length : 0;

  // Profit calculation
  const totalProfit = products.reduce((sum, p) => {
    const soldItems = sales.flatMap(s => s.items).filter(i => i.productId === p.id);
    const qtySold = soldItems.reduce((s, i) => s + i.quantity, 0);
    return sum + (qtySold * (p.price - p.costPrice));
  }, 0);
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Payment method breakdown
  const paymentBreakdown = sales.reduce((acc, s) => {
    acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + s.grandTotal;
    return acc;
  }, {} as Record<string, number>);

  // Sales by day
  const salesByDay = sales.reduce((acc, s) => {
    const day = formatDate(s.createdAt);
    if (!acc[day]) acc[day] = { count: 0, revenue: 0 };
    acc[day].count++;
    acc[day].revenue += s.grandTotal;
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);

  // Cashier performance
  const cashierStats = sales.reduce((acc, s) => {
    if (!acc[s.cashier]) acc[s.cashier] = { transactions: 0, revenue: 0, items: 0 };
    acc[s.cashier].transactions++;
    acc[s.cashier].revenue += s.grandTotal;
    acc[s.cashier].items += s.items.reduce((sum, i) => sum + i.quantity, 0);
    return acc;
  }, {} as Record<string, { transactions: number; revenue: number; items: number }>);

  // Category profit analysis
  const categoryAnalysis = categories.map(cat => {
    const catProducts = products.filter(p => p.categoryId === cat.id);
    const revenue = sales.flatMap(s => s.items)
      .filter(item => catProducts.some(p => p.id === item.productId))
      .reduce((sum, item) => sum + item.total, 0);
    const cost = sales.flatMap(s => s.items)
      .filter(item => catProducts.some(p => p.id === item.productId))
      .reduce((sum, item) => {
        const product = products.find(p => p.id === item.productId);
        return sum + (product ? product.costPrice * item.quantity : 0);
      }, 0);
    return {
      ...cat,
      revenue,
      cost,
      profit: revenue - cost,
      productCount: catProducts.length,
      margin: revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0,
    };
  }).filter(c => c.revenue > 0).sort((a, b) => b.revenue - a.revenue);

  // Export data
  const exportCSV = () => {
    const headers = [t('date'), t('transactionId'), t('items'), t('subtotal'), t('tax'), t('discount'), t('total'), t('payment'), t('cashier')];
    const rows = sales.map(s => [
      new Date(s.createdAt).toLocaleString(),
      s.id,
      s.items.map(i => `${i.productName} x${i.quantity}`).join('; '),
      s.total.toFixed(2),
      s.tax.toFixed(2),
      s.discount.toFixed(2),
      s.grandTotal.toFixed(2),
      s.paymentMethod,
      s.cashier,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="section-title">{t('reportsTitle')}</h1>
          <p className="text-gray-500 mt-1">{t('reportsSubtitle')}</p>
        </div>
        <button onClick={exportCSV} className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors">
          <Download size={18} /> {t('exportCSV')}
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <DollarSign size={20} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">{formatCurrency(totalRevenue)}</p>
          <p className="text-sm text-gray-500 mt-1">{t('totalRevenue')}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <TrendingUp size={20} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">{formatCurrency(totalProfit)}</p>
          <p className="text-sm text-gray-500 mt-1">{t('grossProfit')}</p>
          <p className="text-xs text-emerald-600 mt-1">{profitMargin.toFixed(1)}% {t('profitMargin')}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
            <ShoppingCart size={20} className="text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">{formatCurrency(avgOrderValue)}</p>
          <p className="text-sm text-gray-500 mt-1">{t('avgOrderValue')}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
            <Calendar size={20} className="text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">{sales.length}</p>
          <p className="text-sm text-gray-500 mt-1">{t('totalTransactions', sales.length)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">{t('dailySales')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('revenueByDay')}</p>
          </div>
          <div className="p-6 space-y-4">
            {Object.entries(salesByDay).sort((a, b) => b[1].revenue - a[1].revenue).map(([day, data]) => {
              const maxRevenue = Math.max(...Object.values(salesByDay).map(d => d.revenue));
              const widthPercent = (data.revenue / maxRevenue) * 100;
              return (
                <div key={day}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{day}</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(data.revenue)}</span>
                      <span className="text-xs text-gray-400 ml-2">{data.count} {t('orders')}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className="bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full h-3 transition-all" style={{ width: `${widthPercent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">{t('paymentMethods')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('revenueByPayment')}</p>
          </div>
          <div className="p-6 space-y-6">
            {[
              { method: 'cash', label: t('cash'), color: '#22c55e', icon: '💵' },
              { method: 'card', label: t('card'), color: '#3b82f6', icon: '💳' },
              { method: 'mobile', label: t('mobile'), color: '#8b5cf6', icon: '📱' },
            ].map(({ method, label, color, icon }) => {
              const revenue = paymentBreakdown[method] || 0;
              const percent = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
              const count = sales.filter(s => s.paymentMethod === method).length;
              return (
                <div key={method}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{icon}</span>
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(revenue)}</span>
                      <span className="text-xs text-gray-400 ml-2">{count} {t('transactionShort')}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className="rounded-full h-3 transition-all" style={{ width: `${percent}%`, backgroundColor: color }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{percent.toFixed(1)}% {t('ofTotalRevenue')}</p>
                </div>
              );
            })}
          </div>

          {/* Tax and Discounts Summary */}
          <div className="px-6 pb-6 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50 rounded-xl p-4">
                <p className="text-xs text-orange-600 font-medium">{t('totalTaxCollected')}</p>
                <p className="text-lg font-bold text-orange-700 mt-1">{formatCurrency(totalTax)}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-xs text-red-600 font-medium">{t('totalDiscounts')}</p>
                <p className="text-lg font-bold text-red-700 mt-1">{formatCurrency(totalDiscount)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Profit Analysis */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">{t('categoryProfitability')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('revenueCostProfit')}</p>
          </div>
          <div className="table-container">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">{t('category')}</th>
                  <th className="px-6 py-3">{t('totalRevenue')}</th>
                  <th className="px-6 py-3">{t('grossProfit')}</th>
                  <th className="px-6 py-3">{t('margin')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categoryAnalysis.map(cat => (
                  <tr key={cat.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(cat.revenue)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-emerald-600">{formatCurrency(cat.profit)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{cat.margin.toFixed(1)}%</span>
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-emerald-400 rounded-full h-1.5" style={{ width: `${Math.min(cat.margin, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cashier Performance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">{t('cashierPerformance')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('transactionStats')}</p>
          </div>
          <div className="p-6 space-y-4">
            {Object.entries(cashierStats).map(([cashier, stats]) => {
              const maxRevenue = Math.max(...Object.values(cashierStats).map(s => s.revenue));
              const widthPercent = (stats.revenue / maxRevenue) * 100;
              return (
                <div key={cashier} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {cashier.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{cashier}</p>
                        <p className="text-xs text-gray-400">{stats.transactions} {t('transactions')} · {stats.items} {t('items')}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(stats.revenue)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full h-2" style={{ width: `${widthPercent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Inventory Value Report */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{t('inventoryValueSummary')}</h3>
          <p className="text-sm text-gray-500 mt-1">{t('stockValuation')}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">{t('category')}</th>
                <th className="px-6 py-3">{t('productsCount')}</th>
                <th className="px-6 py-3">{t('totalUnits')}</th>
                <th className="px-6 py-3">{t('costValue')}</th>
                <th className="px-6 py-3">{t('retailValue')}</th>
                <th className="px-6 py-3">{t('potentialProfit')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map(cat => {
                const catProducts = products.filter(p => p.categoryId === cat.id);
                const totalUnits = catProducts.reduce((s, p) => s + p.stock, 0);
                const costValue = catProducts.reduce((s, p) => s + (p.costPrice * p.stock), 0);
                const retailValue = catProducts.reduce((s, p) => s + (p.price * p.stock), 0);
                const potentialProfit = retailValue - costValue;
                return (
                  <tr key={cat.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{catProducts.length}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatNumber(totalUnits)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(costValue)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(retailValue)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-emerald-600">{formatCurrency(potentialProfit)}</td>
                  </tr>
                );
              })}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-6 py-4 text-sm text-gray-900">{t('total')}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{products.length}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{formatNumber(products.reduce((s, p) => s + p.stock, 0))}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(products.reduce((s, p) => s + (p.costPrice * p.stock), 0))}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(products.reduce((s, p) => s + (p.price * p.stock), 0))}</td>
                <td className="px-6 py-4 text-sm text-emerald-600">{formatCurrency(products.reduce((s, p) => s + ((p.price - p.costPrice) * p.stock), 0))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
