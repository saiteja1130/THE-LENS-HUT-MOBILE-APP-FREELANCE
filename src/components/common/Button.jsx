import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import LAYOUT from '../../constants/layout';

export const Button = ({
  title,
  onPress,
  variant = 'primary', // primary | secondary | outline | ghost | danger
  size = 'md', // sm | md | lg
  disabled = false,
  loading = false,
  leftIcon = null,
  rightIcon = null,
  style = null,
  textStyle = null,
  ...props
}) => {
  const getContainerStyle = () => {
    const base = [styles.button, styles[`size_${size}`]];

    if (variant === 'primary') base.push(styles.primaryButton);
    if (variant === 'secondary') base.push(styles.secondaryButton);
    if (variant === 'outline') base.push(styles.outlineButton);
    if (variant === 'ghost') base.push(styles.ghostButton);
    if (variant === 'danger') base.push(styles.dangerButton);

    if (disabled || loading) base.push(styles.disabledButton);
    if (style) base.push(style);

    return base;
  };

  const getTextStyle = () => {
    const base = [styles.text, styles[`textSize_${size}`]];

    if (variant === 'primary') base.push(styles.primaryText);
    if (variant === 'secondary') base.push(styles.secondaryText);
    if (variant === 'outline') base.push(styles.outlineText);
    if (variant === 'ghost') base.push(styles.ghostText);
    if (variant === 'danger') base.push(styles.dangerText);

    if (disabled) base.push(styles.disabledText);
    if (textStyle) base.push(textStyle);

    return base;
  };

  const getSpinnerColor = () => {
    if (variant === 'outline' || variant === 'ghost') return COLORS.primary;
    return COLORS.surface;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={getContainerStyle()}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getSpinnerColor()} />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon && <View style={styles.leftIconWrapper}>{leftIcon}</View>}
          {title ? <Text style={getTextStyle()}>{title}</Text> : null}
          {rightIcon && <View style={styles.rightIconWrapper}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: LAYOUT.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIconWrapper: {
    marginRight: 8,
  },
  rightIconWrapper: {
    marginLeft: 8,
  },
  // Sizes
  size_sm: {
    height: 38,
    paddingHorizontal: 14,
  },
  size_md: {
    height: 48,
    paddingHorizontal: 20,
  },
  size_lg: {
    height: 54,
    paddingHorizontal: 24,
  },
  // Variants
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
  },
  outlineButton: {
    backgroundColor: COLORS.transparent,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  ghostButton: {
    backgroundColor: COLORS.transparent,
  },
  dangerButton: {
    backgroundColor: COLORS.error,
  },
  disabledButton: {
    opacity: 0.5,
  },
  // Text
  text: {
    fontFamily: FONTS.semiBold,
    textAlign: 'center',
  },
  textSize_sm: {
    fontSize: 13,
  },
  textSize_md: {
    fontSize: 15,
  },
  textSize_lg: {
    fontSize: 16,
  },
  primaryText: {
    color: COLORS.surface,
  },
  secondaryText: {
    color: COLORS.surface,
  },
  outlineText: {
    color: COLORS.primary,
  },
  ghostText: {
    color: COLORS.primary,
  },
  dangerText: {
    color: COLORS.surface,
  },
  disabledText: {
    color: COLORS.textMuted,
  },
});

export default Button;
