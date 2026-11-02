import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { useGymData } from '../../context/GymDataContext';
import { dataService } from '../../services/dataService';

export default function LoginScreen({ navigation }) {
  const { login, hasAdmin } = useAuth();
  const { gymConfig } = useGymData();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const [recoverMode, setRecoverMode] = useState(false);
  const [recTelefone, setRecTelefone] = useState('');
  const [recNovaSenha, setRecNovaSenha] = useState('');

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Campos Obrigatórios', 'Por favor, informe seu e-mail e senha.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, senha);
      if (!res.success) {
        Alert.alert('Falha no Acesso', res.message);
      }
    } catch (err) {
      Alert.alert('Erro', 'Ocorreu um erro ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverPassword = async () => {
    const res = await dataService.recoverPassword({
      email,
      telefone: recTelefone,
      novaSenha: recNovaSenha
    });
    if (!res.success) {
      Alert.alert('Recuperação de Senha', res.message);
      return;
    }
    Alert.alert('Senha Redefinida', res.message);
    setRecoverMode(false);
    setSenha('');
  };

  const handleLogoTap = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    setTimeout(() => setLogoClicks(0), 1500);

    if (newCount >= 3) {
      setLogoClicks(0);
      if (!hasAdmin) {
        navigation.navigate('RegisterOwner');
      } else {
        Alert.alert('Perfil Personal', 'O perfil de Personal já está configurado neste aplicativo.');
      }
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {!hasAdmin && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('RegisterOwner')}
          style={styles.ownerBanner}
        >
          <Ionicons name="key-outline" size={20} color="#FFD700" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.ownerBannerTitle}>Configuração Inicial do Personal</Text>
            <Text style={styles.ownerBannerSubtitle}>Toque aqui para cadastrar a conta de Personal e o nome da academia.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#FFD700" />
        </TouchableOpacity>
      )}

      <TouchableOpacity activeOpacity={0.9} onPress={handleLogoTap} style={styles.logoSection}>
        <View style={styles.logoBadge}>
          <Ionicons name="barbell" size={32} color="#06090F" />
        </View>
        <Text style={styles.appName}>{(gymConfig?.name || 'ACADEMIA & JIU-JÍTSU').toUpperCase()}</Text>
        <Text style={styles.appSlogan}>{gymConfig?.slogan || 'FORÇA, TÉCNICA & ALTA PERFORMANCE'}</Text>
      </TouchableOpacity>

      {!recoverMode ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acessar Conta</Text>
          <Text style={styles.cardSubtitle}>Autenticação segura com hash criptográfico</Text>

          <Input
            label="E-mail de Acesso"
            value={email}
            onChangeText={setEmail}
            placeholder="seuemail@exemplo.com"
            keyboardType="email-address"
            leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textSecondary} />}
          />

          <Input
            label="Senha"
            value={senha}
            onChangeText={setSenha}
            placeholder="Sua senha..."
            secureTextEntry
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
          />

          <TouchableOpacity onPress={() => setRecoverMode(true)} style={{ alignSelf: 'flex-end', marginBottom: 10 }}>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <Button
            title="Entrar no Aplicativo"
            onPress={handleLogin}
            loading={loading}
            variant="primary"
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OU CADASTRE-SE</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Criar Conta de Aluno"
            onPress={() => navigation.navigate('RegisterStudent')}
            variant="secondary"
          />
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recuperar Senha</Text>
          <Text style={styles.cardSubtitle}>Confirme seu e-mail e o telefone cadastrado para redefinir sua senha.</Text>

          <Input
            label="E-mail Cadastrado"
            value={email}
            onChangeText={setEmail}
            placeholder="seuemail@exemplo.com"
            keyboardType="email-address"
          />

          <Input
            label="Telefone / WhatsApp Cadastrado"
            value={recTelefone}
            onChangeText={setRecTelefone}
            placeholder="(11) 99999-9999"
            keyboardType="phone-pad"
          />

          <Input
            label="Nova Senha (mín. 6 caracteres)"
            value={recNovaSenha}
            onChangeText={setRecNovaSenha}
            placeholder="Crie uma nova senha..."
            secureTextEntry
          />

          <Button
            title="Salvar Nova Senha"
            onPress={handleRecoverPassword}
            variant="primary"
            style={{ marginBottom: 10 }}
          />

          <Button
            title="Voltar ao Login"
            onPress={() => setRecoverMode(false)}
            variant="secondary"
          />
        </View>
      )}
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
    justifyContent: 'center',
    minHeight: '100%'
  },
  ownerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 20
  },
  ownerBannerTitle: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '800'
  },
  ownerBannerSubtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 24
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  appName: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center'
  },
  appSlogan: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 4,
    textAlign: 'center'
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4
  },
  cardSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 16
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginHorizontal: 10
  }
});
