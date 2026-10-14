import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import LAYOUT from '../../constants/layout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Divider from '../../components/common/Divider';
import BrandLogo from '../../components/common/BrandLogo';
import useAuthStore from '../../store/authStore';
import useFeedbackStore from '../../store/feedbackStore';

export const LoginScreen = ({ navigation }) => {
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // OTP flow state
  const [otpStep, setOtpStep] = useState(1); // 1: send, 2: verify
  const [otp, setOtp] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loginWithPassword = useAuthStore((state) => state.loginWithPassword);
  const requestLoginOTP = useAuthStore((state) => state.requestLoginOTP);
  const verifyLoginOTP = useAuthStore((state) => state.verifyLoginOTP);
  const showError = useFeedbackStore((state) => state.showError);
  const showToast = useFeedbackStore((state) => state.showToast);

  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  const validatePasswordForm = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePasswordLogin = async () => {
    setServerError(null);
    if (!validatePasswordForm()) return;

    setIsLoading(true);
    const res = await loginWithPassword(email.trim(), password);
    setIsLoading(false);

    if (res.success) {
      showToast('Welcome back to The Lens Hut!', 'success');
      navigation.replace('Main');
    } else {
      if (res.errorCode === 'EMAIL_NOT_VERIFIED') {
        Alert.alert(
          'Email Verification Mandatory',
          'Your account is created but not verified yet. A verification code has been dispatched to your email.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Verify Now',
              onPress: () => navigation.navigate('VerifyEmail', { email: email.trim() }),
            },
          ]
        );
      } else {
        setServerError(res.message || 'Invalid credentials');
        if (res.errors) setErrors(res.errors);
        showError('Login Failed', res.message || 'Please check your credentials.');
      }
    }
  };

  const handleSendOTP = async () => {
    setServerError(null);
    if (!email.trim()) {
      setErrors({ email: 'Please enter your registered email' });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setErrors({ email: 'Enter a valid email address' });
      return;
    }

    setErrors({});
    setIsLoading(true);
    const res = await requestLoginOTP(email.trim());
    setIsLoading(false);

    if (res.success) {
      showToast('A 6-digit login code has been sent to your email', 'success');
      setOtpStep(2);
      setOtpCountdown(60);
    } else {
      setServerError(res.message || 'Failed to send login code');
      if (res.errors) setErrors(res.errors);
      showError('Error', res.message || 'Failed to send login code');
    }
  };

  const handleVerifyOTP = async () => {
    setServerError(null);
    if (!otp.trim() || otp.trim().length !== 6) {
      setErrors({ otp: 'Please enter the 6-digit login code' });
      return;
    }

    setErrors({});
    setIsLoading(true);
    const res = await verifyLoginOTP(email.trim(), otp.trim());
    setIsLoading(false);

    if (res.success) {
      showToast('Logged in successfully via OTP!', 'success');
      navigation.replace('Main');
    } else {
      setServerError(res.message || 'Invalid or expired login code');
      if (res.errors) setErrors(res.errors);
      showError('Verification Failed', res.message || 'Incorrect code entered');
    }
  };

  const handleGuestBrowse = () => {
    navigation.replace('Main');
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
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
        <View style={styles.topSection}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.replace('Main')}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
          </TouchableOpacity>

          <BrandLogo size="lg" style={{ marginBottom: 16 }} />

          <Text style={styles.heading}>Welcome Back</Text>
          <Text style={styles.subheading}>
            Sign in to access your orders, prescriptions, and saved wishlist.
          </Text>

          {/* Toggle Login Method */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, loginMethod === 'password' && styles.tabButtonActive]}
              onPress={() => {
                setLoginMethod('password');
                setServerError(null);
                setErrors({});
              }}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  loginMethod === 'password' && styles.tabButtonTextActive,
                ]}
              >
                Password Login
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, loginMethod === 'otp' && styles.tabButtonActive]}
              onPress={() => {
                setLoginMethod('otp');
                setServerError(null);
                setErrors({});
              }}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  loginMethod === 'otp' && styles.tabButtonTextActive,
                ]}
              >
                OTP Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {serverError && (
          <View style={styles.serverErrorBox}>
            <Ionicons name="alert-circle" size={16} color={COLORS.error} />
            <Text style={styles.serverErrorText}>{serverError}</Text>
          </View>
        )}

        <View style={styles.formSection}>
          {loginMethod === 'password' ? (
            <>
              <Input
                label="Email Address"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                }}
                error={errors.email}
                leftIcon={<Ionicons name="mail-outline" size={18} color={COLORS.textMuted} />}
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                secureTextEntry
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                }}
                error={errors.password}
                leftIcon={<Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} />}
              />

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <Button
                title="Sign In with Password"
                onPress={handlePasswordLogin}
                loading={isLoading}
                variant="primary"
                size="lg"
                style={styles.signInButton}
              />
            </>
          ) : (
            <>
              {otpStep === 1 ? (
                <>
                  <Input
                    label="Registered Email"
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(val) => {
                      setEmail(val);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                    }}
                    error={errors.email}
                    leftIcon={<Ionicons name="mail-outline" size={18} color={COLORS.textMuted} />}
                  />

                  <Button
                    title="Send Login Code"
                    onPress={handleSendOTP}
                    loading={isLoading}
                    variant="primary"
                    size="lg"
                    style={styles.signInButton}
                  />
                </>
              ) : (
                <>
                  <Input
                    label="6-Digit Login Code"
                    placeholder="••••••"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={(val) => {
                      setOtp(val.replace(/\D/g, ''));
                      if (errors.otp) setErrors((prev) => ({ ...prev, otp: null }));
                    }}
                    error={errors.otp}
                    leftIcon={<Ionicons name="key-outline" size={18} color={COLORS.textMuted} />}
                  />

                  <View style={styles.otpMetaRow}>
                    <TouchableOpacity onPress={() => setOtpStep(1)}>
                      <Text style={styles.changeEmailText}>Change Email</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleSendOTP}
                      disabled={otpCountdown > 0 || isLoading}
                    >
                      <Text style={[styles.resendOtpText, otpCountdown > 0 && styles.resendOtpDisabled]}>
                        {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Resend Code'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Button
                    title="Verify & Sign In"
                    onPress={handleVerifyOTP}
                    loading={isLoading}
                    disabled={otp.length < 6}
                    variant="primary"
                    size="lg"
                    style={styles.signInButton}
                  />
                </>
              )}
            </>
          )}

          <Divider text="OR" />

          <Button
            title="Continue as Guest"
            onPress={handleGuestBrowse}
            variant="outline"
            size="md"
            style={styles.guestButton}
          />
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  topSection: {
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heading: {
    fontFamily: FONTS.family.bold,
    fontSize: FONTS.size.xxl,
    color: COLORS.secondary,
    marginBottom: 6,
  },
  subheading: {
    fontFamily: FONTS.family.regular,
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.borderLight,
    borderRadius: 12,
    padding: 4,
    marginTop: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontFamily: FONTS.family.medium,
    fontSize: FONTS.size.xs,
    color: COLORS.textSecondary,
  },
  tabButtonTextActive: {
    fontFamily: FONTS.family.bold,
    color: COLORS.secondary,
  },
  serverErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorLight,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    gap: 8,
  },
  serverErrorText: {
    flex: 1,
    fontFamily: FONTS.family.medium,
    fontSize: 12,
    color: COLORS.error,
  },
  formSection: {
    marginBottom: 20,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 16,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontFamily: FONTS.family.medium,
    fontSize: FONTS.size.xs,
    color: COLORS.primary,
  },
  signInButton: {
    marginTop: 8,
  },
  otpMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -4,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  changeEmailText: {
    fontFamily: FONTS.family.regular,
    fontSize: FONTS.size.xs,
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
  resendOtpText: {
    fontFamily: FONTS.family.bold,
    fontSize: FONTS.size.xs,
    color: COLORS.primary,
  },
  resendOtpDisabled: {
    color: COLORS.textMuted,
  },
  guestButton: {
    marginTop: 4,
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 24,
    marginTop: 'auto',
  },
  footerText: {
    fontFamily: FONTS.family.regular,
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
  },
  registerLink: {
    fontFamily: FONTS.family.bold,
    fontSize: FONTS.size.sm,
    color: COLORS.primary,
  },
});

export default LoginScreen;
