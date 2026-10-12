import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import LAYOUT from '../../constants/layout';
import Button from '../../components/common/Button';
import { storage, STORAGE_KEYS } from '../../utils/storage';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    image: require('../../../assets/images/auth/login-hero.png'),
    badge: 'EXCLUSIVE COLLECTION',
    title: 'Curated Luxury\nDesigner Frames',
    description:
      'Discover aerospace titanium and handcrafted Italian acetate silhouettes sculpted to complement your distinct face shape.',
  },
  {
    id: '2',
    image: require('../../../assets/images/auth/signup-hero.png'),
    badge: 'OPTICAL EXCELLENCE',
    title: 'Custom Optics\nDelivered To You',
    description:
      'Engineered prescription lenses, blue-light filtering, and zero-distortion clarity delivered securely to your doorstep.',
  },
];

export const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleFinish = async (targetScreen = 'Main') => {
    await storage.set(STORAGE_KEYS.HAS_ONBOARDED, true);
    navigation.replace(targetScreen);
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleFinish('Main');
    }
  };

  const handleSignIn = () => {
    handleFinish('Login');
  };

  const onMomentumScrollEnd = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index >= 0 && index < SLIDES.length) {
      setCurrentIndex(index);
    }
  };

  const renderSlide = ({ item, index }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.imageContainer}>
          <Image
            source={item.image}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(20, 35, 46, 0.2)', 'transparent', COLORS.surface]}
            locations={[0, 0.45, 1]}
            style={styles.imageGradient}
          />
          <View style={styles.slideCounterBadge}>
            <Text style={styles.slideCounterText}>
              {`0${index + 1}`}
              <Text style={styles.slideCounterTotal}> / {`0${SLIDES.length}`}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.contentCard}>
          <View style={styles.badgeWrapper}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>

          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Top Header Floating Skip Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => handleFinish('Main')}
          style={styles.skipButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slide Carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        keyExtractor={(item) => item.id}
        style={styles.flatList}
      />

      {/* Footer Controls */}
      <View style={styles.footer}>
        {/* Pagination Indicator */}
        <View style={styles.indicatorContainer}>
          {SLIDES.map((_, index) => {
            const isActive = currentIndex === index;
            return (
              <View
                key={index}
                style={[
                  styles.dot,
                  isActive ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            );
          })}
        </View>

        {/* Action Button */}
        <Button
          title={isLastSlide ? 'Get Started' : 'Continue'}
          onPress={handleNext}
          variant="primary"
          size="lg"
          rightIcon={
            <Ionicons
              name={isLastSlide ? 'checkmark-circle-outline' : 'arrow-forward-outline'}
              size={20}
              color={COLORS.surface}
            />
          }
          style={styles.actionButton}
        />

        {/* Direct Login Shortcut */}
        <View style={styles.signInRow}>
          <Text style={styles.signInPrompt}>Already have an account? </Text>
          <TouchableOpacity onPress={handleSignIn} activeOpacity={0.7}>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: (StatusBar.currentHeight || 24) + 12,
    paddingBottom: 8,
  },
  skipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    ...LAYOUT.shadows.sm,
  },
  skipText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.secondaryMuted,
  },
  flatList: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  imageContainer: {
    width,
    height: height * 0.52,
    position: 'relative',
    backgroundColor: COLORS.borderLight,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  slideCounterBadge: {
    position: 'absolute',
    bottom: 24,
    right: 22,
    backgroundColor: 'rgba(20, 35, 46, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  slideCounterText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.surface,
    letterSpacing: 1,
  },
  slideCounterTotal: {
    color: COLORS.textMuted,
    fontFamily: FONTS.medium,
  },
  contentCard: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 14,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  badgeWrapper: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.primary,
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 26,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 33,
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 6,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    backgroundColor: COLORS.surface,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 28,
    backgroundColor: COLORS.primary,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: COLORS.borderDark,
  },
  actionButton: {
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  signInPrompt: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  signInLink: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.primary,
  },
});

export default OnboardingScreen;

