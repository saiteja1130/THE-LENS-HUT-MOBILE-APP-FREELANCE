import { api } from './api';

export const categoryApi = {
  /**
   * Fetch active categories for mobile home and catalog
   */
  getActiveCategories: async (featuredOnly = false) => {
    try {
      const url = `/categories${featuredOnly ? '?featured=true' : ''}`;
      const res = await api.get(url);
      return {
        success: Boolean(res?.success),
        data: Array.isArray(res?.data) ? res.data : [],
      };
    } catch (error) {
      console.warn('[CategoryApi Mobile Axios] Fetch failed, falling back to mock categories:', error.message);
      return { success: false, data: [] };
    }
  },
};

export default categoryApi;
