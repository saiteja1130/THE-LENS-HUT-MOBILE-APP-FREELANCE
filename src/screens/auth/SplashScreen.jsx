import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar, Image } from 'react-native';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import LAYOUT from '../../constants/layout';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import useWishlistStore from '../../store/wishlistStore';
import { storage, STORAGE_KEYS } from '../../utils/storage';

const LOGO_IMG = require('../../../assets/images/Logo.png');

export const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const initAuth = useAuthStore((state) => state.initAuth);
  const initCart = useCartStore((state) => state.initCart);
  const initWishlist = useWishlistStore((state) => state.initWishlist);

  useEffect(() => {
    // Start animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Initialize stores & check destination
    const checkState = async () => {
      await Promise.all([initAuth(), initCart(), initWishlist()]);
      const hasOnboarded = await storage.get(STORAGE_KEYS.HAS_ONBOARDED);

      setTimeout(() => {
        if (!hasOnboarded) {
          navigation.replace('Onboarding');
        } else {
          navigation.replace('Main');
        }
      }, 1900);
    };

    checkState();
  }, [fadeAnim, scaleAnim, navigation, initAuth, initCart, initWishlist]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoCard}>
          <Image
            source={LOGO_IMG}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.tagline}>PRECISION OPTICS • MODERN ELEGANCE</Text>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.versionText}>v1.0.0 (Android)</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCard: {
    width: 260,
    height: 90,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoImage: {
    width: 250,
    height: 80,
  },
  tagline: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    color: COLORS.secondary,
    letterSpacing: 2,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
  },
  versionText: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
  },
});

export default SplashScreen;
