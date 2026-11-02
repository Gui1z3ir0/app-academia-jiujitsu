import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function PriorityChip({ selected, onSelect }) {
  const options = [
    { key: 'alta', label: '🔴 Alta (Dor / Lesão)', color: colors.danger, bg: 'rgba(255, 71, 87, 0.15)' },
    { key: 'media', label: '🟡 Média (Treino)', color: colors.warning, bg: 'rgba(255, 184, 0, 0.15)' },
    { key: 'baixa', label: '🟢 Geral', color: colors.primary, bg: 'rgba(0, 245, 155, 0.15)' }
  ];

  return (
    <View style={styles.container}>
      {options.map(opt => {
        const isSelected = selected === opt.key;
        return (
          <TouchableOpacity
            key={opt.key}
            activeOpacity={0.7}
            onPress={() => onSelect(opt.key)}
            style={[
              styles.chip,
              {
                borderColor: isSelected ? opt.color : colors.border,
                backgroundColor: isSelected ? opt.bg : colors.surfaceElevated
              }
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: isSelected ? opt.color : colors.textSecondary, fontWeight: isSelected ? '800' : '600' }
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 6
  },
  chip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  chipText: {
    fontSize: 11,
    textAlign: 'center'
  }
});
