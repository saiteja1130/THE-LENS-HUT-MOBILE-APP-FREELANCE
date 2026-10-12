import { create } from 'zustand';

let toastTimer = null;

export const useFeedbackStore = create((set, get) => ({
  // Modal state
  modal: {
    visible: false,
    type: 'success', // 'success' | 'error' | 'warning' | 'confirm'
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancel',
    onConfirm: null,
    onCancel: null,
    destructive: false,
  },

  // Toast state
  toast: {
    visible: false,
    type: 'success', // 'success' | 'error' | 'info'
    message: '',
  },

  // Modal actions
  showSuccess: (title, message, onConfirm) => {
    set({
      modal: {
        visible: true,
        type: 'success',
        title: title || 'Success',
        message: message || '',
        confirmText: 'Continue',
        cancelText: null,
        onConfirm: onConfirm || null,
        onCancel: null,
        destructive: false,
      },
    });
  },

  showError: (title, message, onConfirm) => {
    set({
      modal: {
        visible: true,
        type: 'error',
        title: title || 'Error',
        message: message || 'Something went wrong. Please try again.',
        confirmText: 'Dismiss',
        cancelText: null,
        onConfirm: onConfirm || null,
        onCancel: null,
        destructive: false,
      },
    });
  },

  showWarning: (title, message, onConfirm) => {
    set({
      modal: {
        visible: true,
        type: 'warning',
        title: title || 'Attention',
        message: message || '',
        confirmText: 'Understood',
        cancelText: null,
        onConfirm: onConfirm || null,
        onCancel: null,
        destructive: false,
      },
    });
  },

  showConfirm: ({
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm = null,
    onCancel = null,
    destructive = false,
    type = 'confirm',
  }) => {
    set({
      modal: {
        visible: true,
        type: type || 'confirm',
        title: title || 'Are you sure?',
        message: message || '',
        confirmText,
        cancelText,
        onConfirm,
        onCancel,
        destructive,
      },
    });
  },

  hideModal: () => {
    set((state) => ({
      modal: { ...state.modal, visible: false },
    }));
  },

  // Toast actions
  showToast: (message, type = 'success', duration = 2800) => {
    if (toastTimer) clearTimeout(toastTimer);

    set({
      toast: {
        visible: true,
        type,
        message,
      },
    });

    toastTimer = setTimeout(() => {
      set((state) => ({
        toast: { ...state.toast, visible: false },
      }));
    }, duration);
  },

  hideToast: () => {
    if (toastTimer) clearTimeout(toastTimer);
    set((state) => ({
      toast: { ...state.toast, visible: false },
    }));
  },
}));

export default useFeedbackStore;
