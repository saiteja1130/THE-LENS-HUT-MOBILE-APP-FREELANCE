import { api } from './api';

export const orderApi = {
  /**
   * Place an order with the backend API
   */
  createOrder: async (orderData) => {
    try {
      const res = await api.post('/orders', orderData);
      return res;
    } catch (error) {
      console.warn('[orderApi Mobile] Create order failed:', error.message);
      return {
        success: false,
        message: 'Network error: Unable to create order',
      };
    }
  },

  /**
   * Fetch authenticated user's order history
   */
  getMyOrders: async () => {
    try {
      const res = await api.get('/orders/my-orders');
      return res;
    } catch (error) {
      console.warn('[orderApi Mobile] Fetch my orders failed:', error.message);
      return {
        success: false,
        message: 'Network error: Unable to retrieve order history',
        data: [],
      };
    }
  },

  /**
   * Fetch specific order details by ID or Order Number
   * @param {string} idOrOrderNumber
   * @param {Object|string} options Verification options (email, phone) or tracking mode
   */
  getOrderById: async (idOrOrderNumber, options = {}) => {
    try {
      const params = [];
      if (typeof options === 'string') {
        if (options.includes('@')) {
          params.push(`email=${encodeURIComponent(options)}`);
        } else {
          params.push(`phone=${encodeURIComponent(options)}`);
        }
      } else if (options && typeof options === 'object') {
        if (options.email) params.push(`email=${encodeURIComponent(options.email)}`);
        if (options.phone) params.push(`phone=${encodeURIComponent(options.phone)}`);
        if (options.mode) params.push(`mode=${encodeURIComponent(options.mode)}`);
        if (options.trackingOnly) params.push('trackingOnly=true');
      }

      const queryString = params.length > 0 ? `?${params.join('&')}` : '';
      const res = await api.get(`/orders/${encodeURIComponent(idOrOrderNumber)}${queryString}`);
      return res;
    } catch (error) {
      console.warn('[orderApi Mobile] Fetch order by id failed:', error.message);
      return {
        success: false,
        message: 'Network error: Unable to retrieve order details',
      };
    }
  },
};

export default orderApi;
