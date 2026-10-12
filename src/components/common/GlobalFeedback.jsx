import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import LAYOUT from '../../constants/layout';
import Button from './Button';
import useFeedbackStore from '../../store/feedbackStore';

const { width } = Dimensions.get('window');

export const GlobalFeedback = () => {
  const modal = useFeedbackStore((state) => state.modal);
  const hideModal = useFeedbackStore((state) => state.hideModal);
  const toast = useFeedbackStore((state) => state.toast);
  const hideToast = useFeedbackStore((state) => state.hideToast);

  const handleConfirm = () => {
    const callback = modal.onConfirm;
    hideModal();
    if (callback && typeof callback === 'function') {
      callback();
    }
  };

  const handleCancel = () => {
    const callback = modal.onCancel;
    hideModal();
    if (callback && typeof callback === 'function') {
      callback();
    }
  };

  // Get icon and colors for modal
  const getModalMeta = () => {
    switch (modal.type) {
      case 'success':
        return {
          icon: 'checkmark-circle',
          iconColor: COLORS.success || '#059669',
          badgeBg: '#ECFDF5',
          borderColor: '#A7F3D0',
          confirmVariant: 'primary',
        };
      case 'error':
        return {
          icon: 'close-circle',
          iconColor: COLORS.error || '#DC2626',
          badgeBg: '#FEF2F2',
          borderColor: '#FECACA',
          confirmVariant: 'danger',
        };
      case 'warning':
        return {
          icon: 'alert-circle',
          iconColor: COLORS.warning || '#D97706',
          badgeBg: '#FFFBEB',
          borderColor: '#FDE68A',
          confirmVariant: 'primary',
        };
      case 'confirm':
      default:
        return {
          icon: modal.destructive ? 'trash-outline' : 'help-circle-outline',
          iconColor: modal.destructive ? COLORS.error : COLORS.primary,
          badgeBg: modal.destructive ? '#FEF2F2' : COLORS.primaryLight,
          borderColor: modal.destructive ? '#FECACA' : '#FFD2D5',
          confirmVariant: modal.destructive ? 'danger' : 'primary',
        };
    }
  };

  const modalMeta = getModalMeta();

  return (
    <>
      {/* 1. Modal Dialog Popup */}
      <Modal
        visible={modal.visible}
        transparent
        animationType="fade"
        onRequestClose={hideModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {/* Icon Header Badge */}
            <View
              style={[
                styles.iconBadge,
                {
                  backgroundColor: modalMeta.badgeBg,
                  borderColor: modalMeta.borderColor,
                },
              ]}
            >
              <Ionicons
                name={modalMeta.icon}
                size={34}
                color={modalMeta.iconColor}
              />
            </View>

            {/* Title & Message */}
            <Text style={styles.modalTitle}>{modal.title}</Text>
            {modal.message ? (
              <Text style={styles.modalMessage}>{modal.message}</Text>
            ) : null}

            {/* Action Buttons */}
            <View style={styles.modalActionsRow}>
              {modal.cancelText ? (
                <Button
                  title={modal.cancelText}
                  variant="outline"
                  size="md"
                  onPress={handleCancel}
                  style={styles.cancelButton}
                />
              ) : null}

              <Button
                title={modal.confirmText || 'OK'}
                variant={modalMeta.confirmVariant}
                size="md"
                onPress={handleConfirm}
                style={[
                  styles.confirmButton,
                  !modal.cancelText && styles.confirmButtonFull,
                ]}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. Floating Top Toast Notification */}
      {toast.visible ? (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={hideToast}
          style={[
            styles.toastContainer,
            toast.type === 'error'
              ? styles.toastError
              : toast.type === 'info'
              ? styles.toastInfo
              : styles.toastSuccess,
          ]}
        >
          <Ionicons
            name={
              toast.type === 'error'
                ? 'alert-circle'
                : toast.type === 'info'
                ? 'information-circle'
                : 'checkmark-circle'
            }
            size={18}
            color="#FFFFFF"
            style={styles.toastIcon}
          />
          <Text style={styles.toastMessage} numberOfLines={2}>
            {toast.message}
          </Text>
        </TouchableOpacity>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 35, 46, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: Math.min(width - 48, 380),
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: 'center',
    ...LAYOUT.shadows.lg,
  },
  iconBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMessage: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 6,
  },
  modalActionsRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 46,
  },
  confirmButton: {
    flex: 1,
    height: 46,
  },
  confirmButtonFull: {
    flex: 1,
    width: '100%',
  },
  toastContainer: {
    position: 'absolute',
    top: 52,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 25,
    maxWidth: width - 40,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  toastSuccess: {
    backgroundColor: '#0F766E', // Deep teal / emerald
  },
  toastError: {
    backgroundColor: '#B91C1C', // Deep red
  },
  toastInfo: {
    backgroundColor: '#1E293B', // Deep slate
  },
  toastIcon: {
    marginRight: 8,
  },
  toastMessage: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: '#FFFFFF',
    flexShrink: 1,
  },
});

export default GlobalFeedback;
