import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import LAYOUT from '../../constants/layout';
import BrandLogo from './BrandLogo';
import useCartStore from '../../store/cartStore';
import useWishlistStore from '../../store/wishlistStore';

export const ScreenHeader = ({
  title,
  subtitle,
  showLogo = false,
  showBack = false,
  onBack,
  showSearch = false,
  showWishlist = false,
  showCart = false,
  rightAction = null,
  containerStyle,
}) => {
  const navigation = useNavigation();
  const cartItemCount = useCartStore((state) => state.getItemCount());
  const wishlistCount = useWishlistStore((state) => state.items.length);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.header, containerStyle]}>
      {/* Left Slot: Back Button OR Logo (if aligned left without back) */}
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
        ) : showLogo ? (
          <BrandLogo size="md" onPress={() => navigation.navigate('HomeTab')} />
        ) : null}
      </View>

      {/* Center Slot: Title or Centered Logo */}
      <View style={styles.centerContainer}>
        {showLogo && showBack ? (
          <BrandLogo size="sm" onPress={() => navigation.navigate('HomeTab')} />
        ) : title ? (
          <View style={styles.titleWrapper}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* Right Slot: Search, Wishlist, Cart, or custom right action */}
      <View style={styles.rightContainer}>
        {rightAction ? (
          rightAction
        ) : (
          <View style={styles.rightActionsRow}>
            {showSearch && (
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation.navigate('ShopTab', { focusSearch: true })}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="search-outline" size={22} color={COLORS.secondary} />
              </TouchableOpacity>
            )}

            {showWishlist && (
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation.navigate('WishlistTab')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="heart-outline" size={22} color={COLORS.secondary} />
                {wishlistCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{wishlistCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {showCart && (
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation.navigate('CartTab')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="bag-outline" size={22} color={COLORS.secondary} />
                {cartItemCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartItemCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    zIndex: 10,
    ...LAYOUT.shadows.sm,
  },
  leftContainer: {
    minWidth: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  titleWrapper: {
    alignItems: 'center',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  rightContainer: {
    minWidth: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 6,
    marginLeft: 6,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: COLORS.primary,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: COLORS.surface,
  },
});

export default ScreenHeader;
