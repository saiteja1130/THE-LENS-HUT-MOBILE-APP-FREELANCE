import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import LAYOUT from '../../constants/layout';
import formatCurrency from '../../utils/formatCurrency';
import Button from '../../components/common/Button';
import { LENS_PACKAGES } from '../../constants/lensPackages';
import useCartStore from '../../store/cartStore';
import useFeedbackStore from '../../store/feedbackStore';
import ScreenHeader from '../../components/common/ScreenHeader';

export const LensSelectionScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { product, selectedColor } = route.params;
  const [selectedLens, setSelectedLens] = useState(LENS_PACKAGES[0]);

  const addItem = useCartStore((state) => state.addItem);
  const showConfirm = useFeedbackStore((state) => state.showConfirm);

  const totalAmount = product.price + selectedLens.price;

  const handleContinue = async () => {
    // If Zero Power, add directly to bag
    if (selectedLens.price === 0) {
      await addItem(product, {
        frameColor: selectedColor,
        lensType: selectedLens.title,
        lensPrice: selectedLens.price,
        quantity: 1,
      });

      showConfirm({
        type: 'success',
        title: 'Eyewear Added to Bag',
        message: `${product.name} with ${selectedLens.title} has been added to your shopping bag.`,
        confirmText: 'View Bag',
        cancelText: 'Keep Shopping',
        onConfirm: () => navigation.navigate('Main', { screen: 'CartTab' }),
      });
    } else {
      // Powered lens requires prescription entry
      navigation.navigate('PowerPrescription', {
        product,
        selectedColor,
        selectedLens,
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <ScreenHeader title="Select Lenses" showBack={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}
      >
        {/* 1. Selected Frame Mini Summary */}
        <View style={styles.frameSummaryCard}>
          <View style={styles.summaryThumbWrapper}>
            <Image
              source={{ uri: product.image || (product.images && product.images[0]) }}
              style={styles.summaryThumb}
              resizeMode="contain"
            />
          </View>
          <View style={styles.summaryDetails}>
            <Text style={styles.summaryBrand}>{product.brand || 'The Lens Hut'}</Text>
            <Text style={styles.summaryName} numberOfLines={1}>
              {product.name}
            </Text>
            <View style={styles.summaryMetaRow}>
              <View style={styles.colorTag}>
                <Text style={styles.colorTagText}>Color: {selectedColor}</Text>
              </View>
              <Text style={styles.summaryFramePrice}>
                Frame: <Text style={styles.boldText}>{formatCurrency(product.price)}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Lens Selection Header */}
        <View style={styles.headerTitleSection}>
          <Text style={styles.sectionTitle}>Choose Your Lens Package</Text>
          <Text style={styles.sectionSubtitle}>
            Custom cut in our state-of-the-art optical laboratory with precision surfacing.
          </Text>
        </View>

        {/* 3. Lens Options Cards */}
        <View style={styles.lensList}>
          {LENS_PACKAGES.map((pkg) => {
            const isSelected = selectedLens.id === pkg.id;
            const isZeroPower = pkg.price === 0;

            return (
              <TouchableOpacity
                key={pkg.id}
                activeOpacity={0.88}
                onPress={() => setSelectedLens(pkg)}
                style={[styles.lensCard, isSelected && styles.selectedLensCard]}
              >
                <View style={styles.lensCardTopRow}>
                  <View style={styles.radioWrapper}>
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.lensTitleCol}>
                      <Text style={[styles.lensTitle, isSelected && styles.selectedLensTitle]}>
                        {pkg.title}
                      </Text>
                      {/* Plain Language Prescription Explanation */}
                      <View style={[styles.rxBadge, isZeroPower ? styles.rxBadgeZero : styles.rxBadgePower]}>
                        <Ionicons
                          name={isZeroPower ? 'checkmark-circle-outline' : 'document-text-outline'}
                          size={12}
                          color={isZeroPower ? '#059669' : '#0284C7'}
                          style={{ marginRight: 3 }}
                        />
                        <Text style={[styles.rxBadgeText, isZeroPower ? styles.rxTextZero : styles.rxTextPower]}>
                          {isZeroPower ? 'No Prescription Needed' : 'Prescription Required'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.priceBadgeContainer}>
                    <Text style={[styles.lensPriceText, isSelected && styles.selectedLensPriceText]}>
                      {isZeroPower ? 'FREE' : `+${formatCurrency(pkg.price)}`}
                    </Text>
                  </View>
                </View>

                {/* Features Checklist */}
                <View style={styles.featuresList}>
                  {pkg.features.map((feat, idx) => (
                    <View key={idx} style={styles.featureItem}>
                      <Ionicons
                        name="checkmark-circle"
                        size={15}
                        color={isSelected ? COLORS.primary : '#94A3B8'}
                      />
                      <Text style={[styles.featureText, isSelected && styles.selectedFeatureText]}>
                        {feat}
                      </Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Optical Guarantee Card */}
        <View style={styles.opticalAssuranceBox}>
          <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
          <View style={styles.opticalAssuranceTextCol}>
            <Text style={styles.opticalAssuranceTitle}>100% Prescription Accuracy Guarantee</Text>
            <Text style={styles.opticalAssuranceSubtitle}>
              Every pair undergoes rigorous dual-inspection before dispatch. Free remake if your sight isn't crystal clear.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 4. Persistent Bottom Action Area */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.priceSummaryCol}>
          <Text style={styles.totalLabel}>Total (Frame + Lenses)</Text>
          <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
        </View>

        <Button
          title={selectedLens.price === 0 ? 'Add to Bag' : 'Next: Prescription'}
          onPress={handleContinue}
          variant="primary"
          size="lg"
          rightIcon={<Ionicons name="arrow-forward" size={17} color={COLORS.surface} />}
          style={styles.continueBtn}
        />
      </View>
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
  },
  // Frame Summary Card
  frameSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  summaryThumbWrapper: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  summaryThumb: {
    width: '100%',
    height: '100%',
  },
  summaryDetails: {
    marginLeft: 12,
    flex: 1,
  },
  summaryBrand: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryName: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.secondary,
    marginTop: 1,
  },
  summaryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  colorTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  colorTagText: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
    color: COLORS.textSecondary,
  },
  summaryFramePrice: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: COLORS.textMuted,
  },
  boldText: {
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
  },
  // Header Section
  headerTitleSection: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.secondary,
  },
  sectionSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: COLORS.textMuted,
    marginTop: 3,
    lineHeight: 18,
  },
  // Lens Cards
  lensList: {
    marginBottom: 14,
  },
  lensCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  selectedLensCard: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F9FF',
  },
  lensCardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  radioWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 8,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  lensTitleCol: {
    flex: 1,
  },
  lensTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.secondary,
    lineHeight: 20,
  },
  selectedLensTitle: {
    color: COLORS.primary,
  },
  rxBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    marginTop: 5,
  },
  rxBadgeZero: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  rxBadgePower: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  rxBadgeText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
  },
  rxTextZero: {
    color: '#065F46',
  },
  rxTextPower: {
    color: '#0369A1',
  },
  priceBadgeContainer: {
    alignItems: 'flex-end',
  },
  lensPriceText: {
    fontFamily: FONTS.extraBold,
    fontSize: 15,
    color: COLORS.secondary,
  },
  selectedLensPriceText: {
    color: COLORS.primary,
  },
  featuresList: {
    marginLeft: 32,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  featureText: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginLeft: 7,
  },
  selectedFeatureText: {
    color: COLORS.secondary,
    fontFamily: FONTS.medium,
  },
  // Optical Assurance
  opticalAssuranceBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  opticalAssuranceTextCol: {
    flex: 1,
    marginLeft: 10,
  },
  opticalAssuranceTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.secondary,
  },
  opticalAssuranceSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
    color: COLORS.textMuted,
    lineHeight: 17,
    marginTop: 2,
  },
  // Persistent Bottom Action Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  priceSummaryCol: {
    marginRight: 12,
  },
  totalLabel: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  totalValue: {
    fontFamily: FONTS.extraBold,
    fontSize: 19,
    color: COLORS.secondary,
  },
  continueBtn: {
    flex: 1,
    height: 46,
  },
});

export default LensSelectionScreen;

