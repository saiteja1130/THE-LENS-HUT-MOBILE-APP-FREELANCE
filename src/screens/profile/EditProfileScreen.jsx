import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import LAYOUT from '../../constants/layout';
import ScreenHeader from '../../components/common/ScreenHeader';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import useAuthStore from '../../store/authStore';
import useFeedbackStore from '../../store/feedbackStore';

export const EditProfileScreen = ({ navigation }) => {
  const { user, updateProfile } = useAuthStore();
  const showSuccess = useFeedbackStore((state) => state.showSuccess);
  const showError = useFeedbackStore((state) => state.showError);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Name cannot be empty';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email.trim())) {
      errs.email = 'Enter a valid email';
    }
    if (!phone.trim() || phone.trim().replace(/\D/g, '').length < 10) {
      errs.phone = 'Enter a valid 10-digit mobile number';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsLoading(true);
    const success = await updateProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
    setIsLoading(false);

    if (success) {
      showSuccess(
        'Profile Updated',
        'Your profile details have been successfully saved.',
        () => navigation.goBack()
      );
    } else {
      showError('Error', 'Failed to update profile.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <ScreenHeader title="Edit Profile" showBack={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Input
            label="Full Name"
            value={name}
            onChangeText={(val) => {
              setName(val);
              if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
            }}
            error={errors.name}
            leftIcon={<Ionicons name="person-outline" size={18} color={COLORS.textMuted} />}
          />

          <Input
            label="Email Address"
            value={email}
            onChangeText={(val) => {
              setEmail(val);
              if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
            }}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Ionicons name="mail-outline" size={18} color={COLORS.textMuted} />}
          />

          <Input
            label="Mobile Phone"
            value={phone}
            onChangeText={(val) => {
              setPhone(val);
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
            }}
            error={errors.phone}
            keyboardType="phone-pad"
            leftIcon={<Ionicons name="call-outline" size={18} color={COLORS.textMuted} />}
          />

          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={isLoading}
            variant="primary"
            size="lg"
            style={styles.saveBtn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: LAYOUT.radius.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...LAYOUT.shadows.sm,
  },
  saveBtn: {
    marginTop: 8,
  },
});

export default EditProfileScreen;
