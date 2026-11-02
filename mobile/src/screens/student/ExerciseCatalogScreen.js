import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Badge from '../../components/Badge';
import { exerciseCatalog } from '../../data/exercises';

export default function ExerciseCatalogScreen() {
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Todos');

  const groups = ['Todos', 'Peito', 'Costas', 'Pernas', 'Braços', 'Ombros', 'Jiu-Jítsu'];

  const filteredExercises = exerciseCatalog.filter(ex => {
    const matchesGroup = selectedGroup === 'Todos' || ex.group === selectedGroup;
    const matchesSearch = !search ||
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.muscle.toLowerCase().includes(search.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <Header title="Catálogo de Exercícios" subtitle="EXECUÇÃO & TÉCNICA CORRETA" />

      <View style={styles.searchSection}>
        <Input
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por exercício ou músculo..."
          leftIcon={<Ionicons name="search-outline" size={20} color={colors.textSecondary} />}
          style={{ marginBottom: 10 }}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.groupsScroll}>
          {groups.map(g => {
            const isSelected = selectedGroup === g;
            return (
              <TouchableOpacity
                key={g}
                activeOpacity={0.75}
                onPress={() => setSelectedGroup(g)}
                style={[styles.groupChip, isSelected && styles.groupChipActive]}
              >
                <Text style={[styles.groupChipText, isSelected && styles.groupChipTextActive]}>{g}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultsCount}>{filteredExercises.length} exercícios encontrados</Text>

        {filteredExercises.map(ex => (
          <Card key={ex.id} style={styles.exCard}>
            <View style={styles.exCardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.exName}>{ex.name}</Text>
                <Text style={styles.exMuscle}>🎯 Músculo: {ex.muscle}</Text>
              </View>
              <Badge label={ex.group} variant={ex.group === 'Jiu-Jítsu' ? 'danger' : 'cyan'} />
            </View>

            <View style={styles.tipsBox}>
              <Ionicons name="bulb-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.tipsText}>{ex.tips}</Text>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  searchSection: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  groupsScroll: {
    gap: 8
  },
  groupChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border
  },
  groupChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  groupChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700'
  },
  groupChipTextActive: {
    color: '#000',
    fontWeight: '800'
  },
  content: {
    padding: 16,
    paddingBottom: 40
  },
  resultsCount: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12
  },
  exCard: {
    marginBottom: 12
  },
  exCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  exName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800'
  },
  exMuscle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2
  },
  tipsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 245, 155, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 155, 0.2)',
    borderRadius: 10,
    padding: 10
  },
  tipsText: {
    flex: 1,
    color: '#E2E8F0',
    fontSize: 12,
    lineHeight: 16
  }
});
