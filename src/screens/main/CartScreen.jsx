import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import LAYOUT from '../../constants/layout';
import formatCurrency from '../../utils/formatCurrency';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import ScreenHeader from '../../components/common/ScreenHeader';
import useCartStore from '../../store/cartStore';

export const CartScreen = ({ navigation }) => {
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

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();

  const handleApplyCoupon = () => {
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'FIRST10' || code === 'LENS10') {
      applyCoupon({ code, discountPercent: 10, maxDiscount: 500 });
      setCouponCode('');
    } else if (code === 'SAVE200') {
      applyCoupon({ code, flatDiscount: 200 });
      setCouponCode('');
    } else {
      setCouponError('Invalid coupon code. Try FIRST10 or SAVE200');
    }
  };

  const handleCheckout = () => {
    navigation.navigate('Checkout');
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
        <ScreenHeader title="Shopping Bag" showWishlist={true} />
        <EmptyState
          iconName="cart-outline"
          title="Your Shopping Bag is Empty"
          description="Looks like you haven't added any designer frames or lenses yet. Discover our premium collection today."
          actionTitle="Explore Frames"
          onActionPress={() => navigation.navigate('ShopTab')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <ScreenHeader
        title={`Shopping Bag (${items.length})`}
        showWishlist={true}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Items List */}
        <View style={styles.itemsList}>
          {items.map((item) => (
            <View key={item.key} style={styles.cartItemCard}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />

              <View style={styles.itemInfo}>
                <View style={styles.itemNameRow}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeItem(item.key)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.itemOptionText}>Color: {item.frameColor}</Text>
                {item.configuration?.contactLens ? (
                  <Text style={styles.itemOptionText} numberOfLines={1}>
                    {item.configuration.contactLens.boxes || 1} Box{item.configuration.contactLens.boxes > 1 ? 'es' : ''} · {item.configuration.contactLens.od?.sph ? `OD ${item.configuration.contactLens.od.sph}` : 'Powers confirmed'}
                  </Text>
                ) : (
                  <Text style={styles.itemOptionText} numberOfLines={1}>
                    Lens: {item.lensType}
                  </Text>
                )}

                <View style={styles.itemBottomRow}>
                  <Text style={styles.itemPrice}>
                    {formatCurrency((item.unitPrice || item.price + (item.lensPrice || 0)) * item.quantity)}
                  </Text>

                  {/* Quantity Stepper */}
                  <View style={styles.stepperContainer}>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => updateQuantity(item.key, item.quantity - 1)}
                    >
                      <Ionicons name="remove" size={16} color={COLORS.secondary} />
                    </TouchableOpacity>
                    <Text style={styles.stepperText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => updateQuantity(item.key, item.quantity + 1)}
                    >
                      <Ionicons name="add" size={16} color={COLORS.secondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Promo Coupon Box */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionCardTitle}>Have a Coupon Code?</Text>
          {coupon ? (
            <View style={styles.appliedCouponRow}>
              <View style={styles.couponTag}>
                <Ionicons name="pricetag" size={16} color={COLORS.success} />
                <Text style={styles.couponTagText}>{coupon.code} Applied</Text>
              </View>
              <TouchableOpacity onPress={removeCoupon}>
                <Text style={styles.removeCouponText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={styles.couponInputRow}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Enter coupon code (e.g. FIRST10)"
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

        {/* Free Shipping Progress */}
        <View style={styles.shippingNoticeBox}>
          <Ionicons
            name={subtotal >= 999 ? 'checkmark-circle' : 'information-circle'}
            size={20}
            color={subtotal >= 999 ? COLORS.success : COLORS.info}
          />
          <Text style={styles.shippingNoticeText}>
            {subtotal >= 999
              ? 'You have qualified for FREE Shipping!'
              : `Add ${formatCurrency(999 - subtotal)} more for FREE Shipping.`}
          </Text>
        </View>

        {/* Price Breakdown */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionCardTitle}>Price Breakdown</Text>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Subtotal</Text>
            <Text style={styles.breakdownValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Delivery Fee</Text>
            <Text
              style={[
                styles.breakdownValue,
                deliveryFee === 0 && { color: COLORS.success },
              ]}
            >
              {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
            </Text>
          </View>
          {discount > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Coupon Discount</Text>
              <Text style={[styles.breakdownValue, { color: COLORS.success }]}>
                -{formatCurrency(discount)}
              </Text>
            </View>
          )}
          <View style={styles.breakdownDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomBarSubtotalLabel}>Total Amount</Text>
          <Text style={styles.bottomBarTotal}>{formatCurrency(total)}</Text>
        </View>

        <Button
          title="Proceed to Checkout"
          onPress={handleCheckout}
          variant="primary"
          size="lg"
          rightIcon={<Ionicons name="arrow-forward" size={18} color={COLORS.surface} />}
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
  topBar: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  topBarTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.secondary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  itemsList: {
    marginBottom: 16,
  },
  cartItemCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.md,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...LAYOUT.shadows.sm,
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: LAYOUT.radius.sm,
    backgroundColor: '#F8F9FA',
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
    fontSize: 14,
    color: COLORS.secondary,
    marginRight: 8,
  },
  itemOptionText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  itemPrice: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.secondary,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.borderLight,
    borderRadius: LAYOUT.radius.round,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.secondary,
    paddingHorizontal: 8,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.md,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...LAYOUT.shadows.sm,
  },
  sectionCardTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
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
    borderColor: COLORS.border,
    borderRadius: LAYOUT.radius.sm,
    paddingHorizontal: 12,
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  applyBtn: {
    backgroundColor: COLORS.secondary,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: LAYOUT.radius.sm,
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
    fontSize: 12,
    color: COLORS.error,
    marginTop: 6,
  },
  appliedCouponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.successLight,
    padding: 12,
    borderRadius: LAYOUT.radius.sm,
  },
  couponTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponTagText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.success,
    marginLeft: 8,
  },
  removeCouponText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.error,
  },
  shippingNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: LAYOUT.radius.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 16,
  },
  shippingNoticeText: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 10,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  breakdownLabel: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  breakdownValue: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.secondary,
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.secondary,
  },
  totalValue: {
    fontFamily: FONTS.extraBold,
    fontSize: 18,
    color: COLORS.primary,
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
    paddingHorizontal: 20,
    ...LAYOUT.shadows.lg,
  },
  bottomBarSubtotalLabel: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  bottomBarTotal: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.secondary,
  },
  checkoutBtn: {
    minWidth: 190,
  },
});

export default CartScreen;
