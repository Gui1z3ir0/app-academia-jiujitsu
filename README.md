# 🏋️‍♂️🥋 Academia & Jiu-Jítsu Pro — Plataforma White-Label (Web PWA + Mobile + Supabase)

Plataforma completa e pronta para comercialização para Academias de Musculação e Escolas de Jiu-Jítsu, contendo:
- **Backend Real em Supabase (PostgreSQL + RLS + RPC)**: Script completo em [`supabase/schema.sql`](./supabase/schema.sql).
- **Gateway de Pagamento Real & Webhook**: Edge Function em [`supabase/functions/payment-webhook/index.ts`](./supabase/functions/payment-webhook/index.ts) para **Mercado Pago / Asaas** + gerador oficial de **PIX Copia e Cola (EMVCo BRCode CRC16)**.
- **Web App (PWA)** em `src/` e **App Mobile (React Native / Expo)** em `mobile/`.

---

## ✅ Correções e Funcionalidades Comerciais

1. **Banco de Dados Real (`supabase/schema.sql`)**:
   - Tabelas estruturadas com `bigint generated always as identity`, índices em todas as Foreign Keys e políticas **Row Level Security (RLS)**:
     - `gym_config`, `planos`, `usuarios`, `matriculas`, `faturas`, `treinos`, `treino_exercicios`, `turmas_jiujitsu`, `presencas`, `avaliacoes_fisicas`, `mensagens_chat`, `notificacoes`.
   - Função RPC `public.copiar_treino_aluno` para clonar treinos entre alunos diretamente no banco.
2. **Autenticação & Segurança**:
   - Removidos todos os logins secretos, atalhos de e-mail, senhas em texto puro e e-mails pessoais fixos no código.
   - Hash criptográfico (`SHA-256` com salt) e geração de senha temporária aleatória ao cadastrar novos alunos pelo painel do Personal.
   - Fluxo de **Recuperação de Senha** ("Esqueci minha senha") integrado na tela de login.
3. **Pagamento Real (Sem Auto-Aprovação pelo Aluno)**:
   - Removido o botão de simulação instantânea e campos de cartão sem tokenização.
   - Geração dinâmica de **PIX Copia e Cola (BRCode Banco Central)** a partir da chave PIX e nome da academia configurados pelo Personal.
   - O aluno pode informar que realizou o PIX (mudando o status para `aguardando_confirmacao`), e somente o **Webhook do Gateway** (`payment-webhook`) ou o **Personal** pode liquidar a fatura como `pago`.
4. **Funções Essenciais**:
   - **Jiu-Jítsu Completo**: Graduação de faixas (`Branca`, `Azul`, `Roxa`, `Marrom`, `Preta`), graus (`0` a `4`), quadro de horários de turmas e chamada/controle de presença no tatame.
   - **3 Planos Oficiais**: `Plano Musculação` (R$ 120), `Plano Jiu-Jítsu` (R$ 130) e `Plano Completo (Musculação + Jiu-Jítsu)` (R$ 150).
   - **Chat Interno no App**: Conversa bidirecional em tempo real entre `aluno` e `personal` dentro do aplicativo.
   - **Notificações Push**: Web Push / Service Worker (`public/sw.js`) e `notificationEngine.js` para avisos de novas mensagens, treinos e vencimento de faturas.
   - **Treinos**: Seleção dos dias da semana em que o aluno treina e ferramenta para **copiar/aplicar** um treino pronto para outro aluno.
   - **Perfil Unificado**: Papéis padronizados em `personal` e `aluno`.
5. **White-Label & LGPD**:
   - Nome da academia, sigla do logo, slogan, chave PIX e gateway 100% configuráveis no painel.
   - Avatares gerados localmente em SVG com iniciais (sem dependência de fotos externas do Unsplash).
   - Termos de Uso, Política de Privacidade (LGPD) e botão **"Excluir Minha Conta e Dados (LGPD)"** no perfil do aluno.

---

## 🚀 Como Executar

```bash
# 1. Copie o arquivo de variáveis de ambiente
cp .env.example .env

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```
