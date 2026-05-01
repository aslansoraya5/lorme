import { Category, Product, Sale } from './types';

export const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Fruits & Vegetables', description: 'Fresh produce and organic items', color: '#22c55e' },
  { id: 'cat-2', name: 'Dairy & Eggs', description: 'Milk, cheese, yogurt, and eggs', color: '#3b82f6' },
  { id: 'cat-3', name: 'Bakery', description: 'Bread, pastries, and baked goods', color: '#f59e0b' },
  { id: 'cat-4', name: 'Meat & Seafood', description: 'Fresh and frozen meat products', color: '#ef4444' },
  { id: 'cat-5', name: 'Beverages', description: 'Drinks, juices, and water', color: '#8b5cf6' },
  { id: 'cat-6', name: 'Snacks & Confectionery', description: 'Chips, candy, and snack items', color: '#ec4899' },
  { id: 'cat-7', name: 'Pantry & Dry Goods', description: 'Rice, pasta, canned goods', color: '#f97316' },
  { id: 'cat-8', name: 'Frozen Foods', description: 'Frozen meals, ice cream, and more', color: '#06b6d4' },
  { id: 'cat-9', name: 'Household', description: 'Cleaning supplies and home essentials', color: '#64748b' },
  { id: 'cat-10', name: 'Personal Care', description: 'Health and beauty products', color: '#a855f7' },
];

