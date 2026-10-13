import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
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

const { width } = Dimensions.get('window');

export const ProductDetailScreen = ({ route, navigation }) => {
  const incomingProduct = route.params?.product;
  const productId = route.params?.productId || incomingProduct?.id;
  const [product, setProduct] = useState(incomingProduct || null);

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
    }
  };

  const images = activeImages;
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product?.id));
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const addItem = useCartStore((state) => state.addItem);
  const showFeedback = useFeedbackStore((state) => state.showConfirm);

  if (!product) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Product Details" onBackPress={() => navigation.goBack()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontFamily: FONTS.medium, color: COLORS.textMuted }}>Product not found</Text>
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
        os: { sph: '-2.00' }
      },
      quantity: 1
    });
    showConfirm({
      type: 'success',
      title: 'Contact Lenses Added',
      message: `${product.name} (1 Box · OD -2.00 / OS -2.00) has been added to your shopping bag.`,
      confirmText: 'View Bag',
      cancelText: 'Continue Shopping',
      onConfirm: () => navigation.navigate('CartTab'),
    });
  };

  const handleSunglassesAction = async () => {
    await addItem(product, {
      frameColor: selectedColor,
      image: activeImages[0] || '',
      lensType: 'Polarized UV400 Sun Lens',
      lensPrice: 0,
      sunglass: {
        mode: 'standard',
        lensType: 'sg-polarized'
      },
      quantity: 1
    });
    showConfirm({
      type: 'success',
      title: 'Sunglasses Added',
      message: `${product.name} (${selectedColor} · Polarized) has been added to your shopping bag.`,
      confirmText: 'View Bag',
      cancelText: 'Continue Shopping',
      onConfirm: () => navigation.navigate('CartTab'),
    });
  };

  const handleDirectAddFrame = async () => {
    await addItem(product, {
      frameColor: selectedColor,
      image: activeImages[0] || '',
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
      onConfirm: () => navigation.navigate('CartTab'),
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <ScreenHeader
        title={product.brand || 'The Lens Hut'}
        rightAction={
          <TouchableOpacity
            onPress={() => toggleWishlist(product)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isInWishlist ? 'heart' : 'heart-outline'}
              size={24}
              color={isInWishlist ? COLORS.primary : COLORS.secondary}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: images[selectedImageIndex] }}
            style={styles.mainImage}
            resizeMode="cover"
          />

          {discountPercent ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>{discountPercent}% OFF</Text>
            </View>
          ) : null}

          {/* Thumbnails row */}
          {images.length > 1 && (
            <View style={styles.thumbnailsRow}>
              {images.map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  style={[
                    styles.thumbnail,
                    selectedImageIndex === idx && styles.selectedThumbnail,
                  ]}
                  onPress={() => setSelectedImageIndex(idx)}
                >
                  <Image source={{ uri: img }} style={styles.thumbImage} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Product Details Header */}
        <View style={styles.detailsCard}>
          <View style={styles.categoryRatingRow}>
            <Text style={styles.categoryText}>{product.category}</Text>
            {product.rating ? (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={13} color={COLORS.star} />
                <Text style={styles.ratingText}>{product.rating}</Text>
                <Text style={styles.reviewsCountText}>
                  ({product.reviewsCount || 48} reviews)
                </Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.productName}>{product.name}</Text>

          {/* Price Row */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatCurrency(product.price)}</Text>
            {product.mrp && product.mrp > product.price ? (
              <Text style={styles.mrp}>{formatCurrency(product.mrp)}</Text>
            ) : null}
            <Text style={styles.taxInfo}>inclusive of all taxes</Text>
          </View>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <View style={styles.optionSection}>
              <Text style={styles.optionLabel}>
                Frame Color: <Text style={styles.selectedOptionValue}>{selectedColor}</Text>
              </Text>
              <View style={styles.colorSwatchesRow}>
                {product.colors.map((c) => {
                  const isSelected = selectedColor === c.name;
                  return (
                    <TouchableOpacity
                      key={c.name}
                      onPress={() => handleColorSelect(c)}
                      style={[
                        styles.colorSwatchRing,
                        isSelected && styles.selectedColorSwatchRing,
                      ]}
                    >
                      <View style={[styles.colorSwatchDot, { backgroundColor: c.hex }]} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Frame Specifications */}
          <View style={styles.specsSection}>
            <Text style={styles.sectionHeading}>Frame Specifications</Text>
            <View style={styles.specsGrid}>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Frame Shape</Text>
                <Text style={styles.specValue}>{product.frameShape || 'Geometric'}</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Rim Type</Text>
                <Text style={styles.specValue}>{product.frameType || 'Full Rim'}</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Material</Text>
                <Text style={styles.specValue}>{product.material || 'Acetate'}</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Size</Text>
                <Text style={styles.specValue}>{product.size || 'Medium (52-18-140)'}</Text>
              </View>
              {product.weight && (
                <View style={styles.specItem}>
                  <Text style={styles.specLabel}>Frame Weight</Text>
                  <Text style={styles.specValue}>{product.weight}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Description */}
          {product.description ? (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionHeading}>About this Frame</Text>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </View>
          ) : null}

          {/* Guarantees Box */}
          <View style={styles.guaranteesBox}>
            <View style={styles.guaranteeItem}>
              <Ionicons name="checkmark-done-circle-outline" size={20} color={COLORS.primary} />
              <Text style={styles.guaranteeText}>1-Year Warranty on Frame</Text>
            </View>
            <View style={styles.guaranteeItem}>
              <Ionicons name="swap-horizontal-outline" size={20} color={COLORS.primary} />
              <Text style={styles.guaranteeText}>7 Days Hassle-Free Exchange</Text>
            </View>
            <View style={styles.guaranteeItem}>
              <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
              <Text style={styles.guaranteeText}>Authentic Certified Optics</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {pType === 'eyeglasses' && (
          <TouchableOpacity
            style={styles.frameOnlyBtn}
            onPress={handleDirectAddFrame}
          >
            <Text style={styles.frameOnlyBtnText}>Frame Only</Text>
          </TouchableOpacity>
        )}

        <Button
          title={
            pType === 'contact-lens'
              ? 'Add Contact Lenses to Bag'
              : pType === 'sunglasses'
              ? 'Add Sunglasses to Bag'
              : 'Select Lenses & Buy'
          }
          onPress={
            pType === 'contact-lens'
              ? handleContactLensAction
              : pType === 'sunglasses'
              ? handleSunglassesAction
              : handleSelectLenses
          }
          variant="primary"
          size="lg"
          rightIcon={<Ionicons name="arrow-forward" size={18} color={COLORS.surface} />}
          style={pType === 'eyeglasses' ? styles.selectLensesBtn : { flex: 1 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    position: 'relative',
    paddingBottom: 16,
  },
  mainImage: {
    width: '100%',
    height: 280,
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: LAYOUT.radius.xs,
  },
  discountBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.surface,
  },
  thumbnailsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: LAYOUT.radius.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginHorizontal: 6,
    overflow: 'hidden',
  },
  selectedThumbnail: {
    borderColor: COLORS.primary,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  detailsCard: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderTopLeftRadius: LAYOUT.radius.xl,
    borderTopRightRadius: LAYOUT.radius.xl,
    marginTop: -16,
    ...LAYOUT.shadows.sm,
  },
  categoryRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: LAYOUT.radius.xs,
  },
  ratingText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.secondary,
    marginLeft: 4,
  },
  reviewsCountText: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  productName: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.secondary,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  price: {
    fontFamily: FONTS.extraBold,
    fontSize: 22,
    color: COLORS.secondary,
  },
  mrp: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  taxInfo: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
    marginLeft: 8,
  },
  optionSection: {
    marginBottom: 20,
  },
  optionLabel: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  selectedOptionValue: {
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
  },
  colorSwatchesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorSwatchRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  selectedColorSwatchRing: {
    borderColor: COLORS.primary,
  },
  colorSwatchDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  specsSection: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.secondary,
    marginBottom: 12,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: COLORS.borderLight,
    borderRadius: LAYOUT.radius.md,
    padding: 12,
  },
  specItem: {
    width: '50%',
    paddingVertical: 6,
  },
  specLabel: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  specValue: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.secondary,
    marginTop: 2,
  },
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  guaranteesBox: {
    backgroundColor: COLORS.primaryUltraLight,
    padding: 14,
    borderRadius: LAYOUT.radius.md,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  guaranteeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  guaranteeText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.secondary,
    marginLeft: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 76,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    ...LAYOUT.shadows.lg,
  },
  frameOnlyBtn: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: LAYOUT.radius.md,
    borderWidth: 1.5,
    borderColor: COLORS.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  frameOnlyBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.secondary,
  },
  selectLensesBtn: {
    flex: 1,
  },
});

export default ProductDetailScreen;
