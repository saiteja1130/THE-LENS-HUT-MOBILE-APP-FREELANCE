import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
} from 'react-native';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import ProductCard from '../../components/product/ProductCard';
import EmptyState from '../../components/common/EmptyState';
import ScreenHeader from '../../components/common/ScreenHeader';
import useWishlistStore from '../../store/wishlistStore';

export const WishlistScreen = ({ navigation }) => {
  const items = useWishlistStore((state) => state.items);

  const renderItem = ({ item }) => (
    <View style={styles.column}>
      <ProductCard
        product={item}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <ScreenHeader
        title={`My Wishlist (${items.length})`}
        showCart={true}
      />

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => (item.id || item._id).toString()}
        numColumns={2}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            iconName="heart-outline"
            title="Your Wishlist is Empty"
            description="Explore our curated catalogue and tap the heart icon on any frame you love to save it for later."
            actionTitle="Discover Eyewear"
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
  topBar: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  topBarTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.secondary,
  },
  list: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  column: {
    width: '50%',
    padding: 6,
  },
});

export default WishlistScreen;
