import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
const isSmallDevice = width < 375;

const LOCAL_CATEGORY_IMAGES = {
  eyeglasses: require('../../../assets/images/categories/cat-eyeglasses.png'),
  sunglasses: require('../../../assets/images/categories/cat-sunglasses.png'),
  'contact-lenses': require('../../../assets/images/categories/cat-contact-lenses.png'),
  accessories: require('../../../assets/images/categories/cat-accessories.png'),
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

// Luxury editorial fallback banners
const DEFAULT_BANNERS = [
  {
    id: 'hero-banner-1',
    title: 'Architectural Titanium',
    subtitle: 'Ultralight aerospace alloy frames engineered for everyday distinction and effortless wear.',
    highlight: 'SPRING / SUMMER 2026',
    tag: 'NEW COLLECTION',
    bgColor: '#14232E',
    buttonText: 'Explore Eyeglasses',
    targetCategory: 'eyeglasses',
  },
  {
    id: 'hero-banner-2',
    title: 'Polarized Sunwear',
    subtitle: 'High-contrast UV400 lenses housed in handcrafted Italian acetate silhouettes.',
    highlight: 'LIMITED RELEASE',
    tag: 'SIGNATURE SHADES',
    bgColor: '#1E293B',
    buttonText: 'Shop Sunglasses',
    targetCategory: 'sunglasses',
  },
  {
    id: 'hero-banner-3',
    title: 'AquaComfort Optics',
    subtitle: 'Ultra-breathable hydra-matrix lenses delivering clinical moisture and crisp vision.',
    highlight: 'PURE HYDRATION',
    tag: 'CONTACT LENSES',
    bgColor: '#0F172A',
    buttonText: 'View Contacts',
    targetCategory: 'contact-lenses',
  },
];

const DEFAULT_CATEGORIES = [
  { id: 'cat-eyeglasses', name: 'Eyeglasses', slug: 'eyeglasses', subtitle: 'Frames & Lenses', image: null },
  { id: 'cat-sunglasses', name: 'Sunglasses', slug: 'sunglasses', subtitle: 'UV400 Polarized', image: null },
  { id: 'cat-contact-lenses', name: 'Contact Lenses', slug: 'contact-lenses', subtitle: 'Daily & Monthly', image: null },
  { id: 'cat-accessories', name: 'Accessories', slug: 'accessories', subtitle: 'Cases & Care', image: null },
];

export const HomeScreen = ({ navigation }) => {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  const bestSellers = useMemo(
    () => allProducts.filter((p) => p.isBestSeller),
    [allProducts]
  );
  const newArrivals = useMemo(
    () => allProducts.filter((p) => p.isNew || !p.isBestSeller),
    [allProducts]
  );

  const fetchBanners = useCallback(async () => {
    try {
      const res = await bannerApi.getActiveBanners('hero');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map((b, idx) => ({
          id: b.id || b._id || `api-banner-${idx}`,
          title: b.title,
          subtitle: b.subtitle || '',
          highlight: b.headline || b.kicker || 'SPECIAL OFFER',
          tag: b.kicker || b.headline || 'NEW ARRIVAL',
          bgColor: b.bgColor || (idx % 2 === 0 ? '#14232E' : '#1E293B'),
          buttonText: b.buttonText || 'Shop Collection',
          targetCategory: (b.targetCategory || 'eyeglasses').toLowerCase(),
        }));
        setBanners(mapped);
      }
    } catch {
      // Fallback used seamlessly
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoryApi.getActiveCategories();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
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
    } catch {
      // Fallback used seamlessly
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await productApi.getProducts();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setAllProducts(res.data);
      }
    } catch {
      // Fallback used seamlessly
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

  const displayBanners = banners.length > 0 ? banners : DEFAULT_BANNERS;
  const displayCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  const displayBestSellers = bestSellers.length > 0 ? bestSellers.slice(0, 4) : allProducts.slice(0, 4);
  const displayFreshDrops = newArrivals.length > 0 ? newArrivals.slice(0, 6) : allProducts.slice(4, 10);

  // Render Full-Width Hero Slide
  const renderHeroBanner = ({ item }) => {
    return (
      <View style={[styles.heroSlide, { backgroundColor: item.bgColor || '#14232E' }]}>
        <View style={styles.heroContent}>
          {/* Editorial Tag */}
          <View style={styles.heroTagBadge}>
            <Text style={styles.heroTagText}>{(item.tag || item.highlight || 'EXCLUSIVE').toUpperCase()}</Text>
          </View>

          {/* Headline */}
          <Text style={styles.heroTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Subtitle */}
          <Text style={styles.heroSubtitle} numberOfLines={2}>
            {item.subtitle}
          </Text>

          {/* Single Clear Shopping Action */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() =>
              navigation.navigate('Main', {
                screen: 'ShopTab',
                params: { category: item.targetCategory },
              })
            }
            style={styles.heroCtaButton}
          >
            <Text style={styles.heroCtaText}>{item.buttonText || 'Shop Collection'}</Text>
            <Ionicons name="arrow-forward" size={15} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render Circular Category Tile
  const renderCategoryTile = ({ item }) => {
    const imageSource = resolveImageSource(item.image, item.slug);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate('Main', {
            screen: 'ShopTab',
            params: { category: item.slug },
          })
        }
        style={styles.categoryTileWrapper}
      >
        <View style={styles.categoryAvatarContainer}>
          <Image
            source={imageSource}
            style={styles.categoryAvatarImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.categoryTileName} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Compact Top Bar with Logo, Search, Wishlist and Cart */}
      <ScreenHeader
        showLogo={true}
        showSearch={true}
        showWishlist={true}
        showCart={true}
      />

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
        {/* Prominent Edge-to-Edge Hero Banner Carousel */}
        <View style={styles.heroCarouselContainer}>
          <FlatList
            data={displayBanners}
            renderItem={renderHeroBanner}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
              setActiveBannerIndex(slideIndex);
            }}
          />

          {/* Subtle Page Indicator */}
          {displayBanners.length > 1 && (
            <View style={styles.paginationRow}>
              {displayBanners.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.paginationDot,
                    activeBannerIndex === idx && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Quick Search Shortcut Pill */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => navigation.navigate('Main', { screen: 'ShopTab', params: { focusSearch: true } })}
          style={styles.searchBarShortcut}
        >
          <Ionicons name="search-outline" size={17} color={COLORS.textMuted} />
          <Text style={styles.searchShortcutText}>Search designer frames, styles, lenses...</Text>
          <View style={styles.searchShortcutBadge}>
            <Text style={styles.searchShortcutBadgeText}>Browse</Text>
          </View>
        </TouchableOpacity>

        {/* Horizontally Scrollable Category Tiles */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleCol}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <Text style={styles.sectionSubtitle}>Iconic shapes & precision optical lenses</Text>
          </View>
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => navigation.navigate('Main', { screen: 'ShopTab', params: { category: 'all' } })}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={displayCategories}
          renderItem={renderCategoryTile}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTilesList}
        />

        {/* Bestsellers Product Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleCol}>
            <Text style={styles.sectionTitle}>Curated Bestsellers</Text>
            <Text style={styles.sectionSubtitle}>Signature eyewear favored for timeless distinction</Text>
          </View>
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => navigation.navigate('Main', { screen: 'ShopTab', params: { category: 'all' } })}
          >
            <Text style={styles.viewAllText}>See More</Text>
          </TouchableOpacity>
        </View>

        {displayBestSellers.length > 0 ? (
          <View style={styles.productsGrid}>
            {displayBestSellers.map((item) => (
              <View key={item.id} style={styles.productColumn}>
                <ProductCard
                  product={item}
                  onPress={() => navigation.navigate('ProductDetail', { product: item })}
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyNotice}>
            <Text style={styles.emptyNoticeText}>Loading bestselling collection...</Text>
          </View>
        )}

        {/* Second Editorial & Craftsmanship Spotlight */}
        <View style={styles.editorialCard}>
          <View style={styles.editorialHeader}>
            <View style={styles.editorialBadge}>
              <Ionicons name="sparkles" size={12} color={COLORS.primary} style={{ marginRight: 4 }} />
              <Text style={styles.editorialBadgeText}>THE OPTICAL STANDARD</Text>
            </View>
            <Text style={styles.editorialTitle}>Precision Eyewear Crafted for Distinction</Text>
            <Text style={styles.editorialSubtitle}>
              Every frame is assembled with custom prescription optics, multi-layer anti-reflective coatings, and our full 1-year warranty.
            </Text>
          </View>

          <View style={styles.editorialPillarsRow}>
            <View style={styles.editorialPillarItem}>
              <View style={styles.pillarIconCircle}>
                <Ionicons name="shield-checkmark" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.pillarTitle}>Anti-Glare</Text>
              <Text style={styles.pillarDesc}>Crystal-clear lab coating</Text>
            </View>

            <View style={styles.editorialPillarDivider} />

            <View style={styles.editorialPillarItem}>
              <View style={styles.pillarIconCircle}>
                <Ionicons name="eye-outline" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.pillarTitle}>Blue-Cut</Text>
              <Text style={styles.pillarDesc}>Digital screen filter</Text>
            </View>

            <View style={styles.editorialPillarDivider} />

            <View style={styles.editorialPillarItem}>
              <View style={styles.pillarIconCircle}>
                <Ionicons name="ribbon-outline" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.pillarTitle}>1-Yr Care</Text>
              <Text style={styles.pillarDesc}>Complete warranty</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() =>
              navigation.navigate('Main', {
                screen: 'ShopTab',
                params: { category: 'eyeglasses' },
              })
            }
            style={styles.editorialCtaBtn}
          >
            <Text style={styles.editorialCtaText}>Explore Optical Frames</Text>
            <Ionicons name="arrow-forward" size={14} color={COLORS.surface} />
          </TouchableOpacity>
        </View>

        {/* Fresh Drops Showcase */}
        {displayFreshDrops.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleCol}>
                <Text style={styles.sectionTitle}>Fresh Drops & Sunwear</Text>
                <Text style={styles.sectionSubtitle}>New season silhouettes and UV400 tints</Text>
              </View>
              <TouchableOpacity
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() =>
                  navigation.navigate('Main', {
                    screen: 'ShopTab',
                    params: { category: 'sunglasses' },
                  })
                }
              >
                <Text style={styles.viewAllText}>Shop Sun</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={displayFreshDrops}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.freshDropsList}
              renderItem={({ item }) => (
                <View style={styles.freshDropCardWrapper}>
                  <ProductCard
                    product={item}
                    onPress={() => navigation.navigate('ProductDetail', { product: item })}
                  />
                </View>
              )}
            />
          </>
        )}
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
    paddingBottom: 36,
  },

  // Hero Section
  heroCarouselContainer: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#14232E',
  },
  heroSlide: {
    width,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  heroContent: {
    maxWidth: width - 40,
  },
  heroTagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: LAYOUT.radius.xs,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroTagText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontFamily: FONTS.bold,
    fontSize: isSmallDevice ? 22 : 25,
    color: '#FFFFFF',
    lineHeight: isSmallDevice ? 27 : 31,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.82)',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 16,
  },
  heroCtaButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: LAYOUT.radius.sm,
    ...LAYOUT.shadows.sm,
  },
  heroCtaText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12.5,
    color: COLORS.secondary,
    marginRight: 6,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    marginHorizontal: 3,
  },
  paginationDotActive: {
    width: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 3,
  },

  // Search shortcut
  searchBarShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 6,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: LAYOUT.radius.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...LAYOUT.shadows.sm,
  },
  searchShortcutText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: COLORS.textMuted,
    marginLeft: 8,
  },
  searchShortcutBadge: {
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: LAYOUT.radius.xs,
  },
  searchShortcutBadgeText: {
    fontFamily: FONTS.medium,
    fontSize: 10.5,
    color: COLORS.secondary,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 22,
    marginBottom: 12,
  },
  sectionTitleCol: {
    flex: 1,
    marginRight: 10,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: COLORS.secondary,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  viewAllText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12.5,
    color: COLORS.primary,
  },

  // Category Tiles
  categoryTilesList: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  categoryTileWrapper: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 76,
  },
  categoryAvatarContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    ...LAYOUT.shadows.sm,
  },
  categoryAvatarImage: {
    width: '100%',
    height: '100%',
  },
  categoryTileName: {
    fontFamily: FONTS.medium,
    fontSize: 11.5,
    color: COLORS.secondary,
    marginTop: 7,
    textAlign: 'center',
  },

  // Product Grid
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  productColumn: {
    width: '50%',
    padding: 6,
  },
  emptyNotice: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyNoticeText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.textMuted,
  },

  // Editorial Section
  editorialCard: {
    backgroundColor: '#14232E',
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: LAYOUT.radius.lg,
    padding: 20,
    ...LAYOUT.shadows.md,
  },
  editorialHeader: {
    marginBottom: 16,
  },
  editorialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: LAYOUT.radius.xs,
    marginBottom: 8,
  },
  editorialBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 9.5,
    color: COLORS.surface,
    letterSpacing: 0.8,
  },
  editorialTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.surface,
    lineHeight: 23,
    letterSpacing: -0.2,
  },
  editorialSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.78)',
    lineHeight: 17,
    marginTop: 6,
  },
  editorialPillarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: LAYOUT.radius.md,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  editorialPillarItem: {
    flex: 1,
    alignItems: 'center',
  },
  pillarIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  pillarTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.surface,
  },
  pillarDesc: {
    fontFamily: FONTS.regular,
    fontSize: 9.5,
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 1,
  },
  editorialPillarDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  editorialCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: LAYOUT.radius.sm,
  },
  editorialCtaText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12.5,
    color: COLORS.surface,
    marginRight: 6,
  },

  // Fresh drops carousel
  freshDropsList: {
    paddingHorizontal: 12,
    paddingBottom: 6,
  },
  freshDropCardWrapper: {
    width: Math.min(width * 0.44, 180),
    marginHorizontal: 5,
  },
});

export default HomeScreen;
