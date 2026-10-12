import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StatusBar,
  Image,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import LAYOUT from '../../constants/layout';
import ScreenHeader from '../../components/common/ScreenHeader';
import ProductCard from '../../components/product/ProductCard';
import bannerApi from '../../services/bannerApi';
import categoryApi from '../../services/categoryApi';
import productApi from '../../services/productApi';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 32;
const CATEGORY_CARD_WIDTH = Math.round(width * 0.84);

const LOCAL_CATEGORY_IMAGES = {
  eyeglasses: require('../../assets/images/categories/cat-eyeglasses.png'),
  sunglasses: require('../../assets/images/categories/cat-sunglasses.png'),
  'contact-lenses': require('../../assets/images/categories/cat-contact-lenses.png'),
  accessories: require('../../assets/images/categories/cat-accessories.png'),
};

const resolveImageSource = (img, slug) => {
  if (typeof img === 'string') {
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
      return { uri: img };
    }
    if (slug && LOCAL_CATEGORY_IMAGES[slug]) {
      return LOCAL_CATEGORY_IMAGES[slug];
    }
    return LOCAL_CATEGORY_IMAGES.eyeglasses;
  }
  return img || (slug && LOCAL_CATEGORY_IMAGES[slug]) || LOCAL_CATEGORY_IMAGES.eyeglasses;
};

export const HomeScreen = ({ navigation }) => {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const bestSellers = allProducts.filter(p => p.isBestSeller);
  const newArrivals = allProducts.filter(p => p.isNew || !p.isBestSeller);

  const fetchBanners = useCallback(async () => {
    const res = await bannerApi.getActiveBanners('hero');
    if (res.success && res.data && res.data.length > 0) {
      const mapped = res.data.map((b, idx) => ({
        id: b.id || b._id || `api-banner-${idx}`,
        title: b.title,
        subtitle: b.subtitle || '',
        highlight: b.headline || b.kicker || 'SPECIAL OFFER',
        tag: b.kicker || b.headline || 'NEW ARRIVAL',
        bgColor: b.bgColor || (idx % 2 === 0 ? '#14232E' : '#E4232C'),
        buttonText: b.buttonText || 'Shop Now',
        targetCategory: (b.targetCategory || 'eyeglasses').toLowerCase(),
      }));
      setBanners(mapped);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    const res = await categoryApi.getActiveCategories();
    if (res.success && res.data && res.data.length > 0) {
      const mapped = res.data.map((c, idx) => ({
        id: c.id || c._id || `api-cat-${idx}`,
        name: c.name,
        slug: c.slug,
        subtitle: c.subtitle || `${c.itemCount || 0} Products`,
        image: c.imageUrl,
        count: c.itemCount || 0,
      }));
      setCategories(mapped);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    const res = await productApi.getProducts();
    if (res.success && res.data && res.data.length > 0) {
      setAllProducts(res.data);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
    fetchCategories();
    fetchProducts();
  }, [fetchBanners, fetchCategories, fetchProducts]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchBanners(), fetchCategories(), fetchProducts()]);
    setIsRefreshing(false);
  };

  const renderBanner = ({ item }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate('ShopTab', { category: item.targetCategory })
        }
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

  const renderCategoryCard = ({ item }) => {
    const imageSource = resolveImageSource(item.image, item.slug);

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => navigation.navigate('ShopTab', { category: item.slug })}
        style={styles.categoryCard}
      >
        {/* Product Visual Centered with Clean Aspect */}
        <View style={styles.categoryImageWrapper}>
          <Image
            source={imageSource}
            style={styles.categoryImage}
            resizeMode="contain"
          />
        </View>

        {/* Card Footer: Category Meta & Navigation Arrow */}
        <View style={styles.categoryFooter}>
          <View style={styles.categoryTextCol}>
            <Text style={styles.categoryTitle}>{item.name}</Text>
            <Text style={styles.categorySubtitle} numberOfLines={1}>
              {item.subtitle}
            </Text>
          </View>
          <View style={styles.categoryArrowWrapper}>
            <Ionicons name="arrow-forward" size={13} color={COLORS.secondary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Universal Reusable Header with Official Brand Logo, Wishlist & Cart */}
      <ScreenHeader showLogo={true} showWishlist={true} showCart={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Search Bar Trigger */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ShopTab', { focusSearch: true })}
          style={styles.searchBarTrigger}
        >
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
          <Text style={styles.searchPlaceholder}>
            Search frames, shapes, blue cut...
          </Text>
          <Ionicons name="options-outline" size={18} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Promo Banners Carousel */}
        <FlatList
          data={banners}
          renderItem={renderBanner}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bannerList}
          snapToInterval={BANNER_WIDTH + 12}
          decelerationRate="fast"
        />

        {/* Categories Section - Clean Category Strip */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <Text style={styles.sectionSubtitle}>
              Classic & modern eyewear silhouettes
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ShopTab')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={categories}
          renderItem={renderCategoryCard}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />

        {/* Value Propositions / Brand Trust Banner */}
        <View style={styles.trustRow}>
          <View style={styles.trustItem}>
            <Ionicons
              name="shield-checkmark"
              size={18}
              color={COLORS.primary}
            />
            <Text style={styles.trustText}>Anti-Glare Certified</Text>
          </View>
          {/* <View style={styles.trustDivider} /> */}
          {/* <View style={styles.trustItem}>
            <Ionicons name="car-outline" size={18} color={COLORS.primary} />
            <Text style={styles.trustText}>Fast Insured Dispatch</Text>
          </View> */}
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color={COLORS.primary}
            />
            <Text style={styles.trustText}>1-Yr Frame Warranty</Text>
          </View>
        </View>

        {/* Best Sellers Section */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Bestselling Eyewear</Text>
            <Text style={styles.sectionSubtitle}>
              Loved by over 10,000+ happy customers
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ShopTab')}>
            <Text style={styles.viewAllText}>See More</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productsGrid}>
          {bestSellers.map(item => (
            <View key={item.id} style={styles.productColumn}>
              <ProductCard
                product={item}
                onPress={() =>
                  navigation.navigate('ProductDetail', { product: item })
                }
              />
            </View>
          ))}
        </View>

        {/* New Arrivals Section */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Fresh Drops & Sunglasses</Text>
            <Text style={styles.sectionSubtitle}>
              Handcrafted titanium & UV-polarized lenses
            </Text>
          </View>
        </View>

        <View style={styles.productsGrid}>
          {newArrivals.map(item => (
            <View key={item.id} style={styles.productColumn}>
              <ProductCard
                product={item}
                onPress={() =>
                  navigation.navigate('ProductDetail', { product: item })
                }
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
  categoryList: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
  },
  categoryCard: {
    width: 160,
    height: 125,
    backgroundColor: '#F4F6F8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    marginRight: 12,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryImageWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
    paddingBottom: 6,
  },
  categoryImage: {
    width: '100%',
    height: 60,
  },
  categoryFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  categoryTextCol: {
    flex: 1,
    marginRight: 6,
  },
  categoryTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#111827',
  },
  categorySubtitle: {
    fontFamily: FONTS.medium,
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  categoryArrowWrapper: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
