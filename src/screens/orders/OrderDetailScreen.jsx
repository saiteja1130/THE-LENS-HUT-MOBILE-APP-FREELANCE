import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import LAYOUT from '../../constants/layout';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';
import ScreenHeader from '../../components/common/ScreenHeader';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const ORDER_STEPS = [
  { key: 'placed', label: 'Order Placed', desc: 'Received & verified' },
  { key: 'lab', label: 'Lens Fitting', desc: 'Crafting precision optics in lab' },
  { key: 'shipped', label: 'Dispatched', desc: 'With express delivery partner' },
  { key: 'delivered', label: 'Delivered', desc: 'Delivered to your doorstep' },
];

export const OrderDetailScreen = ({ route, navigation }) => {
  const { order } = route.params;

  const getActiveStepIndex = () => {
    const s = order.status?.toLowerCase() || '';
    if (s.includes('delivered')) return 3;
    if (s.includes('dispatch') || s.includes('shipped')) return 2;
    if (s.includes('lab') || s.includes('process')) return 1;
    return 0;
  };

  const activeIndex = getActiveStepIndex();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <ScreenHeader title={`Order ${order.id}`} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Order Status & Date Card */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.orderIdText}>{order.id}</Text>
              <Text style={styles.dateText}>Placed on {formatDate(order.date, 'long')}</Text>
            </View>
            <Badge
              label={order.status || 'Order Placed'}
              variant="info"
              size="md"
            />
          </View>

          {/* Timeline */}
          <View style={styles.timelineContainer}>
            {ORDER_STEPS.map((step, idx) => {
              const isCompleted = idx <= activeIndex;
              const isCurrent = idx === activeIndex;
              return (
                <View key={step.key} style={styles.timelineStep}>
                  <View style={styles.indicatorCol}>
                    <View
                      style={[
                        styles.stepDot,
                        isCompleted && styles.stepDotCompleted,
                        isCurrent && styles.stepDotCurrent,
                      ]}
                    >
                      {isCompleted && (
                        <Ionicons name="checkmark" size={12} color={COLORS.surface} />
                      )}
                    </View>
                    {idx < ORDER_STEPS.length - 1 && (
                      <View
                        style={[
                          styles.stepLine,
                          idx < activeIndex && styles.stepLineCompleted,
                        ]}
                      />
                    )}
                  </View>

                  <View style={styles.stepContentCol}>
                    <Text
                      style={[
                        styles.stepTitle,
                        isCompleted && styles.stepTitleCompleted,
                      ]}
                    >
                      {step.label}
                    </Text>
                    <Text style={styles.stepDesc}>{step.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Ordered Items */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Items Ordered ({order.items?.length || 1})</Text>
          {order.items?.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Image source={{ uri: item.image }} style={styles.itemThumb} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemOptions}>
                  Color: {item.frameColor} • Qty: {item.quantity}
                </Text>
                <Text style={styles.itemLens}>Lens: {item.lensType}</Text>
                {item.prescription && (
                  <View style={styles.rxBadge}>
                    <Text style={styles.rxText}>Custom Vision Rx Attached</Text>
                  </View>
                )}
                <Text style={styles.itemPrice}>
                  {formatCurrency((item.price + (item.lensPrice || 0)) * item.quantity)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Shipping Address (Filled directly by user during checkout) */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Shipping Address</Text>
          <View style={styles.addressBox}>
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
        </View>

        {/* Payment & Invoice Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Payment & Invoicing</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Payment Mode</Text>
            <Text style={styles.priceValue}>{order.paymentMethod}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Items Subtotal</Text>
            <Text style={styles.priceValue}>
              {formatCurrency(order.subtotal || order.total)}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Shipping</Text>
            <Text
              style={[
                styles.priceValue,
                order.deliveryFee === 0 && { color: COLORS.success },
              ]}
            >
              {order.deliveryFee === 0 ? 'FREE' : formatCurrency(order.deliveryFee || 0)}
            </Text>
          </View>
          {order.discount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Discount</Text>
              <Text style={[styles.priceValue, { color: COLORS.success }]}>
                -{formatCurrency(order.discount)}
              </Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid / Payable</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
          </View>
        </View>

        {/* Customer Support CTA */}
        <Button
          title="Need Help with this Order?"
          onPress={() => navigation.navigate('ContactUs', { orderId: order.id })}
          variant="outline"
          size="md"
          leftIcon={<Ionicons name="chatbubbles-outline" size={18} color={COLORS.primary} />}
          style={styles.helpBtn}
        />
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
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.md,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...LAYOUT.shadows.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderIdText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.secondary,
  },
  dateText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  cardSectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: 12,
  },
  timelineContainer: {
    marginTop: 8,
  },
  timelineStep: {
    flexDirection: 'row',
    minHeight: 52,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotCompleted: {
    backgroundColor: COLORS.success,
  },
  stepDotCurrent: {
    backgroundColor: COLORS.primary,
  },
  stepLine: {
    flex: 1,
    width: 2,
    backgroundColor: COLORS.borderLight,
    marginVertical: 4,
  },
  stepLineCompleted: {
    backgroundColor: COLORS.success,
  },
  stepContentCol: {
    flex: 1,
    paddingBottom: 16,
  },
  stepTitle: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  stepTitleCompleted: {
    color: COLORS.secondary,
    fontFamily: FONTS.semiBold,
  },
  stepDesc: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  itemThumb: {
    width: 64,
    height: 64,
    borderRadius: LAYOUT.radius.sm,
    backgroundColor: '#F8F9FA',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.secondary,
  },
  itemOptions: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  itemLens: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  rxBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.infoLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: LAYOUT.radius.xs,
    marginTop: 4,
  },
  rxText: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.info,
  },
  itemPrice: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.secondary,
    marginTop: 6,
  },
  addressBox: {
    backgroundColor: COLORS.borderLight,
    padding: 12,
    borderRadius: LAYOUT.radius.sm,
  },
  recipientName: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.secondary,
    marginBottom: 2,
  },
  addressLine: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  addressPhone: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
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
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  totalLabel: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.secondary,
  },
  totalValue: {
    fontFamily: FONTS.extraBold,
    fontSize: 16,
    color: COLORS.primary,
  },
  helpBtn: {
    marginTop: 4,
  },
});

export default OrderDetailScreen;
