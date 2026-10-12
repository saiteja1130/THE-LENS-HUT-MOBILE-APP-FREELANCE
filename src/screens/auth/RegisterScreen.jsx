import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import BrandLogo from '../../components/common/BrandLogo';
import useAuthStore from '../../store/authStore';
import useFeedbackStore from '../../store/feedbackStore';

export const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const signup = useAuthStore((state) => state.signup);
  const showSuccess = useFeedbackStore((state) => state.showSuccess);
  const showError = useFeedbackStore((state) => state.showError);

  const validate = () => {
    const errs = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required';

    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errs.email = 'Enter a valid email address';
    }

    if (!phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (phone.trim().replace(/\D/g, '').length < 10) {
      errs.phone = 'Enter a valid 10-digit mobile number';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await signup({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        confirmPassword,
      });
      setIsLoading(false);

      if (res.success) {
        showSuccess(
          'Verification Code Sent',
          'Please enter the 6-digit code sent to your email to verify your account.',
          () => navigation.navigate('VerifyEmail', { email: email.trim() })
        );
      } else {
        if (res.errors) {
          setErrors(res.errors);
        }
        showError('Registration Failed', res.message || 'Could not create account. Please check errors.');
      }
    } catch (e) {
      setIsLoading(false);
      showError('Registration Failed', 'Network error. Could not connect to server.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSection}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
          </TouchableOpacity>

          <BrandLogo size="md" style={{ marginBottom: 16 }} />

          <Text style={styles.heading}>Create Account</Text>
          <Text style={styles.subheading}>
            Join The Lens Hut for personalized eyewear shopping and custom lenses.
          </Text>
        </View>

        <View style={styles.formSection}>
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={fullName}
            onChangeText={(val) => {
              setFullName(val);
              if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: null }));
            }}
            error={errors.fullName}
            leftIcon={<Ionicons name="person-outline" size={18} color={COLORS.textMuted} />}
          />

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
            label="Phone Number"
            placeholder="9876543210"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(val) => {
              setPhone(val);
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
            }}
            error={errors.phone}
            leftIcon={<Ionicons name="call-outline" size={18} color={COLORS.textMuted} />}
          />

          <Input
            label="Password"
            placeholder="Create password (min 6 characters)"
            secureTextEntry
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
            }}
            error={errors.password}
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} />}
          />

          <Input
            label="Confirm Password"
            placeholder="Re-enter password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={(val) => {
              setConfirmPassword(val);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
            }}
            error={errors.confirmPassword}
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} />}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            variant="primary"
            size="lg"
            style={styles.registerButton}
          />
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In</Text>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    justifyContent: 'space-between',
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
    marginBottom: 16,
  },
  heading: {
    fontFamily: FONTS.bold,
    fontSize: 26,
    color: COLORS.secondary,
    marginBottom: 6,
  },
  subheading: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  formSection: {
    flex: 1,
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  loginLink: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.primary,
  },
});

export default RegisterScreen;