export const initialProducts: Product[] = [
  { id: 'prod-1', name: 'Organic Bananas', categoryId: 'cat-1', sku: 'FV-001', price: 1.49, costPrice: 0.89, stock: 150, minStock: 30, unit: 'bunch', image: '🍌', expiryDate: '2025-02-15', supplier: 'Fresh Farms Co.', createdAt: '2025-01-01T10:00:00Z', updatedAt: '2025-01-10T14:30:00Z' },
  { id: 'prod-2', name: 'Red Apples', categoryId: 'cat-1', sku: 'FV-002', price: 3.99, costPrice: 2.49, stock: 200, minStock: 50, unit: 'kg', image: '🍎', expiryDate: '2025-02-20', supplier: 'Fresh Farms Co.', createdAt: '2025-01-01T10:00:00Z', updatedAt: '2025-01-09T11:00:00Z' },
  { id: 'prod-3', name: 'Fresh Spinach', categoryId: 'cat-1', sku: 'FV-003', price: 2.99, costPrice: 1.79, stock: 12, minStock: 25, unit: 'bag', image: '🥬', expiryDate: '2025-01-25', supplier: 'Green Valley', createdAt: '2025-01-05T09:00:00Z', updatedAt: '2025-01-11T08:00:00Z' },
  { id: 'prod-4', name: 'Tomatoes', categoryId: 'cat-1', sku: 'FV-004', price: 4.49, costPrice: 2.99, stock: 80, minStock: 20, unit: 'kg', image: '🍅', expiryDate: '2025-02-10', supplier: 'Green Valley', createdAt: '2025-01-02T10:00:00Z', updatedAt: '2025-01-08T16:00:00Z' },
  { id: 'prod-5', name: 'Whole Milk', categoryId: 'cat-2', sku: 'DE-001', price: 3.49, costPrice: 2.19, stock: 120, minStock: 40, unit: 'gallon', image: '🥛', expiryDate: '2025-02-01', supplier: 'Dairy Best Inc.', createdAt: '2025-01-01T10:00:00Z', updatedAt: '2025-01-12T09:00:00Z' },
  { id: 'prod-6', name: 'Cheddar Cheese', categoryId: 'cat-2', sku: 'DE-002', price: 5.99, costPrice: 3.79, stock: 45, minStock: 15, unit: 'block', image: '🧀', expiryDate: '2025-03-15', supplier: 'Dairy Best Inc.', createdAt: '2025-01-03T10:00:00Z', updatedAt: '2025-01-07T12:00:00Z' },
  { id: 'prod-7', name: 'Large Eggs (12ct)', categoryId: 'cat-2', sku: 'DE-003', price: 4.29, costPrice: 2.99, stock: 8, minStock: 20, unit: 'dozen', image: '🥚', expiryDate: '2025-02-28', supplier: 'Happy Hens Farm', createdAt: '2025-01-01T10:00:00Z', updatedAt: '2025-01-11T15:00:00Z' },
  { id: 'prod-8', name: 'Greek Yogurt', categoryId: 'cat-2', sku: 'DE-004', price: 5.49, costPrice: 3.49, stock: 60, minStock: 20, unit: 'tub', image: '🫙', expiryDate: '2025-02-10', supplier: 'Dairy Best Inc.', createdAt: '2025-01-04T10:00:00Z', updatedAt: '2025-01-10T10:00:00Z' },
  { id: 'prod-9', name: 'Sourdough Bread', categoryId: 'cat-3', sku: 'BK-001', price: 4.99, costPrice: 2.99, stock: 35, minStock: 10, unit: 'loaf', image: '🍞', expiryDate: '2025-01-20', supplier: 'Golden Crust Bakery', createdAt: '2025-01-01T10:00:00Z', updatedAt: '2025-01-12T06:00:00Z' },
  { id: 'prod-10', name: 'Croissants (4pk)', categoryId: 'cat-3', sku: 'BK-002', price: 3.99, costPrice: 2.29, stock: 25, minStock: 10, unit: 'pack', image: '🥐', expiryDate: '2025-01-18', supplier: 'Golden Crust Bakery', createdAt: '2025-01-02T10:00:00Z', updatedAt: '2025-01-11T07:00:00Z' },
  { id: 'prod-11', name: 'Chicken Breast', categoryId: 'cat-4', sku: 'MS-001', price: 8.99, costPrice: 5.49, stock: 50, minStock: 20, unit: 'kg', image: '🍗', expiryDate: '2025-01-22', supplier: 'Premium Meats Ltd.', createdAt: '2025-01-01T10:00:00Z', updatedAt: '2025-01-10T08:00:00Z' },
  { id: 'prod-12', name: 'Atlantic Salmon', categoryId: 'cat-4', sku: 'MS-002', price: 12.99, costPrice: 8.49, stock: 18, minStock: 10, unit: 'fillet', image: '🐟', expiryDate: '2025-01-19', supplier: 'Ocean Fresh Seafood', createdAt: '2025-01-05T10:00:00Z', updatedAt: '2025-01-09T14:00:00Z' },
  { id: 'prod-13', name: 'Ground Beef', categoryId: 'cat-4', sku: 'MS-003', price: 7.49, costPrice: 4.79, stock: 5, minStock: 15, unit: 'kg', image: '🥩', expiryDate: '2025-01-17', supplier: 'Premium Meats Ltd.', createdAt: '2025-01-03T10:00:00Z', updatedAt: '2025-01-12T11:00:00Z' },
  { id: 'prod-14', name: 'Orange Juice', categoryId: 'cat-5', sku: 'BV-001', price: 4.49, costPrice: 2.79, stock: 90, minStock: 30, unit: 'bottle', image: '🍊', expiryDate: '2025-03-01', supplier: 'Citrus World', createdAt: '2025-01-01T10:00:00Z', updatedAt: '2025-01-08T13:00:00Z' },
  { id: 'prod-15', name: 'Sparkling Water (6pk)', categoryId: 'cat-5', sku: 'BV-002', price: 5.99, costPrice: 3.49, stock: 110, minStock: 40, unit: 'pack', image: '💧', expiryDate: '2025-06-01', supplier: 'AquaPure', createdAt: '2025-01-02T10:00:00Z', updatedAt: '2025-01-07T09:00:00Z' },
  { id: 'prod-16', name: 'Coffee Beans', categoryId: 'cat-5', sku: 'BV-003', price: 11.99, costPrice: 7.49, stock: 40, minStock: 15, unit: 'bag', image: '☕', expiryDate: '2025-06-15', supplier: 'Roast Masters', createdAt: '2025-01-04T10:00:00Z', updatedAt: '2025-01-11T10:00:00Z' },
  { id: 'prod-17', name: 'Potato Chips', categoryId: 'cat-6', sku: 'SC-001', price: 3.49, costPrice: 1.99, stock: 150, minStock: 50, unit: 'bag', image: '🥔', expiryDate: '2025-04-01', supplier: 'SnackWorld', createdAt: '2025-01-01T10:00:00Z', updatedAt: '2025-01-06T12:00:00Z' },
  { id: 'prod-18', name: 'Chocolate Bar', categoryId: 'cat-6', sku: 'SC-002', price: 2.49, costPrice: 1.29, stock: 200, minStock: 60, unit: 'bar', image: '🍫', expiryDate: '2025-05-01', supplier: 'Sweet Treats Co.', createdAt: '2025-01-01T10:00:00Z', updatedAt: '2025-01-05T15:00:00Z' },
  { id: 'prod-19', name: 'Basmati Rice (5kg)', categoryId: 'cat-7', sku: 'PD-001', price: 8.99, costPrice: 5.49, stock: 70, minStock: 25, unit: 'bag', image: '🍚', expiryDate: '2025-12-01', supplier: 'Global Grains', createdAt: '2025-01-01T10:00:00Z', updatedAt: '2025-01-04T10:00:00Z' },
  { id: 'prod-20', name: 'Penne Pasta', categoryId: 'cat-7', sku: 'PD-002', price: 2.29, costPrice: 1.29, stock: 130, minStock: 40, unit: 'box', image: '🍝', expiryDate: '2025-09-01', supplier: 'Global Grains', createdAt: '2025-01-02T10:00:00Z', updatedAt: '2025-01-03T09:00:00Z' },
  { id: 'prod-21', name: 'Frozen Pizza', categoryId: 'cat-8', sku: 'FF-001', price: 6.99, costPrice: 3.99, stock: 45, minStock: 15, unit: 'box', image: '🍕', expiryDate: '2025-08-01', supplier: 'Frosty Foods', createdAt: '2025-01-03T10:00:00Z', updatedAt: '2025-01-10T11:00:00Z' },
  { id: 'prod-22', name: 'Ice Cream (Vanilla)', categoryId: 'cat-8', sku: 'FF-002', price: 5.49, costPrice: 3.19, stock: 55, minStock: 20, unit: 'tub', image: '🍦', expiryDate: '2025-07-01', supplier: 'Frosty Foods', createdAt: '2025-01-04T10:00:00Z', updatedAt: '2025-01-09T16:00:00Z' },
  { id: 'prod-23', name: 'Dish Soap', categoryId: 'cat-9', sku: 'HH-001', price: 3.99, costPrice: 2.19, stock: 80, minStock: 25, unit: 'bottle', image: '🧴', expiryDate: '2026-01-01', supplier: 'CleanPro', createdAt: '2025-01-01T10:00:00Z', updatedAt: '2025-01-02T10:00:00Z' },
  { id: 'prod-24', name: 'Paper Towels', categoryId: 'cat-9', sku: 'HH-002', price: 8.99, costPrice: 5.49, stock: 60, minStock: 20, unit: 'roll', image: '🧻', expiryDate: '2026-06-01', supplier: 'CleanPro', createdAt: '2025-01-02T10:00:00Z', updatedAt: '2025-01-03T10:00:00Z' },
  { id: 'prod-25', name: 'Shampoo', categoryId: 'cat-10', sku: 'PC-001', price: 6.49, costPrice: 3.79, stock: 40, minStock: 15, unit: 'bottle', image: '🧴', expiryDate: '2026-03-01', supplier: 'Beauty Care Inc.', createdAt: '2025-01-01T10:00:00Z', updatedAt: '2025-01-05T10:00:00Z' },
  { id: 'prod-26', name: 'Toothpaste', categoryId: 'cat-10', sku: 'PC-002', price: 4.29, costPrice: 2.49, stock: 75, minStock: 25, unit: 'tube', image: '🪥', expiryDate: '2026-06-01', supplier: 'Beauty Care Inc.', createdAt: '2025-01-03T10:00:00Z', updatedAt: '2025-01-06T10:00:00Z' },
  { id: 'prod-27', name: 'Avocados', categoryId: 'cat-1', sku: 'FV-005', price: 5.99, costPrice: 3.49, stock: 3, minStock: 20, unit: 'bag', image: '🥑', expiryDate: '2025-01-22', supplier: 'Fresh Farms Co.', createdAt: '2025-01-08T10:00:00Z', updatedAt: '2025-01-12T14:00:00Z' },
  { id: 'prod-28', name: 'Strawberries', categoryId: 'cat-1', sku: 'FV-006', price: 4.99, costPrice: 3.19, stock: 7, minStock: 15, unit: 'box', image: '🍓', expiryDate: '2025-01-20', supplier: 'Berry Best Farm', createdAt: '2025-01-09T10:00:00Z', updatedAt: '2025-01-12T08:00:00Z' },
];

