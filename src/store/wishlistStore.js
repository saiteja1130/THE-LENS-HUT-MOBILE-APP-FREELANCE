import { create } from 'zustand';
import { storage, STORAGE_KEYS } from '../utils/storage';

export const useWishlistStore = create((set, get) => ({
  items: [],
  isLoading: true,

  initWishlist: async () => {
    try {
      const savedItems = await storage.get(STORAGE_KEYS.WISHLIST);
      if (Array.isArray(savedItems)) {
        set({ items: savedItems, isLoading: false });
      } else {
        set({ items: [], isLoading: false });
      }
    } catch (e) {
      console.error('Failed to load wishlist:', e);
      set({ items: [], isLoading: false });
    }
  },

  isInWishlist: (productId) => {
    const { items } = get();
    return items.some((item) => (item.id || item._id) === productId);
  },

  toggleWishlist: async (product) => {
    const { items } = get();
    const id = product.id || product._id;
    const exists = items.some((item) => (item.id || item._id) === id);

    let updatedItems;
    if (exists) {
      updatedItems = items.filter((item) => (item.id || item._id) !== id);
    } else {
      updatedItems = [product, ...items];
    }

    set({ items: updatedItems });
    await storage.set(STORAGE_KEYS.WISHLIST, updatedItems);
    return !exists;
  },

  clearWishlist: async () => {
    set({ items: [] });
    await storage.remove(STORAGE_KEYS.WISHLIST);
  },
}));

export default useWishlistStore;
