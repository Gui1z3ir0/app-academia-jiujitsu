import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function Card({ children, style, variant = 'default' }) {
  const getBorderColor = () => {
    switch (variant) {
      case 'emerald': return colors.borderEmerald;
      case 'cyan': return colors.borderCyan;
      case 'danger': return colors.borderDanger;
      default: return colors.border;
    }
  };

  return (
    <View style={[styles.card, { borderColor: getBorderColor() }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14
  }
});
