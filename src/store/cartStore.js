import { create } from 'zustand';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { generateConfigurationHash } from '../utils/opticalEngine/hasher';
import { calculateItemPrice } from '../utils/opticalEngine/pricing';
import { cartApi } from '../services/cartApi';

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

  /**
   * Sync shopping bag with backend for authenticated user
   */
  syncWithServer: async () => {
    try {
      const token = await storage.get(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) return;

      const { items } = get();

      if (items.length > 0) {
        // Sync guest items with account cart on server
        const guestPayload = items.map((item) => ({
          productId: item.id || item.productId,
          variantId: item.variantId || 'default',
          variantName: item.variantName || item.frameColor || 'Default',
          selectedColor: item.frameColor || item.selectedColor || 'Standard',
          selectedSize: item.size || 'Standard',
          image: item.image,
          quantity: item.quantity,
          unitPrice: item.unitPrice || item.price,
          configuration: item.configuration,
        }));

        const res = await cartApi.syncCart(guestPayload);
        if (res.success && res.data?.items) {
          const syncedItems = res.data.items.map((srvItem) => ({
            key: srvItem.configurationHash,
            configurationHash: srvItem.configurationHash,
            id: srvItem.productId || srvItem.product?._id,
            productId: srvItem.productId || srvItem.product?._id,
            productType: srvItem.configuration?.productType || srvItem.product?.category || 'eyeglasses',
            name: srvItem.product?.name || 'Eyewear Frame',
            price: srvItem.unitPrice,
            unitPrice: srvItem.unitPrice,
            totalPrice: srvItem.totalPrice,
            originalPrice: srvItem.product?.mrp || srvItem.unitPrice,
            image: srvItem.image || srvItem.product?.primaryImage || '',
            frameColor: srvItem.selectedColor || srvItem.variantName || 'Standard',
            variantId: srvItem.variantId,
            variantName: srvItem.variantName,
            selectedColor: srvItem.selectedColor,
            lensType: srvItem.configuration?.lensSelection?.lensName || 'Standard',
            lensPrice: srvItem.configuration?.lensSelection?.lensPrice || 0,
            prescription: srvItem.configuration?.prescription,
            configuration: srvItem.configuration,
            quantity: srvItem.quantity,
          }));
          set({ items: syncedItems });
          await storage.set(STORAGE_KEYS.CART, syncedItems);
        }
      } else {
        // Fetch cart from backend
        const res = await cartApi.getCart();
        if (res.success && res.data?.items && res.data.items.length > 0) {
          const syncedItems = res.data.items.map((srvItem) => ({
            key: srvItem.configurationHash,
            configurationHash: srvItem.configurationHash,
            id: srvItem.productId || srvItem.product?._id,
            productId: srvItem.productId || srvItem.product?._id,
            productType: srvItem.configuration?.productType || srvItem.product?.category || 'eyeglasses',
            name: srvItem.product?.name || 'Eyewear Frame',
            price: srvItem.unitPrice,
            unitPrice: srvItem.unitPrice,
            totalPrice: srvItem.totalPrice,
            originalPrice: srvItem.product?.mrp || srvItem.unitPrice,
            image: srvItem.image || srvItem.product?.primaryImage || '',
            frameColor: srvItem.selectedColor || srvItem.variantName || 'Standard',
            variantId: srvItem.variantId,
            variantName: srvItem.variantName,
            selectedColor: srvItem.selectedColor,
            lensType: srvItem.configuration?.lensSelection?.lensName || 'Standard',
            lensPrice: srvItem.configuration?.lensSelection?.lensPrice || 0,
            prescription: srvItem.configuration?.prescription,
            configuration: srvItem.configuration,
            quantity: srvItem.quantity,
          }));
          set({ items: syncedItems });
          await storage.set(STORAGE_KEYS.CART, syncedItems);
        }
      }
    } catch (e) {
      console.warn('[cartStore] Server sync warning:', e);
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

    // Resolve color and variant
    const frameColor =
      options.frameColor ||
      options.color ||
      options.configuration?.variantName ||
      options.configuration?.color ||
      product.colors?.[0]?.name ||
      product.frameColor ||
      'Standard';

    const variantId =
      options.variantId ||
      options.configuration?.variantId ||
      (frameColor ? `var-${frameColor.toLowerCase().replace(/\s+/g, '-')}` : 'default');

    // Resolve variant image
    const variantImage =
      options.image ||
      product.variants?.find(
        (v) =>
          v.id === variantId ||
          v.color?.toLowerCase() === frameColor.toLowerCase() ||
          v.name?.toLowerCase() === frameColor.toLowerCase()
      )?.image ||
      product.colors?.find((c) => c.name?.toLowerCase() === frameColor.toLowerCase())?.image ||
      product.image ||
      (Array.isArray(product.images) ? product.images[0] : (product.images?.front || '')) ||
      '';

    // Build normalized configuration
    const config = options.configuration
      ? {
          ...options.configuration,
          variantId,
          variantName: frameColor,
          color: frameColor,
        }
      : {
          productId: pid,
          productType: pType,
          variantId,
          variantName: frameColor,
          color: frameColor,
          lensSelection: options.lensType
            ? {
                lensType: options.lensType.toLowerCase().includes('zero') ? 'frame-only' : 'single-vision',
                lensName: options.lensType,
                lensPrice: options.lensPrice || 0,
              }
            : undefined,
          prescription: options.prescription
            ? {
                method: 'manual',
                od: options.prescription.od,
                os: options.prescription.os,
                pd: options.prescription.pd,
              }
            : { method: 'none' },
          contactLens: options.contactLens,
          sunglass: options.sunglass,
        };

    // Calculate deterministic hash
    const itemKey = generateConfigurationHash(pid, config);
    const existingIndex = items.findIndex((i) => i.key === itemKey || i.configurationHash === itemKey);

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
        productId: pid,
        productType: pType,
        name: product.name,
        price: unitPrice,
        originalPrice: product.originalPrice || product.mrp,
        image: variantImage,
        frameColor,
        variantId,
        variantName: frameColor,
        selectedColor: frameColor,
        lensType: options.lensType || config.lensSelection?.lensName || 'Standard',
        lensPrice: options.lensPrice || config.lensSelection?.lensPrice || 0,
        prescription: options.prescription || config.prescription,
        configuration: config,
        quantity: options.quantity || 1,
        unitPrice,
        totalPrice: unitPrice * (options.quantity || 1),
      };
      updatedItems = [newItem, ...items];
    }

    set({ items: updatedItems });
    await storage.set(STORAGE_KEYS.CART, updatedItems);

    // Async sync with server if user is logged in
    const token = await storage.get(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      cartApi.addToCart({
        productId: pid,
        configuration: config,
        quantity: options.quantity || 1,
        variantId,
        variantName: frameColor,
        selectedColor: frameColor,
        selectedSize: options.size || 'Standard',
        image: variantImage,
        unitPrice,
      }).catch((err) => {
        console.warn('[cartStore] Add to cart server warning:', err);
      });
    }
  },

  removeItem: async (key) => {
    const { items } = get();
    const updatedItems = items.filter((i) => i.key !== key && i.configurationHash !== key);
    set({ items: updatedItems });
    await storage.set(STORAGE_KEYS.CART, updatedItems);

    const token = await storage.get(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      cartApi.removeItem(key).catch((err) => {
        console.warn('[cartStore] Remove item server warning:', err);
      });
    }
  },

  updateQuantity: async (key, quantity) => {
    const { items } = get();
    if (quantity <= 0) {
      return get().removeItem(key);
    }
    const updatedItems = items.map((item) =>
      item.key === key || item.configurationHash === key
        ? { ...item, quantity, totalPrice: (item.unitPrice || item.price) * quantity }
        : item
    );
    set({ items: updatedItems });
    await storage.set(STORAGE_KEYS.CART, updatedItems);

    const token = await storage.get(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      cartApi.updateQuantity(key, quantity).catch((err) => {
        console.warn('[cartStore] Update quantity server warning:', err);
      });
    }
  },

  clearCart: async () => {
    set({ items: [], coupon: null, discount: 0 });
    await storage.remove(STORAGE_KEYS.CART);

    const token = await storage.get(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      cartApi.clearCart().catch((err) => {
        console.warn('[cartStore] Clear cart server warning:', err);
      });
    }
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
  },
}));

export default useCartStore;
