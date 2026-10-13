import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
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
import EmptyState from '../../components/common/EmptyState';
import { storage } from '../../utils/storage';
import { orderApi } from '../../services/orderApi';

export const OrderHistoryScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await orderApi.getMyOrders();
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setOrders(res.data);
          await storage.set('tlh_orders', res.data);
          return;
        }
      } catch (apiErr) {
        console.warn('[OrderHistoryScreen Mobile] Failed to fetch live orders:', apiErr);
      }

      try {
        const savedOrders = await storage.get('tlh_orders');
        if (Array.isArray(savedOrders)) {
          setOrders(savedOrders);
        } else {
          setOrders([]);
        }
      } catch (e) {
        setOrders([]);
      }
    };

    loadOrders();
  }, []);

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'processing':
      case 'laboratory processing':
      case 'shipped':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'info';
    }
  };

  const renderOrderItem = ({ item }) => {
    const orderId = item.orderNumber || item.id || item._id;
    const orderDate = item.date || item.createdAt || item.orderDate;
    const orderStatus = item.orderStatus || item.status || 'Processing';
    const orderTotal = Number(item.totalAmount !== undefined ? item.totalAmount : item.total) || 0;

    const firstItem = item.items && item.items[0];
    const firstItemImg =
      firstItem?.image ||
      firstItem?.product?.images?.front ||
      firstItem?.product?.primaryImage ||
      '';
    const totalItemCount = item.items ? item.items.reduce((s, i) => s + (i.quantity || 1), 0) : 1;

    return (
      <TouchableOpacity
        style={styles.orderCard}
        activeOpacity={0.88}
        onPress={() => navigation.navigate('OrderDetail', { order: item })}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderId}>{orderId}</Text>
            <Text style={styles.orderDate}>{formatDate(orderDate, 'medium')}</Text>
          </View>

          <Badge
            label={orderStatus}
            variant={getStatusVariant(orderStatus)}
            size="md"
          />
        </View>

        <View style={styles.cardContent}>
          {firstItemImg ? (
            <Image
              source={{ uri: firstItemImg }}
              style={styles.orderThumb}
            />
          ) : null}

          <View style={styles.orderItemDetails}>
            <Text style={styles.firstItemName} numberOfLines={1}>
              {firstItem?.name || 'Eyewear Frame'}
            </Text>
            <Text style={styles.firstItemSub} numberOfLines={1}>
              {firstItem?.lensType || firstItem?.configuration?.lensSelection?.lensName || 'Precision Lenses'}
            </Text>
            <Text style={styles.itemsSummary}>
              {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} in this order
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>{formatCurrency(orderTotal)}</Text>
          </View>

          <View style={styles.viewDetailsRow}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <ScreenHeader title="My Orders" />

      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            iconName="bag-outline"
            title="No Orders Placed Yet"
            description="When you purchase eyeglasses or sunglasses from The Lens Hut, your orders will appear here."
            actionTitle="Start Shopping"
            onActionPress={() => navigation.navigate('ShopTab')}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.md,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...LAYOUT.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.secondary,
  },
  orderDate: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.borderLight,
  },
  orderThumb: {
    width: 60,
    height: 60,
    borderRadius: LAYOUT.radius.sm,
    backgroundColor: '#F8F9FA',
  },
  orderItemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  firstItemName: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.secondary,
  },
  firstItemSub: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  itemsSummary: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  totalLabel: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  totalValue: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.secondary,
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.primary,
    marginRight: 4,
  },
});

export default OrderHistoryScreen;
