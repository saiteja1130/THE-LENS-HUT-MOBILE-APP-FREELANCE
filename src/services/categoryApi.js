import { Platform } from 'react-native';

const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:5000/api/v1',
  ios: 'http://localhost:5000/api/v1',
  default: 'http://localhost:5000/api/v1',
});

export const categoryApi = {
  /**
   * Fetch active categories for mobile home and catalog
   */
  getActiveCategories: async (featuredOnly = false) => {
    try {
      const url = `${BASE_URL}/categories${featuredOnly ? '?featured=true' : ''}`;
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        return { success: false, data: [] };
      }

      const data = await response.json();
      return {
        success: true,
        data: Array.isArray(data.data) ? data.data : [],
      };
    } catch (error) {
      console.warn('[CategoryApi Mobile] Fetch failed, falling back to mock categories:', error.message);
      return { success: false, data: [] };
    }
  },
};

export default categoryApi;
