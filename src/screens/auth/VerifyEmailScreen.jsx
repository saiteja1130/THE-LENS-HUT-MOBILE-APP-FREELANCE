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
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <BrandLogo size="lg" />
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={36} color={COLORS.primary} />
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
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (errors.email) setErrors((e) => ({ ...e, email: null }));
            }}
            placeholder="name@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.fieldErrorText}>{errors.email}</Text>}

          <Text style={[styles.label, { marginTop: 16 }]}>6-Digit Verification Code</Text>
          <TextInput
            style={[styles.otpInput, errors.otp && styles.inputError]}
            value={otp}
            onChangeText={(t) => {
              setOtp(t.replace(/\D/g, ''));
              if (errors.otp) setErrors((e) => ({ ...e, otp: null }));
            }}
            placeholder="••••••"
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
            style={styles.verifyButton}
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
  scrollContent: {
    flexGrow: 1,
    padding: LAYOUT.screenPadding,
    justifyContent: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  title: {
    fontFamily: FONTS.family.bold,
    fontSize: FONTS.size.xxl,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONTS.family.regular,
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
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
    fontFamily: FONTS.family.medium,
    fontSize: FONTS.size.xs,
    color: COLORS.error,
  },
  form: {
    marginTop: 8,
  },
  label: {
    fontFamily: FONTS.family.bold,
    fontSize: FONTS.size.xs,
    color: COLORS.secondary,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontFamily: FONTS.family.regular,
    fontSize: FONTS.size.sm,
    color: COLORS.secondary,
  },
  otpInput: {
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    textAlign: 'center',
    letterSpacing: 10,
    fontFamily: FONTS.family.bold,
    fontSize: 24,
    color: COLORS.secondary,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorLight,
  },
  fieldErrorText: {
    fontFamily: FONTS.family.medium,
    fontSize: 11,
    color: COLORS.error,
    marginTop: 4,
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 24,
    gap: 6,
  },
  resendHint: {
    fontFamily: FONTS.family.regular,
    fontSize: FONTS.size.xs,
    color: COLORS.textSecondary,
  },
  resendButtonText: {
    fontFamily: FONTS.family.bold,
    fontSize: FONTS.size.xs,
    color: COLORS.primary,
  },
  resendDisabled: {
    color: COLORS.textMuted,
  },
  verifyButton: {
    marginTop: 8,
  },
});

export default VerifyEmailScreen;
