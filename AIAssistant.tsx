import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot, X, Send, Minimize2, Maximize2,
  Sparkles, RotateCcw, User
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Product, Category, Sale } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
  typing?: boolean;
}

interface SuggestedQuestion {
  label: string;
  query: string;
}

interface AIAssistantProps {
  products: Product[];
  categories: Category[];
  sales: Sale[];
  currentPage: string;
  onNavigate: (page: any) => void;
}

// ─── Knowledge base: generate a smart answer from live app data ──────────────
function generateAnswer(
  query: string,
  products: Product[],
  categories: Category[],
  sales: Sale[],
  language: string
): string {
  const q = query.toLowerCase().trim();

  // ── helpers ──
  const fmt = (n: number) => `AFN ${n.toFixed(2)}`;
  const lowStock = products.filter(p => p.stock <= p.minStock);
  const outOfStock = products.filter(p => p.stock === 0);
  const totalRevenue = sales.reduce((s, x) => s + x.grandTotal, 0);
  const totalProfit = products.reduce((sum, p) => {
    const sold = sales.flatMap(s => s.items).filter(i => i.productId === p.id);
    const qty = sold.reduce((a, i) => a + i.quantity, 0);
    return sum + qty * (p.price - p.costPrice);
  }, 0);
  const topProduct = (() => {
    const map = new Map<string, number>();
    sales.forEach(s => s.items.forEach(i => map.set(i.productId, (map.get(i.productId) || 0) + i.total)));
    let best = { name: '', rev: 0 };
    map.forEach((rev, id) => {
      const p = products.find(x => x.id === id);
      if (p && rev > best.rev) best = { name: p.name, rev };
    });
    return best;
  })();

  const isDari = language === 'dr';
  const isPashto = language === 'ps';

  // ── greeting ──
  const greetWords = ['hello', 'hi', 'سلام', 'ښه راغلاست', 'درود', 'کمک', 'help', 'مرسته'];
  if (greetWords.some(w => q.includes(w)) && q.length < 30) {
    if (isDari) return `سلام! 👋 من دستیار هوشمند فرش‌مارت هستم. می‌توانم در مورد موجودی، فروش، گزارش‌ها و محصولات کمک کنم. چه سوالی دارید؟`;
    if (isPashto) return `سلام! 👋 زه د فرېشمارټ هوشمند مرستیال یم. زه کولی شم د موجودي، پلور، راپورونو او محصولاتو په اړه مرسته وکړم. کومه پوښتنه لرئ؟`;
    return `Hello! 👋 I'm the FreshMart AI Assistant. I can help you with inventory, sales, reports, and products. What would you like to know?`;
  }

  // ── low stock / موجودی کم ──
  if (q.includes('low stock') || q.includes('موجودی کم') || q.includes('کم موجودي') || q.includes('کم موجودی') || q.includes('restock') || q.includes('تجدید موجودی') || q.includes('بیا موجودي')) {
    if (lowStock.length === 0) {
      if (isDari) return `✅ تمام محصولات موجودی کافی دارند. نیازی به تجدید موجودی نیست.`;
      if (isPashto) return `✅ ټول محصولات کافي موجودي لري. د بیا موجودي ضرورت نشته.`;
      return `✅ Great news! All products have sufficient stock. No restocking needed right now.`;
    }
    const list = lowStock.slice(0, 5).map(p => `• ${p.name} (${p.stock}/${p.minStock})`).join('\n');
    if (isDari) return `⚠️ **${lowStock.length} محصول** موجودی کم دارند:\n\n${list}\n\nبه صفحه انبارداری بروید تا موجودی را تجدید کنید.`;
    if (isPashto) return `⚠️ **${lowStock.length} محصولات** کم موجودي لري:\n\n${list}\n\nد بیا موجودي لپاره د ګودام پاڼې ته لاړ شئ.`;
    return `⚠️ **${lowStock.length} products** are running low on stock:\n\n${list}\n\nNavigate to Inventory to restock them.`;
  }

  // ── out of stock ──
  if (q.includes('out of stock') || q.includes('تمام شده') || q.includes('ختم شوي') || q.includes('zero stock') || q.includes('موجودی صفر')) {
    if (outOfStock.length === 0) {
      if (isDari) return `✅ هیچ محصولی تمام نشده. همه محصولات در انبار موجود هستند.`;
      if (isPashto) return `✅ هیڅ محصول ختم شوی نه دی. ټول محصولات د ګودام کې شته.`;
      return `✅ No products are currently out of stock. Everything is available!`;
    }
    const list = outOfStock.map(p => `• ${p.name}`).join('\n');
    if (isDari) return `🔴 **${outOfStock.length} محصول** تمام شده:\n\n${list}`;
    if (isPashto) return `🔴 **${outOfStock.length} محصولات** ختم شوي:\n\n${list}`;
    return `🔴 **${outOfStock.length} products** are out of stock:\n\n${list}`;
  }

  // ── revenue / درآمد / عاید ──
  if (q.includes('revenue') || q.includes('درآمد') || q.includes('عاید') || q.includes('income') || q.includes('sales total') || q.includes('مجموع فروش')) {
    const avg = sales.length > 0 ? totalRevenue / sales.length : 0;
    if (isDari) return `💰 **خلاصه درآمد:**\n\n• مجموع درآمد: ${fmt(totalRevenue)}\n• تعداد تراکنش‌ها: ${sales.length}\n• میانگین سفارش: ${fmt(avg)}\n• سود ناخالص: ${fmt(totalProfit)}`;
    if (isPashto) return `💰 **د عاید لنډیز:**\n\n• ټول عاید: ${fmt(totalRevenue)}\n• د تراکنشونو شمیر: ${sales.length}\n• اوسط امر: ${fmt(avg)}\n• ناخالصه ګټه: ${fmt(totalProfit)}`;
    return `💰 **Revenue Summary:**\n\n• Total Revenue: ${fmt(totalRevenue)}\n• Transactions: ${sales.length}\n• Avg. Order Value: ${fmt(avg)}\n• Gross Profit: ${fmt(totalProfit)}`;
  }

  // ── profit / سود / ګټه ──
  if (q.includes('profit') || q.includes('سود') || q.includes('ګټه') || q.includes('margin') || q.includes('حاشیه')) {
    const margin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100).toFixed(1) : '0';
    if (isDari) return `📈 **خلاصه سود:**\n\n• سود ناخالص: ${fmt(totalProfit)}\n• حاشیه سود: ${margin}%\n• مجموع درآمد: ${fmt(totalRevenue)}\n\nبرای جزئیات بیشتر به صفحه گزارش‌ها بروید.`;
    if (isPashto) return `📈 **د ګټې لنډیز:**\n\n• ناخالصه ګټه: ${fmt(totalProfit)}\n• د ګټې حاشیه: ${margin}%\n• ټول عاید: ${fmt(totalRevenue)}\n\nد نور تفصیل لپاره د راپورونو پاڼې ته لاړ شئ.`;
    return `📈 **Profit Summary:**\n\n• Gross Profit: ${fmt(totalProfit)}\n• Profit Margin: ${margin}%\n• Total Revenue: ${fmt(totalRevenue)}\n\nGo to Reports for detailed analytics.`;
  }

  // ── top product / پرفروش‌ترین ──
  if (q.includes('top') || q.includes('best sell') || q.includes('پرفروش') || q.includes('ډیر خرڅ') || q.includes('popular') || q.includes('محبوب')) {
    if (!topProduct.name) {
      if (isDari) return `📊 هنوز داده فروش کافی برای تحلیل وجود ندارد.`;
      if (isPashto) return `📊 تر اوسه کافي د پلور معلومات د تحلیل لپاره نشته.`;
      return `📊 Not enough sales data yet to determine top products.`;
    }
    if (isDari) return `🏆 **پرفروش‌ترین محصول:**\n\n• نام: ${topProduct.name}\n• درآمد: ${fmt(topProduct.rev)}\n\nبرای لیست کامل به صفحه گزارش‌ها بروید.`;
    if (isPashto) return `🏆 **ډیر خرڅ شوی محصول:**\n\n• نوم: ${topProduct.name}\n• عاید: ${fmt(topProduct.rev)}\n\nد بشپړ لیست لپاره د راپورونو پاڼې ته لاړ شئ.`;
    return `🏆 **Top Selling Product:**\n\n• Name: ${topProduct.name}\n• Revenue: ${fmt(topProduct.rev)}\n\nGo to Reports for the full breakdown.`;
  }

  // ── total products ──
  if (q.includes('how many product') || q.includes('total product') || q.includes('تعداد محصول') || q.includes('ټول محصولات') || q.includes('چند محصول')) {
    const catBreakdown = categories.map(c => `• ${c.name}: ${products.filter(p => p.categoryId === c.id).length}`).join('\n');
    if (isDari) return `📦 **مجموع محصولات: ${products.length}**\n\nبر اساس دسته‌بندی:\n${catBreakdown}`;
    if (isPashto) return `📦 **ټول محصولات: ${products.length}**\n\nد کټګورۍ له مخې:\n${catBreakdown}`;
    return `📦 **Total Products: ${products.length}**\n\nBy category:\n${catBreakdown}`;
  }

  // ── categories ──
  if (q.includes('categor') || q.includes('دسته‌بندی') || q.includes('کټګوري')) {
    const list = categories.map(c => `• ${c.name} (${products.filter(p => p.categoryId === c.id).length} products)`).join('\n');
    if (isDari) return `🏷️ **دسته‌بندی‌ها (${categories.length}):**\n\n${list}`;
    if (isPashto) return `🏷️ **کټګورۍ (${categories.length}):**\n\n${list}`;
    return `🏷️ **Categories (${categories.length}):**\n\n${list}`;
  }

  // ── stock value ──
  if (q.includes('stock value') || q.includes('ارزش موجودی') || q.includes('د موجودي ارزښت') || q.includes('inventory value')) {
    const totalVal = products.reduce((s, p) => s + p.price * p.stock, 0);
    const costVal = products.reduce((s, p) => s + p.costPrice * p.stock, 0);
    if (isDari) return `🏪 **ارزش موجودی انبار:**\n\n• ارزش خرده‌فروشی: ${fmt(totalVal)}\n• ارزش هزینه: ${fmt(costVal)}\n• سود بالقوه: ${fmt(totalVal - costVal)}`;
    if (isPashto) return `🏪 **د ګودام موجودي ارزښت:**\n\n• د پرچون ارزښت: ${fmt(totalVal)}\n• د لګښت ارزښت: ${fmt(costVal)}\n• احتمالي ګټه: ${fmt(totalVal - costVal)}`;
    return `🏪 **Inventory Value:**\n\n• Retail Value: ${fmt(totalVal)}\n• Cost Value: ${fmt(costVal)}\n• Potential Profit: ${fmt(totalVal - costVal)}`;
  }

  // ── expiry ──
  if (q.includes('expir') || q.includes('انقضا') || q.includes('ختمېدو') || q.includes('expire')) {
    const today = new Date();
    const soon = products
      .filter(p => p.expiryDate)
      .map(p => ({ ...p, days: Math.ceil((new Date(p.expiryDate).getTime() - today.getTime()) / 86400000) }))
      .filter(p => p.days <= 30)
      .sort((a, b) => a.days - b.days);
    if (soon.length === 0) {
      if (isDari) return `✅ هیچ محصولی در ۳۰ روز آینده منقضی نمی‌شود.`;
      if (isPashto) return `✅ د راتلونکو ۳۰ ورځو کې هیڅ محصول نه ختمیږي.`;
      return `✅ No products expiring in the next 30 days.`;
    }
    const list = soon.map(p => `• ${p.name} — ${p.days > 0 ? `${p.days} days` : 'Expired!'}`).join('\n');
    if (isDari) return `⏰ **محصولات نزدیک به انقضا:**\n\n${list}`;
    if (isPashto) return `⏰ **د ختمیدو سره نږدې محصولات:**\n\n${list}`;
    return `⏰ **Products Expiring Soon:**\n\n${list}`;
  }

  // ── how to add product ──
  if ((q.includes('add') && q.includes('product')) || (q.includes('زیاتول') && q.includes('محصول')) || (q.includes('افزودن') && q.includes('محصول'))) {
    if (isDari) return `➕ **نحوه افزودن محصول:**\n\n1. به صفحه **محصولات** بروید\n2. دکمه **افزودن محصول** را کلیک کنید\n3. اطلاعات را پر کنید (نام، قیمت، دسته‌بندی، موجودی)\n4. **ذخیره** را کلیک کنید\n\n✅ محصول اضافه می‌شود!`;
    if (isPashto) return `➕ **د محصول زیاتولو طریقه:**\n\n1. د **محصولاتو** پاڼې ته لاړ شئ\n2. د **محصول زیاتول** تڼۍ کلیک کړئ\n3. معلومات ډک کړئ (نوم، بیه، کټګوري، موجودي)\n4. **خوندي کول** کلیک کړئ\n\n✅ محصول زیاتیږي!`;
    return `➕ **How to Add a Product:**\n\n1. Go to the **Products** page\n2. Click **Add Product** button\n3. Fill in details (name, price, category, stock)\n4. Click **Save**\n\n✅ Product is added!`;
  }

  // ── how to make a sale ──
  if ((q.includes('sale') || q.includes('sell') || q.includes('پلور') || q.includes('فروش')) && (q.includes('how') || q.includes('چطور') || q.includes('طریقه') || q.includes('چنګه'))) {
    if (isDari) return `🛒 **نحوه ثبت فروش:**\n\n1. به صفحه **فروش** بروید\n2. روی محصولات کلیک کنید تا به سبد اضافه شوند\n3. تخفیف را در صورت نیاز وارد کنید\n4. روش پرداخت را انتخاب کنید\n5. **تکمیل فروش** را کلیک کنید\n\n✅ رسید صادر می‌شود!`;
    if (isPashto) return `🛒 **د پلور ثبتولو طریقه:**\n\n1. د **پلور** پاڼې ته لاړ شئ\n2. محصولاتو ته کلیک وکړئ ترڅو ټوکري ته زیات شي\n3. تخفیف داخل کړئ که ضرور وي\n4. د تادیې طریقه وټاکئ\n5. **پلور بشپړول** کلیک کړئ\n\n✅ رسید صادریږي!`;
    return `🛒 **How to Make a Sale:**\n\n1. Go to the **Sales** page\n2. Click products to add them to the cart\n3. Enter a discount if needed\n4. Choose payment method\n5. Click **Complete Sale**\n\n✅ Receipt is generated!`;
  }

  // ── how to restock ──
  if (q.includes('restock') || q.includes('تجدید') || q.includes('بیا موجودي') || q.includes('add stock') || q.includes('stock add')) {
    if (isDari) return `🔄 **نحوه تجدید موجودی:**\n\n1. به صفحه **انبارداری** بروید\n2. محصول مورد نظر را پیدا کنید\n3. دکمه **تجدید موجودی** را کلیک کنید\n4. مقدار جدید را وارد کنید\n5. **ذخیره** را کلیک کنید`;
    if (isPashto) return `🔄 **د بیا موجودي طریقه:**\n\n1. د **ګودام** پاڼې ته لاړ شئ\n2. مطلوب محصول ومومئ\n3. د **بیا موجودي** تڼۍ کلیک کړئ\n4. نوی مقدار داخل کړئ\n5. **خوندي کول** کلیک کړئ`;
    return `🔄 **How to Restock Products:**\n\n1. Go to **Inventory** page\n2. Find the product\n3. Click **Restock** button\n4. Enter the quantity to add\n5. Click **Save**`;
  }

  // ── reports ──
  if (q.includes('report') || q.includes('گزارش') || q.includes('راپور') || q.includes('analytic') || q.includes('تحلیل')) {
    if (isDari) return `📊 **صفحه گزارش‌ها شامل:**\n\n• مجموع درآمد و سود\n• فروش روزانه\n• توزیع روش‌های پرداخت\n• سودآوری دسته‌بندی‌ها\n• عملکرد صندوق‌داران\n• ارزش موجودی انبار\n• قابلیت خروجی CSV\n\nبه صفحه **گزارش‌ها** بروید.`;
    if (isPashto) return `📊 **د راپورونو پاڼه لري:**\n\n• ټول عاید او ګټه\n• ورځني پلور\n• د تادیې طریقو ویش\n• د کټګورۍ ګټه\n• د صندوق‌داران فعالیت\n• د ګودام موجودي ارزښت\n• CSV صادرول\n\nد **راپورونو** پاڼې ته لاړ شئ.`;
    return `📊 **Reports page includes:**\n\n• Total revenue & profit\n• Daily sales chart\n• Payment method breakdown\n• Category profitability\n• Cashier performance\n• Inventory valuation\n• CSV export\n\nGo to the **Reports** page.`;
  }

  // ── navigate / where ──
  if (q.includes('where') || q.includes('navigate') || q.includes('go to') || q.includes('کجا') || q.includes('کجاست') || q.includes('چیرته') || q.includes('چرته')) {
    if (isDari) return `🗺️ **راهنمای صفحات:**\n\n• 🏠 **داشبورد** — خلاصه کلی\n• 📦 **محصولات** — مدیریت محصولات\n• 🏷️ **دسته‌بندی‌ها** — گروه‌بندی\n• 🛒 **فروش** — صندوق و تاریخچه\n• ⚠️ **انبارداری** — کنترل موجودی\n• 📊 **گزارش‌ها** — تحلیل و آمار`;
    if (isPashto) return `🗺️ **د پاڼو لارښود:**\n\n• 🏠 **ډشبورډ** — عمومي کتنه\n• 📦 **محصولات** — د محصولاتو مدیریت\n• 🏷️ **کټګورۍ** — ډله‌بندي\n• 🛒 **پلور** — صندوق او تاریخچه\n• ⚠️ **ګودام** — د موجودي کنترول\n• 📊 **راپورونه** — تحلیل او احصائیه`;
    return `🗺️ **App Navigation:**\n\n• 🏠 **Dashboard** — Overview & stats\n• 📦 **Products** — Manage catalog\n• 🏷️ **Categories** — Groupings\n• 🛒 **Sales** — POS & history\n• ⚠️ **Inventory** — Stock control\n• 📊 **Reports** — Analytics`;
  }

  // ── payment methods breakdown ──
  if (q.includes('payment') || q.includes('پرداخت') || q.includes('تادیه') || q.includes('cash') || q.includes('card') || q.includes('نقدی') || q.includes('نقدي')) {
    const methods = ['cash', 'card', 'mobile'];
    const breakdown = methods.map(m => {
      const count = sales.filter(s => s.paymentMethod === m).length;
      const rev = sales.filter(s => s.paymentMethod === m).reduce((a, s) => a + s.grandTotal, 0);
      return `• ${m.charAt(0).toUpperCase() + m.slice(1)}: ${count} txns — ${fmt(rev)}`;
    }).join('\n');
    if (isDari) return `💳 **تجزیه روش‌های پرداخت:**\n\n${breakdown}`;
    if (isPashto) return `💳 **د تادیې طریقو ویش:**\n\n${breakdown}`;
    return `💳 **Payment Methods Breakdown:**\n\n${breakdown}`;
  }

  // ── summary / overview ──
  if (q.includes('summary') || q.includes('overview') || q.includes('خلاصه') || q.includes('لنډیز') || q.includes('کلي کتنه')) {
    const totalStockVal = products.reduce((s, p) => s + p.price * p.stock, 0);
    if (isDari) return `📋 **خلاصه کلی سیستم:**\n\n📦 محصولات: ${products.length}\n🏷️ دسته‌بندی‌ها: ${categories.length}\n🛒 تراکنش‌ها: ${sales.length}\n💰 درآمد کل: ${fmt(totalRevenue)}\n📈 سود ناخالص: ${fmt(totalProfit)}\n⚠️ موجودی کم: ${lowStock.length}\n🏪 ارزش انبار: ${fmt(totalStockVal)}`;
    if (isPashto) return `📋 **د سیستم عمومي لنډیز:**\n\n📦 محصولات: ${products.length}\n🏷️ کټګورۍ: ${categories.length}\n🛒 تراکنشونه: ${sales.length}\n💰 ټول عاید: ${fmt(totalRevenue)}\n📈 ناخالصه ګټه: ${fmt(totalProfit)}\n⚠️ کم موجودي: ${lowStock.length}\n🏪 د ګودام ارزښت: ${fmt(totalStockVal)}`;
    return `📋 **System Overview:**\n\n📦 Products: ${products.length}\n🏷️ Categories: ${categories.length}\n🛒 Transactions: ${sales.length}\n💰 Total Revenue: ${fmt(totalRevenue)}\n📈 Gross Profit: ${fmt(totalProfit)}\n⚠️ Low Stock Items: ${lowStock.length}\n🏪 Inventory Value: ${fmt(totalStockVal)}`;
  }

  // ── thank you ──
  if (q.includes('thanks') || q.includes('thank you') || q.includes('ممنون') || q.includes('مننه') || q.includes('سپاس')) {
    if (isDari) return `خواهش می‌کنم! 😊 خوشحالم که توانستم کمک کنم. اگر سوال دیگری دارید، همینجا هستم.`;
    if (isPashto) return `خوش راغلاست! 😊 خوشحاله یم چې مرسته وکولای شوم. که نورې پوښتنې لرئ، دلته یم.`;
    return `You're welcome! 😊 Happy to help. Feel free to ask me anything else!`;
  }

  // ── default fallback ──
  if (isDari) return `🤔 متأسفم، پاسخ دقیقی برای این سوال ندارم.\n\nمی‌توانید بپرسید:\n• موجودی کم\n• درآمد و سود\n• پرفروش‌ترین محصول\n• نحوه افزودن محصول\n• خلاصه کلی\n• تاریخ انقضا`;
  if (isPashto) return `🤔 بخښنه وغواړئ، د دې پوښتنې لپاره سم ځواب نه لرم.\n\nتاسو کولی شئ وپوښتئ:\n• کم موجودي\n• عاید او ګټه\n• ډیر خرڅ شوی محصول\n• د محصول زیاتولو طریقه\n• عمومي لنډیز\n• د ختمیدو نیټه`;
  return `🤔 I'm not sure about that. Try asking me about:\n• Low stock items\n• Revenue & profit\n• Top selling products\n• How to add a product\n• System overview\n• Expiring products`;
}