export const initialSales: Sale[] = [
  {
    id: 'sale-1', items: [
      { productId: 'prod-1', productName: 'Organic Bananas', quantity: 2, unitPrice: 1.49, total: 2.98 },
      { productId: 'prod-5', productName: 'Whole Milk', quantity: 1, unitPrice: 3.49, total: 3.49 },
      { productId: 'prod-9', productName: 'Sourdough Bread', quantity: 1, unitPrice: 4.99, total: 4.99 },
    ], total: 11.46, discount: 0, tax: 0.92, grandTotal: 12.38, paymentMethod: 'card', cashier: 'Sarah M.', createdAt: '2025-01-12T09:15:00Z'
  },
  {
    id: 'sale-2', items: [
      { productId: 'prod-14', productName: 'Orange Juice', quantity: 2, unitPrice: 4.49, total: 8.98 },
      { productId: 'prod-18', productName: 'Chocolate Bar', quantity: 3, unitPrice: 2.49, total: 7.47 },
    ], total: 16.45, discount: 1.00, tax: 1.24, grandTotal: 16.69, paymentMethod: 'cash', cashier: 'Mike T.', createdAt: '2025-01-12T10:30:00Z'
  },
  {
    id: 'sale-3', items: [
      { productId: 'prod-11', productName: 'Chicken Breast', quantity: 2, unitPrice: 8.99, total: 17.98 },
      { productId: 'prod-4', productName: 'Tomatoes', quantity: 1, unitPrice: 4.49, total: 4.49 },
      { productId: 'prod-19', productName: 'Basmati Rice (5kg)', quantity: 1, unitPrice: 8.99, total: 8.99 },
    ], total: 31.46, discount: 0, tax: 2.52, grandTotal: 33.98, paymentMethod: 'card', cashier: 'Sarah M.', createdAt: '2025-01-12T11:45:00Z'
  },
  {
    id: 'sale-4', items: [
      { productId: 'prod-21', productName: 'Frozen Pizza', quantity: 2, unitPrice: 6.99, total: 13.98 },
      { productId: 'prod-22', productName: 'Ice Cream (Vanilla)', quantity: 1, unitPrice: 5.49, total: 5.49 },
      { productId: 'prod-16', productName: 'Coffee Beans', quantity: 1, unitPrice: 11.99, total: 11.99 },
    ], total: 31.46, discount: 2.00, tax: 2.36, grandTotal: 31.82, paymentMethod: 'mobile', cashier: 'Lisa K.', createdAt: '2025-01-12T13:20:00Z'
  },
  {
    id: 'sale-5', items: [
      { productId: 'prod-7', productName: 'Large Eggs (12ct)', quantity: 1, unitPrice: 4.29, total: 4.29 },
      { productId: 'prod-6', productName: 'Cheddar Cheese', quantity: 1, unitPrice: 5.99, total: 5.99 },
      { productId: 'prod-10', productName: 'Croissants (4pk)', quantity: 2, unitPrice: 3.99, total: 7.98 },
    ], total: 18.26, discount: 0, tax: 1.46, grandTotal: 19.72, paymentMethod: 'cash', cashier: 'Mike T.', createdAt: '2025-01-12T14:50:00Z'
  },
  {
    id: 'sale-6', items: [
      { productId: 'prod-17', productName: 'Potato Chips', quantity: 3, unitPrice: 3.49, total: 10.47 },
      { productId: 'prod-15', productName: 'Sparkling Water (6pk)', quantity: 2, unitPrice: 5.99, total: 11.98 },
      { productId: 'prod-25', productName: 'Shampoo', quantity: 1, unitPrice: 6.49, total: 6.49 },
    ], total: 28.94, discount: 0, tax: 2.32, grandTotal: 31.26, paymentMethod: 'card', cashier: 'Lisa K.', createdAt: '2025-01-11T10:00:00Z'
  },
  {
    id: 'sale-7', items: [
      { productId: 'prod-12', productName: 'Atlantic Salmon', quantity: 1, unitPrice: 12.99, total: 12.99 },
      { productId: 'prod-2', productName: 'Red Apples', quantity: 2, unitPrice: 3.99, total: 7.98 },
    ], total: 20.97, discount: 0, tax: 1.68, grandTotal: 22.65, paymentMethod: 'card', cashier: 'Sarah M.', createdAt: '2025-01-11T11:30:00Z'
  },
  {
    id: 'sale-8', items: [
      { productId: 'prod-23', productName: 'Dish Soap', quantity: 2, unitPrice: 3.99, total: 7.98 },
      { productId: 'prod-24', productName: 'Paper Towels', quantity: 1, unitPrice: 8.99, total: 8.99 },
      { productId: 'prod-26', productName: 'Toothpaste', quantity: 2, unitPrice: 4.29, total: 8.58 },
    ], total: 25.55, discount: 1.50, tax: 1.92, grandTotal: 25.97, paymentMethod: 'mobile', cashier: 'Mike T.', createdAt: '2025-01-11T14:15:00Z'
  },
  {
    id: 'sale-9', items: [
      { productId: 'prod-8', productName: 'Greek Yogurt', quantity: 2, unitPrice: 5.49, total: 10.98 },
      { productId: 'prod-20', productName: 'Penne Pasta', quantity: 3, unitPrice: 2.29, total: 6.87 },
      { productId: 'prod-3', productName: 'Fresh Spinach', quantity: 1, unitPrice: 2.99, total: 2.99 },
    ], total: 20.84, discount: 0, tax: 1.67, grandTotal: 22.51, paymentMethod: 'cash', cashier: 'Lisa K.', createdAt: '2025-01-10T09:45:00Z'
  },
  {
    id: 'sale-10', items: [
      { productId: 'prod-13', productName: 'Ground Beef', quantity: 2, unitPrice: 7.49, total: 14.98 },
      { productId: 'prod-4', productName: 'Tomatoes', quantity: 2, unitPrice: 4.49, total: 8.98 },
      { productId: 'prod-19', productName: 'Basmati Rice (5kg)', quantity: 1, unitPrice: 8.99, total: 8.99 },
    ], total: 32.95, discount: 0, tax: 2.64, grandTotal: 35.59, paymentMethod: 'card', cashier: 'Sarah M.', createdAt: '2025-01-10T12:00:00Z'
  },
];
