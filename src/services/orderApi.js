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
   */
  getOrderById: async (idOrOrderNumber) => {
    try {
      const res = await api.get(`/orders/${encodeURIComponent(idOrOrderNumber)}`);
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
