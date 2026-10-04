import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import LAYOUT from '../../constants/layout';
import ScreenHeader from '../../components/common/ScreenHeader';
import useAuthStore from '../../store/authStore';

export const ProfileScreen = ({ navigation }) => {
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const renderMenuItem = ({ icon, title, subtitle, onPress, isDanger = false, rightElement = null }) => {
    return (
      <TouchableOpacity
        style={styles.menuItem}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.menuIconContainer,
            isDanger && styles.dangerMenuIconContainer,
          ]}
        >
          <Ionicons
            name={icon}
            size={20}
            color={isDanger ? COLORS.error : COLORS.secondary}
          />
        </View>

        <View style={styles.menuTextContainer}>
          <Text style={[styles.menuTitle, isDanger && styles.dangerMenuTitle]}>
            {title}
          </Text>
          {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
        </View>

        {rightElement ? (
          rightElement
        ) : (
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        )}
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
        {/* User Profile Card */}
        {isAuthenticated && user ? (
          <View style={styles.userCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name || 'Valued Customer'}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              {user.phone ? <Text style={styles.userPhone}>{user.phone}</Text> : null}
            </View>
            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Ionicons name="create-outline" size={18} color={COLORS.secondary} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.guestCard}>
            <View style={styles.guestIconCircle}>
              <Ionicons name="person-outline" size={28} color={COLORS.primary} />
            </View>
            <View style={styles.guestInfo}>
              <Text style={styles.guestTitle}>Welcome to The Lens Hut</Text>
              <Text style={styles.guestSubtitle}>
                Log in to view past orders and prescription records.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.signInBtn}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.signInBtnText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Section: Orders & Activity */}
        <Text style={styles.sectionHeaderTitle}>Orders & Activity</Text>
        <View style={styles.menuGroup}>
          {renderMenuItem({
            icon: 'bag-handle-outline',
            title: 'My Orders',
            subtitle: 'Track, view details and invoices',
            onPress: () => navigation.navigate('OrderHistory'),
          })}
          {renderMenuItem({
            icon: 'heart-outline',
            title: 'Saved Wishlist',
            subtitle: 'Frames you have marked as favorite',
            onPress: () => navigation.navigate('WishlistTab'),
          })}
        </View>

        {/* Section: Support & Info */}
        <Text style={styles.sectionHeaderTitle}>Support & Information</Text>
        <View style={styles.menuGroup}>
          {renderMenuItem({
            icon: 'help-circle-outline',
            title: 'Help Center & FAQs',
            subtitle: 'Lens types, prescription help & policies',
            onPress: () => navigation.navigate('HelpCenter'),
          })}
          {renderMenuItem({
            icon: 'chatbubbles-outline',
            title: 'Contact Us',
            subtitle: 'WhatsApp, email & customer care',
            onPress: () => navigation.navigate('ContactUs'),
          })}
          {renderMenuItem({
            icon: 'shield-checkmark-outline',
            title: 'Privacy Policy',
            subtitle: 'How we protect your vision & personal data',
            onPress: () => navigation.navigate('PrivacyPolicy'),
          })}
          {renderMenuItem({
            icon: 'document-text-outline',
            title: 'Terms & Conditions',
            subtitle: 'Service terms, warranty and disclaimers',
            onPress: () => navigation.navigate('TermsAndConditions'),
          })}
        </View>

        {/* Section: Account Management */}
        <Text style={styles.sectionHeaderTitle}>Account Management</Text>
        <View style={styles.menuGroup}>
          {isAuthenticated && (
            renderMenuItem({
              icon: 'log-out-outline',
              title: 'Sign Out',
              subtitle: 'Sign out of your session',
              onPress: handleLogout,
            })
          )}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('DeleteAccount')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconContainer, styles.dangerMenuIconContainer]}>
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuTitle, styles.dangerMenuTitle]}>
                Delete Account
              </Text>
              <Text style={styles.menuSubtitle}>
                Permanently delete account and all profile data
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Version Information */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>The Lens Hut • Version 1.0.0 (Android)</Text>
          <Text style={styles.copyrightText}>© 2026 The Lens Hut. All rights reserved.</Text>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: LAYOUT.radius.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 20,
    ...LAYOUT.shadows.sm,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.primary,
  },
  userInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.secondary,
  },
  userEmail: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  userPhone: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  editProfileBtn: {
    padding: 8,
  },
  guestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: LAYOUT.radius.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 20,
    ...LAYOUT.shadows.sm,
  },
  guestIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestInfo: {
    flex: 1,
    marginLeft: 12,
  },
  guestTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.secondary,
  },
  guestSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  signInBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: LAYOUT.radius.md,
    marginLeft: 8,
  },
  signInBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.surface,
  },
  sectionHeaderTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuGroup: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
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
    borderBottomColor: COLORS.borderLight,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dangerMenuIconContainer: {
    backgroundColor: COLORS.errorLight,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  dangerMenuTitle: {
    color: COLORS.error,
  },
  menuSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 10,
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
    marginTop: 4,
  },
});

export default ProfileScreen;