// ─── Suggested questions per language ─────────────────────────────────────
const suggestions: Record<string, SuggestedQuestion[]> = {
  en: [
    { label: '📦 Low stock?', query: 'Which products have low stock?' },
    { label: '💰 Revenue?', query: 'What is the total revenue?' },
    { label: '🏆 Top product?', query: 'What is the best selling product?' },
    { label: '📋 Overview', query: 'Give me a system summary' },
    { label: '⏰ Expiring?', query: 'Which products are expiring soon?' },
    { label: '💳 Payments?', query: 'Show payment method breakdown' },
  ],
  dr: [
    { label: '📦 موجودی کم؟', query: 'کدام محصولات موجودی کم دارند؟' },
    { label: '💰 درآمد؟', query: 'مجموع درآمد چقدر است؟' },
    { label: '🏆 پرفروش؟', query: 'پرفروش‌ترین محصول کدام است؟' },
    { label: '📋 خلاصه', query: 'خلاصه کلی سیستم را بده' },
    { label: '⏰ انقضا؟', query: 'محصولات نزدیک به انقضا کدامند؟' },
    { label: '💳 پرداخت؟', query: 'روش‌های پرداخت را نشان بده' },
  ],
  ps: [
    { label: '📦 کم موجودي؟', query: 'کوم محصولات کم موجودي لري؟' },
    { label: '💰 عاید؟', query: 'ټول عاید څومره دی؟' },
    { label: '🏆 ډیر خرڅ؟', query: 'ډیر خرڅ شوی محصول کوم دی؟' },
    { label: '📋 لنډیز', query: 'د سیستم عمومي لنډیز راکړه' },
    { label: '⏰ ختمیدل؟', query: 'د ختمیدو سره نږدې محصولات کوم دي؟' },
    { label: '💳 تادیه؟', query: 'د تادیې طریقو ویش راښایه' },
  ],
};

