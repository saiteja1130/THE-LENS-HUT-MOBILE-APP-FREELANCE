import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';
import LAYOUT from '../../constants/layout';

export const Badge = ({
  label,
  variant = 'neutral', // success | warning | error | info | primary | neutral
  size = 'md', // sm | md
  style,
  textStyle,
}) => {
  const getContainerStyle = () => {
    const base = [styles.badge, styles[`size_${size}`]];
    if (variant === 'success') base.push(styles.successBadge);
    if (variant === 'warning') base.push(styles.warningBadge);
    if (variant === 'error') base.push(styles.errorBadge);
    if (variant === 'info') base.push(styles.infoBadge);
    if (variant === 'primary') base.push(styles.primaryBadge);
    if (variant === 'neutral') base.push(styles.neutralBadge);
    if (style) base.push(style);
    return base;
  };

  const getTextStyle = () => {
    const base = [styles.text, styles[`textSize_${size}`]];
    if (variant === 'success') base.push(styles.successText);
    if (variant === 'warning') base.push(styles.warningText);
    if (variant === 'error') base.push(styles.errorText);
    if (variant === 'info') base.push(styles.infoText);
    if (variant === 'primary') base.push(styles.primaryText);
    if (variant === 'neutral') base.push(styles.neutralText);
    if (textStyle) base.push(textStyle);
    return base;
  };

  return (
    <View style={getContainerStyle()}>
      <Text style={getTextStyle()}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: LAYOUT.radius.round,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  size_sm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  size_md: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  // Variant containers
  successBadge: {
    backgroundColor: COLORS.successLight,
  },
  warningBadge: {
    backgroundColor: COLORS.warningLight,
  },
  errorBadge: {
    backgroundColor: COLORS.errorLight,
  },
  infoBadge: {
    backgroundColor: COLORS.infoLight,
  },
  primaryBadge: {
    backgroundColor: COLORS.primaryLight,
  },
  neutralBadge: {
    backgroundColor: COLORS.borderLight,
  },
  // Texts
  text: {
    fontFamily: FONTS.semiBold,
    textTransform: 'uppercase',
  },
  textSize_sm: {
    fontSize: 10,
    letterSpacing: 0.4,
  },
  textSize_md: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  successText: {
    color: COLORS.success,
  },
  warningText: {
    color: COLORS.warning,
  },
  errorText: {
    color: COLORS.error,
  },
  infoText: {
    color: COLORS.info,
  },
  primaryText: {
    color: COLORS.primary,
  },
  neutralText: {
    color: COLORS.textSecondary,
  },
});

export default Badge;
