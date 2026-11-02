import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';

export default function GymPassScreen() {
  const { currentUser } = useAuth();

  const isJiujitsu = currentUser?.plano_id === 'plan_academia_jiujitsu';
  const planName = isJiujitsu ? 'Academia + Jiu-Jítsu (R$ 150)' : 'Academia Musculação (R$ 120)';

  return (
    <View style={styles.container}>
      <Header title="Carteirinha Digital" subtitle="ACESSO À CATRACA & RECEPÇÃO" />

      <View style={styles.content}>
        <Card variant="emerald" style={styles.passCard}>
          <View style={styles.passHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.logoBadge}>
                <Ionicons name="barbell" size={18} color="#000" />
              </View>
              <View>
                <Text style={styles.ctName}>CT JEFFERSON CALISTO</Text>
                <Text style={styles.memberPassText}>MEMBER PASS VITALÍCIO</Text>
              </View>
            </View>
            <Badge label="ATIVO" variant="success" />
          </View>

          <View style={styles.studentInfoRow}>
            <Image
              source={{ uri: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }}
              style={styles.avatar}
            />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.studentName}>{currentUser?.nome || 'Aluno'}</Text>
              <Text style={styles.studentPlan}>{planName}</Text>
              <Text style={styles.studentMatricula}>Matrícula: #{currentUser?.id?.replace('usr_', '') || '10293'}</Text>
            </View>
          </View>

          <View style={styles.qrContainer}>
            <View style={styles.qrBox}>
              <Ionicons name="qr-code" size={140} color="#06090F" />
            </View>
            <Text style={styles.qrHelpText}>Aproxime o QR Code do leitor da catraca para liberar seu acesso.</Text>
          </View>

          <View style={styles.passFooter}>
            <View>
              <Text style={styles.footerLabel}>PESO / ALTURA</Text>
              <Text style={styles.footerValue}>{currentUser?.peso || 75} kg • {currentUser?.altura || 175} cm</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.footerLabel}>RESPONSÁVEL TÉCNICO</Text>
              <Text style={styles.footerValue}>Mestre Jefferson Calisto</Text>
            </View>
          </View>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  passCard: {
    width: '100%',
    maxWidth: 380,
    padding: 20,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surface
  },
  passHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ctName: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  memberPassText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  studentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: colors.primary
  },
  studentName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800'
  },
  studentPlan: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2
  },
  studentMatricula: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16
  },
  qrBox: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10
  },
  qrHelpText: {
    color: colors.textSecondary,
    fontSize: 11,
    textAlign: 'center'
  },
  passFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  footerLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  footerValue: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2
  }
});
