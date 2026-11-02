import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Linking, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';
import { useGymData } from '../../context/GymDataContext';
import { dataService } from '../../services/dataService';
import { generatePixBrCode } from '../../utils/security';

export default function PaymentsScreen() {
  const { currentUser } = useAuth();
  const { gymConfig } = useGymData();
  const [faturas, setFaturas] = useState([]);

  useEffect(() => {
    loadFaturas();
  }, []);

  const loadFaturas = async () => {
    const state = await dataService.getState();
    const userFats = (state.faturas || []).filter(f => f.usuario_id === currentUser?.id);
    setFaturas(userFats);
  };

  const planMap = {
    plan_academia: { name: 'Plano Musculação', amount: 120.00 },
    plan_jiujitsu: { name: 'Plano Jiu-Jítsu', amount: 130.00 },
    plan_academia_jiujitsu: { name: 'Plano Completo (Musculação + Jiu-Jítsu)', amount: 150.00 }
  };
  const selectedPlan = planMap[currentUser?.plano_id] || planMap.plan_academia;
  const planName = selectedPlan.name;
  const planAmountNum = selectedPlan.amount;
  const planAmount = planAmountNum.toFixed(2).replace('.', ',');

  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const isPaidThisMonth = faturas.some(f => f.status === 'Pago' && f.dataPagamento && f.dataPagamento.startsWith(currentMonthStr));
  const pendingFatura = faturas.find(f => f.status === 'Pendente' || f.status === 'Aguardando Confirmação');

  const pixKey = gymConfig?.pixKey || 'financeiro@sua-academia.com.br';
  const brcode = generatePixBrCode({
    pixKey,
    merchantName: gymConfig?.name || 'ACADEMIA',
    merchantCity: 'SAO PAULO',
    amount: pendingFatura?.valor || planAmountNum,
    txid: pendingFatura?.id || 'MENSALIDADE'
  });

  const handleCopyOrSharePix = async () => {
    try {
      await Share.share({
        title: 'Código PIX Copia e Cola',
        message: brcode
      });
    } catch (e) {
      Alert.alert('PIX Copia e Cola', brcode);
    }
  };

  const handleInformarPagamento = async () => {
    if (!pendingFatura) return;
    await dataService.informarPagamentoPix(pendingFatura.id);
    await loadFaturas();
    Alert.alert(
      'Pagamento Informado',
      'O Personal foi notificado! Sua fatura está como "Aguardando Confirmação" até a compensação bancária/webhook.'
    );
  };

  const handleSendWhatsAppReceipt = () => {
    const phone = gymConfig?.whatsapp || '11999999999';
    const text = `Olá! Segue o comprovante de pagamento da minha mensalidade da ${gymConfig?.name || 'Academia'} (${currentUser?.nome} - ${planName} R$ ${planAmount}).`;
    Linking.openURL(`https://api.whatsapp.com/send?phone=55${phone.replace(/\D/g, '')}&text=${encodeURIComponent(text)}`);
  };

  return (
    <View style={styles.container}>
      <Header title="Mensalidade & PIX" subtitle="FINANCEIRO DO ALUNO" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card variant="emerald" style={styles.planCard}>
          <View style={styles.planHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.planBadgeText}>PLANO ATIVO</Text>
              <Text style={styles.planTitle}>{planName}</Text>
            </View>
            <Text style={styles.planPrice}>R$ {planAmount}<Text style={{ fontSize: 11, color: colors.textSecondary }}>/mês</Text></Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Situação do Mês Atual:</Text>
            <Badge
              label={isPaidThisMonth || !pendingFatura ? '✓ PAGO NO MÊS' : pendingFatura?.status === 'Aguardando Confirmação' ? '⏳ EM ANÁLISE' : '● PENDENTE'}
              variant={isPaidThisMonth || !pendingFatura ? 'success' : 'danger'}
            />
          </View>
        </Card>

        <Card style={styles.pixCard}>
          <View style={styles.pixHeader}>
            <View style={styles.pixIconBadge}>
              <Ionicons name="qr-code" size={20} color="#000" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pixTitle}>PIX Copia e Cola Oficial (BRCode)</Text>
              <Text style={styles.pixSub}>Chave PIX: {pixKey}</Text>
            </View>
          </View>

          <View style={styles.pixKeyContainer}>
            <Text style={styles.pixKeyLabel}>Payload EMVCo Banco Central:</Text>
            <Text style={styles.pixKeyText} selectable>{brcode}</Text>
          </View>

          <Button
            title="Copiar / Compartilhar Código PIX"
            onPress={handleCopyOrSharePix}
            variant="outline"
            icon={<Ionicons name="copy-outline" size={18} color={colors.primary} />}
            style={{ marginBottom: 10 }}
          />

          {pendingFatura && pendingFatura.status === 'Pendente' && (
            <Button
              title="Já Realizei o PIX (Enviar p/ Confirmação)"
              onPress={handleInformarPagamento}
              variant="primary"
              style={{ marginBottom: 10 }}
            />
          )}

          <Button
            title="Enviar Comprovante via WhatsApp"
            onPress={handleSendWhatsAppReceipt}
            variant="whatsapp"
            icon={<Ionicons name="logo-whatsapp" size={18} color="#000" />}
          />
        </Card>

        <Text style={styles.sectionTitle}>HISTÓRICO DE FATURAS</Text>

        {faturas.map(fat => (
          <Card key={fat.id} style={styles.invoiceCard}>
            <View style={styles.invoiceRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.invoiceDesc}>{fat.descricao}</Text>
                <Text style={styles.invoiceDate}>Vencimento: {fat.dataVencimento}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.invoiceAmount}>R$ {fat.valor.toFixed(2)}</Text>
                <Badge
                  label={fat.status}
                  variant={fat.status === 'Pago' ? 'success' : 'danger'}
                  style={{ marginTop: 4 }}
                />
              </View>
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
  content: {
    padding: 16,
    paddingBottom: 40
  },
  planCard: {
    marginBottom: 16
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  planBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  planTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2
  },
  planPrice: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '900'
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600'
  },
  pixCard: {
    marginBottom: 16
  },
  pixHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14
  },
  pixIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pixTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800'
  },
  pixSub: {
    color: colors.textSecondary,
    fontSize: 11
  },
  pixKeyContainer: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14
  },
  pixKeyLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700'
  },
  pixKeyText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 12
  },
  invoiceCard: {
    marginBottom: 10,
    padding: 14
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  invoiceDesc: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700'
  },
  invoiceDate: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2
  },
  invoiceAmount: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800'
  }
});
