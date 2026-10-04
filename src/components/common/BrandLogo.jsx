import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';

const LOGO_IMG = require('../../../assets/images/Logo.png');

export const BrandLogo = ({
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  style,
  onPress,
}) => {
  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return { height: 26, width: 110 };
      case 'lg':
        return { height: 44, width: 180 };
      case 'xl':
        return { height: 60, width: 240 };
      case 'md':
      default:
        return { height: 34, width: 140 };
    }
  };

  const imageElement = (
    <Image
      source={LOGO_IMG}
      style={[styles.logo, getSizeStyle(), style]}
      resizeMode="contain"
    />
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        {imageElement}
      </TouchableOpacity>
    );
  }

  return imageElement;
};

const styles = StyleSheet.create({
  logo: {
    // Keeps aspect ratio intact
  },
});

export default BrandLogo;
