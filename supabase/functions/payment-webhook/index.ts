import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature, asaas-access-token'
};

async function sendExpoPush(tokens: string[], title: string, body: string, data: Record<string, unknown> = {}) {
  const validTokens = tokens.filter(t => t && t.startsWith('ExponentPushToken['));
  if (validTokens.length === 0) return;

  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(
        validTokens.map(to => ({
          to,
          sound: 'default',
          title,
          body,
          data
        }))
      )
    });
  } catch (_e) {}
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const asaasApiKey = Deno.env.get('ASAAS_API_KEY') ?? '';
    const asaasEnv = Deno.env.get('ASAAS_ENVIRONMENT') ?? 'sandbox';
    const mpAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') ?? '';
    const webhookSecret = Deno.env.get('WEBHOOK_SECRET') ?? '';

    const asaasBaseUrl = asaasEnv === 'production'
      ? 'https://api.asaas.com/v3'
      : 'https://sandbox.asaas.com/api/v3';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'webhook';

    if (action === 'send_push' && req.method === 'POST') {
      const { targetRole, targetUserId, title, message, data } = await req.json();
      let tokens: string[] = [];

      if (targetUserId) {
        const { data: usr } = await supabase
          .from('usuarios')
          .select('push_token')
          .eq('id', targetUserId)
          .single();
        if (usr?.push_token) tokens.push(usr.push_token);
      } else if (targetRole === 'personal') {
        const { data: personals } = await supabase
          .from('usuarios')
          .select('push_token')
          .eq('role', 'personal');
        tokens = (personals || []).map(p => p.push_token).filter(Boolean);
      }

      await sendExpoPush(tokens, title || 'Aviso da Academia', message || '', data || {});
      return new Response(JSON.stringify({ sent: tokens.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'create_charge' && req.method === 'POST') {
      const body = await req.json();
      const { faturaId, method = 'pix', provider = 'asaas', recurring = false } = body;

      const { data: fatura, error: fatErr } = await supabase
        .from('faturas')
        .select('*, usuarios(id, nome, email, telefone, cpf_cnpj, asaas_customer_id)')
        .eq('id', faturaId)
        .single();

      if (fatErr || !fatura) {
        return new Response(JSON.stringify({ error: 'Fatura não encontrada' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (provider === 'asaas' && asaasApiKey) {
        let customerId = fatura.usuarios?.asaas_customer_id;

        if (!customerId) {
          const custRes = await fetch(`${asaasBaseUrl}/customers`, {
            method: 'POST',
            headers: {
              access_token: asaasApiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: fatura.usuarios?.nome || 'Aluno',
              email: fatura.usuarios?.email || undefined,
              mobilePhone: (fatura.usuarios?.telefone || '').replace(/\D/g, '') || undefined,
              cpfCnpj: (fatura.usuarios?.cpf_cnpj || '').replace(/\D/g, '') || undefined,
              externalReference: String(fatura.usuario_id)
            })
          });
          const custData = await custRes.json();
          if (custData?.id) {
            customerId = custData.id;
            await supabase
              .from('usuarios')
              .update({ asaas_customer_id: customerId })
              .eq('id', fatura.usuario_id);
          }
        }

        const billingTypeMap: Record<string, string> = {
          pix: 'PIX',
          boleto: 'BOLETO',
          cartao_credito: 'CREDIT_CARD'
        };
        const billingType = billingTypeMap[method] || 'UNDEFINED';

        if (recurring && customerId) {
          const subRes = await fetch(`${asaasBaseUrl}/subscriptions`, {
            method: 'POST',
            headers: {
              access_token: asaasApiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              customer: customerId,
              billingType,
              value: Number(fatura.valor),
              nextDueDate: fatura.data_vencimento,
              cycle: 'MONTHLY',
              description: fatura.descricao,
              externalReference: String(fatura.id)
            })
          });
          const subData = await subRes.json();
          if (subData?.id) {
            await supabase
              .from('matriculas')
              .update({ asaas_subscription_id: subData.id })
              .eq('usuario_id', fatura.usuario_id);
          }
        }

        const payRes = await fetch(`${asaasBaseUrl}/payments`, {
          method: 'POST',
          headers: {
            access_token: asaasApiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            customer: customerId,
            billingType,
            value: Number(fatura.valor),
            dueDate: fatura.data_vencimento,
            description: fatura.descricao,
            externalReference: String(fatura.id)
          })
        });
        const payData = await payRes.json();

        if (payData?.id) {
          let pixCopiaCola = null;
          let pixQrCodeBase64 = null;

          if (billingType === 'PIX' || billingType === 'UNDEFINED') {
            const qrRes = await fetch(`${asaasBaseUrl}/payments/${payData.id}/pixQrCode`, {
              headers: { access_token: asaasApiKey }
            });
            const qrData = await qrRes.json();
            pixCopiaCola = qrData?.payload || null;
            pixQrCodeBase64 = qrData?.encodedImage || null;
          }

          await supabase
            .from('faturas')
            .update({
              gateway_provider: 'asaas',
              gateway_payment_id: String(payData.id),
              metodo_pagamento: method,
              pix_copia_cola: pixCopiaCola,
              pix_qr_code_base64: pixQrCodeBase64,
              boleto_url: payData.bankSlipUrl || null,
              checkout_url: payData.invoiceUrl || null
            })
            .eq('id', fatura.id);

          return new Response(
            JSON.stringify({
              paymentId: payData.id,
              pixCopiaCola,
              pixQrCodeBase64,
              boletoUrl: payData.bankSlipUrl || null,
              checkoutUrl: payData.invoiceUrl || null
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      if (provider === 'mercadopago' && mpAccessToken) {
        if (method === 'pix') {
          const mpRes = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${mpAccessToken}`,
              'Content-Type': 'application/json',
              'X-Idempotency-Key': `fatura_${fatura.id}_${Date.now()}`
            },
            body: JSON.stringify({
              transaction_amount: Number(fatura.valor),
              description: fatura.descricao,
              payment_method_id: 'pix',
              external_reference: String(fatura.id),
              payer: {
                email: fatura.usuarios?.email || 'aluno@academia.com',
                first_name: fatura.usuarios?.nome || 'Aluno'
              }
            })
          });

          const mpData = await mpRes.json();
          const qrData = mpData?.point_of_interaction?.transaction_data;

          if (mpData?.id && qrData) {
            await supabase
              .from('faturas')
              .update({
                gateway_provider: 'mercadopago',
                gateway_payment_id: String(mpData.id),
                metodo_pagamento: 'pix',
                pix_copia_cola: qrData.qr_code,
                pix_qr_code_base64: qrData.qr_code_base64
              })
              .eq('id', fatura.id);

            return new Response(
              JSON.stringify({
                paymentId: mpData.id,
                pixCopiaCola: qrData.qr_code,
                pixQrCodeBase64: qrData.qr_code_base64
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      }

      return new Response(
        JSON.stringify({ error: 'Configure ASAAS_API_KEY (conta do dono da academia) ou MERCADOPAGO_ACCESS_TOKEN no Supabase' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload = await req.json();

    if (webhookSecret) {
      const providedToken = req.headers.get('asaas-access-token') || url.searchParams.get('secret');
      if (providedToken && providedToken !== webhookSecret) {
        return new Response(JSON.stringify({ error: 'Assinatura de webhook inválida' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    let confirmedFaturaId: string | null = null;
    let overdueFaturaId: string | null = null;
    let gatewayPaymentId: string | null = null;

    if (
      (payload?.event === 'PAYMENT_RECEIVED' || payload?.event === 'PAYMENT_CONFIRMED') &&
      payload?.payment?.externalReference
    ) {
      confirmedFaturaId = String(payload.payment.externalReference);
      gatewayPaymentId = String(payload.payment.id);
    } else if (payload?.event === 'PAYMENT_OVERDUE' && payload?.payment?.externalReference) {
      overdueFaturaId = String(payload.payment.externalReference);
      gatewayPaymentId = String(payload.payment.id);
    } else if (payload?.type === 'payment' && payload?.data?.id && mpAccessToken) {
      const verifyRes = await fetch(`https://api.mercadopago.com/v1/payments/${payload.data.id}`, {
        headers: { Authorization: `Bearer ${mpAccessToken}` }
      });
      const paymentInfo = await verifyRes.json();
      if (paymentInfo?.status === 'approved') {
        confirmedFaturaId = String(paymentInfo.external_reference || '');
        gatewayPaymentId = String(paymentInfo.id);
      }
    }

    if (confirmedFaturaId) {
      const { data: updatedFatura } = await supabase
        .from('faturas')
        .update({
          status: 'pago',
          data_pagamento: new Date().toISOString(),
          webhook_confirmed_at: new Date().toISOString(),
          gateway_payment_id: gatewayPaymentId
        })
        .eq('id', Number(confirmedFaturaId))
        .select('id, usuario_id, descricao, valor, usuarios(nome, push_token)')
        .single();

      if (updatedFatura) {
        await supabase.from('notificacoes').insert({
          usuario_id: updatedFatura.usuario_id,
          tipo: 'cobranca',
          titulo: 'Pagamento Confirmado!',
          mensagem: `Sua fatura (${updatedFatura.descricao}) de R$ ${Number(updatedFatura.valor).toFixed(2)} foi confirmada automaticamente.`
        });

        const studentToken = (updatedFatura as any).usuarios?.push_token;
        if (studentToken) {
          await sendExpoPush(
            [studentToken],
            'Mensalidade Confirmada!',
            `Recebemos a confirmação do pagamento de R$ ${Number(updatedFatura.valor).toFixed(2)}.`
          );
        }

        const { data: personals } = await supabase
          .from('usuarios')
          .select('push_token')
          .eq('role', 'personal');
        const personalTokens = (personals || []).map(p => p.push_token).filter(Boolean);
        await sendExpoPush(
          personalTokens,
          'Pagamento Recebido (Webhook)',
          `${(updatedFatura as any).usuarios?.nome || 'Aluno'} pagou R$ ${Number(updatedFatura.valor).toFixed(2)} (${updatedFatura.descricao}).`
        );
      }
    }

    if (overdueFaturaId) {
      const { data: overdueFatura } = await supabase
        .from('faturas')
        .update({ status: 'atrasado', gateway_payment_id: gatewayPaymentId })
        .eq('id', Number(overdueFaturaId))
        .select('id, usuario_id, descricao, valor, usuarios(nome, push_token)')
        .single();

      if (overdueFatura) {
        const { data: personals } = await supabase
          .from('usuarios')
          .select('push_token')
          .eq('role', 'personal');
        const personalTokens = (personals || []).map(p => p.push_token).filter(Boolean);
        await sendExpoPush(
          personalTokens,
          'Aluno Inadimplente',
          `A fatura de ${(overdueFatura as any).usuarios?.nome || 'Aluno'} (R$ ${Number(overdueFatura.valor).toFixed(2)}) venceu.`
        );
      }
    }

    return new Response(JSON.stringify({ received: true, confirmedFaturaId, overdueFaturaId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
