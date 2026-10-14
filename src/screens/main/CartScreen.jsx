import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
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
import EmptyState from '../../components/common/EmptyState';
import ScreenHeader from '../../components/common/ScreenHeader';
import useCartStore from '../../store/cartStore';
import useFeedbackStore from '../../store/feedbackStore';

export const CartScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  const items = useCartStore((state) => state.items);
  const coupon = useCartStore((state) => state.coupon);
  const discount = useCartStore((state) => state.discount);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const applyCoupon = useCartStore((state) => state.applyCoupon);
  const removeCoupon = useCartStore((state) => state.removeCoupon);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getDeliveryFee = useCartStore((state) => state.getDeliveryFee);
  const getTotal = useCartStore((state) => state.getTotal);
  const getItemCount = useCartStore((state) => state.getItemCount);

  const showToast = useFeedbackStore((state) => state.showToast);
  const showConfirm = useFeedbackStore((state) => state.showConfirm);

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();
  const itemCount = getItemCount();

  const handleApplyCoupon = () => {
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'FIRST10' || code === 'LENS10') {
      applyCoupon({ code, discountPercent: 10, maxDiscount: 500 });
      setCouponCode('');
      showToast('Coupon FIRST10 applied successfully!', 'success');
    } else if (code === 'SAVE200') {
      applyCoupon({ code, flatDiscount: 200 });
      setCouponCode('');
      showToast('Coupon SAVE200 applied successfully!', 'success');
    } else {
      setCouponError('Invalid coupon. Try FIRST10 or SAVE200');
    }
  };

  const handleRemoveItem = (item) => {
    showConfirm({
      type: 'warning',
      title: 'Remove Frame',
      message: `Are you sure you want to remove "${item.name}" from your shopping bag?`,
      confirmText: 'Remove',
      cancelText: 'Keep in Bag',
      onConfirm: () => {
        removeItem(item.key);
        showToast('Item removed from shopping bag', 'info');
      },
    });
  };

  const handleDecreaseQuantity = (item) => {
    if (item.quantity <= 1) {
      handleRemoveItem(item);
    } else {
      updateQuantity(item.key, item.quantity - 1);
    }
  };

  const handleCheckout = () => {
    navigation.navigate('Checkout');
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
        <ScreenHeader title="Shopping Bag (0)" showWishlist={true} />
        <EmptyState
          iconName="bag-outline"
          title="Your Shopping Bag is Empty"
          description="Looks like you haven't added any designer frames or lenses yet. Discover our handcrafted collection today."
          actionTitle="Explore Frames"
          onActionPress={() => navigation.navigate('Main', { screen: 'ShopTab' })}
        />
      </View>
    );
  }

  const freeShippingThreshold = 999;
  const progressRatio = Math.min(subtotal / freeShippingThreshold, 1);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <ScreenHeader
        title={`Shopping Bag (${itemCount})`}
        showWishlist={true}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Free Shipping Progress Indicator */}
        <View style={styles.shippingCard}>
          <View style={styles.shippingHeaderRow}>
            <View style={styles.shippingIconTitleRow}>
              <Ionicons
                name={subtotal >= freeShippingThreshold ? 'checkmark-circle' : 'cube-outline'}
                size={18}
                color={subtotal >= freeShippingThreshold ? '#10B981' : COLORS.primary}
              />
              <Text style={styles.shippingTitle}>
                {subtotal >= freeShippingThreshold
                  ? 'Congratulations! You qualified for Free Shipping'
                  : `Add ${formatCurrency(freeShippingThreshold - subtotal)} more for Free Shipping`}
              </Text>
            </View>
            <Text style={styles.shippingTarget}>₹999</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressRatio * 100}%` }]} />
          </View>
        </View>

        {/* Items List */}
        <View style={styles.itemsList}>
          {items.map((item) => {
            const unitPrice = item.unitPrice || item.price + (item.lensPrice || 0);
            const lineTotal = unitPrice * item.quantity;

            return (
              <View key={item.key} style={styles.cartItemCard}>
                <View style={styles.itemImageContainer}>
                  <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="contain" />
                </View>

                <View style={styles.itemInfo}>
                  <View style={styles.itemNameRow}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveItem(item)}
                      style={styles.trashBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={17} color="#EF4444" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.itemOptionsContainer}>
                    <View style={styles.colorPill}>
                      <Text style={styles.colorPillText}>Color: {item.frameColor || 'Standard'}</Text>
                    </View>
                    {item.configuration?.contactLens ? (
                      <Text style={styles.lensDescText} numberOfLines={1}>
                        {item.configuration.contactLens.boxes || 1} Box{item.configuration.contactLens.boxes > 1 ? 'es' : ''} · {item.configuration.contactLens.od?.sph ? `OD ${item.configuration.contactLens.od.sph}` : 'Prescription Verified'}
                      </Text>
                    ) : (
                      <Text style={styles.lensDescText} numberOfLines={1}>
                        Lens: {item.lensType || 'Frame Only'}
                      </Text>
                    )}
                  </View>

                  <View style={styles.itemBottomRow}>
                    <View style={styles.priceCol}>
                      <Text style={styles.lineTotalText}>{formatCurrency(lineTotal)}</Text>
                      {item.quantity > 1 && (
                        <Text style={styles.unitPriceText}>{formatCurrency(unitPrice)} each</Text>
                      )}
                    </View>

                    {/* Quantity Stepper */}
                    <View style={styles.stepperContainer}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => handleDecreaseQuantity(item)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name={item.quantity === 1 ? 'trash-outline' : 'remove'} size={15} color={item.quantity === 1 ? '#EF4444' : COLORS.secondary} />
                      </TouchableOpacity>
                      <Text style={styles.stepperText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => updateQuantity(item.key, item.quantity + 1)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="add" size={15} color={COLORS.secondary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Promo Coupon Box */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionCardTitle}>Have a Coupon Code?</Text>
          {coupon ? (
            <View style={styles.appliedCouponRow}>
              <View style={styles.couponTag}>
                <Ionicons name="pricetag" size={16} color="#059669" />
                <Text style={styles.couponTagText}>{coupon.code} Applied</Text>
              </View>
              <TouchableOpacity onPress={removeCoupon} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                <Text style={styles.removeCouponText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={styles.couponInputRow}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Enter code (e.g. FIRST10, SAVE200)"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="characters"
                  value={couponCode}
                  onChangeText={(val) => {
                    setCouponCode(val);
                    if (couponError) setCouponError('');
                  }}
                />
                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={handleApplyCoupon}
                  activeOpacity={0.8}
                >
                  <Text style={styles.applyBtnText}>Apply</Text>
                </TouchableOpacity>
              </View>
              {couponError ? (
                <Text style={styles.couponErrorText}>{couponError}</Text>
              ) : null}
            </View>
          )}
        </View>

        {/* Price Breakdown */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionCardTitle}>Order Summary</Text>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Bag Subtotal</Text>
            <Text style={styles.breakdownValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Estimated Delivery</Text>
            <Text
              style={[
                styles.breakdownValue,
                deliveryFee === 0 && { color: '#059669', fontFamily: FONTS.semiBold },
              ]}
            >
              {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
            </Text>
          </View>
          {discount > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Coupon Discount</Text>
              <Text style={[styles.breakdownValue, { color: '#059669', fontFamily: FONTS.semiBold }]}>
                -{formatCurrency(discount)}
              </Text>
            </View>
          )}
          <View style={styles.breakdownDivider} />
          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.taxSubText}>Inclusive of all taxes</Text>
            </View>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Persistent Bottom Checkout Bar with Safe Area */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomBarSubtotalLabel}>Total Payable</Text>
          <Text style={styles.bottomBarTotal}>{formatCurrency(total)}</Text>
        </View>

        <Button
          title="Proceed to Checkout"
          onPress={handleCheckout}
          variant="primary"
          size="lg"
          rightIcon={<Ionicons name="arrow-forward" size={17} color={COLORS.surface} />}
          style={styles.checkoutBtn}
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
  emptyContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    padding: 16,
  },
  // Shipping Progress
  shippingCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 14,
  },
  shippingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shippingIconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  shippingTitle: {
    fontFamily: FONTS.medium,
    fontSize: 12.5,
    color: COLORS.secondary,
    marginLeft: 6,
    flex: 1,
  },
  shippingTarget: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.primary,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#E0F2FE',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  // Item Cards
  itemsList: {
    marginBottom: 14,
  },
  cartItemCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
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
  itemImageContainer: {
    width: 84,
    height: 84,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    flex: 1,
    fontFamily: FONTS.semiBold,
    fontSize: 14.5,
    color: COLORS.secondary,
    marginRight: 6,
  },
  trashBtn: {
    padding: 2,
  },
  itemOptionsContainer: {
    marginVertical: 4,
  },
  colorPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 3,
  },
  colorPillText: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
    color: COLORS.textSecondary,
  },
  lensDescText: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
    color: COLORS.textMuted,
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceCol: {
    flexDirection: 'column',
  },
  lineTotalText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.secondary,
  },
  unitPriceText: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 3,
    paddingVertical: 2,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  stepperText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13.5,
    color: COLORS.secondary,
    paddingHorizontal: 10,
  },
  // Section Cards
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionCardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14.5,
    color: COLORS.secondary,
    marginBottom: 12,
  },
  couponInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textPrimary,
    backgroundColor: '#F8FAFC',
  },
  applyBtn: {
    backgroundColor: COLORS.secondary,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  applyBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.surface,
  },
  couponErrorText: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
    color: COLORS.error,
    marginTop: 6,
  },
  appliedCouponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 12,
    borderRadius: 10,
  },
  couponTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponTagText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: '#065F46',
    marginLeft: 8,
  },
  removeCouponText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: '#EF4444',
  },
  // Breakdown
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 9,
  },
  breakdownLabel: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  breakdownValue: {
    fontFamily: FONTS.medium,
    fontSize: 13.5,
    color: COLORS.secondary,
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  totalLabel: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.secondary,
  },
  taxSubText: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  totalValue: {
    fontFamily: FONTS.extraBold,
    fontSize: 19,
    color: COLORS.primary,
  },
  // Sticky Bottom Bar
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
  bottomPriceCol: {
    marginRight: 12,
  },
  bottomBarSubtotalLabel: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  bottomBarTotal: {
    fontFamily: FONTS.extraBold,
    fontSize: 19,
    color: COLORS.secondary,
  },
  checkoutBtn: {
    flex: 1,
    height: 46,
  },
});

export default CartScreen;

