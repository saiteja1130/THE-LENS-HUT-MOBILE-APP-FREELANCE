import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import LAYOUT from '../../constants/layout';
import ScreenHeader from '../../components/common/ScreenHeader';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import useFeedbackStore from '../../store/feedbackStore';

export const ContactUsScreen = ({ route }) => {
  const initialOrderId = route?.params?.orderId || '';
  const [subject, setSubject] = useState(
    initialOrderId ? `Query regarding Order ${initialOrderId}` : ''
  );
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const showWarning = useFeedbackStore((state) => state.showWarning);
  const showSuccess = useFeedbackStore((state) => state.showSuccess);

  const handlePhone = () => {
    Linking.openURL('tel:18001235367');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@thelenshut.com');
  };

  const handleSendMessage = () => {
    if (!message.trim()) {
      showWarning('Required', 'Please enter your query message.');
      return;
    }
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      showSuccess(
        'Message Received',
        'Thank you for reaching out. Our optical support specialist will get in touch with you shortly.'
      );
      setMessage('');
      setSubject('');
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <ScreenHeader title="Contact Support" showBack={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.heading}>We're Here to Help</Text>
        <Text style={styles.subheading}>
          Need help choosing frames, entering your vision prescription, or checking delivery status?
        </Text>

        {/* Contact Action Cards */}
        <View style={styles.contactRow}>
          <TouchableOpacity
            style={styles.contactCard}
            onPress={handlePhone}
            activeOpacity={0.8}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="call" size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.contactCardTitle}>Call Us</Text>
            <Text style={styles.contactCardValue}>1800-123-LENS</Text>
            <Text style={styles.contactCardSub}>9 AM - 8 PM (Mon-Sat)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            onPress={handleEmail}
            activeOpacity={0.8}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="mail" size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.contactCardTitle}>Email</Text>
            <Text style={styles.contactCardValue}>support@thelenshut.com</Text>
            <Text style={styles.contactCardSub}>Replies within 4 hrs</Text>
          </TouchableOpacity>
        </View>

        {/* Message Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Send Us a Message</Text>

          <Input
            label="Subject"
            placeholder="e.g. Lens recommendation, Order question"
            value={subject}
            onChangeText={setSubject}
          />

          <Input
            label="Your Message"
            placeholder="Type your question or query here..."
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            inputStyle={styles.messageInput}
          />

          <Button
            title="Send Message"
            onPress={handleSendMessage}
            loading={isSending}
            variant="primary"
            size="lg"
            style={styles.sendBtn}
          />
        </View>

        {/* Optical Lab Address */}
        <View style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <Ionicons name="business-outline" size={20} color={COLORS.secondary} />
            <Text style={styles.addressTitle}>Optical Laboratory & HQ</Text>
          </View>
          <Text style={styles.addressText}>
            The Lens Hut Eyewear Tech Pvt Ltd{'\n'}
            Plot 45, Tech Innovation Park, Whitefield{'\n'}
            Bengaluru, Karnataka - 560066
          </Text>
        </View>
      </ScrollView>
    </View>
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
  heading: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.secondary,
    marginBottom: 4,
  },
  subheading: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 20,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  contactCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: LAYOUT.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...LAYOUT.shadows.sm,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  contactCardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.secondary,
  },
  contactCardValue: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 4,
    textAlign: 'center',
  },
  contactCardSub: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: COLORS.surface,
    padding: 18,
    borderRadius: LAYOUT.radius.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 20,
    ...LAYOUT.shadows.sm,
  },
  formTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.secondary,
    marginBottom: 16,
  },
  messageInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sendBtn: {
    marginTop: 4,
  },
  addressCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: LAYOUT.radius.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.secondary,
    marginLeft: 8,
  },
  addressText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

export default ContactUsScreen;
