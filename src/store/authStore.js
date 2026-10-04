import { create } from 'zustand';
import { storage, STORAGE_KEYS } from '../utils/storage';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  initAuth: async () => {
    try {
      const token = await storage.get(STORAGE_KEYS.AUTH_TOKEN);
      const user = await storage.get(STORAGE_KEYS.USER);
      if (token && user) {
        set({ user, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } catch (e) {
      console.error('Failed to restore auth session:', e);
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (userData, token) => {
    try {
      await storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
      await storage.set(STORAGE_KEYS.USER, userData);
      set({ user: userData, token, isAuthenticated: true });
      return true;
    } catch (e) {
      console.error('Login error:', e);
      return false;
    }
  },

  logout: async () => {
    try {
      await storage.remove(STORAGE_KEYS.AUTH_TOKEN);
      await storage.remove(STORAGE_KEYS.USER);
      set({ user: null, token: null, isAuthenticated: false });
      return true;
    } catch (e) {
      console.error('Logout error:', e);
      return false;
    }
  },

  updateProfile: async (updates) => {
    try {
      const currentUser = get().user || {};
      const updatedUser = { ...currentUser, ...updates };
      await storage.set(STORAGE_KEYS.USER, updatedUser);
      set({ user: updatedUser });
      return true;
    } catch (e) {
      console.error('Update profile error:', e);
      return false;
    }
  },

  deleteAccount: async () => {
    try {
      await storage.remove(STORAGE_KEYS.AUTH_TOKEN);
      await storage.remove(STORAGE_KEYS.USER);
      await storage.remove(STORAGE_KEYS.CART);
      await storage.remove(STORAGE_KEYS.WISHLIST);
      set({ user: null, token: null, isAuthenticated: false });
      return true;
    } catch (e) {
      console.error('Delete account error:', e);
      return false;
    }
  },
}));

export default useAuthStore;
