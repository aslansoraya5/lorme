export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  sku: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  unit: string;
  image: string;
  expiryDate: string;
  supplier: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paymentMethod: 'cash' | 'card' | 'mobile';
  cashier: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type Page = 'dashboard' | 'products' | 'categories' | 'sales' | 'inventory' | 'reports';
