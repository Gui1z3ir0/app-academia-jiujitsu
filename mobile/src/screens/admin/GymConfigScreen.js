import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useGymData } from '../../context/GymDataContext';
import { dataService } from '../../services/dataService';

export default function GymConfigScreen({ navigation }) {
  const { gymConfig, refreshAll } = useGymData();

  const [name, setName] = useState(gymConfig?.name || 'Sua Academia & Jiu-Jítsu');
  const [logoText, setLogoText] = useState(gymConfig?.logoText || 'FIT');
  const [slogan, setSlogan] = useState(gymConfig?.slogan || 'Força, Técnica & Alta Performance');
  const [phone, setPhone] = useState(gymConfig?.phone || '(11) 99999-9999');
  const [whatsapp, setWhatsapp] = useState(gymConfig?.whatsapp || '11999999999');
  const [pixKey, setPixKey] = useState(gymConfig?.pixKey || 'financeiro@sua-academia.com.br');
  const [paymentGateway, setPaymentGateway] = useState(gymConfig?.paymentGateway || 'asaas');
  const [asaasEnvironment, setAsaasEnvironment] = useState(gymConfig?.asaasEnvironment || 'sandbox');
  const [weekdays, setWeekdays] = useState(gymConfig?.workingHoursWeekdays || '06:00 às 22:00');
  const [saturdays, setSaturdays] = useState(gymConfig?.workingHoursSaturdays || '08:00 às 16:00');
  const [announcements, setAnnouncements] = useState(gymConfig?.announcements || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (gymConfig) {
      setName(gymConfig.name || '');
      setLogoText(gymConfig.logoText || 'FIT');
      setSlogan(gymConfig.slogan || '');
      setPhone(gymConfig.phone || '');
      setWhatsapp(gymConfig.whatsapp || '');
      setPixKey(gymConfig.pixKey || '');
      setPaymentGateway(gymConfig.paymentGateway || 'asaas');
      setAsaasEnvironment(gymConfig.asaasEnvironment || 'sandbox');
      setWeekdays(gymConfig.workingHoursWeekdays || '');
      setSaturdays(gymConfig.workingHoursSaturdays || '');
      setAnnouncements(gymConfig.announcements || '');
    }
  }, [gymConfig]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await dataService.updateGymConfig({
        name,
        logoText,
        slogan,
        phone,
        whatsapp,
        pixKey,
        paymentGateway,
        asaasEnvironment,
        workingHoursWeekdays: weekdays,
        workingHoursSaturdays: saturdays,
        announcements
      });
      await refreshAll();
      Alert.alert('Sucesso', 'Configurações White-Label, Chave PIX e Gateway salvas com sucesso!');
    } catch (e) {
      Alert.alert('Erro', 'Falha ao salvar configurações.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Marca, PIX & Gateway" subtitle="WHITE-LABEL & CONTA DO DONO" showBack navigation={navigation} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Text style={styles.sectionHeading}>MARCA WHITE-LABEL DA ACADEMIA</Text>
          <Input label="Nome Oficial da Academia / CT" value={name} onChangeText={setName} />
          <Input label="Sigla da Logo (2 a 4 letras)" value={logoText} onChangeText={setLogoText} />
          <Input label="Slogan" value={slogan} onChangeText={setSlogan} />
          <Input label="WhatsApp Comercial" value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" />
          <Input label="Telefone Recepção" value={phone} onChangeText={setPhone} />
        </Card>

        <Card variant="emerald" style={styles.card}>
          <Text style={styles.sectionHeading}>GATEWAY DE PAGAMENTO & CONTA DO DONO</Text>
          <Text style={styles.noticeText}>
            IMPORTANTE: A conta e a chave de API do gateway (Asaas ou Mercado Pago) devem pertencer diretamente ao dono da academia. Assim o dinheiro das mensalidades (PIX, Cartão e Boleto recorrente) cai direto na conta da academia, sem responsabilidade fiscal ou de chargeback para o desenvolvedor.
          </Text>

          <Text style={styles.fieldLabel}>Gateway Principal:</Text>
          <View style={styles.pillRow}>
            {[
              { id: 'asaas', label: 'Asaas (Recorrência Pix/Cartão/Boleto)' },
              { id: 'mercadopago', label: 'Mercado Pago' }
            ].map(gw => {
              const active = paymentGateway === gw.id;
              return (
                <TouchableOpacity
                  key={gw.id}
                  onPress={() => setPaymentGateway(gw.id)}
                  style={[styles.pill, active && styles.pillActive]}
                >
                  <Text style={[styles.pillText, active && { color: '#000', fontWeight: '800' }]}>{gw.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>Ambiente do Gateway (Sandbox p/ Testes vs Produção):</Text>
          <View style={styles.pillRow}>
            {[
              { id: 'sandbox', label: '🧪 Sandbox (Testes)' },
              { id: 'production', label: '🚀 Produção (Real)' }
            ].map(env => {
              const active = asaasEnvironment === env.id;
              return (
                <TouchableOpacity
                  key={env.id}
                  onPress={() => setAsaasEnvironment(env.id)}
                  style={[styles.pill, active && styles.pillActive]}
                >
                  <Text style={[styles.pillText, active && { color: '#000', fontWeight: '800' }]}>{env.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Input label="Chave PIX Oficial da Academia (EMVCo BRCode)" value={pixKey} onChangeText={setPixKey} placeholder="CNPJ, E-mail ou Celular" />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionHeading}>HORÁRIOS & COMUNICADOS</Text>
          <Input label="Segunda a Sexta-feira" value={weekdays} onChangeText={setWeekdays} />
          <Input label="Sábados e Feriados" value={saturdays} onChangeText={setSaturdays} />
          <Input
            label="Mural de Avisos para os Alunos"
            value={announcements}
            onChangeText={setAnnouncements}
            multiline
            numberOfLines={3}
          />
        </Card>

        <Button title="Salvar Configurações" onPress={handleSave} loading={loading} variant="primary" style={{ marginTop: 8 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  card: { marginBottom: 14 },
  sectionHeading: { color: colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 0.8, marginBottom: 10 },
  noticeText: { color: colors.textSecondary, fontSize: 11, lineHeight: 16, marginBottom: 12 },
  fieldLabel: { color: '#FFF', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  pill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { color: '#FFF', fontSize: 11, fontWeight: '700' }
});