// ─── Component ────────────────────────────────────────────────────────────
export default function AIAssistant({ products, categories, sales }: AIAssistantProps) {
  const { language, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aiName = language === 'dr' ? 'دستیار هوشمند' : language === 'ps' ? 'هوشمند مرستیال' : 'AI Assistant';
  const placeholder = language === 'dr' ? 'سوال خود را بنویسید...' : language === 'ps' ? 'خپله پوښتنه ولیکئ...' : 'Ask me anything about your store...';
  const welcomeMsg = language === 'dr'
    ? `سلام! 👋 من **${aiName}** فرش‌مارت هستم.\n\nمی‌توانم در مورد موجودی، فروش، گزارش‌ها و راهنمایی استفاده از سیستم کمک کنم. چه سوالی دارید؟`
    : language === 'ps'
    ? `سلام! 👋 زه د فرېشمارټ **${aiName}** یم.\n\nزه کولی شم د موجودي، پلور، راپورونو او د سیستم کارولو لارښود کې مرسته وکړم. کومه پوښتنه لرئ؟`
    : `Hello! 👋 I'm the **FreshMart ${aiName}**.\n\nI can help with inventory alerts, sales insights, product management tips, and guide you through the app. What would you like to know?`;

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        text: welcomeMsg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setHasUnread(false);
    }
  }, [isOpen, isMinimized]);

  const sendMessage = useCallback(async (text?: string) => {
    const query = (text ?? input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const delay = 700 + Math.random() * 600;
    await new Promise(r => setTimeout(r, delay));

    const answer = generateAnswer(query, products, categories, sales, language);

    const botMsg: Message = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      text: answer,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setIsTyping(false);
    setMessages(prev => [...prev, botMsg]);

    if (isMinimized || !isOpen) setHasUnread(true);
  }, [input, products, categories, sales, language, isMinimized, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome-reset',
      role: 'assistant',
      text: welcomeMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  };

  const currentSuggestions = suggestions[language] ?? suggestions.en;

  // ── Render message text with basic markdown ──
  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.+?)\*\*/g);
      return (
        <p key={i} className={line === '' ? 'h-2' : 'leading-relaxed'}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
          )}
        </p>
      );
    });
  };

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => { setIsOpen(true); setIsMinimized(false); setHasUnread(false); }}
        className={`fixed bottom-6 ${isRTL ? 'left-6' : 'right-6'} z-50 w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 ${isOpen && !isMinimized ? 'scale-0 pointer-events-none' : 'scale-100'}`}
        title={aiName}
      >
        <Sparkles size={24} />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 ${isRTL ? 'left-6' : 'right-6'} z-50 transition-all duration-300 ${
            isMinimized ? 'w-64 h-14' : 'w-[360px] sm:w-[400px] h-[580px]'
          } flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-gray-100`}
          style={{ maxHeight: 'calc(100vh - 100px)' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex-shrink-0">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">{aiName}</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
                <span className="text-xs text-white/80">
                  {language === 'dr' ? 'آنلاین' : language === 'ps' ? 'آنلاین' : 'Online'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={clearChat} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" title="Clear chat">
                <RotateCcw size={15} className="text-white/80" />
              </button>
              <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                {isMinimized ? <Maximize2 size={15} className="text-white/80" /> : <Minimize2 size={15} className="text-white/80" />}
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                <X size={15} className="text-white/80" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? (isRTL ? 'flex-row' : 'flex-row-reverse') : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mt-0.5 ${
                      msg.role === 'assistant' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-gray-400 to-gray-500'
                    }`}>
                      {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
                    </div>

                    {/* Bubble */}
                    <div className={`max-w-[80%] ${msg.role === 'user' ? (isRTL ? 'items-start' : 'items-end') : 'items-start'} flex flex-col`}>
                      <div className={`px-4 py-3 rounded-2xl text-sm ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-tr-sm'
                          : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm'
                      }`}>
                        <div className="space-y-0.5">{renderText(msg.text)}</div>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mt-0.5">
                      <Bot size={14} className="text-white" />
                    </div>
                    <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100">
                      <div className="flex gap-1.5 items-center h-4">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              {messages.length <= 1 && (
                <div className="bg-white border-t border-gray-100 px-3 py-2 flex gap-1.5 overflow-x-auto">
                  {currentSuggestions.map(s => (
                    <button
                      key={s.query}
                      onClick={() => sendMessage(s.query)}
                      className="flex-shrink-0 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium rounded-xl border border-emerald-100 transition-colors whitespace-nowrap"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="bg-white border-t border-gray-100 p-3 flex-shrink-0">
                <div className={`flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-200 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    className={`flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim()}
                    className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-600 disabled:from-gray-200 disabled:to-gray-200 text-white rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed"
                  >
                    <Send size={14} className={`${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                <p className="text-center text-[10px] text-gray-400 mt-2">
                  {language === 'dr' ? 'دستیار هوشمند فرش‌مارت' : language === 'ps' ? 'د فرېشمارټ هوشمند مرستیال' : 'FreshMart AI Assistant'}
                </p>
              </div>
            </>
          )}

          {/* Minimized unread badge */}
          {isMinimized && hasUnread && (
            <span className="absolute top-2 left-2 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </div>
      )}
    </>
  );
}
