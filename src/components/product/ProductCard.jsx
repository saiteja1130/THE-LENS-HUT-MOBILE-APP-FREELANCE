import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import LAYOUT from '../../constants/layout';
import formatCurrency from '../../utils/formatCurrency';
import useWishlistStore from '../../store/wishlistStore';

export const ProductCard = ({ product, onPress, style }) => {
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product.id));
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  const discountPercent =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : null;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.card, style]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
        />

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.wishlistButton}
          onPress={() => toggleWishlist(product)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isInWishlist ? 'heart' : 'heart-outline'}
            size={18}
            color={isInWishlist ? COLORS.primary : COLORS.secondary}
          />
        </TouchableOpacity>

        {discountPercent ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercent}% OFF</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.details}>
        <Text style={styles.category} numberOfLines={1}>
          {product.category || product.brand}
        </Text>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatCurrency(product.price)}</Text>
            {product.mrp && product.mrp > product.price ? (
              <Text style={styles.mrp}>{formatCurrency(product.mrp)}</Text>
            ) : null}
          </View>

          {product.rating ? (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={11} color={COLORS.star} />
              <Text style={styles.ratingText}>{product.rating}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
    ...LAYOUT.shadows.sm,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#F8F9FA',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...LAYOUT.shadows.sm,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: LAYOUT.radius.xs,
  },
  discountText: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: COLORS.surface,
    letterSpacing: 0.3,
  },
  details: {
    padding: 10,
  },
  category: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  name: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.secondary,
  },
  mrp: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: LAYOUT.radius.xs,
  },
  ratingText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.secondary,
    marginLeft: 3,
  },
});

export default ProductCard;
