import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import LAYOUT from '../../constants/layout';
import ScreenHeader from '../../components/common/ScreenHeader';

export const TermsAndConditionsScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <ScreenHeader title="Terms & Conditions" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.lastUpdated}>Effective Date: September 27, 2026</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Agreement to Terms</Text>
          <Text style={styles.bodyText}>
            By downloading, accessing, or placing orders on The Lens Hut mobile application, you
            agree to be legally bound by these terms. If you do not agree, please do not use our services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Optical Prescription Accuracy</Text>
          <Text style={styles.bodyText}>
            You represent and warrant that the prescription parameters (SPH, CYL, AXIS, ADD, PD)
            submitted by you for powered eyeglasses or contact lenses have been provided by a registered
            optometrist or ophthalmologist and are not older than 12 months. The Lens Hut is not
            liable for eye strain or vision issues resulting from incorrect customer inputs.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Pricing & Cash on Delivery</Text>
          <Text style={styles.bodyText}>
            All product prices are quoted in Indian Rupees (INR) and are inclusive of GST.
            Orders placed under Cash on Delivery (Pay on Delivery) must be settled in full with the
            delivery agent prior to opening the tamper-evident package.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. 1-Year Limited Warranty</Text>
          <Text style={styles.bodyText}>
            The Lens Hut provides a 1-Year Manufacturer Warranty covering material defects and hinge
            failures on frames. The warranty does not cover accidental lens scratching, physical breakage
            due to impact, chemical exposure, or improper maintenance.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. 7-Day Exchange Policy</Text>
          <Text style={styles.bodyText}>
            If your frames do not fit comfortably, you may request an exchange within 7 calendar days
            of delivery provided the product and packaging are in unused condition with all original
            tags attached.
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
    marginBottom: 16,
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
    marginBottom: 8,
  },
  bodyText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default TermsAndConditionsScreen;
