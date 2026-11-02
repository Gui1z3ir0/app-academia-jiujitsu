# 🥋 Academia & Jiu-Jítsu Pro — Aplicativo Mobile (React Native / Expo)

Aplicativo White-Label completo em **React Native (Expo)** para Academias de Musculação e Centros de Treinamento de Jiu-Jítsu, integrado ao **Supabase (PostgreSQL + Auth + RLS)** e **Gateway de Pagamento (Mercado Pago / Asaas Webhook)**.

---

## 📱 Funcionalidades Comerciais Implementadas

1. **Autenticação Segura & LGPD**:
   - **Sem senhas em texto puro ou logins secretos**: Senhas protegidas por hash criptográfico (`SHA-256 + salt`) e autenticação via Supabase Auth.
   - **Recuperação de Senha**: Fluxo integrado de redefinição de senha na tela de login.
   - **LGPD**: Consentimento explícito no cadastro e exclusão definitiva de conta pelo aluno.
   - **Perfil Unificado (`personal` e `aluno`)**: Sem confusão entre `ADMIN`, `dono` e `PROFESSOR`.
2. **Os 3 Planos Oficiais**:
   - 🏋️ **Plano Musculação** — R$ 120,00/mês
   - 🥋 **Plano Jiu-Jítsu** — R$ 130,00/mês
   - 🔥 **Plano Completo (Musculação + Jiu-Jítsu)** — R$ 150,00/mês
3. **Módulo Jiu-Jítsu**:
   - Graduação de Faixas (`Branca`, `Azul`, `Roxa`, `Marrom`, `Preta`) e Graus (`0` a `4` graus).
   - Quadro de horários das turmas (Gi, No-Gi, Competição) e registro de presença no tatame.
4. **Treinos & Cópia de Ficha**:
   - Definição dos dias da semana em que cada aluno treina.
   - Função para **copiar/aplicar** um treino pronto de um aluno para outro.
5. **Pagamentos Reais (PIX EMVCo & Webhook)**:
   - Geração dinâmica de payload **PIX Copia e Cola (BRCode Banco Central)** com CRC16-CCITT usando a chave PIX configurada pelo Personal.
   - Status **`Aguardando Confirmação`** quando o aluno informa o pagamento (sem auto-aprovação pelo aluno); baixa definitiva apenas via Webhook (`supabase/functions/payment-webhook/index.ts`) ou confirmação do Personal.

---

## 🚀 Como Executar e Gerar Build

### 1. Instalar Dependências
Na pasta `mobile` do projeto:

```bash
cd mobile
npm install
```

### 2. Configurar Variáveis de Ambiente (`.env`)
Copie o arquivo `.env.example` da raiz e preencha:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_PAYMENT_WEBHOOK_URL`

### 3. Executar no Emulador ou Dispositivo
```bash
npx expo start
```

### 4. Gerar Build de Produção (EAS Build — Google Play & App Store)
```bash
npm install -g eas-cli
npx eas-cli login
npx eas-cli build -p android --profile production
npx eas-cli build -p ios --profile production
```
