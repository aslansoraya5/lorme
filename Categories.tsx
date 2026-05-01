import { useState } from 'react';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import { Category, Product } from '../types';
import Modal from './Modal';
import { useLanguage } from '../contexts/LanguageContext';

interface CategoriesProps {
  categories: Category[];
  products: Product[];
  onAdd: (category: Category) => void;
  onUpdate: (category: Category) => void;
  onDelete: (id: string) => void;
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4', '#64748b', '#a855f7', '#14b8a6', '#f43f5e'];

export default function Categories({ categories, products, onAdd, onUpdate, onDelete }: CategoriesProps) {
  const { t, formatCurrency } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', color: COLORS[0] });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', color: COLORS[Math.floor(Math.random() * COLORS.length)] });
    setShowModal(true);
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description, color: category.color });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      onUpdate({ ...editingCategory, ...formData });
    } else {
      onAdd({ id: `cat-${Date.now()}`, ...formData });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setDeleteConfirm(null);
  };

  const getProductCount = (catId: string) => products.filter(p => p.categoryId === catId).length;
  const getTotalStock = (catId: string) => products.filter(p => p.categoryId === catId).reduce((sum, p) => sum + p.stock, 0);
  const getStockValue = (catId: string) => products.filter(p => p.categoryId === catId).reduce((sum, p) => sum + (p.price * p.stock), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="section-title">{t('categoriesTitle')}</h1>
          <p className="text-gray-500 mt-1">{t('categoriesSubtitle', categories.length)}</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm">
          <Plus size={18} /> {t('addCategory')}
        </button>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(category => {
          const productCount = getProductCount(category.id);
          const totalStock = getTotalStock(category.id);
          const stockValue = getStockValue(category.id);
          return (
            <div key={category.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="h-2" style={{ backgroundColor: category.color }} />
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${category.color}20` }}>
                      <Package size={20} style={{ color: category.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(category)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                      <Edit2 size={14} className="text-gray-400" />
                    </button>
                    <button onClick={() => setDeleteConfirm(category.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-50">
                  <div>
                    <p className="text-xs text-gray-400">{t('productsCount')}</p>
                    <p className="text-lg font-bold text-gray-900">{productCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{t('inStockCount')}</p>
                    <p className="text-lg font-bold text-gray-900">{totalStock}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{t('value')}</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(stockValue)}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title={`${t('delete')} ${t('category')}`} size="sm">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={24} className="text-red-500" />
          </div>
          <p className="text-gray-600 mb-2">{t('confirmDelete')}</p>
          {deleteConfirm && getProductCount(deleteConfirm) > 0 && (
            <p className="text-sm text-red-600 mb-4">{t('deleteCategoryWarning', getProductCount(deleteConfirm))}</p>
          )}
          <div className="flex gap-3 justify-center">
            <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">{t('cancel')}</button>
            <button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={!!(deleteConfirm && getProductCount(deleteConfirm) > 0)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium"
            >
              {t('delete')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCategory ? t('editCategory') : t('addNewCategory')} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('categoryName')} *</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder={t('placeholderCategory')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('description')}</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none" placeholder={t('placeholderDescription')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('color')}</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(color => (
                <button key={color} type="button" onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-xl transition-all ${formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">{t('cancel')}</button>
            <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors">
              {editingCategory ? t('updateCategory') : t('addCategory')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
