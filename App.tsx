import { useState, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { initialCategories, initialProducts, initialSales } from './data';
import { Category, Product, Sale, Page } from './types';
import { LanguageProvider } from './contexts/LanguageContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Categories from './components/Categories';
import Sales from './components/Sales';
import Inventory from './components/Inventory';
import Reports from './components/Reports';
import LanguageSwitcher from './components/LanguageSwitcher';
import AIAssistant from './components/AIAssistant';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [products, setProducts] = useLocalStorage<Product[]>('freshmart-products', initialProducts);
  const [categories, setCategories] = useLocalStorage<Category[]>('freshmart-categories', initialCategories);
  const [sales, setSales] = useLocalStorage<Sale[]>('freshmart-sales', initialSales);

  // Product CRUD
  const addProduct = useCallback((product: Product) => {
    setProducts(prev => [...prev, product]);
  }, [setProducts]);

  const updateProduct = useCallback((product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  }, [setProducts]);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, [setProducts]);

  // Category CRUD
  const addCategory = useCallback((category: Category) => {
    setCategories(prev => [...prev, category]);
  }, [setCategories]);

  const updateCategory = useCallback((category: Category) => {
    setCategories(prev => prev.map(c => c.id === category.id ? category : c));
  }, [setCategories]);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, [setCategories]);

  // Sales
  const addSale = useCallback((sale: Sale) => {
    setSales(prev => [...prev, sale]);
    // Update product stock
    setProducts(prev => prev.map(product => {
      const saleItem = sale.items.find(item => item.productId === product.id);
      if (saleItem) {
        return { ...product, stock: Math.max(0, product.stock - saleItem.quantity), updatedAt: new Date().toISOString() };
      }
      return product;
    }));
  }, [setSales, setProducts]);

  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard products={products} categories={categories} sales={sales} onNavigate={navigateTo} />;
      case 'products':
        return <Products products={products} categories={categories} onAdd={addProduct} onUpdate={updateProduct} onDelete={deleteProduct} />;
      case 'categories':
        return <Categories categories={categories} products={products} onAdd={addCategory} onUpdate={updateCategory} onDelete={deleteCategory} />;
      case 'sales':
        return <Sales products={products} categories={categories} sales={sales} onNewSale={addSale} />;
      case 'inventory':
        return <Inventory products={products} categories={categories} onUpdate={updateProduct} />;
      case 'reports':
        return <Reports products={products} categories={categories} sales={sales} />;
      default:
        return <Dashboard products={products} categories={categories} sales={sales} onNavigate={navigateTo} />;
    }
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50/80">
        <Sidebar currentPage={currentPage} onNavigate={navigateTo} lowStockCount={lowStockCount} />
        <main className="app-main lg:ml-64 min-h-screen">
          <div className="p-4 sm:p-5 lg:p-8 pt-16 lg:pt-8 max-w-[100vw] overflow-x-hidden">
            {currentPage === 'dashboard' && (
              <div className="flex justify-end mb-4 lg:mb-2">
                <LanguageSwitcher />
              </div>
            )}
            {renderPage()}
          </div>
        </main>
        <AIAssistant
          products={products}
          categories={categories}
          sales={sales}
          currentPage={currentPage}
          onNavigate={navigateTo}
        />
      </div>
    </LanguageProvider>
  );
}
