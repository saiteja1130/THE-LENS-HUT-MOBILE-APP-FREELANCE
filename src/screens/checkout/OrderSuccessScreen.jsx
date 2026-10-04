import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import LAYOUT from '../../constants/layout';
import formatCurrency from '../../utils/formatCurrency';
import Button from '../../components/common/Button';

export const OrderSuccessScreen = ({ route, navigation }) => {
  const { order } = route.params;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.successIconCircle}>
          <Ionicons name="checkmark-done" size={54} color={COLORS.success} />
        </View>

        <Text style={styles.title}>Order Placed Successfully!</Text>
        <Text style={styles.subtitle}>
          Thank you for choosing The Lens Hut. Your order is confirmed and our optical laboratory will begin assembling your frames.
        </Text>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order Reference ID</Text>
            <Text style={styles.orderIdText}>{order.id}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Mode</Text>
            <Text style={styles.infoValue}>{order.paymentMethod}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.addressHeading}>Delivering to:</Text>
          <Text style={styles.recipientName}>{order.shippingAddress?.fullName}</Text>
          <Text style={styles.addressLine}>
            {order.shippingAddress?.street}
            {order.shippingAddress?.locality ? `, ${order.shippingAddress?.locality}` : ''}
          </Text>
          <Text style={styles.addressLine}>
            {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
          </Text>
          <Text style={styles.addressPhone}>Phone: {order.shippingAddress?.phone}</Text>
        </View>

        <View style={styles.deliveryEstimateBox}>
          <Ionicons name="airplane-outline" size={24} color={COLORS.secondary} />
          <View style={styles.estimateTextCol}>
            <Text style={styles.estimateTitle}>Estimated Delivery</Text>
            <Text style={styles.estimateSubtitle}>3 to 5 business days with insured courier tracking</Text>
          </View>
        </View>

        <View style={styles.actionsGroup}>
          <Button
            title="View Order Details"
            onPress={() => navigation.replace('OrderDetail', { order })}
            variant="primary"
            size="lg"
            style={styles.actionBtn}
          />

          <Button
            title="Continue Shopping"
            onPress={() => navigation.replace('Main')}
            variant="outline"
            size="md"
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
    padding: 24,
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 40,
  },
  successIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(5, 150, 105, 0.2)',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 20,
    ...LAYOUT.shadows.sm,
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
  orderIdText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.secondary,
  },
  infoValue: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.secondary,
  },
  totalValue: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 12,
  },
  addressHeading: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  recipientName: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: 2,
  },
  addressLine: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  addressPhone: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  deliveryEstimateBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.borderLight,
    padding: 14,
    borderRadius: LAYOUT.radius.md,
    marginBottom: 24,
  },
  estimateTextCol: {
    marginLeft: 12,
    flex: 1,
  },
  estimateTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.secondary,
  },
  estimateSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionsGroup: {
    width: '100%',
  },
  actionBtn: {
    marginBottom: 12,
  },
});

export default OrderSuccessScreen;
