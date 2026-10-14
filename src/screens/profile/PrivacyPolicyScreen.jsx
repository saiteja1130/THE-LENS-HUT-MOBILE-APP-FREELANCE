import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import LAYOUT from '../../constants/layout';
import ScreenHeader from '../../components/common/ScreenHeader';

export const PrivacyPolicyScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <ScreenHeader title="Privacy Policy" showBack={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.lastUpdated}>Effective Date: September 27, 2026</Text>

        <Text style={styles.leadParagraph}>
          At The Lens Hut, your vision health and personal privacy are our highest priorities.
          This Privacy Policy explains how we collect, handle, store, and safeguard your personal
          information, optical prescriptions, and device details when you use our mobile application.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.bodyText}>
            • <Text style={styles.boldText}>Personal Contact Information:</Text> Full name, phone number,
            email address, and physical shipping address provided during checkout.
          </Text>
          <Text style={styles.bodyText}>
            • <Text style={styles.boldText}>Vision & Prescription Records:</Text> Spherical (SPH),
            Cylindrical (CYL), Axis, Addition (ADD), and Pupillary Distance (PD) measurements you supply
            for custom lens fitting.
          </Text>
          <Text style={styles.bodyText}>
            • <Text style={styles.boldText}>Order & Transaction Data:</Text> Items selected, lens coating
            customizations, total amounts, and delivery timestamps.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. How We Use Your Vision Data</Text>
          <Text style={styles.bodyText}>
            Your prescription data is strictly used by our certified opticians and optical laboratory
            technicians solely to cut, bevel, and inspect your custom eyewear lenses. We never sell,
            rent, or monetize your ophthalmic or personal medical information to any third party.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Shipping Address & Order Processing</Text>
          <Text style={styles.bodyText}>
            In accordance with our streamlined privacy approach, your shipping address is gathered
            directly during the checkout step for specific order fulfillment and handed over to our
            reputable courier partners exclusively to ensure doorstep delivery.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Data Security & Storage</Text>
          <Text style={styles.bodyText}>
            We employ industry-standard encryption protocols (TLS/SSL) to protect all communications
            between our mobile application and our servers. Data stored locally on your device utilizes
            secure sandboxed application storage.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Right to Erasure & Account Deletion</Text>
          <Text style={styles.bodyText}>
            You hold the absolute right to delete your profile, remove order associations, and purge
            all stored details at any time using the "Delete Account" feature directly within the
            Account settings menu of this application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Contacting the Grievance Officer</Text>
          <Text style={styles.bodyText}>
            For any inquiries, requests to review your stored vision data, or concerns regarding your
            privacy, please contact us at:
          </Text>
          <Text style={styles.contactDetails}>
            Privacy Officer: privacy@thelenshut.com{'\n'}
            Customer Support: support@thelenshut.com{'\n'}
            Toll-Free: 1800-123-LENS
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
    padding: 20,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  leadParagraph: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  section: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: LAYOUT.radius.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...LAYOUT.shadows.sm,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.secondary,
    marginBottom: 10,
  },
  bodyText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  boldText: {
    fontFamily: FONTS.semiBold,
    color: COLORS.secondary,
  },
  contactDetails: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.primary,
    lineHeight: 22,
    marginTop: 6,
  },
});

export default PrivacyPolicyScreen;
