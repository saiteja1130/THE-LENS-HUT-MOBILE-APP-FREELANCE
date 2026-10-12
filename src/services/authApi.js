import { Platform } from 'react-native';

// Android emulator maps 10.0.2.2 to host machine's localhost; iOS and physical devices connect via localhost/IP
const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:5000/api/v1',
  ios: 'http://localhost:5000/api/v1',
  default: 'http://localhost:5000/api/v1',
});

const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch {
    data = { success: false, message: 'Server communication error' };
  }

  if (!response.ok) {
    return {
      success: false,
      status: response.status,
      message: data.message || 'An error occurred. Please try again.',
      errorCode: data.errorCode || 'UNKNOWN_ERROR',
      errors: data.errors || {},
      data: data.data || null,
    };
  }

  return data;
};

export const authApi = {
  /**
   * Register user
   */
  signup: async ({ fullName, email, phone, password, confirmPassword }) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, password, confirmPassword }),
      });
      return await handleResponse(response);
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
      const response = await fetch(`${BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      return await handleResponse(response);
    } catch (error) {
      return {
        success: false,
        message: 'Network error: Unable to connect to server.',
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
      const response = await fetch(`${BASE_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return await handleResponse(response);
    } catch (error) {
      return {
        success: false,
        message: 'Network error: Unable to connect to server.',
        errorCode: 'NETWORK_ERROR',
        errors: {},
      };
    }
  },

  /**
   * Login with Password
   */
  loginWithPassword: async ({ email, password }) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return await handleResponse(response);
    } catch (error) {
      return {
        success: false,
        message: 'Network error: Unable to connect to server.',
        errorCode: 'NETWORK_ERROR',
        errors: {},
      };
    }
  },

  /**
   * Request Login OTP
   */
  requestLoginOTP: async ({ email }) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return await handleResponse(response);
    } catch (error) {
      return {
        success: false,
        message: 'Network error: Unable to connect to server.',
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
      const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      return await handleResponse(response);
    } catch (error) {
      return {
        success: false,
        message: 'Network error: Unable to connect to server.',
        errorCode: 'NETWORK_ERROR',
        errors: {},
      };
    }
  },
};
