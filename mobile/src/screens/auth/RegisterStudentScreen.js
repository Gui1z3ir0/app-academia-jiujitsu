import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';

export default function RegisterStudentScreen({ navigation }) {
  const { registerStudent } = useAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [peso, setPeso] = useState('75.0');
  const [altura, setAltura] = useState('175');
  const [planoId, setPlanoId] = useState('plan_academia');
  const [faixaJiuJitsu, setFaixaJiuJitsu] = useState('Branca');
  const [lgpdAccepted, setLgpdAccepted] = useState(true);
  const [objetivo, setObjetivo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nome.trim() || !email.trim() || !senha.trim() || senha.trim().length < 6) {
      Alert.alert('Campos Obrigatórios', 'Preencha Nome Completo, E-mail e Senha (mínimo 6 caracteres).');
      return;
    }

    if (!lgpdAccepted) {
      Alert.alert('Consentimento LGPD', 'É necessário aceitar os Termos de Uso e Política de Privacidade (LGPD).');
      return;
    }

    if (!peso || Number(peso) <= 0 || !altura || Number(altura) <= 0) {
      Alert.alert('Medidas Obrigatórias', 'Informe seu Peso Corporal (kg) e Altura (cm).');
      return;
    }

    try {
      setLoading(true);
      const res = await registerStudent({
        nome,
        email,
        senha,
        telefone,
        peso: Number(peso),
        altura: Number(altura),
        planoId,
        faixaJiuJitsu,
        lgpdAccepted,
        objetivoPrincipal: objetivo || 'Saúde & Performance'
      });

      if (!res.success) {
        Alert.alert('Falha no Cadastro', res.message);
      }
    } catch (err) {
      Alert.alert('Erro', 'Ocorreu um erro ao processar o cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Cadastro de Aluno</Text>
          <Text style={styles.headerSubtitle}>Musculação & Jiu-Jítsu</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Input
          label="Nome Completo"
          value={nome}
          onChangeText={setNome}
          placeholder="Ex: Carlos Silva"
          leftIcon={<Ionicons name="person-outline" size={20} color={colors.textSecondary} />}
        />

        <Input
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          placeholder="seuemail@exemplo.com"
          keyboardType="email-address"
          leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textSecondary} />}
        />

        <Input
          label="Senha de Acesso (mín. 6 caracteres)"
          value={senha}
          onChangeText={setSenha}
          placeholder="Crie uma senha segura..."
          secureTextEntry
          leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
        />

        <Input
          label="WhatsApp / Telefone"
          value={telefone}
          onChangeText={setTelefone}
          placeholder="(11) 99999-9999"
          keyboardType="phone-pad"
          leftIcon={<Ionicons name="logo-whatsapp" size={20} color={colors.whatsapp} />}
        />

        <Text style={styles.sectionTitle}>MEDIDAS CORPORAIS OBRIGATÓRIAS</Text>
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Input
              label="Peso Corporal (kg)"
              value={peso}
              onChangeText={setPeso}
              placeholder="75.5"
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Input
              label="Altura (cm)"
              value={altura}
              onChangeText={setAltura}
              placeholder="175"
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>ESCOLHA SEU PLANO (3 OPÇÕES)</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setPlanoId('plan_academia')}
          style={[styles.planOption, planoId === 'plan_academia' && styles.planOptionActive]}
        >
          <View style={styles.planRadio}>
            {planoId === 'plan_academia' && <View style={styles.planRadioInner} />}
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.planHeaderRow}>
              <Text style={styles.planName}>🏋️ Plano Musculação</Text>
              <Text style={styles.planPrice}>R$ 120,00<Text style={styles.planPeriod}>/mês</Text></Text>
            </View>
            <Text style={styles.planDesc}>Musculação livre todos os dias e ficha personalizada.</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setPlanoId('plan_jiujitsu')}
          style={[styles.planOption, planoId === 'plan_jiujitsu' && styles.planOptionActive]}
        >
          <View style={styles.planRadio}>
            {planoId === 'plan_jiujitsu' && <View style={styles.planRadioInner} />}
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.planHeaderRow}>
              <Text style={styles.planName}>🥋 Plano Jiu-Jítsu</Text>
              <Text style={styles.planPrice}>R$ 130,00<Text style={styles.planPeriod}>/mês</Text></Text>
            </View>
            <Text style={styles.planDesc}>Aulas de Jiu-Jítsu (Gi e No-Gi), controle de faixa, graus e presença.</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setPlanoId('plan_academia_jiujitsu')}
          style={[styles.planOption, planoId === 'plan_academia_jiujitsu' && styles.planOptionActive]}
        >
          <View style={styles.planRadio}>
            {planoId === 'plan_academia_jiujitsu' && <View style={styles.planRadioInner} />}
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.planHeaderRow}>
              <Text style={styles.planName}>🔥 Completo (Musculação + Jiu-Jítsu)</Text>
              <Text style={styles.planPrice}>R$ 150,00<Text style={styles.planPeriod}>/mês</Text></Text>
            </View>
            <Text style={styles.planDesc}>Acesso ilimitado à musculação e todas as turmas de Jiu-Jítsu.</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>FAIXA ATUAL NO JIU-JÍTSU</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'].map((belt) => (
            <TouchableOpacity
              key={belt}
              onPress={() => setFaixaJiuJitsu(belt)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: faixaJiuJitsu === belt ? colors.primary : colors.border,
                backgroundColor: faixaJiuJitsu === belt ? 'rgba(0,245,155,0.15)' : colors.surfaceElevated
              }}
            >
              <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>🥋 {belt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Objetivo Principal de Treino"
          value={objetivo}
          onChangeText={setObjetivo}
          placeholder="Ex: Hipertrofia, Jiu-Jítsu, Emagrecimento..."
        />

        <TouchableOpacity
          onPress={() => setLgpdAccepted(!lgpdAccepted)}
          style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}
        >
          <Ionicons
            name={lgpdAccepted ? 'checkbox' : 'square-outline'}
            size={22}
            color={colors.primary}
            style={{ marginRight: 8 }}
          />
          <Text style={{ color: colors.textSecondary, fontSize: 12, flex: 1 }}>
            Concordo com os Termos de Uso e Política de Privacidade (LGPD) para uso de peso, altura e evolução física.
          </Text>
        </TouchableOpacity>

        <Button
          title="Finalizar Cadastro de Aluno"
          onPress={handleRegister}
          loading={loading}
          variant="primary"
          style={{ marginTop: 14 }}
        />

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
          <Text style={styles.loginLinkText}>Já possui uma conta? <Text style={{ color: colors.primary, fontWeight: '800' }}>Fazer Login</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 20,
    paddingTop: 50
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  backBtn: {
    marginRight: 14,
    padding: 4
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800'
  },
  headerSubtitle: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700'
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 40
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 10,
    marginBottom: 10
  },
  row: {
    flexDirection: 'row'
  },
  planOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12
  },
  planOptionActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 245, 155, 0.08)'
  },
  planRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  planRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary
  },
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  planName: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800'
  },
  planPrice: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '900'
  },
  planPeriod: {
    fontSize: 10,
    color: colors.textSecondary
  },
  planDesc: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16
  },
  loginLink: {
    marginTop: 18,
    alignItems: 'center'
  },
  loginLinkText: {
    color: colors.textSecondary,
    fontSize: 13
  }
});
