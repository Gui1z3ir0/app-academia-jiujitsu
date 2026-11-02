import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function Badge({ label, variant = 'success', icon, style, textStyle }) {
  const getStyles = () => {
    switch (variant) {
      case 'success':
        return { bg: 'rgba(0, 245, 155, 0.12)', border: colors.primary, text: colors.primary };
      case 'danger':
        return { bg: 'rgba(255, 71, 87, 0.12)', border: colors.danger, text: colors.danger };
      case 'warning':
        return { bg: 'rgba(255, 184, 0, 0.12)', border: colors.warning, text: colors.warning };
      case 'cyan':
        return { bg: 'rgba(0, 229, 255, 0.12)', border: colors.secondary, text: colors.secondary };
      case 'muted':
      default:
        return { bg: colors.surfaceElevated, border: colors.border, text: colors.textSecondary };
    }
  };

  const current = getStyles();

  return (
    <View style={[styles.badge, { backgroundColor: current.bg, borderColor: current.border }, style]}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.text, { color: current.text }, textStyle]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start'
  },
  icon: {
    marginRight: 4
  },
  text: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3
  }
});
