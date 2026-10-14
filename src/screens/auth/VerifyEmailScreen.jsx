import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import LAYOUT from '../../constants/layout';
import Button from '../../components/common/Button';
import BrandLogo from '../../components/common/BrandLogo';
import useAuthStore from '../../store/authStore';
import useFeedbackStore from '../../store/feedbackStore';

export const VerifyEmailScreen = ({ navigation, route }) => {
  const initialEmail = route?.params?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const verifyEmail = useAuthStore((state) => state.verifyEmail);
  const resendVerification = useAuthStore((state) => state.resendVerification);
  const showToast = useFeedbackStore((state) => state.showToast);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async () => {
    setServerError(null);
    const errs = {};

    if (!email.trim()) {
      errs.email = 'Email address is required';
    }
    if (!otp.trim()) {
      errs.otp = 'Please enter the 6-digit code';
    } else if (otp.trim().length !== 6) {
      errs.otp = 'Verification code must be 6 digits';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setIsLoading(true);

    const res = await verifyEmail(email.trim(), otp.trim());
    setIsLoading(false);

    if (res.success) {
      showToast('Email verified successfully! Welcome!', 'success');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } else {
      setServerError(res.message || 'Verification failed. Please check code.');
      if (res.errors) setErrors(res.errors);
      showToast(res.message || 'Verification failed', 'error');
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    if (!email.trim()) {
      setErrors({ email: 'Email is required to resend code' });
      return;
    }

    setServerError(null);
    setIsResending(true);
    const res = await resendVerification(email.trim());
    setIsResending(false);

    if (res.success) {
      showToast('New 6-digit code sent to your email', 'success');
      setCountdown(60);
    } else {
      setServerError(res.message || 'Failed to resend code');
      if (res.errors) setErrors(res.errors);
      showToast(res.message || 'Resend failed', 'error');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <BrandLogo size="lg" />
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={34} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            Email verification is mandatory. Please enter the 6-digit code sent to your email.
          </Text>
        </View>

        {serverError && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={COLORS.error} />
            <Text style={styles.errorBannerText}>{serverError}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.lockedBadge}>
              <Ionicons name="lock-closed" size={11} color={COLORS.textMuted} />
              <Text style={styles.lockedText}>Locked</Text>
            </View>
          </View>
          <View style={styles.disabledInputContainer}>
            <Ionicons name="mail" size={18} color={COLORS.textMuted} style={styles.inputLeftIcon} />
            <TextInput
              style={styles.disabledInput}
              value={email}
              editable={false}
              selectTextOnFocus={false}
            />
          </View>

          <Text style={[styles.label, { marginTop: 18,marginBottom:6 }]}>6-Digit Verification Code</Text>
          <TextInput
            style={[styles.otpInput, errors.otp && styles.inputError]}
            value={otp}
            onChangeText={(t) => {
              setOtp(t.replace(/\D/g, ''));
              if (errors.otp) setErrors((e) => ({ ...e, otp: null }));
            }}
            placeholder="••••••"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="number-pad"
            maxLength={6}
          />
          {errors.otp && <Text style={[styles.fieldErrorText, { textAlign: 'center' }]}>{errors.otp}</Text>}

          <View style={styles.resendContainer}>
            <Text style={styles.resendHint}>Didn't receive the email code?</Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={countdown > 0 || isResending}
            >
              <Text
                style={[
                  styles.resendButtonText,
                  (countdown > 0 || isResending) && styles.resendDisabled,
                ]}
              >
                {isResending
                  ? 'Sending...'
                  : countdown > 0
                  ? `Resend in ${countdown}s`
                  : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Verify & Continue"
            onPress={handleVerify}
            loading={isLoading}
            disabled={otp.length < 6}
            variant="primary"
            size="lg"
            style={styles.verifyButton}
            textStyle={styles.verifyButtonText}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 12,
    lineHeight: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorLight,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.error,
  },
  form: {
    marginTop: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.secondary,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lockedText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  disabledInputContainer: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputLeftIcon: {
    marginRight: 8,
  },
  disabledInput: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    padding: 0,
  },
  otpInput: {
    height: 56,
    borderWidth: 1.5,
    borderColor: COLORS.borderDark,
    borderRadius: 12,
    textAlign: 'center',
    letterSpacing: 10,
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.secondary,
    backgroundColor: COLORS.surface,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorLight,
  },
  fieldErrorText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.error,
    marginTop: 4,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 20,
    gap: 6,
  },
  resendHint: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  resendButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.primary,
  },
  resendDisabled: {
    color: COLORS.textMuted,
  },
  verifyButton: {
    marginTop: 8,
    height: 52,
    borderRadius: 12,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontFamily: FONTS.bold,
    fontSize: 16,
    letterSpacing: 0.3,
  },
});

export default VerifyEmailScreen;
