import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
  Platform,
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
  { id: 'rating', label: 'Highest Customer Rating' },
];

const SHAPE_OPTIONS = ['All', 'Aviator', 'Square', 'Cat-Eye', 'Round', 'Wayfarer'];

export const ShopScreen = ({ route, navigation }) => {
  const initialCategory = route?.params?.category || 'all';
  const searchInputRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(route?.params?.search || route?.params?.searchQuery || '');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedShape, setSelectedShape] = useState('All');
  const [selectedSort, setSelectedSort] = useState('featured');
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);

  // Sync category and search focus when navigation params change
  useEffect(() => {
    if (route?.params?.category !== undefined) {
      setSelectedCategory(route.params.category || 'all');
    }
    if (route?.params?.search !== undefined || route?.params?.searchQuery !== undefined) {
      setSearchQuery(route.params.search || route.params.searchQuery || '');
    }
    if (route?.params?.focusSearch) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
        navigation.setParams({ focusSearch: undefined });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [route?.params?.category, route?.params?.search, route?.params?.searchQuery, route?.params?.focusSearch, navigation]);

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
      // Keep existing products on network error
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
    () => [{ id: 'all', name: 'All Frames', slug: 'all' }, ...categoriesList],
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
  }, [products, selectedCategory, selectedShape, searchQuery, selectedSort]);

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setSelectedShape('All');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedShape !== 'All' || searchQuery.trim().length > 0;

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
      
      {/* 1. Top Bar with Logo, Wishlist & Bag */}
      <ScreenHeader showLogo={true} showWishlist={true} showCart={true} />

      {/* 2. Prominent Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={19} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search frames, brands, styles..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={route?.params?.focusSearch || false}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 3. Horizontal Scrollable Category Chips */}
      <View style={styles.filterSection}>
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
                activeOpacity={0.7}
                style={[styles.categoryChip, isSelected && styles.selectedCategoryChip]}
              >
                <Text style={[styles.categoryChipText, isSelected && styles.selectedCategoryChipText]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* 4. Horizontal Scrollable Frame Shape Chips */}
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
                activeOpacity={0.7}
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

      {/* 5. Compact Result Count and Sort Bar */}
      <View style={styles.metaRow}>
        <View style={styles.countWrapper}>
          <Text style={styles.resultsCountText}>
            Showing <Text style={styles.resultsCountBold}>{filteredProducts.length}</Text>{' '}
            {filteredProducts.length === 1 ? 'frame' : 'frames'}
          </Text>
          {hasActiveFilters && (
            <TouchableOpacity onPress={resetAllFilters} style={styles.inlineResetBtn}>
              <Text style={styles.inlineResetText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setIsSortModalVisible(true)}
          activeOpacity={0.7}
          style={styles.sortTriggerPill}
        >
          <Ionicons name="swap-vertical" size={14} color={COLORS.secondary} style={{ marginRight: 4 }} />
          <Text style={styles.sortTriggerLabel}>
            {SORT_OPTIONS.find((s) => s.id === selectedSort)?.label}
          </Text>
          <Ionicons name="chevron-down" size={12} color={COLORS.secondary} style={{ marginLeft: 2 }} />
        </TouchableOpacity>
      </View>

      {/* 6. Product Grid */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={5}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyState
              iconName="search-outline"
              title="No matching frames found"
              description="Try adjusting your search keywords, switching categories, or resetting the shape filters."
              actionTitle="Reset All Filters"
              onActionPress={resetAllFilters}
            />
          </View>
        }
      />

      {/* 7. Bottom Sheet Sort Modal */}
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
            <View style={styles.modalGrabber} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort By</Text>
              <TouchableOpacity
                onPress={() => setIsSortModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color={COLORS.secondary} />
              </TouchableOpacity>
            </View>

            {SORT_OPTIONS.map((option) => {
              const isSelected = selectedSort === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.sortOptionItem, isSelected && styles.selectedSortOptionItem]}
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
  // Search section
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: COLORS.surface,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: 4,
    marginLeft: 4,
  },
  // Filter bar
  filterSection: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: 8,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  categoryChipText: {
    fontFamily: FONTS.medium,
    fontSize: 12.5,
    color: COLORS.textSecondary,
  },
  selectedCategoryChipText: {
    color: COLORS.surface,
    fontFamily: FONTS.semiBold,
  },
  shapeScroll: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 2,
  },
  shapeChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: 'transparent',
    marginRight: 6,
  },
  selectedShapeChip: {
    backgroundColor: '#E6F0FA',
    borderColor: COLORS.primary,
  },
  shapeChipText: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
    color: COLORS.textMuted,
  },
  selectedShapeChipText: {
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
  },
  // Meta count & sort bar
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.background,
  },
  countWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultsCountText: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: COLORS.textMuted,
  },
  resultsCountBold: {
    fontFamily: FONTS.semiBold,
    color: COLORS.secondary,
  },
  inlineResetBtn: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  inlineResetText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.secondary,
  },
  sortTriggerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  sortTriggerLabel: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.secondary,
  },
  // Product Grid
  productList: {
    paddingHorizontal: 10,
    paddingTop: 4,
    paddingBottom: 32,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productColumn: {
    width: '50%',
    padding: 6,
  },
  emptyContainer: {
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  // Sort Bottom Sheet Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalGrabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 17,
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
  selectedSortOptionItem: {
    backgroundColor: '#F8FAFC',
  },
  sortOptionText: {
    fontFamily: FONTS.medium,
    fontSize: 14.5,
    color: COLORS.textPrimary,
  },
  selectedSortOptionText: {
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
  },
});

export default ShopScreen;

