import { api } from './api';

export const wishlistApi = {
  /**
   * Fetch current user's wishlist
   */
  getWishlist: async () => {
    try {
      const res = await api.get('/wishlist');
      return res;
    } catch (error) {
      console.warn('[wishlistApi Mobile Axios] Fetch failed:', error.message);
      return {
        success: false,
        message: 'Network error: Unable to fetch wishlist',
        data: { wishlist: [], count: 0 },
      };
    }
  },

  /**
   * Add product to wishlist
   */
  addToWishlist: async (productId) => {
    try {
      const res = await api.post('/wishlist', { productId });
      return res;
    } catch (error) {
      console.warn('[wishlistApi Mobile Axios] Add failed:', error.message);
      return {
        success: false,
        message: 'Network error: Unable to add to wishlist',
      };
    }
  },

  /**
   * Toggle product in wishlist
   */
  toggleWishlist: async (productId) => {
    try {
      const res = await api.post('/wishlist/toggle', { productId });
      return res;
    } catch (error) {
      console.warn('[wishlistApi Mobile Axios] Toggle failed:', error.message);
      return {
        success: false,
        message: 'Network error: Unable to toggle wishlist',
      };
    }
  },

  /**
   * Remove product from wishlist
   */
  removeFromWishlist: async (productId) => {
    try {
      const res = await api.delete(`/wishlist/${productId}`);
      return res;
    } catch (error) {
      console.warn('[wishlistApi Mobile Axios] Remove failed:', error.message);
      return {
        success: false,
        message: 'Network error: Unable to remove from wishlist',
      };
    }
  },

  /**
   * Clear entire wishlist
   */
  clearWishlist: async () => {
    try {
      const res = await api.delete('/wishlist');
      return res;
    } catch (error) {
      console.warn('[wishlistApi Mobile Axios] Clear failed:', error.message);
      return {
        success: false,
        message: 'Network error: Unable to clear wishlist',
      };
    }
  },

  /**
   * Fast boolean status check
   */
  checkWishlistStatus: async (productId) => {
    try {
      const res = await api.get(`/wishlist/check/${productId}`);
      return res;
    } catch (error) {
      return {
        success: false,
        data: { productId, isInWishlist: false },
      };
    }
  },
};

export default wishlistApi;
