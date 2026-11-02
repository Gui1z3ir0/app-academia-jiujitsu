const SUPABASE_URL = (import.meta.env?.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';
const PAYMENT_WEBHOOK_URL = import.meta.env?.VITE_PAYMENT_WEBHOOK_URL || (SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/payment-webhook` : '');

let accessToken = null;

export const supabaseClient = {
  isConfigured() {
    return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('seu-projeto'));
  },

  setAccessToken(token) {
    accessToken = token;
  },

  headers(extra = {}) {
    return {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...extra
    };
  },

  async signUp({ email, password, data = {} }) {
    if (!this.isConfigured()) return null;
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ email, password, data })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.msg || json.error_description || 'Erro ao criar conta no servidor');
    if (json.access_token) accessToken = json.access_token;
    return json;
  },

  async signIn({ email, password }) {
    if (!this.isConfigured()) return null;
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ email, password })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error_description || 'Credenciais inválidas');
    if (json.access_token) accessToken = json.access_token;
    return json;
  },

  async resetPassword(email) {
    if (!this.isConfigured()) return { simulated: true };
    const res = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ email })
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.msg || 'Não foi possível enviar o e-mail de recuperação');
    }
    return { simulated: false };
  },

  async select(table, query = 'select=*') {
    if (!this.isConfigured()) return null;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      headers: this.headers()
    });
    if (!res.ok) return null;
    return await res.json();
  },

  async insert(table, payload) {
    if (!this.isConfigured()) return null;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: this.headers({ Prefer: 'return=representation' }),
      body: JSON.stringify(payload)
    });
    if (!res.ok) return null;
    return await res.json();
  },

  async update(table, matchQuery, payload) {
    if (!this.isConfigured()) return null;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${matchQuery}`, {
      method: 'PATCH',
      headers: this.headers({ Prefer: 'return=representation' }),
      body: JSON.stringify(payload)
    });
    if (!res.ok) return null;
    return await res.json();
  },

  async remove(table, matchQuery) {
    if (!this.isConfigured()) return false;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${matchQuery}`, {
      method: 'DELETE',
      headers: this.headers()
    });
    return res.ok;
  },

  async rpc(fnName, params = {}) {
    if (!this.isConfigured()) return null;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fnName}`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(params)
    });
    if (!res.ok) return null;
    return await res.json().catch(() => true);
  },

  async createGatewayCharge({ faturaId, method = 'pix', provider = 'mercadopago' }) {
    if (!PAYMENT_WEBHOOK_URL || PAYMENT_WEBHOOK_URL.includes('seu-projeto')) {
      return null;
    }
    const res = await fetch(`${PAYMENT_WEBHOOK_URL}?action=create_charge`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ faturaId, method, provider })
    });
    if (!res.ok) return null;
    return await res.json();
  }
};
