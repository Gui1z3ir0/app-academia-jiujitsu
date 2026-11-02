const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const PAYMENT_WEBHOOK_URL = process.env.EXPO_PUBLIC_PAYMENT_WEBHOOK_URL || '';

export const USE_REMOTE_BACKEND = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

class MobileSupabaseAdapter {
  constructor() {
    this.url = SUPABASE_URL.replace(/\/$/, '');
    this.anonKey = SUPABASE_ANON_KEY;
    this.webhookUrl = PAYMENT_WEBHOOK_URL;
    this.accessToken = null;
    this.realtimeSocket = null;
  }

  get isConfigured() {
    return USE_REMOTE_BACKEND;
  }

  setSessionToken(token) {
    this.accessToken = token;
  }

  getHeaders(extra = {}) {
    const authBearer = this.accessToken || this.anonKey;
    return {
      apikey: this.anonKey,
      Authorization: `Bearer ${authBearer}`,
      'Content-Type': 'application/json',
      ...extra
    };
  }

  async signUp(email, password, metadata = {}) {
    if (!this.isConfigured) return { data: null, error: 'Backend remoto não configurado' };
    const res = await fetch(`${this.url}/auth/v1/signup`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password, data: metadata })
    });
    const data = await res.json();
    if (!res.ok) return { data: null, error: data.msg || data.error_description || 'Falha no cadastro' };
    if (data.access_token) this.setSessionToken(data.access_token);
    return { data, error: null };
  }

  async signIn(email, password) {
    if (!this.isConfigured) return { data: null, error: 'Backend remoto não configurado' };
    const res = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) return { data: null, error: data.error_description || 'Credenciais inválidas' };
    if (data.access_token) this.setSessionToken(data.access_token);
    return { data, error: null };
  }

  async resetPasswordForEmail(email) {
    if (!this.isConfigured) return { data: null, error: 'Backend remoto não configurado' };
    const res = await fetch(`${this.url}/auth/v1/recover`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email })
    });
    if (!res.ok) return { data: null, error: 'Erro ao enviar recuperação de senha' };
    return { data: true, error: null };
  }

  async select(table, query = '*') {
    if (!this.isConfigured) return { data: null, error: 'Offline' };
    const res = await fetch(`${this.url}/rest/v1/${table}?${query}`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    if (!res.ok) return { data: null, error: await res.text() };
    return { data: await res.json(), error: null };
  }

  async insert(table, payload) {
    if (!this.isConfigured) return { data: null, error: 'Offline' };
    const res = await fetch(`${this.url}/rest/v1/${table}`, {
      method: 'POST',
      headers: this.getHeaders({ Prefer: 'return=representation' }),
      body: JSON.stringify(payload)
    });
    if (!res.ok) return { data: null, error: await res.text() };
    return { data: await res.json(), error: null };
  }

  async update(table, matchQuery, payload) {
    if (!this.isConfigured) return { data: null, error: 'Offline' };
    const res = await fetch(`${this.url}/rest/v1/${table}?${matchQuery}`, {
      method: 'PATCH',
      headers: this.getHeaders({ Prefer: 'return=representation' }),
      body: JSON.stringify(payload)
    });
    if (!res.ok) return { data: null, error: await res.text() };
    return { data: await res.json(), error: null };
  }

  async rpc(fnName, params = {}) {
    if (!this.isConfigured) return { data: null, error: 'Offline' };
    const res = await fetch(`${this.url}/rest/v1/rpc/${fnName}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(params)
    });
    if (!res.ok) return { data: null, error: await res.text() };
    return { data: await res.json(), error: null };
  }

  async listarInadimplentesMes() {
    return await this.rpc('listar_inadimplentes_mes');
  }

  async createAsaasCharge({ faturaId, method = 'pix', recurring = false }) {
    if (!this.webhookUrl) return { data: null, error: 'Webhook URL não configurada' };
    const res = await fetch(`${this.webhookUrl}?action=create_charge`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        faturaId,
        method,
        provider: 'asaas',
        recurring
      })
    });
    const data = await res.json();
    if (!res.ok) return { data: null, error: data.error || 'Erro ao gerar cobrança no Asaas' };
    return { data, error: null };
  }

  async sendPushNotification({ targetRole, targetUserId, title, message, data = {} }) {
    if (!this.webhookUrl) return { data: null, error: 'Webhook URL não configurada' };
    try {
      const res = await fetch(`${this.webhookUrl}?action=send_push`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ targetRole, targetUserId, title, message, data })
      });
      return { data: await res.json(), error: null };
    } catch (err) {
      return { data: null, error: String(err) };
    }
  }

  subscribeToRealtime(onEventCallback) {
    if (!this.isConfigured || typeof WebSocket === 'undefined') return () => {};
    try {
      const wsUrl = this.url.replace(/^http/, 'ws') + `/realtime/v1/websocket?apikey=${this.anonKey}&vsn=1.0.0`;
      const socket = new WebSocket(wsUrl);
      this.realtimeSocket = socket;

      socket.onopen = () => {
        socket.send(
          JSON.stringify({
            topic: 'realtime:public:mensagens_chat',
            event: 'phx_join',
            payload: {},
            ref: '1'
          })
        );
        socket.send(
          JSON.stringify({
            topic: 'realtime:public:faturas',
            event: 'phx_join',
            payload: {},
            ref: '2'
          })
        );
      };

      socket.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          if (msg.event === 'INSERT' || msg.event === 'UPDATE') {
            if (onEventCallback) onEventCallback(msg);
          }
        } catch (e) {}
      };

      return () => {
        try {
          socket.close();
        } catch (e) {}
      };
    } catch (e) {
      return () => {};
    }
  }
}

export const apiAdapter = new MobileSupabaseAdapter();
