import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  FlatList,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import LAYOUT from '../../constants/layout';
import formatCurrency from '../../utils/formatCurrency';
import Button from '../../components/common/Button';
import ScreenHeader from '../../components/common/ScreenHeader';
import useWishlistStore from '../../store/wishlistStore';
import useCartStore from '../../store/cartStore';
import useFeedbackStore from '../../store/feedbackStore';
import productApi from '../../services/productApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ProductDetailScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const incomingProduct = route.params?.product;
  const productId = route.params?.productId || incomingProduct?.id;
  const [product, setProduct] = useState(incomingProduct || null);
  const carouselRef = useRef(null);

  useEffect(() => {
    if (!product && productId) {
      productApi.getProductByIdOrSlug(productId).then((res) => {
        if (res.success && res.data) {
          setProduct(res.data);
        }
      });
    }
  }, [product, productId]);

  const getImagesFromColor = (c) => {
    if (!c) return [];
    if (c.images && typeof c.images === 'object' && !Array.isArray(c.images)) {
      return [c.images.front, c.images.side, c.images.angle].filter(Boolean);
    }
    if (Array.isArray(c.images) && c.images.length > 0) return c.images;
    if (c.image) return [c.image];
    return [];
  };

  const getProductBaseImages = (prod) => {
    if (!prod) return [];
    if (prod.images && typeof prod.images === 'object' && !Array.isArray(prod.images)) {
      return [prod.images.front, prod.images.side, prod.images.angle].filter(Boolean);
    }
    if (Array.isArray(prod.images) && prod.images.length > 0) return prod.images.filter(Boolean);
    if (prod.image) return [prod.image];
    return [];
  };

  const defaultImages = getProductBaseImages(product);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeImages, setActiveImages] = useState(defaultImages);
  const [selectedColor, setSelectedColor] = useState(
    product?.colors && product.colors.length > 0 ? product.colors[0].name : 'Default'
  );

  useEffect(() => {
    if (!product) return;
    const updatedImages = getProductBaseImages(product);
    setActiveImages(updatedImages);
    if (product.colors && product.colors.length > 0) {
      const firstColor = product.colors[0];
      setSelectedColor(firstColor.name);
      const colorImages = getImagesFromColor(firstColor);
      if (colorImages.length > 0) {
        setActiveImages(colorImages);
      }
    }
    setSelectedImageIndex(0);
  }, [product]);

  const handleColorSelect = (colorObj) => {
    setSelectedColor(colorObj.name);
    const colorImages = getImagesFromColor(colorObj);
    if (colorImages.length > 0) {
      setActiveImages(colorImages);
      setSelectedImageIndex(0);
      carouselRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  };

  const handleThumbnailSelect = (index) => {
    setSelectedImageIndex(index);
    carouselRef.current?.scrollToIndex({ index, animated: true });
  };

  const onCarouselScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    if (index >= 0 && index !== selectedImageIndex && index < activeImages.length) {
      setSelectedImageIndex(index);
    }
  };

  const images = activeImages.length > 0 ? activeImages : (product?.image ? [product.image] : []);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product?.id));
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const addItem = useCartStore((state) => state.addItem);
  const cartItemCount = useCartStore((state) => state.getItemCount());
  const showConfirm = useFeedbackStore((state) => state.showConfirm);

  if (!product) {
    return (
      <View style={styles.container}>
        <ScreenHeader
          title="Product Details"
          showBack={true}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading product details...</Text>
        </View>
      </View>
    );
  }

  const discountPercent =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : null;

  const pType =
    product.productType ||
    (product.category === 'Contact Lenses' || product.category === 'contact-lenses'
      ? 'contact-lens'
      : product.category === 'Sunglasses'
      ? 'sunglasses'
      : 'eyeglasses');

  const handleSelectLenses = () => {
    navigation.navigate('LensSelection', {
      product,
      selectedColor,
    });
  };

  const handleContactLensAction = async () => {
    await addItem(product, {
      frameColor: 'Clear Blue Tint',
      contactLens: {
        boxes: 1,
        piecesPerBox: 6,
        powerType: 'spherical',
        prescriptionMethod: 'manual',
        od: { sph: '-2.00' },
        os: { sph: '-2.00' },
      },
      quantity: 1,
    });
    showConfirm({
      type: 'success',
      title: 'Contact Lenses Added',
      message: `${product.name} (1 Box · OD -2.00 / OS -2.00) has been added to your shopping bag.`,
      confirmText: 'View Bag',
      cancelText: 'Continue Shopping',
      onConfirm: () => navigation.navigate('Main', { screen: 'CartTab' }),
    });
  };

  const handleSunglassesAction = async () => {
    await addItem(product, {
      frameColor: selectedColor,
      image: images[0] || '',
      lensType: 'Polarized UV400 Sun Lens',
      lensPrice: 0,
      sunglass: {
        mode: 'standard',
        lensType: 'sg-polarized',
      },
      quantity: 1,
    });
    showConfirm({
      type: 'success',
      title: 'Sunglasses Added',
      message: `${product.name} (${selectedColor} · Polarized) has been added to your shopping bag.`,
      confirmText: 'View Bag',
      cancelText: 'Continue Shopping',
      onConfirm: () => navigation.navigate('Main', { screen: 'CartTab' }),
    });
  };

  const handleDirectAddFrame = async () => {
    await addItem(product, {
      frameColor: selectedColor,
      image: images[0] || '',
      lensType: 'Zero Power (Frame Only)',
      lensPrice: 0,
      quantity: 1,
    });
    showConfirm({
      type: 'success',
      title: 'Added to Bag',
      message: `${product.name} (${selectedColor}) has been added to your shopping bag.`,
      confirmText: 'View Bag',
      cancelText: 'Continue Shopping',
      onConfirm: () => navigation.navigate('Main', { screen: 'CartTab' }),
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      {/* 1. Compact Header with Back, Wishlist & Bag access */}
      <ScreenHeader
        title={product.brand || 'The Lens Hut'}
        showBack={true}
        rightAction={
          <View style={styles.headerRightActions}>
            <TouchableOpacity
              onPress={() => toggleWishlist(product)}
              style={styles.headerIconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isInWishlist ? 'heart' : 'heart-outline'}
                size={23}
                color={isInWishlist ? '#E11D48' : COLORS.secondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Main', { screen: 'CartTab' })}
              style={[styles.headerIconBtn, { marginLeft: 12 }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="bag-outline" size={23} color={COLORS.secondary} />
              {cartItemCount > 0 && (
                <View style={styles.headerCartBadge}>
                  <Text style={styles.headerCartBadgeText}>{cartItemCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}
      >
        {/* 2. Swipeable Photography Carousel */}
        <View style={styles.galleryWrapper}>
          <FlatList
            ref={carouselRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onCarouselScroll}
            keyExtractor={(_, index) => `img-${index}`}
            renderItem={({ item }) => (
              <View style={styles.slideContainer}>
                <Image
                  source={{ uri: item }}
                  style={styles.carouselImage}
                  resizeMode="contain"
                />
              </View>
            )}
          />

          {/* Badges on Gallery */}
          <View style={styles.galleryTopBadges}>
            {discountPercent ? (
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>{discountPercent}% OFF</Text>
              </View>
            ) : <View />}

            <View style={styles.inStockBadge}>
              <Ionicons name="checkmark-circle" size={13} color="#10B981" style={{ marginRight: 3 }} />
              <Text style={styles.inStockBadgeText}>In Stock</Text>
            </View>
          </View>

          {/* Carousel Page Dots Indicator */}
          {images.length > 1 && (
            <View style={styles.indicatorContainer}>
              <View style={styles.dotsRow}>
                {images.map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.dot,
                      selectedImageIndex === idx ? styles.activeDot : styles.inactiveDot,
                    ]}
                  />
                ))}
              </View>
              <View style={styles.counterBadge}>
                <Text style={styles.counterBadgeText}>
                  {selectedImageIndex + 1} / {images.length}
                </Text>
              </View>
            </View>
          )}

          {/* 3. Interactive Thumbnails Row */}
          {images.length > 1 && (
            <View style={styles.thumbnailsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailsScroll}>
                {images.map((img, idx) => {
                  const isSelected = selectedImageIndex === idx;
                  return (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.8}
                      style={[styles.thumbnailCard, isSelected && styles.selectedThumbnailCard]}
                      onPress={() => handleThumbnailSelect(idx)}
                    >
                      <Image source={{ uri: img }} style={styles.thumbImage} resizeMode="contain" />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>

        {/* 4. Product Details Card */}
        <View style={styles.detailsContainer}>
          {/* Brand & Category Row */}
          <View style={styles.brandRow}>
            <Text style={styles.brandTag}>{product.brand || 'The Lens Hut Collection'}</Text>
            {product.rating ? (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={13} color="#F59E0B" />
                <Text style={styles.ratingScore}>{product.rating}</Text>
                <Text style={styles.reviewCount}>({product.reviewsCount || 48})</Text>
              </View>
            ) : null}
          </View>

          {/* Product Name */}
          <Text style={styles.productTitle}>{product.name}</Text>

          {/* Price & Tax Row */}
          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>{formatCurrency(product.price)}</Text>
            {product.mrp && product.mrp > product.price ? (
              <Text style={styles.originalMrp}>{formatCurrency(product.mrp)}</Text>
            ) : null}
            {discountPercent ? (
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>Save {formatCurrency(product.mrp - product.price)}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.taxNote}>Inclusive of all taxes · Free standard delivery</Text>

          {/* 5. Color Choices as Visual Swatches */}
          {product.colors && product.colors.length > 0 && (
            <View style={styles.sectionDivider}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>
                  Frame Color: <Text style={styles.sectionValueBold}>{selectedColor}</Text>
                </Text>
                <Text style={styles.colorCount}>{product.colors.length} choices</Text>
              </View>
              <View style={styles.swatchesRow}>
                {product.colors.map((c) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <TouchableOpacity
                      key={c.name}
                      onPress={() => handleColorSelect(c)}
                      activeOpacity={0.7}
                      style={[
                        styles.swatchOuterRing,
                        isSelected && styles.selectedSwatchOuterRing,
                      ]}
                    >
                      <View style={[styles.swatchColorDot, { backgroundColor: c.hex }]} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* 6. Frame Specifications Grid */}
          <View style={styles.sectionDivider}>
            <Text style={styles.sectionTitle}>Frame Specifications</Text>
            <View style={styles.specsGrid}>
              <View style={styles.specBox}>
                <Text style={styles.specKey}>Shape</Text>
                <Text style={styles.specVal}>{product.frameShape || 'Square'}</Text>
              </View>
              <View style={styles.specBox}>
                <Text style={styles.specKey}>Rim Type</Text>
                <Text style={styles.specVal}>{product.frameType || 'Full Rim'}</Text>
              </View>
              <View style={styles.specBox}>
                <Text style={styles.specKey}>Material</Text>
                <Text style={styles.specVal}>{product.material || 'Acetate'}</Text>
              </View>
              <View style={styles.specBox}>
                <Text style={styles.specKey}>Size</Text>
                <Text style={styles.specVal}>{product.size || 'Medium (52-18)'}</Text>
              </View>
              {product.weight && (
                <View style={styles.specBox}>
                  <Text style={styles.specKey}>Weight</Text>
                  <Text style={styles.specVal}>{product.weight}</Text>
                </View>
              )}
              <View style={styles.specBox}>
                <Text style={styles.specKey}>Gender</Text>
                <Text style={styles.specVal}>{product.gender || 'Unisex'}</Text>
              </View>
            </View>
          </View>

          {/* 7. Product Description */}
          {product.description ? (
            <View style={styles.sectionDivider}>
              <Text style={styles.sectionTitle}>Craft & Design</Text>
              <Text style={styles.descriptionParagraph}>{product.description}</Text>
            </View>
          ) : null}

          {/* 8. Assurance & Guarantees Box */}
          <View style={styles.assuranceCard}>
            <View style={styles.assuranceItem}>
              <View style={styles.assuranceIconCircle}>
                <Ionicons name="shield-checkmark" size={17} color={COLORS.primary} />
              </View>
              <View style={styles.assuranceTextCol}>
                <Text style={styles.assuranceTitle}>1-Year Warranty</Text>
                <Text style={styles.assuranceSub}>Free replacement for manufacturing defects</Text>
              </View>
            </View>

            <View style={styles.assuranceDivider} />

            <View style={styles.assuranceItem}>
              <View style={styles.assuranceIconCircle}>
                <Ionicons name="swap-horizontal" size={17} color={COLORS.primary} />
              </View>
              <View style={styles.assuranceTextCol}>
                <Text style={styles.assuranceTitle}>7 Days Easy Return / Exchange</Text>
                <Text style={styles.assuranceSub}>No questions asked doorstep pickup</Text>
              </View>
            </View>

            <View style={styles.assuranceDivider} />

            <View style={styles.assuranceItem}>
              <View style={styles.assuranceIconCircle}>
                <Ionicons name="ribbon-outline" size={17} color={COLORS.primary} />
              </View>
              <View style={styles.assuranceTextCol}>
                <Text style={styles.assuranceTitle}>100% Certified Authentic</Text>
                <Text style={styles.assuranceSub}>Original branded frames & precision optics</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 9. Persistent Bottom Action Area */}
      <View style={[styles.bottomActionBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomPriceLabel}>Total Amount</Text>
          <Text style={styles.bottomPriceValue}>{formatCurrency(product.price)}</Text>
        </View>

        <View style={styles.bottomButtonsCol}>
          {pType === 'eyeglasses' ? (
            <View style={styles.dualActionsRow}>
              <TouchableOpacity
                style={styles.frameOnlyButton}
                activeOpacity={0.8}
                onPress={handleDirectAddFrame}
              >
                <Text style={styles.frameOnlyButtonText}>Frame Only</Text>
              </TouchableOpacity>

              <Button
                title="Select Lenses & Buy"
                onPress={handleSelectLenses}
                variant="primary"
                size="md"
                rightIcon={<Ionicons name="arrow-forward" size={16} color={COLORS.surface} />}
                style={styles.selectLensesButton}
              />
            </View>
          ) : (
            <Button
              title={
                pType === 'contact-lens'
                  ? 'Add to Bag'
                  : 'Add Sunglasses to Bag'
              }
              onPress={
                pType === 'contact-lens'
                  ? handleContactLensAction
                  : handleSunglassesAction
              }
              variant="primary"
              size="lg"
              rightIcon={<Ionicons name="bag-check" size={18} color={COLORS.surface} />}
              style={styles.fullWidthActionButton}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: FONTS.medium,
    color: COLORS.textMuted,
    fontSize: 14,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  // Header Actions
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    padding: 4,
    position: 'relative',
  },
  headerCartBadge: {
    position: 'absolute',
    top: -2,
    right: -6,
    backgroundColor: COLORS.primary,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  headerCartBadgeText: {
    color: COLORS.surface,
    fontFamily: FONTS.bold,
    fontSize: 10,
  },
  // Gallery & Carousel
  galleryWrapper: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    position: 'relative',
    paddingBottom: 12,
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    height: 290,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  galleryTopBadges: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discountBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.surface,
  },
  inStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  inStockBadgeText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#065F46',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 16,
    position: 'relative',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    height: 5,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  activeDot: {
    width: 20,
    backgroundColor: COLORS.secondary,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#CBD5E1',
  },
  counterBadge: {
    position: 'absolute',
    right: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  counterBadgeText: {
    fontFamily: FONTS.medium,
    fontSize: 10.5,
    color: COLORS.surface,
  },
  // Thumbnails
  thumbnailsContainer: {
    marginTop: 12,
  },
  thumbnailsScroll: {
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  thumbnailCard: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginRight: 8,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedThumbnailCard: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F9FF',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  // Details Card
  detailsContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  brandTag: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingScore: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#92400E',
    marginLeft: 3,
  },
  reviewCount: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: '#B45309',
    marginLeft: 2,
  },
  productTitle: {
    fontFamily: FONTS.bold,
    fontSize: 21,
    color: COLORS.secondary,
    lineHeight: 28,
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  currentPrice: {
    fontFamily: FONTS.extraBold,
    fontSize: 24,
    color: COLORS.secondary,
  },
  originalMrp: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
    marginLeft: 10,
  },
  saveBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 10,
  },
  saveBadgeText: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: '#15803D',
  },
  taxNote: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  sectionDivider: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 14.5,
    color: COLORS.secondary,
  },
  sectionValueBold: {
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  colorCount: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  swatchesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swatchOuterRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  selectedSwatchOuterRing: {
    borderColor: COLORS.primary,
  },
  swatchColorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  // Specs Grid
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specBox: {
    width: '33.33%',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  specKey: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  specVal: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.secondary,
    marginTop: 2,
  },
  descriptionParagraph: {
    fontFamily: FONTS.regular,
    fontSize: 13.5,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginTop: 8,
  },
  // Assurance Card
  assuranceCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginTop: 8,
  },
  assuranceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  assuranceIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  assuranceTextCol: {
    flex: 1,
  },
  assuranceTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.secondary,
  },
  assuranceSub: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  assuranceDivider: {
    height: 1,
    backgroundColor: '#E0F2FE',
    marginVertical: 4,
  },
  // Persistent Bottom Action Bar
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  bottomPriceCol: {
    marginRight: 14,
  },
  bottomPriceLabel: {
    fontFamily: FONTS.regular,
    fontSize: 10.5,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  bottomPriceValue: {
    fontFamily: FONTS.extraBold,
    fontSize: 19,
    color: COLORS.secondary,
  },
  bottomButtonsCol: {
    flex: 1,
  },
  dualActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  frameOnlyButton: {
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#F8FAFC',
  },
  frameOnlyButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12.5,
    color: COLORS.secondary,
  },
  selectLensesButton: {
    flex: 1,
    height: 44,
  },
  fullWidthActionButton: {
    flex: 1,
    height: 46,
  },
});

export default ProductDetailScreen;

