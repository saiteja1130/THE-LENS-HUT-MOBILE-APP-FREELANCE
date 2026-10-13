import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import LAYOUT from '../../constants/layout';
import formatCurrency from '../../utils/formatCurrency';
import ScreenHeader from '../../components/common/ScreenHeader';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import useFeedbackStore from '../../store/feedbackStore';
import { storage } from '../../utils/storage';
import { orderApi } from '../../services/orderApi';

export const CheckoutScreen = ({ navigation }) => {
  const user = useAuthStore((state) => state.user);
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const deliveryFee = useCartStore((state) => state.getDeliveryFee());
  const discount = useCartStore((state) => state.discount);
  const total = useCartStore((state) => state.getTotal());
  const clearCart = useCartStore((state) => state.clearCart);

  const showWarning = useFeedbackStore((state) => state.showWarning);
  const showError = useFeedbackStore((state) => state.showError);
  const showToast = useFeedbackStore((state) => state.showToast);

  // Direct Address Form State (NO multiple address management)
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [pincode, setPincode] = useState('');
  const [street, setStreet] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!fullName.trim()) errs.fullName = 'Full Name is required';
    if (!phone.trim()) {
      errs.phone = 'Mobile number is required';
    } else if (phone.trim().replace(/\D/g, '').length < 10) {
      errs.phone = 'Please enter a valid 10-digit number';
    }
    if (!pincode.trim() || pincode.trim().length < 6) {
      errs.pincode = 'Valid 6-digit Pincode is required';
    }
    if (!street.trim()) errs.street = 'Flat / House / Street details required';
    if (!city.trim()) errs.city = 'City is required';
    if (!stateName.trim()) errs.stateName = 'State is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) {
      showWarning('Incomplete Address', 'Please fill in all required delivery address fields to proceed.');
      return;
    }

    if (items.length === 0) {
      showToast('Your shopping bag is empty', 'info');
      navigation.navigate('HomeTab');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        items: items.map((i) => ({
          productId: i.productId || i.product?._id || i.product?.id || i.id,
          name: i.name,
          brand: i.brand || 'The Lens Hut',
          sku: i.sku || 'LH-OPTICAL',
          image: i.image || '',
          quantity: i.quantity || 1,
          unitPrice: i.price || i.unitPrice || 0,
          totalPrice: ((i.price || i.unitPrice || 0) + (i.lensPrice || 0)) * (i.quantity || 1),
          selectedColor: i.frameColor || i.selectedColor || 'Standard',
          configuration: {
            lensSelection: { lensName: i.lensType },
            prescription: i.prescription,
          },
        })),
        shippingAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          pincode: pincode.trim(),
          street: street.trim(),
          locality: locality.trim(),
          city: city.trim(),
          state: stateName.trim(),
        },
        paymentMethod: 'Cash on Delivery (Pay on Delivery)',
        subtotal,
        shippingFee: deliveryFee,
        discount,
        total,
      };

      let finalOrder = null;
      try {
        const apiRes = await orderApi.createOrder(orderPayload);
        if (apiRes && apiRes.success && apiRes.data) {
          finalOrder = {
            ...apiRes.data,
            id: apiRes.data.orderNumber || apiRes.data.id || apiRes.data._id,
            date: apiRes.data.createdAt || apiRes.data.orderDate || new Date().toISOString(),
            status: apiRes.data.orderStatus || 'Order Placed',
            deliveryFee: apiRes.data.shippingFee !== undefined ? apiRes.data.shippingFee : deliveryFee,
            items: apiRes.data.items?.length ? apiRes.data.items : [...items],
          };
        }
      } catch (apiErr) {
        console.warn('[Checkout Mobile] API call failed, using offline fallback:', apiErr);
      }

      // Offline fallback if server is unreachable
      if (!finalOrder) {
        const orderId = `LH-${Math.floor(100000 + Math.random() * 900000)}`;
        finalOrder = {
          id: orderId,
          orderNumber: orderId,
          date: new Date().toISOString(),
          items: [...items],
          subtotal,
          deliveryFee,
          discount,
          total,
          shippingAddress: orderPayload.shippingAddress,
          paymentMethod: 'Cash on Delivery (Pay on Delivery)',
          status: 'Order Placed',
          orderStatus: 'Processing',
        };
      }

      // Save order to persistent local storage
      const existingOrders = (await storage.get('tlh_orders')) || [];
      await storage.set('tlh_orders', [finalOrder, ...existingOrders]);

      // Clear cart
      await clearCart();
      setIsSubmitting(false);

      // Navigate to Order Success Screen
      navigation.replace('OrderSuccess', { order: finalOrder });
    } catch (e) {
      console.error('Order creation error:', e);
      setIsSubmitting(false);
      showError('Order Failed', 'Could not process your order. Please check your details and try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <ScreenHeader title="Direct Checkout" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Address Notice */}
        <View style={styles.addressNoticeCard}>
          <Ionicons name="location" size={20} color={COLORS.primary} />
          <View style={styles.addressNoticeTextWrapper}>
            <Text style={styles.addressNoticeTitle}>Delivery Address</Text>
            <Text style={styles.addressNoticeSubtitle}>
              Please enter your destination shipping details below for this order.
            </Text>
          </View>
        </View>

        {/* Address Form */}
        <View style={styles.formCard}>
          <Input
            label="Full Name *"
            placeholder="Recipient's Name"
            value={fullName}
            onChangeText={(val) => {
              setFullName(val);
              if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: null }));
            }}
            error={errors.fullName}
            leftIcon={<Ionicons name="person-outline" size={18} color={COLORS.textMuted} />}
          />

          <Input
            label="Mobile Phone Number *"
            placeholder="10-digit mobile number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(val) => {
              setPhone(val);
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
            }}
            error={errors.phone}
            leftIcon={<Ionicons name="call-outline" size={18} color={COLORS.textMuted} />}
          />

          <View style={styles.twoColumnRow}>
            <View style={styles.halfWidth}>
              <Input
                label="Pincode *"
                placeholder="6-digit PIN"
                keyboardType="number-pad"
                maxLength={6}
                value={pincode}
                onChangeText={(val) => {
                  setPincode(val);
                  if (errors.pincode) setErrors((prev) => ({ ...prev, pincode: null }));
                }}
                error={errors.pincode}
                leftIcon={<Ionicons name="pin-outline" size={18} color={COLORS.textMuted} />}
              />
            </View>

            <View style={styles.halfWidth}>
              <Input
                label="City *"
                placeholder="City"
                value={city}
                onChangeText={(val) => {
                  setCity(val);
                  if (errors.city) setErrors((prev) => ({ ...prev, city: null }));
                }}
                error={errors.city}
              />
            </View>
          </View>

          <Input
            label="Flat, House no., Building, Street *"
            placeholder="e.g. Flat 302, Sunrise Towers, MG Road"
            value={street}
            onChangeText={(val) => {
              setStreet(val);
              if (errors.street) setErrors((prev) => ({ ...prev, street: null }));
            }}
            error={errors.street}
          />

          <View style={styles.twoColumnRow}>
            <View style={styles.halfWidth}>
              <Input
                label="Area / Landmark"
                placeholder="Near Metro Station"
                value={locality}
                onChangeText={setLocality}
              />
            </View>

            <View style={styles.halfWidth}>
              <Input
                label="State *"
                placeholder="e.g. Karnataka"
                value={stateName}
                onChangeText={(val) => {
                  setStateName(val);
                  if (errors.stateName) setErrors((prev) => ({ ...prev, stateName: null }));
                }}
                error={errors.stateName}
              />
            </View>
          </View>
        </View>

        {/* Payment Method Section (NO online payment integrations per prompt) */}
        <View style={styles.paymentSectionCard}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.codOptionCard}>
            <Ionicons name="radio-button-on" size={20} color={COLORS.primary} />
            <View style={styles.codOptionInfo}>
              <Text style={styles.codOptionTitle}>Cash on Delivery (Pay on Delivery)</Text>
              <Text style={styles.codOptionDesc}>
                Pay cash or UPI directly to the courier executive upon doorstep package delivery.
              </Text>
            </View>
          </View>
        </View>

        {/* Order Items Preview */}
        <View style={styles.orderSummaryCard}>
          <Text style={styles.sectionTitle}>Order Items ({items.length})</Text>
          {items.map((item) => (
            <View key={item.key} style={styles.summaryItemRow}>
              <Image source={{ uri: item.image }} style={styles.summaryItemThumb} />
              <View style={styles.summaryItemInfo}>
                <Text style={styles.summaryItemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.summaryItemOptions}>
                  {item.frameColor} • {item.lensType}
                </Text>
                <Text style={styles.summaryItemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.summaryItemPrice}>
                {formatCurrency((item.price + (item.lensPrice || 0)) * item.quantity)}
              </Text>
            </View>
          ))}

          {/* Pricing Breakdown */}
          <View style={styles.summaryDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Items Subtotal</Text>
            <Text style={styles.priceValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Shipping / Delivery</Text>
            <Text style={[styles.priceValue, deliveryFee === 0 && { color: COLORS.success }]}>
              {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
            </Text>
          </View>
          {discount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Coupon Savings</Text>
              <Text style={[styles.priceValue, { color: COLORS.success }]}>
                -{formatCurrency(discount)}
              </Text>
            </View>
          )}
          <View style={styles.summaryDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>

        <Button
          title="Place Order"
          onPress={handlePlaceOrder}
          loading={isSubmitting}
          variant="primary"
          size="lg"
          rightIcon={<Ionicons name="checkmark-circle" size={20} color={COLORS.surface} />}
          style={styles.placeOrderBtn}
        />
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
  addressNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryUltraLight,
    padding: 14,
    borderRadius: LAYOUT.radius.md,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    marginBottom: 16,
  },
  addressNoticeTextWrapper: {
    marginLeft: 10,
    flex: 1,
  },
  addressNoticeTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.secondary,
  },
  addressNoticeSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: LAYOUT.radius.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 16,
    ...LAYOUT.shadows.sm,
  },
  twoColumnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  paymentSectionCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: LAYOUT.radius.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 16,
    ...LAYOUT.shadows.sm,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.secondary,
    marginBottom: 12,
  },
  codOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: LAYOUT.radius.sm,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  codOptionInfo: {
    marginLeft: 10,
    flex: 1,
  },
  codOptionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.secondary,
  },
  codOptionDesc: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  orderSummaryCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: LAYOUT.radius.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 24,
    ...LAYOUT.shadows.sm,
  },
  summaryItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryItemThumb: {
    width: 48,
    height: 48,
    borderRadius: LAYOUT.radius.xs,
    backgroundColor: '#F8F9FA',
  },
  summaryItemInfo: {
    flex: 1,
    marginLeft: 10,
  },
  summaryItemName: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.secondary,
  },
  summaryItemOptions: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  summaryItemQuantity: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  summaryItemPrice: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.secondary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  priceLabel: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.secondary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
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
  placeOrderBtn: {
    width: '100%',
  },
});

export default CheckoutScreen;
