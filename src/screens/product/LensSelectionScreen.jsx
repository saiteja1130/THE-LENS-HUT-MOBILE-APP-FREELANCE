import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import LAYOUT from '../../constants/layout';
import formatCurrency from '../../utils/formatCurrency';
import Button from '../../components/common/Button';
import { LENS_PACKAGES } from '../../constants/lensPackages';
import useCartStore from '../../store/cartStore';
import useFeedbackStore from '../../store/feedbackStore';

export const LensSelectionScreen = ({ route, navigation }) => {
  const { product, selectedColor } = route.params;
  const [selectedLens, setSelectedLens] = useState(LENS_PACKAGES[0]);

  const addItem = useCartStore((state) => state.addItem);
  const showConfirm = useFeedbackStore((state) => state.showConfirm);

  const totalAmount = product.price + selectedLens.price;

  const handleContinue = async () => {
    // If Zero Power, can add directly to cart
    if (selectedLens.price === 0) {
      await addItem(product, {
        frameColor: selectedColor,
        lensType: selectedLens.title,
        lensPrice: selectedLens.price,
        quantity: 1,
      });

      showConfirm({
        type: 'success',
        title: 'Added to Bag',
        message: `${product.name} with ${selectedLens.title} has been added to your shopping bag.`,
        confirmText: 'Go to Bag',
        cancelText: 'Keep Shopping',
        onConfirm: () => navigation.navigate('CartTab'),
      });
    } else {
      // Powered lens requires prescription
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
      <ScreenHeader title="Select Lens Package" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Selected Frame Mini Summary */}
        <View style={styles.frameSummaryCard}>
          <Image
            source={{ uri: product.image || (product.images && product.images[0]) }}
            style={styles.summaryThumb}
          />
          <View style={styles.summaryDetails}>
            <Text style={styles.summaryName} numberOfLines={1}>
              {product.name}
            </Text>
            <Text style={styles.summaryColor}>Color: {selectedColor}</Text>
            <Text style={styles.summaryFramePrice}>
              Frame: {formatCurrency(product.price)}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Choose Your Lens Type</Text>
        <Text style={styles.sectionSubtitle}>
          All our precision optical lenses include anti-scratch and UV protection coatings.
        </Text>

        {/* Lens Options Cards */}
        <View style={styles.lensList}>
          {LENS_PACKAGES.map((pkg) => {
            const isSelected = selectedLens.id === pkg.id;
            return (
              <TouchableOpacity
                key={pkg.id}
                activeOpacity={0.88}
                onPress={() => setSelectedLens(pkg)}
                style={[styles.lensCard, isSelected && styles.selectedLensCard]}
              >
                <View style={styles.lensCardHeader}>
                  <View style={styles.radioWrapper}>
                    <View
                      style={[
                        styles.radioOuter,
                        isSelected && styles.radioOuterSelected,
                      ]}
                    >
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <Text
                      style={[
                        styles.lensTitle,
                        isSelected && styles.selectedLensTitle,
                      ]}
                    >
                      {pkg.title}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.lensPriceText,
                      isSelected && styles.selectedLensPriceText,
                    ]}
                  >
                    {pkg.price === 0 ? 'FREE' : `+${formatCurrency(pkg.price)}`}
                  </Text>
                </View>

                <View style={styles.featuresList}>
                  {pkg.features.map((feat, idx) => (
                    <View key={idx} style={styles.featureItem}>
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color={isSelected ? COLORS.primary : COLORS.textMuted}
                      />
                      <Text style={styles.featureText}>{feat}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky Bottom Total Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>Total (Frame + Lens)</Text>
          <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
        </View>

        <Button
          title={selectedLens.price === 0 ? 'Add to Bag' : 'Next: Prescription'}
          onPress={handleContinue}
          variant="primary"
          size="lg"
          rightIcon={<Ionicons name="arrow-forward" size={18} color={COLORS.surface} />}
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
    paddingBottom: 100,
  },
  frameSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: LAYOUT.radius.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 20,
    ...LAYOUT.shadows.sm,
  },
  summaryThumb: {
    width: 60,
    height: 60,
    borderRadius: LAYOUT.radius.sm,
    backgroundColor: '#F8F9FA',
  },
  summaryDetails: {
    marginLeft: 12,
    flex: 1,
  },
  summaryName: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.secondary,
  },
  summaryColor: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  summaryFramePrice: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.primary,
    marginTop: 2,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.secondary,
  },
  sectionSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  lensList: {
    marginBottom: 16,
  },
  lensCard: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...LAYOUT.shadows.sm,
  },
  selectedLensCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryUltraLight,
  },
  lensCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  radioWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  lensTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.secondary,
    flex: 1,
  },
  selectedLensTitle: {
    color: COLORS.primary,
  },
  lensPriceText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.secondary,
  },
  selectedLensPriceText: {
    color: COLORS.primary,
  },
  featuresList: {
    marginLeft: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  featureText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 76,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    ...LAYOUT.shadows.lg,
  },
  totalLabel: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  totalValue: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.secondary,
  },
  continueBtn: {
    minWidth: 180,
  },
});

export default LensSelectionScreen;
