import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import LAYOUT from '../../constants/layout';
import formatCurrency from '../../utils/formatCurrency';
import Button from '../../components/common/Button';
import useFeedbackStore from '../../store/feedbackStore';

export const OrderSuccessScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { order } = route.params;
  const showToast = useFeedbackStore((state) => state.showToast);

  const orderNumber = order?.orderNumber || order?.id || 'LH-CONFIRMED';

  const handleCopyOrderId = () => {
    showToast(`Order ID ${orderNumber} copied to clipboard`, 'success');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Celebratory Checkmark Icon */}
        <View style={styles.successIconCircle}>
          <View style={styles.innerSuccessCircle}>
            <Ionicons name="checkmark-done" size={44} color="#059669" />
          </View>
        </View>

        <Text style={styles.title}>Order Confirmed!</Text>
        <Text style={styles.subtitle}>
          Thank you for trusting The Lens Hut. Your order has been placed successfully and our master opticians are preparing your custom eyewear.
        </Text>

        {/* Order Reference Badge Card */}
        <View style={styles.orderRefCard}>
          <View style={styles.orderRefInfo}>
            <Text style={styles.orderRefLabel}>ORDER REFERENCE</Text>
            <Text style={styles.orderRefNumber}>{orderNumber}</Text>
          </View>
          <TouchableOpacity
            style={styles.copyBtn}
            onPress={handleCopyOrderId}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="copy-outline" size={16} color={COLORS.primary} />
            <Text style={styles.copyBtnText}>Copy</Text>
          </TouchableOpacity>
        </View>

        {/* Order Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionHeading}>Order Details</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Mode</Text>
            <View style={styles.codBadge}>
              <Ionicons name="cash-outline" size={13} color="#065F46" style={{ marginRight: 4 }} />
              <Text style={styles.codBadgeText}>{order?.paymentMethod || 'Cash on Delivery'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Payable Amount</Text>
            <Text style={styles.totalValue}>{formatCurrency(order?.total || 0)}</Text>
          </View>

          <View style={styles.divider} />

          {/* Delivery Address Details */}
          <Text style={styles.addressHeading}>Delivering To:</Text>
          <Text style={styles.recipientName}>{order?.shippingAddress?.fullName || 'Customer'}</Text>
          <Text style={styles.addressLine}>
            {order?.shippingAddress?.street}
            {order?.shippingAddress?.locality ? `, ${order.shippingAddress.locality}` : ''}
          </Text>
          <Text style={styles.addressLine}>
            {order?.shippingAddress?.city}, {order?.shippingAddress?.state} - {order?.shippingAddress?.pincode}
          </Text>
          <Text style={styles.addressPhone}>
            <Ionicons name="call-outline" size={13} color={COLORS.textMuted} /> {order?.shippingAddress?.phone}
          </Text>
        </View>

        {/* Delivery Estimate Box */}
        <View style={styles.deliveryEstimateBox}>
          <View style={styles.estimateIconCircle}>
            <Ionicons name="cube-outline" size={22} color={COLORS.primary} />
          </View>
          <View style={styles.estimateTextCol}>
            <Text style={styles.estimateTitle}>Insured Doorstep Delivery</Text>
            <Text style={styles.estimateSubtitle}>
              Expected within 3 to 5 business days with live courier tracking updates via SMS.
            </Text>
          </View>
        </View>

        {/* Primary Actions Group */}
        <View style={styles.actionsGroup}>
          <Button
            title="View Order Details"
            onPress={() => navigation.replace('OrderDetail', { order })}
            variant="primary"
            size="lg"
            rightIcon={<Ionicons name="receipt-outline" size={18} color={COLORS.surface} />}
            style={styles.actionBtn}
          />

          <Button
            title="Continue Shopping"
            onPress={() => navigation.replace('Main', { screen: 'ShopTab' })}
            variant="outline"
            size="lg"
            rightIcon={<Ionicons name="arrow-forward" size={17} color={COLORS.secondary} />}
            style={styles.actionBtn}
          />
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
    alignItems: 'center',
    paddingTop: 28,
  },
  successIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#A7F3D0',
  },
  innerSuccessCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 23,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  // Order Ref Card
  orderRefCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 16,
  },
  orderRefInfo: {
    flex: 1,
  },
  orderRefLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 10.5,
    color: COLORS.primary,
    letterSpacing: 0.8,
  },
  orderRefNumber: {
    fontFamily: FONTS.extraBold,
    fontSize: 17,
    color: COLORS.secondary,
    marginTop: 2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  copyBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 4,
  },
  // Card Details
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
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
  cardSectionHeading: {
    fontFamily: FONTS.bold,
    fontSize: 14.5,
    color: COLORS.secondary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  infoLabel: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  codBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  codBadgeText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#065F46',
  },
  totalValue: {
    fontFamily: FONTS.extraBold,
    fontSize: 16,
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  addressHeading: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  recipientName: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: 2,
  },
  addressLine: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  addressPhone: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  // Delivery Estimate Box
  deliveryEstimateBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  estimateIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  estimateTextCol: {
    marginLeft: 12,
    flex: 1,
  },
  estimateTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 13.5,
    color: COLORS.secondary,
  },
  estimateSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
    color: COLORS.textMuted,
    lineHeight: 16,
    marginTop: 2,
  },
  // Actions
  actionsGroup: {
    width: '100%',
  },
  actionBtn: {
    width: '100%',
    marginBottom: 10,
    height: 48,
  },
});

export default OrderSuccessScreen;

