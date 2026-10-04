import React from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import COLORS from '../constants/colors';

// Screens
import SplashScreen from '../screens/auth/SplashScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import BottomTabNavigator from './BottomTabNavigator';
import ProductDetailScreen from '../screens/product/ProductDetailScreen';
import LensSelectionScreen from '../screens/product/LensSelectionScreen';
import PowerPrescriptionScreen from '../screens/product/PowerPrescriptionScreen';
import CheckoutScreen from '../screens/checkout/CheckoutScreen';
import OrderSuccessScreen from '../screens/checkout/OrderSuccessScreen';
import OrderHistoryScreen from '../screens/orders/OrderHistoryScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import PrivacyPolicyScreen from '../screens/profile/PrivacyPolicyScreen';
import DeleteAccountScreen from '../screens/profile/DeleteAccountScreen';
import HelpCenterScreen from '../screens/profile/HelpCenterScreen';
import ContactUsScreen from '../screens/profile/ContactUsScreen';
import TermsAndConditionsScreen from '../screens/profile/TermsAndConditionsScreen';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          {/* Splash & Onboarding */}
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />

          {/* Authentication */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

          {/* Main Application with Bottom Tabs */}
          <Stack.Screen name="Main" component={BottomTabNavigator} />

          {/* Product & Customization */}
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
          <Stack.Screen name="LensSelection" component={LensSelectionScreen} />
          <Stack.Screen name="PowerPrescription" component={PowerPrescriptionScreen} />

          {/* Direct Checkout & Confirmation */}
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />

          {/* Orders */}
          <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
          <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />

          {/* Profile, Policies & Support */}
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
          <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
          <Stack.Screen name="ContactUs" component={ContactUsScreen} />
          <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
});

export default RootNavigator;
