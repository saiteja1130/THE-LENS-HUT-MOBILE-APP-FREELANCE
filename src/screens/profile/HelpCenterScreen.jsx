import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import LAYOUT from '../../constants/layout';
import ScreenHeader from '../../components/common/ScreenHeader';

const FAQS = [
  {
    q: 'Can I order frames without powered lenses?',
    a: 'Yes! When viewing any product, you can select the "Zero Power (Plano / Anti-Glare)" package or tap "Frame Only". These come with clear, anti-reflective lenses suitable for fashion or eye protection.',
  },
  {
    q: 'What is Pupillary Distance (PD) and how do I measure it?',
    a: 'Pupillary distance is the distance in millimeters between the centers of your pupils. It ensures the optical center of the lenses sits directly in front of your pupils. The standard adult average is 63mm.',
  },
  {
    q: 'What is the difference between Anti-Glare and Blue Cut Pro lenses?',
    a: 'Anti-glare lenses eliminate unwanted reflections and halos (ideal for night driving and bright lights). Blue Cut Pro lenses incorporate an optical filter that blocks high-energy visible (HEV) blue rays from digital screens and LED lighting to prevent digital eye strain.',
  },
  {
    q: 'How long does lens fitting and delivery take?',
    a: 'Our certified optical laboratory typically cuts and quality-checks lenses within 24-48 hours. Express shipping takes an additional 2-3 business days across India.',
  },
  {
    q: 'What warranty is offered on frames and lenses?',
    a: 'All frames purchased through The Lens Hut include a 1-Year Manufacturer Warranty covering manufacturing defects and hinge issues, along with a 7-day hassle-free exchange policy.',
  },
];

export const HelpCenterScreen = () => {
  const [expandedIndex, setExpandedIndex] = useState(0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <ScreenHeader title="Help Center & FAQs" showBack={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <Text style={styles.sectionSubtitle}>
          Everything you need to know about custom prescription eyewear, lenses, and care.
        </Text>

        {FAQS.map((faq, index) => {
          const isExpanded = expandedIndex === index;
          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.85}
              style={[styles.faqCard, isExpanded && styles.expandedFaqCard]}
              onPress={() => setExpandedIndex(isExpanded ? null : index)}
            >
              <View style={styles.questionRow}>
                <Text style={[styles.questionText, isExpanded && styles.expandedQuestionText]}>
                  {faq.q}
                </Text>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={isExpanded ? COLORS.primary : COLORS.textMuted}
                />
              </View>

              {isExpanded && (
                <View style={styles.answerContainer}>
                  <Text style={styles.answerText}>{faq.a}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
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
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.secondary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 20,
  },
  faqCard: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...LAYOUT.shadows.sm,
  },
  expandedFaqCard: {
    borderColor: COLORS.primaryLight,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.secondary,
    flex: 1,
    marginRight: 10,
    lineHeight: 20,
  },
  expandedQuestionText: {
    color: COLORS.primary,
  },
  answerContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  answerText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default HelpCenterScreen;
