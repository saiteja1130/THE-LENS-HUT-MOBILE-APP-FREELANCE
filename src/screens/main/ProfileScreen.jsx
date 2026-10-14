import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import LAYOUT from '../../constants/layout';
import ScreenHeader from '../../components/common/ScreenHeader';
import useAuthStore from '../../store/authStore';
import useWishlistStore from '../../store/wishlistStore';
import useFeedbackStore from '../../store/feedbackStore';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'LH';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
};

export const ProfileScreen = ({ navigation }) => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const showConfirm = useFeedbackStore((state) => state.showConfirm);
  const showToast = useFeedbackStore((state) => state.showToast);

  const handleLogout = () => {
    showConfirm({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out of your account on this device?',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
      destructive: true,
      onConfirm: async () => {
        await logout();
        showToast('Signed out successfully', 'info');
      },
    });
  };

  const renderMenuItem = ({
    icon,
    title,
    subtitle,
    onPress,
    badgeCount,
    isLast = false,
  }) => {
    return (
      <TouchableOpacity
        style={[styles.menuItem, isLast && styles.menuItemLast]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.menuIconContainer}>
          <Ionicons name={icon} size={20} color={COLORS.secondary} />
        </View>

        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>{title}</Text>
          {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
        </View>

        {badgeCount !== undefined && badgeCount > 0 ? (
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>{badgeCount}</Text>
          </View>
        ) : null}

        <Ionicons name="chevron-forward" size={17} color={COLORS.textMuted} style={styles.chevron} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <ScreenHeader title="My Account" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Profile Card (Authenticated State) */}
        {isAuthenticated && user ? (
          <View style={styles.userCard}>
            <View style={styles.userTopRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
              </View>

              <View style={styles.userInfo}>
                <View style={styles.memberBadge}>
                  <Ionicons name="shield-checkmark" size={11} color={COLORS.primary} style={{ marginRight: 3 }} />
                  <Text style={styles.memberBadgeText}>VERIFIED MEMBER</Text>
                </View>
                <Text style={styles.userName} numberOfLines={1}>
                  {user.name || 'Valued Customer'}
                </Text>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {user.email}
                </Text>
                {user.phone ? (
                  <Text style={styles.userPhone} numberOfLines={1}>
                    {user.phone}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Clear Edit Profile Action Button */}
            <View style={styles.userActionDivider} />
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.editProfileBtn}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Ionicons name="create-outline" size={16} color={COLORS.secondary} style={{ marginRight: 6 }} />
              <Text style={styles.editProfileBtnText}>Edit Profile Details</Text>
              <Ionicons name="chevron-forward" size={15} color={COLORS.secondary} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          </View>
        ) : (
          /* Guest / Signed-Out Card */
          <View style={styles.guestCard}>
            <View style={styles.guestHeaderRow}>
              <View style={styles.guestIconCircle}>
                <Ionicons name="person-outline" size={26} color={COLORS.primary} />
              </View>
              <View style={styles.guestInfo}>
                <Text style={styles.guestTitle}>Welcome to The Lens Hut</Text>
                <Text style={styles.guestSubtitle}>
                  Sign in to track orders, save vision prescriptions, and sync your favorite frames.
                </Text>
              </View>
            </View>

            {/* Quick trust benefits */}
            <View style={styles.guestPerksRow}>
              <View style={styles.guestPerkItem}>
                <Ionicons name="checkmark-circle" size={13} color={COLORS.primary} />
                <Text style={styles.guestPerkText}>Order Tracking</Text>
              </View>
              <View style={styles.guestPerkItem}>
                <Ionicons name="checkmark-circle" size={13} color={COLORS.primary} />
                <Text style={styles.guestPerkText}>Prescriptions</Text>
              </View>
              <View style={styles.guestPerkItem}>
                <Ionicons name="checkmark-circle" size={13} color={COLORS.primary} />
                <Text style={styles.guestPerkText}>Fast Checkout</Text>
              </View>
            </View>

            {/* Prominent Sign In Action */}
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.signInBtn}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.signInBtnText}>Sign In / Register</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.surface} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        )}

        {/* Section 1: Orders & Saved Items */}
        <Text style={styles.sectionHeaderTitle}>Orders & Saved Items</Text>
        <View style={styles.menuGroup}>
          {renderMenuItem({
            icon: 'bag-handle-outline',
            title: 'My Orders',
            subtitle: 'Track deliveries, invoices & prescription history',
            onPress: () => navigation.navigate('OrderHistory'),
          })}
          {renderMenuItem({
            icon: 'heart-outline',
            title: 'Saved Wishlist',
            subtitle: 'Frames and lenses you have marked as favorites',
            badgeCount: wishlistCount,
            onPress: () => navigation.navigate('Main', { screen: 'WishlistTab' }),
            isLast: true,
          })}
        </View>

        {/* Section 2: Help & Optical Support */}
        <Text style={styles.sectionHeaderTitle}>Help & Support</Text>
        <View style={styles.menuGroup}>
          {renderMenuItem({
            icon: 'help-circle-outline',
            title: 'Help Center & FAQs',
            subtitle: 'Prescription guide, lens packages & frame fit',
            onPress: () => navigation.navigate('HelpCenter'),
          })}
          {renderMenuItem({
            icon: 'chatbubble-ellipses-outline',
            title: 'Contact Support',
            subtitle: 'WhatsApp, email or speak with our optical team',
            onPress: () => navigation.navigate('ContactUs'),
            isLast: true,
          })}
        </View>

        {/* Section 3: Trust & Policies */}
        <Text style={styles.sectionHeaderTitle}>Policies & Trust</Text>
        <View style={styles.menuGroup}>
          {renderMenuItem({
            icon: 'shield-checkmark-outline',
            title: 'Privacy Policy',
            subtitle: 'How your medical & personal data is safeguarded',
            onPress: () => navigation.navigate('PrivacyPolicy'),
          })}
          {renderMenuItem({
            icon: 'document-text-outline',
            title: 'Terms & Conditions',
            subtitle: '1-Year warranty, service terms & care guidelines',
            onPress: () => navigation.navigate('TermsAndConditions'),
            isLast: true,
          })}
        </View>

        {/* Section 4: Session (Only when logged in) */}
        {isAuthenticated && (
          <>
            <Text style={styles.sectionHeaderTitle}>Session</Text>
            <View style={styles.menuGroup}>
              <TouchableOpacity
                style={[styles.menuItem, styles.menuItemLast]}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons name="log-out-outline" size={20} color={COLORS.secondary} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>Sign Out</Text>
                  <Text style={styles.menuSubtitle}>Safely disconnect your account session</Text>
                </View>
                <Ionicons name="chevron-forward" size={17} color={COLORS.textMuted} style={styles.chevron} />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Section 5: Destructive Action - Isolated Danger Zone */}
        <Text style={styles.sectionHeaderTitle}>Account Deletion</Text>
        <View style={styles.dangerGroup}>
          <TouchableOpacity
            style={styles.dangerMenuItem}
            onPress={() => navigation.navigate('DeleteAccount')}
            activeOpacity={0.7}
          >
            <View style={styles.dangerMenuIconContainer}>
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.dangerMenuTitle}>Delete Account</Text>
              <Text style={styles.dangerMenuSubtitle}>
                Permanently delete account and all saved prescription records
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={COLORS.error} style={styles.chevron} />
          </TouchableOpacity>
        </View>

        {/* Version Information */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>The Lens Hut • Version 1.0.0 (Android)</Text>
          <Text style={styles.copyrightText}>© 2026 The Lens Hut. Premium Eyewear & Optics.</Text>
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
    padding: 16,
    paddingBottom: 40,
  },

  // User Profile Card
  userCard: {
    backgroundColor: COLORS.surface,
    padding: 18,
    borderRadius: LAYOUT.radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 22,
    ...LAYOUT.shadows.sm,
  },
  userTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#14232E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...LAYOUT.shadows.sm,
  },
  avatarText: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  userInfo: {
    flex: 1,
    marginLeft: 14,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: LAYOUT.radius.xs,
    marginBottom: 4,
  },
  memberBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  userName: {
    fontFamily: FONTS.bold,
    fontSize: isSmallDevice ? 16 : 18,
    color: COLORS.secondary,
    letterSpacing: -0.2,
  },
  userEmail: {
    fontFamily: FONTS.regular,
    fontSize: 12.5,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  userPhone: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  userActionDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginTop: 16,
    marginBottom: 12,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: LAYOUT.radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 44,
  },
  editProfileBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12.5,
    color: COLORS.secondary,
  },

  // Guest Card
  guestCard: {
    backgroundColor: COLORS.surface,
    padding: 18,
    borderRadius: LAYOUT.radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 22,
    ...LAYOUT.shadows.sm,
  },
  guestHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  guestIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestInfo: {
    flex: 1,
    marginLeft: 14,
  },
  guestTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.secondary,
    letterSpacing: -0.2,
  },
  guestSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
    marginTop: 3,
  },
  guestPerksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: LAYOUT.radius.sm,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  guestPerkItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestPerkText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.secondary,
    marginLeft: 4,
  },
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: LAYOUT.radius.md,
    minHeight: 46,
    ...LAYOUT.shadows.sm,
  },
  signInBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13.5,
    color: COLORS.surface,
    letterSpacing: 0.2,
  },

  // Section Headers
  sectionHeaderTitle: {
    fontFamily: FONTS.bold,
    fontSize: 11.5,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },

  // Menu Groups
  menuGroup: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    overflow: 'hidden',
    ...LAYOUT.shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    minHeight: 52,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 13.5,
    color: COLORS.textPrimary,
  },
  menuSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  badgePill: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  badgePillText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.surface,
  },
  chevron: {
    marginLeft: 4,
  },

  // Isolated Danger Zone (Delete Account)
  dangerGroup: {
    backgroundColor: '#FFF8F8',
    borderRadius: LAYOUT.radius.lg,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginBottom: 24,
    overflow: 'hidden',
    ...LAYOUT.shadows.sm,
  },
  dangerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
  },
  dangerMenuIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  dangerMenuTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 13.5,
    color: COLORS.error,
  },
  dangerMenuSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
    color: '#991B1B',
    marginTop: 2,
    lineHeight: 16,
  },

  // Version Footer
  versionContainer: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  versionText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  copyrightText: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 3,
  },
});

export default ProfileScreen;
