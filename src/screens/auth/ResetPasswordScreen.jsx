import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const ResetPasswordScreen = ({ route, navigation }) => {
  const email = route?.params?.email || 'your email';
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!code || code.length < 4) {
      errs.code = 'Enter the verification code sent to your email';
    }
    if (!password || password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleReset = () => {
    if (!validate()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Password Reset Successful',
        'Your password has been updated. You can now log in with your new credentials.',
        [{ text: 'Sign In', onPress: () => navigation.navigate('Login') }]
      );
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topSection}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>

        <Text style={styles.heading}>Reset Password</Text>
        <Text style={styles.subheading}>
          We sent a verification code to <Text style={styles.boldText}>{email}</Text>. Enter the code and set your new password.
        </Text>
      </View>

      <View style={styles.formSection}>
        <Input
          label="Verification Code"
          placeholder="e.g. 123456"
          keyboardType="number-pad"
          maxLength={6}
          value={code}
          onChangeText={(val) => {
            setCode(val);
            if (errors.code) setErrors((prev) => ({ ...prev, code: null }));
          }}
          error={errors.code}
          leftIcon={<Ionicons name="shield-checkmark-outline" size={18} color={COLORS.textMuted} />}
        />

        <Input
          label="New Password"
          placeholder="Minimum 6 characters"
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
          label="Confirm New Password"
          placeholder="Re-enter new password"
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
          title="Update Password"
          onPress={handleReset}
          loading={isLoading}
          variant="primary"
          size="lg"
          style={styles.button}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  topSection: {
    marginBottom: 24,
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
    marginBottom: 8,
  },
  subheading: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  boldText: {
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  formSection: {
    flex: 1,
  },
  button: {
    marginTop: 8,
  },
});

export default ResetPasswordScreen;
