import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function Header({ title, subtitle, showBack, navigation, rightAction }) {
  const { currentUser, currentRole, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack && navigation && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
        )}
        <View>
          <View style={styles.badgeRow}>
            <Ionicons name="flash" size={12} color={colors.primary} />
            <Text style={styles.badgeText}>CT JEFFERSON CALISTO</Text>
          </View>
          <Text style={styles.title} numberOfLines={1}>{title || 'Painel'}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>

      <View style={styles.right}>
        {rightAction ? (
          rightAction
        ) : (
          <TouchableOpacity onPress={logout} style={styles.logoutBtn} title="Sair">
            <Ionicons name="log-out-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  backBtn: {
    marginRight: 12,
    padding: 4
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2
  },
  badgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800'
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 12
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  logoutBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceElevated
  }
});
