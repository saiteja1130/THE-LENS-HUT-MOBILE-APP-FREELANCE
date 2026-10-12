import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StatusBar,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import LAYOUT from '../../constants/layout';
import ProductCard from '../../components/product/ProductCard';
import EmptyState from '../../components/common/EmptyState';
import ScreenHeader from '../../components/common/ScreenHeader';
import productApi from '../../services/productApi';
import categoryApi from '../../services/categoryApi';

const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured & Popular' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
  { id: 'rating', label: 'Customer Rating' },
];

const SHAPE_OPTIONS = ['All', 'Aviator', 'Square', 'Cat-Eye', 'Round', 'Wayfarer'];

export const ShopScreen = ({ route, navigation }) => {
  const initialCategory = route?.params?.category || 'all';
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedShape, setSelectedShape] = useState('All');
  const [selectedSort, setSelectedSort] = useState('featured');
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        productApi.getProducts(),
        categoryApi.getActiveCategories(),
      ]);
      if (prodRes.success && Array.isArray(prodRes.data)) {
        setProducts(prodRes.data);
      }
      if (catRes.success && Array.isArray(catRes.data)) {
        setCategoriesList(catRes.data);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const categories = useMemo(
    () => [{ id: 'all', name: 'All Products', slug: 'all' }, ...categoriesList],
    [categoriesList]
  );

  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      list = list.filter(
        (p) =>
          p.categorySlug === selectedCategory ||
          p.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Shape filter
    if (selectedShape !== 'All') {
      list = list.filter((p) => p.frameShape?.toLowerCase() === selectedShape.toLowerCase());
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.material.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (selectedSort === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (selectedSort === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (selectedSort === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return list;
  }, [selectedCategory, selectedShape, searchQuery, selectedSort]);

  const renderProductItem = ({ item }) => (
    <View style={styles.productColumn}>
      <ProductCard
        product={item}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <ScreenHeader showLogo={true} showWishlist={true} showCart={true} />

      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search-outline" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search frames, brands, styles..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={route?.params?.focusSearch || false}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.sortTriggerBtn}
          onPress={() => setIsSortModalVisible(true)}
        >
          <Ionicons name="swap-vertical-outline" size={20} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      {/* Category Horizontal Pills */}
      <View style={styles.categoryBar}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoryScroll}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.slug;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item.slug)}
                style={[styles.categoryChip, isSelected && styles.selectedCategoryChip]}
              >
                <Text
                  style={[styles.categoryChipText, isSelected && styles.selectedCategoryChipText]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Frame Shape Filter Sub-bar */}
      <View style={styles.shapeBar}>
        <FlatList
          data={SHAPE_OPTIONS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.shapeScroll}
          renderItem={({ item }) => {
            const isSelected = selectedShape === item;
            return (
              <TouchableOpacity
                onPress={() => setSelectedShape(item)}
                style={[styles.shapeChip, isSelected && styles.selectedShapeChip]}
              >
                <Text style={[styles.shapeChipText, isSelected && styles.selectedShapeChipText]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Counter Row */}
      <View style={styles.resultsInfoRow}>
        <Text style={styles.resultsCountText}>
          Showing <Text style={styles.boldText}>{filteredProducts.length}</Text> items
        </Text>
        <TouchableOpacity
          onPress={() => setIsSortModalVisible(true)}
          style={styles.activeSortDisplay}
        >
          <Text style={styles.activeSortText}>
            {SORT_OPTIONS.find((s) => s.id === selectedSort)?.label}
          </Text>
          <Ionicons name="chevron-down" size={14} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            iconName="search-outline"
            title="No matching frames found"
            description="Try changing the category, removing filters, or searching with different keywords."
            actionTitle="Reset Filters"
            onActionPress={() => {
              setSelectedCategory('all');
              setSelectedShape('All');
              setSearchQuery('');
            }}
          />
        }
      />

      {/* Sort Modal (Using standard React Native Modal per user requirement) */}
      <Modal
        visible={isSortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSortModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsSortModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort By</Text>
              <TouchableOpacity onPress={() => setIsSortModalVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.secondary} />
              </TouchableOpacity>
            </View>

            {SORT_OPTIONS.map((option) => {
              const isSelected = selectedSort === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={styles.sortOptionItem}
                  onPress={() => {
                    setSelectedSort(option.id);
                    setIsSortModalVisible(false);
                  }}
                >
                  <Text style={[styles.sortOptionText, isSelected && styles.selectedSortOptionText]}>
                    {option.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.borderLight,
    height: 42,
    borderRadius: LAYOUT.radius.md,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginLeft: 8,
    padding: 0,
  },
  sortTriggerBtn: {
    width: 42,
    height: 42,
    borderRadius: LAYOUT.radius.md,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  categoryBar: {
    backgroundColor: COLORS.surface,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  categoryScroll: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: LAYOUT.radius.round,
    backgroundColor: COLORS.borderLight,
    marginRight: 8,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.secondary,
  },
  categoryChipText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  selectedCategoryChipText: {
    color: COLORS.surface,
  },
  shapeBar: {
    backgroundColor: COLORS.surface,
    paddingVertical: 6,
  },
  shapeScroll: {
    paddingHorizontal: 16,
  },
  shapeChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: LAYOUT.radius.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6,
  },
  selectedShapeChip: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  shapeChipText: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  selectedShapeChipText: {
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
  },
  resultsInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resultsCountText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  boldText: {
    fontFamily: FONTS.semiBold,
    color: COLORS.secondary,
  },
  activeSortDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeSortText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.secondary,
    marginRight: 4,
  },
  productList: {
    paddingHorizontal: 10,
    paddingBottom: 40,
  },
  productColumn: {
    width: '50%',
    padding: 6,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: LAYOUT.radius.lg,
    borderTopRightRadius: LAYOUT.radius.lg,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.secondary,
  },
  sortOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  sortOptionText: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  selectedSortOptionText: {
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
  },
});

export default ShopScreen;
