import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import LAYOUT from '../../constants/layout';
import ScreenHeader from '../../components/common/ScreenHeader';
import ProductCard from '../../components/product/ProductCard';
import { MOCK_BANNERS, MOCK_CATEGORIES, MOCK_PRODUCTS } from '../../data/mockData';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 32;

export const HomeScreen = ({ navigation }) => {
  const bestSellers = MOCK_PRODUCTS.filter((p) => p.isBestSeller);
  const newArrivals = MOCK_PRODUCTS.filter((p) => p.isNew || !p.isBestSeller);

  const renderBanner = ({ item }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ShopTab', { category: item.targetCategory })}
        style={[styles.bannerCard, { backgroundColor: item.bgColor }]}
      >
        <View style={styles.bannerTagBadge}>
          <Text style={styles.bannerTagText}>{item.tag}</Text>
        </View>
        <Text style={styles.bannerTitle}>{item.title}</Text>
        <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>

        <View style={styles.bannerBottomRow}>
          <Text style={styles.bannerHighlight}>{item.highlight}</Text>
          <View style={styles.bannerActionBtn}>
            <Text style={styles.bannerActionBtnText}>{item.buttonText}</Text>
            <Ionicons name="arrow-forward" size={14} color={COLORS.secondary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategory = ({ item }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ShopTab', { category: item.slug })}
        style={styles.categoryItem}
      >
        <View style={styles.categoryIconCircle}>
          <Ionicons name={item.icon} size={26} color={COLORS.primary} />
        </View>
        <Text style={styles.categoryName} numberOfLines={2}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Universal Reusable Header with Official Brand Logo, Wishlist & Cart */}
      <ScreenHeader
        showLogo={true}
        showWishlist={true}
        showCart={true}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar Trigger */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ShopTab', { focusSearch: true })}
          style={styles.searchBarTrigger}
        >
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
          <Text style={styles.searchPlaceholder}>Search frames, shapes, blue cut...</Text>
          <Ionicons name="options-outline" size={18} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Promo Banners Carousel */}
        <FlatList
          data={MOCK_BANNERS}
          renderItem={renderBanner}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bannerList}
          snapToInterval={BANNER_WIDTH + 12}
          decelerationRate="fast"
        />

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ShopTab')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={MOCK_CATEGORIES}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />

        {/* Value Propositions / Brand Trust Banner */}
        <View style={styles.trustRow}>
          <View style={styles.trustItem}>
            <Ionicons name="shield-checkmark" size={18} color={COLORS.primary} />
            <Text style={styles.trustText}>Anti-Glare Certified</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <Ionicons name="car-outline" size={18} color={COLORS.primary} />
            <Text style={styles.trustText}>Fast Insured Dispatch</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.primary} />
            <Text style={styles.trustText}>1-Yr Frame Warranty</Text>
          </View>
        </View>

        {/* Best Sellers Section */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Bestselling Eyewear</Text>
            <Text style={styles.sectionSubtitle}>Loved by over 10,000+ happy customers</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ShopTab')}>
            <Text style={styles.viewAllText}>See More</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productsGrid}>
          {bestSellers.map((item) => (
            <View key={item.id} style={styles.productColumn}>
              <ProductCard
                product={item}
                onPress={() => navigation.navigate('ProductDetail', { product: item })}
              />
            </View>
          ))}
        </View>

        {/* New Arrivals Section */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Fresh Drops & Sunglasses</Text>
            <Text style={styles.sectionSubtitle}>Handcrafted titanium & UV-polarized lenses</Text>
          </View>
        </View>

        <View style={styles.productsGrid}>
          {newArrivals.map((item) => (
            <View key={item.id} style={styles.productColumn}>
              <ProductCard
                product={item}
                onPress={() => navigation.navigate('ProductDetail', { product: item })}
              />
            </View>
          ))}
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
    paddingBottom: 40,
  },
  searchBarTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: LAYOUT.radius.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchPlaceholder: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textMuted,
    marginHorizontal: 10,
  },
  bannerList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  bannerCard: {
    width: BANNER_WIDTH,
    borderRadius: LAYOUT.radius.lg,
    padding: 20,
    marginRight: 12,
    justifyContent: 'center',
    ...LAYOUT.shadows.md,
  },
  bannerTagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: LAYOUT.radius.xs,
    marginBottom: 8,
  },
  bannerTagText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.surface,
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.surface,
    lineHeight: 24,
  },
  bannerSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    marginBottom: 16,
  },
  bannerBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerHighlight: {
    fontFamily: FONTS.extraBold,
    fontSize: 16,
    color: COLORS.surface,
  },
  bannerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: LAYOUT.radius.md,
  },
  bannerActionBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.secondary,
    marginRight: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.secondary,
  },
  sectionSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  viewAllText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.primary,
  },
  categoriesList: {
    paddingHorizontal: 12,
    paddingBottom: 6,
  },
  categoryItem: {
    alignItems: 'center',
    width: 76,
    marginHorizontal: 4,
  },
  categoryIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 6,
    ...LAYOUT.shadows.sm,
  },
  categoryName: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 18,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: LAYOUT.radius.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustText: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.secondary,
    marginLeft: 6,
  },
  trustDivider: {
    width: 1,
    height: 18,
    backgroundColor: COLORS.border,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  productColumn: {
    width: '50%',
    padding: 6,
  },
});

export default HomeScreen;
