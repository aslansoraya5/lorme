import { LayoutDashboard, Package, Tags, ShoppingCart, AlertTriangle, BarChart3, Menu, X } from 'lucide-react';
import { Page } from '../types';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  lowStockCount: number;
}

const navItems = [
  { page: 'dashboard' as Page, labelKey: 'navDashboard', icon: <LayoutDashboard size={20} /> },
  { page: 'products' as Page, labelKey: 'navProducts', icon: <Package size={20} /> },
  { page: 'categories' as Page, labelKey: 'navCategories', icon: <Tags size={20} /> },
  { page: 'sales' as Page, labelKey: 'navSales', icon: <ShoppingCart size={20} /> },
  { page: 'inventory' as Page, labelKey: 'navInventory', icon: <AlertTriangle size={20} /> },
  { page: 'reports' as Page, labelKey: 'navReports', icon: <BarChart3 size={20} /> },
];

export default function Sidebar({ currentPage, onNavigate, lowStockCount }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, isRTL } = useLanguage();

  const getSidebarTransform = (isOpen: boolean) => {
    if (isOpen) return 'translate-x-0';
    return isRTL ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0';
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="app-mobile-menu lg:hidden fixed top-4 left-4 rtl:right-4 rtl:left-auto z-50 bg-white rounded-lg shadow-lg p-2 border border-gray-200"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/30 z-30" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`app-sidebar fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ${getSidebarTransform(mobileOpen)}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 lg:p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-lg lg:text-xl">
                🛒
              </div>
              <div>
                <h1 className="text-base lg:text-lg font-bold text-gray-900">{t('appName')}</h1>
                <p className="text-[10px] lg:text-xs text-gray-500">{t('appSubtitle')}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => { onNavigate(item.page); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 touch-manipulation ${
                  currentPage === item.page
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.icon}
                <span>{t(item.labelKey)}</span>
                {item.page === 'inventory' && lowStockCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {lowStockCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-emerald-800">{t('storeStatusLabel')}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-xs text-emerald-600">{t('storeStatus')}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
