import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import LAYOUT from '../../constants/layout';
import ScreenHeader from '../../components/common/ScreenHeader';
import Button from '../../components/common/Button';
import useAuthStore from '../../store/authStore';
import useFeedbackStore from '../../store/feedbackStore';

const REASONS = [
  'I am not using the application anymore',
  'I have privacy or data storage concerns',
  'I created a duplicate or secondary account',
  'The lenses or frames did not fit my expectations',
  'Other reason',
];

export const DeleteAccountScreen = ({ navigation }) => {
  const [selectedReason, setSelectedReason] = useState(REASONS[0]);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const user = useAuthStore((state) => state.user);
  const showSuccess = useFeedbackStore((state) => state.showSuccess);
  const showError = useFeedbackStore((state) => state.showError);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      setIsDeleting(false);
      setIsConfirmModalVisible(false);

      showSuccess(
        'Account Deleted',
        'Your profile, stored vision prescriptions, and device session have been permanently deleted.',
        () => navigation.replace('Splash')
      );
    } catch (e) {
      setIsDeleting(false);
      showError('Error', 'Unable to delete account at this time. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <ScreenHeader title="Delete Account" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.warningCard}>
          <View style={styles.warningIconWrapper}>
            <Ionicons name="warning" size={32} color={COLORS.error} />
          </View>
          <Text style={styles.warningTitle}>Permanent Account Deletion</Text>
          <Text style={styles.warningDescription}>
            This action cannot be undone. Once deleted, your account credentials, saved prescription records, and past order details will be completely wiped from our systems.
          </Text>
        </View>

        <View style={styles.consequencesList}>
          <Text style={styles.consequencesHeading}>What happens when you delete:</Text>
          <View style={styles.consequenceItem}>
            <Ionicons name="close-circle-outline" size={18} color={COLORS.error} />
            <Text style={styles.consequenceText}>You will lose access to past digital invoices</Text>
          </View>
          <View style={styles.consequenceItem}>
            <Ionicons name="close-circle-outline" size={18} color={COLORS.error} />
            <Text style={styles.consequenceText}>All saved vision lens power records will be erased</Text>
          </View>
          <View style={styles.consequenceItem}>
            <Ionicons name="close-circle-outline" size={18} color={COLORS.error} />
            <Text style={styles.consequenceText}>Your wishlist items and active cart will be cleared</Text>
          </View>
        </View>

        {/* Reason Selector */}
        <Text style={styles.sectionHeading}>Please tell us why you are leaving:</Text>
        <View style={styles.reasonsCard}>
          {REASONS.map((reason) => {
            const isSelected = selectedReason === reason;
            return (
              <TouchableOpacity
                key={reason}
                style={styles.reasonRow}
                onPress={() => setSelectedReason(reason)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.radioOuter,
                    isSelected && styles.radioOuterSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.reasonText, isSelected && styles.selectedReasonText]}>
                  {reason}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          title="Delete My Account Permanently"
          onPress={() => setIsConfirmModalVisible(true)}
          variant="danger"
          size="lg"
          style={styles.deleteBtn}
        />
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={isConfirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="trash-outline" size={32} color={COLORS.error} />
            </View>

            <Text style={styles.modalTitle}>Are you absolutely sure?</Text>
            <Text style={styles.modalDescription}>
              This will permanently delete the account for{' '}
              <Text style={styles.modalUserText}>{user?.email || 'this user'}</Text>. You will not be able to recover this account.
            </Text>

            <View style={styles.modalButtonsRow}>
              <Button
                title="Cancel"
                onPress={() => setIsConfirmModalVisible(false)}
                variant="outline"
                size="md"
                style={styles.modalCancelBtn}
              />
              <Button
                title="Yes, Delete"
                onPress={handleConfirmDelete}
                loading={isDeleting}
                variant="danger"
                size="md"
                style={styles.modalConfirmBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  warningCard: {
    backgroundColor: COLORS.errorLight,
    borderRadius: LAYOUT.radius.lg,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
    marginBottom: 20,
  },
  warningIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  warningTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 8,
  },
  warningDescription: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  consequencesList: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: LAYOUT.radius.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 24,
  },
  consequencesHeading: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: 10,
  },
  consequenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  consequenceText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  sectionHeading: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: 12,
  },
  reasonsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 28,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioOuterSelected: {
    borderColor: COLORS.error,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.error,
  },
  reasonText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  selectedReasonText: {
    fontFamily: FONTS.medium,
    color: COLORS.secondary,
  },
  deleteBtn: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.lg,
    padding: 24,
    alignItems: 'center',
    ...LAYOUT.shadows.lg,
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDescription: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalUserText: {
    fontFamily: FONTS.semiBold,
    color: COLORS.secondary,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  modalCancelBtn: {
    flex: 1,
    marginRight: 8,
    borderColor: COLORS.border,
  },
  modalConfirmBtn: {
    flex: 1,
    marginLeft: 8,
  },
});

export default DeleteAccountScreen;
