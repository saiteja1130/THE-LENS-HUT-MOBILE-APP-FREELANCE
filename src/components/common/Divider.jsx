import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';
import { FONTS } from '../../constants/fonts';

export const Divider = ({
  text,
  color = COLORS.border,
  thickness = 1,
  style,
  textStyle,
}) => {
  if (text) {
    return (
      <View style={[styles.containerWithText, style]}>
        <View style={[styles.line, { backgroundColor: color, height: thickness }]} />
        <Text style={[styles.text, textStyle]}>{text}</Text>
        <View style={[styles.line, { backgroundColor: color, height: thickness }]} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.simpleLine,
        { backgroundColor: color, height: thickness },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  simpleLine: {
    width: '100%',
    marginVertical: 12,
  },
  containerWithText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  line: {
    flex: 1,
  },
  text: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textMuted,
    marginHorizontal: 12,
    textTransform: 'uppercase',
  },
});

export default Divider;
