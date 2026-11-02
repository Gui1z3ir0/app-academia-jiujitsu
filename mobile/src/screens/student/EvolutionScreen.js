import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';

export default function EvolutionScreen() {
  const { currentUser } = useAuth();
  const [evaluation, setEvaluation] = useState(null);

  useEffect(() => {
    loadEvaluation();
  }, []);

  const loadEvaluation = async () => {
    const state = await dataService.getState();
    const evals = (state.avaliacoesFisicas || []).filter(a => a.usuario_id === currentUser?.id);
    if (evals.length > 0) {
      setEvaluation(evals[evals.length - 1]);
    } else {
      setEvaluation({
        peso: currentUser?.peso || 75,
        altura: currentUser?.altura || 175,
        gordura_corporal: 15.0,
        massa_muscular: 38.0,
        torax_cm: 98,
        braco_cm: 34,
        cintura_cm: 80,
        coxa_cm: 55,
        data_avaliacao: 'Hoje'
      });
    }
  };

  const peso = evaluation?.peso || currentUser?.peso || 75;
  const altura = evaluation?.altura || currentUser?.altura || 175;
  const imc = (peso / Math.pow(altura / 100, 2)).toFixed(1);

  return (
    <View style={styles.container}>
      <Header title="Evolução & Medidas" subtitle="BIOIMPEDÂNCIA & PROGRESSO" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card variant="emerald" style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.summaryTitle}>Composição Corporal Atual</Text>
              <Text style={styles.summaryDate}>Última aferição: {evaluation?.data_avaliacao || 'Recente'}</Text>
            </View>
            <Badge label="Em Dia" variant="success" />
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{peso} <Text style={styles.metricUnit}>kg</Text></Text>
              <Text style={styles.metricLabel}>Peso Corporal</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{altura} <Text style={styles.metricUnit}>cm</Text></Text>
              <Text style={styles.metricLabel}>Estatura</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: colors.secondary }]}>{imc}</Text>
              <Text style={styles.metricLabel}>Índice IMC</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: colors.warning }]}>{evaluation?.gordura_corporal || 15}%</Text>
              <Text style={styles.metricLabel}>Gordura (BF)</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>PERÍMETROS & CIRCUNFERÊNCIAS (CM)</Text>

        <View style={styles.perimetersGrid}>
          <Card style={styles.perimeterCard}>
            <Ionicons name="body-outline" size={24} color={colors.primary} />
            <Text style={styles.perimeterValue}>{evaluation?.torax_cm || 98} cm</Text>
            <Text style={styles.perimeterLabel}>Tórax / Peitoral</Text>
          </Card>

          <Card style={styles.perimeterCard}>
            <Ionicons name="barbell-outline" size={24} color={colors.secondary} />
            <Text style={styles.perimeterValue}>{evaluation?.braco_cm || 34} cm</Text>
            <Text style={styles.perimeterLabel}>Braço Contraído</Text>
          </Card>

          <Card style={styles.perimeterCard}>
            <Ionicons name="fitness-outline" size={24} color={colors.warning} />
            <Text style={styles.perimeterValue}>{evaluation?.cintura_cm || 80} cm</Text>
            <Text style={styles.perimeterLabel}>Cintura / Abdômen</Text>
          </Card>

          <Card style={styles.perimeterCard}>
            <Ionicons name="walk-outline" size={24} color={colors.primary} />
            <Text style={styles.perimeterValue}>{evaluation?.coxa_cm || 55} cm</Text>
            <Text style={styles.perimeterLabel}>Coxa Medial</Text>
          </Card>
        </View>

        <Card style={styles.coachNoteCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
            <Text style={styles.coachNoteHeading}>ORIENTAÇÃO DO TREINADOR JEFFERSON</Text>
          </View>
          <Text style={styles.coachNoteText}>
            "Parabéns pelo comprometimento! Mantenha a consistência nos treinos e hidratação. Na próxima avaliação mediremos a taxa metabólica basal e simetria muscular."
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 16,
    paddingBottom: 40
  },
  summaryCard: {
    marginBottom: 16
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14
  },
  summaryTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800'
  },
  summaryDate: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10
  },
  metricItem: {
    width: '46%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center'
  },
  metricValue: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '900'
  },
  metricUnit: {
    fontSize: 12,
    color: colors.textSecondary
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 12
  },
  perimetersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  perimeterCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 18,
    marginBottom: 12
  },
  perimeterValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8
  },
  perimeterLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2
  },
  coachNoteCard: {
    backgroundColor: 'rgba(0, 245, 155, 0.05)',
    borderColor: 'rgba(0, 245, 155, 0.25)',
    marginTop: 4
  },
  coachNoteHeading: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6
  },
  coachNoteText: {
    color: '#E2E8F0',
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic'
  }
});
