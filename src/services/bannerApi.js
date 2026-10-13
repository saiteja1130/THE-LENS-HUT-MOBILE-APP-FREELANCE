import { api } from './api';

export const bannerApi = {
  /**
   * Fetch active hero banners for mobile home screen
   */
  getActiveBanners: async (position = 'hero') => {
    try {
      const res = await api.get(`/banners?position=${position}`);
      return {
        success: Boolean(res?.success),
        data: Array.isArray(res?.data) ? res.data : [],
      };
    } catch (error) {
      console.warn('[BannerApi Mobile Axios] Fetch failed, falling back to local mock data:', error.message);
      return { success: false, data: [] };
    }
  },
};

export default bannerApi;
