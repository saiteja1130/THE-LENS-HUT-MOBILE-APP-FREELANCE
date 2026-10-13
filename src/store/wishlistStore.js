import { create } from 'zustand';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { wishlistApi } from '../services/wishlistApi';
import { normalizeMobileProduct } from '../services/productApi';

export const useWishlistStore = create((set, get) => ({
  items: [],
  isLoading: true,

  initWishlist: async () => {
    try {
      // 1. Instant local restore
      const savedItems = await storage.get(STORAGE_KEYS.WISHLIST);
      if (Array.isArray(savedItems)) {
        set({ items: savedItems, isLoading: false });
      } else {
        set({ items: [], isLoading: false });
      }

      // 2. Background sync from server if authenticated
      const token = await storage.get(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        const res = await wishlistApi.getWishlist();
        if (res.success && Array.isArray(res.data?.wishlist)) {
          const normalized = res.data.wishlist.map(normalizeMobileProduct);
          set({ items: normalized });
          await storage.set(STORAGE_KEYS.WISHLIST, normalized);
        }
      }
    } catch (e) {
      console.error('Failed to load wishlist:', e);
      set({ items: [], isLoading: false });
    }
  },

  isInWishlist: (productId) => {
    if (!productId) return false;
    const target = productId.toString();
    const { items } = get();
    return items.some((item) => (item.id || item._id)?.toString() === target);
  },

  toggleWishlist: async (product) => {
    if (!product) return false;
    const { items } = get();
    const id = product.id || product._id;
    if (!id) return false;

    const exists = items.some((item) => (item.id || item._id) === id);

    let updatedItems;
    if (exists) {
      updatedItems = items.filter((item) => (item.id || item._id) !== id);
    } else {
      const normalized = normalizeMobileProduct(product);
      updatedItems = [normalized, ...items];
    }

    // Instant optimistic update
    set({ items: updatedItems });
    await storage.set(STORAGE_KEYS.WISHLIST, updatedItems);

    // Call server API if logged in
    const token = await storage.get(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      try {
        await wishlistApi.toggleWishlist(id);
      } catch (err) {
        console.warn('[wishlistStore] Server toggle sync failed:', err);
      }
    }

    return !exists;
  },

  removeFromWishlist: async (productId) => {
    if (!productId) return;
    const { items } = get();
    const updatedItems = items.filter((item) => (item.id || item._id) !== productId);

    set({ items: updatedItems });
    await storage.set(STORAGE_KEYS.WISHLIST, updatedItems);

    const token = await storage.get(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      try {
        await wishlistApi.removeFromWishlist(productId);
      } catch (err) {
        console.warn('[wishlistStore] Server remove sync failed:', err);
      }
    }
  },

  clearWishlist: async () => {
    set({ items: [] });
    await storage.remove(STORAGE_KEYS.WISHLIST);

    const token = await storage.get(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      try {
        await wishlistApi.clearWishlist();
      } catch (err) {
        console.warn('[wishlistStore] Server clear sync failed:', err);
      }
    }
  },

  syncWithServer: async () => {
    try {
      const token = await storage.get(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) return;
      const res = await wishlistApi.getWishlist();
      if (res.success && Array.isArray(res.data?.wishlist)) {
        const normalized = res.data.wishlist.map(normalizeMobileProduct);
        set({ items: normalized });
        await storage.set(STORAGE_KEYS.WISHLIST, normalized);
      }
    } catch (e) {
      console.warn('[wishlistStore] Server sync failed:', e);
    }
  },
}));

export default useWishlistStore;
