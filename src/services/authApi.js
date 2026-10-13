import { api } from './api';

export const authApi = {
  /**
   * Register user
   */
  signup: async ({ fullName, email, phone, password, confirmPassword }) => {
    try {
      return await api.post('/auth/signup', {
        fullName,
        email,
        phone,
        password,
        confirmPassword,
      });
    } catch (error) {
      return {
        success: false,
        message: 'Unable to connect to server. Ensure backend is running.',
        errorCode: 'NETWORK_ERROR',
        errors: {},
      };
    }
  },

  /**
   * Verify Email OTP
   */
  verifyEmail: async ({ email, otp }) => {
    try {
      return await api.post('/auth/verify-email', { email, otp });
    } catch (error) {
      return {
        success: false,
        message: 'Unable to connect to server.',
        errorCode: 'NETWORK_ERROR',
        errors: {},
      };
    }
  },

  /**
   * Resend Verification OTP
   */
  resendVerificationOTP: async ({ email }) => {
    try {
      return await api.post('/auth/resend-verification', { email });
    } catch (error) {
      return {
        success: false,
        message: 'Unable to connect to server.',
        errorCode: 'NETWORK_ERROR',
        errors: {},
      };
    }
  },

  /**
   * Password Login
   */
  loginWithPassword: async ({ email, password }) => {
    try {
      return await api.post('/auth/login', { email, password });
    } catch (error) {
      return {
        success: false,
        message: 'Unable to connect to server.',
        errorCode: 'NETWORK_ERROR',
        errors: {},
      };
    }
  },

  /**
   * Request Login OTP (Passwordless)
   */
  requestLoginOTP: async ({ email }) => {
    try {
      return await api.post('/auth/request-otp', { email });
    } catch (error) {
      return {
        success: false,
        message: 'Unable to connect to server.',
        errorCode: 'NETWORK_ERROR',
        errors: {},
      };
    }
  },

  /**
   * Verify Login OTP
   */
  verifyLoginOTP: async ({ email, otp }) => {
    try {
      return await api.post('/auth/verify-otp', { email, otp });
    } catch (error) {
      return {
        success: false,
        message: 'Unable to connect to server.',
        errorCode: 'NETWORK_ERROR',
        errors: {},
      };
    }
  },

  /**
   * Get Active User Profile
   */
  getMe: async () => {
    try {
      return await api.get('/auth/me');
    } catch (error) {
      return {
        success: false,
        message: 'Unable to connect to server.',
        errorCode: 'NETWORK_ERROR',
      };
    }
  },
};

export default authApi;
