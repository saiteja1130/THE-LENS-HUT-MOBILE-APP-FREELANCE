import { create } from 'zustand';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { generateConfigurationHash } from '../utils/opticalEngine/hasher';
import { calculateItemPrice } from '../utils/opticalEngine/pricing';

export const useCartStore = create((set, get) => ({
  items: [],
  coupon: null,
  discount: 0,
  isLoading: true,

  initCart: async () => {
    try {
      const savedItems = await storage.get(STORAGE_KEYS.CART);
      if (Array.isArray(savedItems)) {
        set({ items: savedItems, isLoading: false });
      } else {
        set({ items: [], isLoading: false });
      }
    } catch (e) {
      console.error('Failed to load cart:', e);
      set({ items: [], isLoading: false });
    }
  },

  addItem: async (product, options = {}) => {
    const { items } = get();
    const pid = product.id || product._id;
    const pType =
      product.productType ||
      (product.category === 'Contact Lenses' || product.category === 'contact-lenses'
        ? 'contact-lens'
        : product.category === 'Sunglasses'
        ? 'sunglasses'
        : 'eyeglasses');

    // Build normalized configuration
    const config = options.configuration || {
      productId: pid,
      productType: pType,
      variantId: options.variantId || 'default',
      variantName: options.frameColor || 'Default',
      lensSelection: options.lensType ? {
        lensType: options.lensType.toLowerCase().includes('zero') ? 'frame-only' : 'single-vision',
        lensName: options.lensType,
        lensPrice: options.lensPrice || 0
      } : undefined,
      prescription: options.prescription ? {
        method: 'manual',
        od: options.prescription.od,
        os: options.prescription.os,
        pd: options.prescription.pd
      } : { method: 'none' },
      contactLens: options.contactLens,
      sunglass: options.sunglass
    };

    // Calculate deterministic hash
    const itemKey = generateConfigurationHash(pid, config);
    const existingIndex = items.findIndex((i) => i.key === itemKey);

    // Calculate price
    const pricing = calculateItemPrice(product, config, options.quantity || 1);
    const unitPrice = pricing.unitPrice;

    let updatedItems;
    if (existingIndex > -1) {
      updatedItems = [...items];
      const newQty = updatedItems[existingIndex].quantity + (options.quantity || 1);
      updatedItems[existingIndex].quantity = newQty;
      updatedItems[existingIndex].totalPrice = unitPrice * newQty;
    } else {
      const newItem = {
        key: itemKey,
        configurationHash: itemKey,
        id: pid,
        productType: pType,
        name: product.name,
        price: unitPrice,
        originalPrice: product.originalPrice || product.mrp,
        image: product.image || (product.images && product.images[0]) || '',
        frameColor: options.frameColor || config.variantName || 'Default',
        lensType: options.lensType || config.lensSelection?.lensName || 'Standard',
        lensPrice: options.lensPrice || config.lensSelection?.lensPrice || 0,
        prescription: options.prescription || config.prescription,
        configuration: config,
        quantity: options.quantity || 1,
        unitPrice,
        totalPrice: unitPrice * (options.quantity || 1)
      };
      updatedItems = [newItem, ...items];
    }

    set({ items: updatedItems });
    await storage.set(STORAGE_KEYS.CART, updatedItems);
  },

  removeItem: async (key) => {
    const { items } = get();
    const updatedItems = items.filter((i) => i.key !== key);
    set({ items: updatedItems });
    await storage.set(STORAGE_KEYS.CART, updatedItems);
  },

  updateQuantity: async (key, quantity) => {
    const { items } = get();
    if (quantity <= 0) {
      return get().removeItem(key);
    }
    const updatedItems = items.map((item) =>
      item.key === key ? { ...item, quantity, totalPrice: (item.unitPrice || item.price) * quantity } : item
    );
    set({ items: updatedItems });
    await storage.set(STORAGE_KEYS.CART, updatedItems);
  },

  clearCart: async () => {
    set({ items: [], coupon: null, discount: 0 });
    await storage.remove(STORAGE_KEYS.CART);
  },

  applyCoupon: (coupon) => {
    const subtotal = get().getSubtotal();
    let discountAmount = 0;
    if (coupon.discountPercent) {
      discountAmount = (subtotal * coupon.discountPercent) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.flatDiscount) {
      discountAmount = coupon.flatDiscount;
    }
    set({ coupon, discount: Math.min(discountAmount, subtotal) });
  },

  removeCoupon: () => {
    set({ coupon: null, discount: 0 });
  },

  getSubtotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + ((item.unitPrice || item.price) * item.quantity), 0);
  },

  getDeliveryFee: () => {
    const subtotal = get().getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal >= 999 ? 0 : 99;
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const delivery = get().getDeliveryFee();
    const discount = get().discount;
    return Math.max(0, subtotal + delivery - discount);
  },

  getItemCount: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }
}));

export default useCartStore;
