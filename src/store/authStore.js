import { create } from 'zustand';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { authApi } from '../services/authApi';
import useWishlistStore from './wishlistStore';
import useCartStore from './cartStore';

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

  // Direct login state setter
  login: async (userData, token) => {
    try {
      await storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
      await storage.set(STORAGE_KEYS.USER, userData);
      set({ user: userData, token, isAuthenticated: true });
      useWishlistStore.getState().syncWithServer().catch(() => {});
      useCartStore.getState().syncWithServer().catch(() => {});
      return true;
    } catch (e) {
      console.error('Login error:', e);
      return false;
    }
  },

  // Password Login via Backend API
  loginWithPassword: async (email, password) => {
    const res = await authApi.loginWithPassword({ email, password });
    if (res.success && res.data) {
      const { token, user } = res.data;
      await storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
      await storage.set(STORAGE_KEYS.USER, user);
      set({ user, token, isAuthenticated: true });
      useWishlistStore.getState().syncWithServer().catch(() => {});
      useCartStore.getState().syncWithServer().catch(() => {});
      return { success: true, user };
    }
    return res;
  },

  // Request Login OTP
  requestLoginOTP: async (email) => {
    return await authApi.requestLoginOTP({ email });
  },

  // Verify Login OTP
  verifyLoginOTP: async (email, otp) => {
    const res = await authApi.verifyLoginOTP({ email, otp });
    if (res.success && res.data) {
      const { token, user } = res.data;
      await storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
      await storage.set(STORAGE_KEYS.USER, user);
      set({ user, token, isAuthenticated: true });
      useWishlistStore.getState().syncWithServer().catch(() => {});
      useCartStore.getState().syncWithServer().catch(() => {});
      return { success: true, user };
    }
    return res;
  },

  // Signup
  signup: async (data) => {
    return await authApi.signup(data);
  },

  // Verify Email OTP
  verifyEmail: async (email, otp) => {
    const res = await authApi.verifyEmail({ email, otp });
    if (res.success && res.data) {
      const { token, user } = res.data;
      await storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
      await storage.set(STORAGE_KEYS.USER, user);
      set({ user, token, isAuthenticated: true });
      return { success: true, user };
    }
    return res;
  },

  // Resend Email Verification OTP
  resendVerification: async (email) => {
    return await authApi.resendVerificationOTP({ email });
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
