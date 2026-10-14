import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
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
  const { order: initialOrder } = route.params || {};
  const order = initialOrder || {};

  const orderId = order.orderNumber || order.id || order._id || 'LH-ORDER';
  const orderDate = order.date || order.createdAt || order.orderDate;
  const orderStatus = order.orderStatus || order.status || 'Order Placed';
  const orderSubtotal = Number(order.subtotal || order.total || 0);
  const orderDeliveryFee = Number(order.shippingFee !== undefined ? order.shippingFee : (order.deliveryFee !== undefined ? order.deliveryFee : order.shipping || 0));
  const orderDiscount = Number(order.discountAmount !== undefined ? order.discountAmount : (order.discount || 0));
  const orderTotal = Number(order.totalAmount !== undefined ? order.totalAmount : (order.total || 0));

  const getActiveStepIndex = () => {
    const s = orderStatus.toLowerCase();
    if (s.includes('delivered')) return 3;
    if (s.includes('dispatch') || s.includes('shipped')) return 2;
    if (s.includes('lab') || s.includes('process')) return 1;
    return 0;
  };

  const activeIndex = getActiveStepIndex();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <ScreenHeader title={`Order ${orderId}`} showBack={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Order Status & Date Card */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.orderIdText}>{orderId}</Text>
              <Text style={styles.dateText}>Placed on {formatDate(orderDate, 'long')}</Text>
            </View>
            <Badge
              label={orderStatus}
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
          {order.items?.map((item, idx) => {
            const itemImg = item.image || item.product?.images?.front || item.product?.primaryImage || '';
            const itemName = item.name || 'Optical Eyewear';
            const itemColor = item.frameColor || item.selectedColor || item.variantName || 'Standard';
            const itemLens = item.lensType || item.configuration?.lensSelection?.lensName || 'Optical Lab Custom Lens';
            const hasRx = item.prescription || order.prescription?.hasPrescription;
            const itemUnitPrice = Number(item.unitPrice !== undefined ? item.unitPrice : item.price || 0);
            const itemTotal = Number(item.totalPrice !== undefined ? item.totalPrice : (itemUnitPrice + (item.lensPrice || 0)) * (item.quantity || 1));

            return (
              <View key={idx} style={styles.itemRow}>
                {itemImg ? (
                  <Image source={{ uri: itemImg }} style={styles.itemThumb} />
                ) : null}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{itemName}</Text>
                  <Text style={styles.itemOptions}>
                    Color: {itemColor} • Qty: {item.quantity || 1}
                  </Text>
                  <Text style={styles.itemLens}>Lens: {itemLens}</Text>
                  {hasRx && (
                    <View style={styles.rxBadge}>
                      <Text style={styles.rxText}>Custom Vision Rx Attached</Text>
                    </View>
                  )}
                  <Text style={styles.itemPrice}>
                    {formatCurrency(itemTotal)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Shipping Address */}
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
            <Text style={styles.priceValue}>{order.paymentMethod || 'Cash on Delivery'}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Items Subtotal</Text>
            <Text style={styles.priceValue}>
              {formatCurrency(orderSubtotal)}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Shipping Fee</Text>
            <Text
              style={[
                styles.priceValue,
                orderDeliveryFee === 0 && { color: COLORS.success },
              ]}
            >
              {orderDeliveryFee === 0 ? 'FREE' : formatCurrency(orderDeliveryFee)}
            </Text>
          </View>
          {orderDiscount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Discount</Text>
              <Text style={[styles.priceValue, { color: COLORS.success }]}>
                -{formatCurrency(orderDiscount)}
              </Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid / Payable</Text>
            <Text style={styles.totalValue}>{formatCurrency(orderTotal)}</Text>
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
