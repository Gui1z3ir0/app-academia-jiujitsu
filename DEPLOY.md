# 🚀 Guia de Configuração de Produção (Supabase + Pagamentos + Deploy)

Este guia descreve o passo a passo para colocar a plataforma em produção comercial para qualquer academia cliente.

---

## 1. Configurar o Banco de Dados no Supabase

1. Crie um novo projeto em [supabase.com](https://supabase.com).
2. No menu lateral do Supabase, abra o **SQL Editor**.
3. Copie todo o conteúdo do arquivo [`supabase/schema.sql`](./supabase/schema.sql) e execute (**Run**).
   - Isso criará todas as tabelas (`gym_config`, `planos`, `usuarios`, `matriculas`, `faturas`, `treinos`, `treino_exercicios`, `turmas_jiujitsu`, `presencas`, `avaliacoes_fisicas`, `mensagens_chat`, `notificacoes`), os **3 planos oficiais**, a função RPC `copiar_treino_aluno` e as políticas **RLS**.
4. Copie a `Project URL` e a `anon public key` em **Project Settings > API** e preencha no seu arquivo `.env` (baseado no [`.env.example`](./.env.example)):
   ```env
   VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
   VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLICA
   ```

---

## 2. Configurar o Gateway de Pagamento e Webhook (Mercado Pago / Asaas)

1. Publique a Edge Function localizada em [`supabase/functions/payment-webhook/index.ts`](./supabase/functions/payment-webhook/index.ts):
   ```bash
   npx supabase functions deploy payment-webhook --no-verify-jwt
   ```
2. Configure os segredos do gateway no Supabase:
   ```bash
   npx supabase secrets set MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
   # ou para Asaas:
   npx supabase secrets set ASAAS_API_KEY=$aact_...
   ```
3. No painel do Mercado Pago ou Asaas, configure a URL de Webhook apontando para:
   `https://SEU_PROJETO.supabase.co/functions/v1/payment-webhook`
   - Quando o aluno pagar o PIX ou Cartão, o gateway chamará o webhook automaticamente e atualizará a fatura para `pago` no banco.

---

## 3. Deploy da Versão Web (Vercel / Netlify)

```bash
npm run build
npx vercel --prod
```
Configure as variáveis `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `VITE_PAYMENT_WEBHOOK_URL` no painel da Vercel ou Netlify.
