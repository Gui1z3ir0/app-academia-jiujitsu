import { store } from '../../data/store.js';
import { Icons } from '../icons.js';

let authActiveTab = 'login';

export function setAuthActiveTab(tab) {
  if (tab === 'owner_register') {
    authActiveTab = store.hasPersonal() ? 'login' : 'owner_register';
  } else if (tab === 'register') {
    authActiveTab = 'register';
  } else if (tab === 'recover') {
    authActiveTab = 'recover';
  } else {
    authActiveTab = 'login';
  }
}

export function getAuthActiveTab() {
  return authActiveTab;
}

export function renderAuthView() {
  const hasPersonal = store.hasPersonal();
  const gymConfig = store.getGymConfig();
  const planos = store.getPlanos();
  const isOwnerRegister = authActiveTab === 'owner_register' && !hasPersonal;
  const isRegister = authActiveTab === 'register';
  const isRecover = authActiveTab === 'recover';

  return `
    <div class="auth-page-wrapper" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at 50% 20%, #0F172A 0%, #06090F 85%); padding: 24px 16px; font-family: 'Plus Jakarta Sans', sans-serif; color: #fff;">
      <div class="auth-card" style="width: 100%; max-width: 500px; background: rgba(13, 19, 31, 0.96); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 32px 28px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 245, 155, 0.08); backdrop-filter: blur(16px); box-sizing: border-box;">

        <div style="text-align: center; margin-bottom: 22px;">
          <div id="authLogoBadge" title="${gymConfig.name}" style="display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; background: linear-gradient(135deg, #00F59B 0%, #00E5FF 100%); border-radius: 18px; color: #06090F; margin-bottom: 12px; box-shadow: 0 8px 24px rgba(0, 245, 155, 0.35); cursor: pointer; user-select: none;">
            ${isOwnerRegister ? Icons.shield('', 30) : Icons.bolt('', 30)}
          </div>
          <h1 style="font-family: 'Outfit', sans-serif; font-size: 1.65rem; font-weight: 900; letter-spacing: 1px; margin: 0; color: #fff;">${gymConfig.logoText || gymConfig.name}</h1>
          <div style="font-size: 0.75rem; font-weight: 800; color: var(--jet-emerald, #00F59B); letter-spacing: 2px; text-transform: uppercase; margin-top: 4px;">
            ${isOwnerRegister ? 'CONFIGURAÇÃO DO PERSONAL TRAINER' : (gymConfig.slogan || 'TREINAMENTO, PERFORMANCE & JIU-JÍTSU')}
          </div>
          <p style="font-size: 0.86rem; color: #94A3B8; margin-top: 10px; line-height: 1.4;">
            ${isOwnerRegister
              ? 'Configuração inicial: cadastre sua conta de Personal responsável e personalize o nome da sua academia.'
              : isRecover
                ? 'Informe o seu e-mail cadastrado e defina uma nova senha segura de acesso.'
                : (!isRegister
                  ? 'Informe seu e-mail e senha para acessar seus treinos, turmas de Jiu-Jítsu e evolução.'
                  : 'Preencha seus dados, medidas iniciais e escolha um dos 3 planos disponíveis.')}
          </p>
        </div>

        ${!hasPersonal && !isOwnerRegister ? `
          <div style="background: linear-gradient(135deg, rgba(0, 245, 155, 0.12), rgba(0, 229, 255, 0.08)); border: 1px solid rgba(0, 245, 155, 0.35); border-radius: 14px; padding: 14px 16px; margin-bottom: 20px; text-align: center;">
            <div style="font-size: 0.8rem; font-weight: 800; color: #00F59B; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; gap: 6px;">
              ${Icons.shield('', 16)} PRIMEIRO ACESSO DO PERSONAL
            </div>
            <p style="font-size: 0.8rem; color: #CBD5E1; margin: 0 0 10px 0; line-height: 1.3;">
              Nenhum Personal cadastrado ainda. Configure a conta principal do Personal para gerenciar alunos, treinos e mensalidades.
            </p>
            <button id="authTriggerOwnerSetupBtn" type="button" class="btn btn-primary btn-sm" style="width: 100%; border-radius: 9px; font-weight: 800; padding: 10px; cursor: pointer;">
              Configurar Conta do Personal
            </button>
          </div>
        ` : ''}

        ${isOwnerRegister || isRecover ? `
          <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0, 245, 155, 0.08); border: 1px solid rgba(0, 245, 155, 0.25); border-radius: 12px; padding: 10px 14px; margin-bottom: 22px;">
            <span style="font-size: 0.82rem; font-weight: 700; color: #00F59B; display: flex; align-items: center; gap: 6px;">
              ${Icons.shield('', 16)} ${isOwnerRegister ? 'Cadastro do Personal' : 'Recuperação de Senha'}
            </span>
            <button id="authBackToLoginBtn" type="button" style="background: none; border: none; color: #94A3B8; font-size: 0.8rem; font-weight: 700; cursor: pointer; text-decoration: underline;">
              ← Voltar ao Login
            </button>
          </div>
        ` : `
          <div style="display: flex; background: rgba(255, 255, 255, 0.05); padding: 4px; border-radius: 12px; margin-bottom: 22px; border: 1px solid rgba(255, 255, 255, 0.08);">
            <button id="authTabLoginBtn" type="button" class="btn ${!isRegister ? 'btn-primary' : 'btn-secondary'}" style="flex: 1; border-radius: 9px; font-weight: 700; font-size: 0.88rem; padding: 10px; border: none; cursor: pointer; transition: all 0.2s;">
              Acessar Conta
            </button>
            <button id="authTabRegisterBtn" type="button" class="btn ${isRegister ? 'btn-primary' : 'btn-secondary'}" style="flex: 1; border-radius: 9px; font-weight: 700; font-size: 0.88rem; padding: 10px; border: none; cursor: pointer; transition: all 0.2s;">
              Cadastrar Aluno
            </button>
          </div>
        `}

        <div id="authAlertBox" style="display: none; background: rgba(255, 71, 87, 0.15); border: 1px solid #FF4757; border-radius: 10px; padding: 12px 14px; margin-bottom: 18px; font-size: 0.85rem; color: #FF6B7A; line-height: 1.4;"></div>

        ${isOwnerRegister ? `
          <form id="authOwnerRegisterForm" autocomplete="off">
            <div style="margin-bottom: 12px;">
              <label class="form-label" style="display: block; font-size: 0.82rem; font-weight: 700; color: #00E5FF; margin-bottom: 6px;">Nome da Academia / Studio / CT</label>
              <input type="text" id="authOwnerGymName" class="form-input" value="${gymConfig.name}" placeholder="Ex: Academia Performance Pro" required style="width: 100%; box-sizing: border-box; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(0, 229, 255, 0.35); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 0.92rem;">
            </div>

            <div style="margin-bottom: 12px;">
              <label class="form-label" style="display: block; font-size: 0.82rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">Nome Completo do Personal</label>
              <input type="text" id="authOwnerNome" class="form-input" placeholder="Seu nome completo" required autocomplete="name" style="width: 100%; box-sizing: border-box; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 0.92rem;">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div>
                <label class="form-label" style="display: block; font-size: 0.82rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">E-mail Profissional</label>
                <input type="email" id="authOwnerEmail" class="form-input" placeholder="contato@academia.com" required autocomplete="email" style="width: 100%; box-sizing: border-box; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 0.92rem;">
              </div>
              <div>
                <label class="form-label" style="display: block; font-size: 0.82rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">CREF / Registro</label>
                <input type="text" id="authOwnerCref" class="form-input" placeholder="000000-G/UF" style="width: 100%; box-sizing: border-box; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 0.92rem;">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px;">
              <div>
                <label class="form-label" style="display: block; font-size: 0.82rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">Senha (mín. 6 dígitos)</label>
                <input type="password" id="authOwnerSenha" class="form-input" placeholder="Crie uma senha forte" required minlength="6" autocomplete="new-password" style="width: 100%; box-sizing: border-box; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 0.92rem;">
              </div>
              <div>
                <label class="form-label" style="display: block; font-size: 0.82rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">WhatsApp / Telefone</label>
                <input type="tel" id="authOwnerTelefone" class="form-input" placeholder="(11) 99999-9999" autocomplete="tel" style="width: 100%; box-sizing: border-box; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 0.92rem;">
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 14px; font-size: 0.98rem; font-weight: 800; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 6px 20px rgba(0, 245, 155, 0.35); cursor: pointer;">
              ${Icons.shield('', 20)}
              <span>Concluir Configuração do Personal</span>
            </button>
          </form>
        ` : isRecover ? `
          <form id="authRecoverPasswordForm" autocomplete="off">
            <div style="margin-bottom: 14px;">
              <label class="form-label" style="display: block; font-size: 0.82rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">E-mail da sua Conta</label>
              <input type="email" id="authRecoverEmail" class="form-input" placeholder="seu@email.com" required style="width: 100%; box-sizing: border-box; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 10px; padding: 12px 14px; color: #fff; font-size: 0.95rem;">
            </div>

            <div style="margin-bottom: 20px;">
              <label class="form-label" style="display: block; font-size: 0.82rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">Nova Senha (mín. 6 caracteres)</label>
              <input type="password" id="authRecoverNewPass" class="form-input" placeholder="Digite a nova senha..." required minlength="6" style="width: 100%; box-sizing: border-box; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 10px; padding: 12px 14px; color: #fff; font-size: 0.95rem;">
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 13px; font-size: 0.95rem; font-weight: 800; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;">
              ${Icons.check('', 18)}
              <span>Redefinir Minha Senha</span>
            </button>
          </form>
        ` : (!isRegister ? `
          <form id="authLoginForm" autocomplete="off">
            <div style="margin-bottom: 14px;">
              <label class="form-label" style="display: block; font-size: 0.82rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">E-mail de Acesso</label>
              <input type="email" id="authLoginEmail" class="form-input" placeholder="seu@email.com" required autocomplete="email" style="width: 100%; box-sizing: border-box; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 10px; padding: 12px 14px; color: #fff; font-size: 0.95rem;">
            </div>

            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label class="form-label" style="font-size: 0.82rem; font-weight: 700; color: #CBD5E1; margin: 0;">Senha</label>
                <button type="button" id="authForgotPasswordBtn" style="background: none; border: none; color: #00E5FF; font-size: 0.78rem; font-weight: 700; cursor: pointer; padding: 0;">
                  Esqueci minha senha
                </button>
              </div>
              <input type="password" id="authLoginSenha" class="form-input" placeholder="Sua senha..." required autocomplete="current-password" style="width: 100%; box-sizing: border-box; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 10px; padding: 12px 14px; color: #fff; font-size: 0.95rem;">
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 8px; padding: 13px; font-size: 1rem; font-weight: 800; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 6px 20px rgba(0, 245, 155, 0.35); cursor: pointer;">
              ${Icons.user('', 18)}
              <span>Entrar no Aplicativo</span>
            </button>
          </form>
        ` : `
          <form id="authRegisterForm" autocomplete="off">
            <div style="margin-bottom: 12px;">
              <label class="form-label" style="display: block; font-size: 0.8rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">Nome Completo</label>
              <input type="text" id="authRegNome" class="form-input" placeholder="Ex: Juliana Mendes" required style="width: 100%; box-sizing: border-box; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 0.9rem;">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div>
                <label class="form-label" style="display: block; font-size: 0.8rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">E-mail</label>
                <input type="email" id="authRegEmail" class="form-input" placeholder="seu@email.com" required style="width: 100%; box-sizing: border-box; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 0.9rem;">
              </div>
              <div>
                <label class="form-label" style="display: block; font-size: 0.8rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">Senha (mín. 6 dígitos)</label>
                <input type="password" id="authRegSenha" class="form-input" placeholder="Crie uma senha..." required minlength="6" autocomplete="new-password" style="width: 100%; box-sizing: border-box; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 0.9rem;">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div>
                <label class="form-label" style="display: block; font-size: 0.8rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">Telefone (WhatsApp)</label>
                <input type="tel" id="authRegTelefone" class="form-input" placeholder="(11) 98888-7777" required style="width: 100%; box-sizing: border-box; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 0.9rem;">
              </div>
              <div>
                <label class="form-label" style="display: block; font-size: 0.8rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">Sexo</label>
                <select id="authRegSexo" class="form-select" required style="width: 100%; box-sizing: border-box; background: #0F172A; border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 0.9rem;">
                  <option value="M">Masculino (M)</option>
                  <option value="F">Feminino (F)</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div>
                <label class="form-label" style="display: block; font-size: 0.8rem; font-weight: 700; color: #00F59B; margin-bottom: 6px;">Peso Corporal (kg)</label>
                <input type="number" step="0.1" min="30" max="300" id="authRegPeso" class="form-input" placeholder="Ex: 75.5" required style="width: 100%; box-sizing: border-box; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(0, 245, 155, 0.35); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 0.9rem; font-weight: 700;">
              </div>
              <div>
                <label class="form-label" style="display: block; font-size: 0.8rem; font-weight: 700; color: #00F59B; margin-bottom: 6px;">Altura (cm)</label>
                <input type="number" min="100" max="250" id="authRegAltura" class="form-input" placeholder="Ex: 175" required style="width: 100%; box-sizing: border-box; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(0, 245, 155, 0.35); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 0.9rem; font-weight: 700;">
              </div>
            </div>

            <div style="margin-bottom: 12px;">
              <label class="form-label" style="display: block; font-size: 0.82rem; font-weight: 800; color: #00E5FF; margin-bottom: 6px;">Escolha o seu Plano (3 Opções)</label>
              <select id="authRegPlano" class="form-select" required style="width: 100%; box-sizing: border-box; background: #0F172A; border: 1px solid rgba(0, 229, 255, 0.4); border-radius: 10px; padding: 12px 14px; color: #fff; font-size: 0.9rem; font-weight: 700;">
                ${planos.map(p => `
                  <option value="${p.id}">${p.nome} — R$ ${Number(p.valor).toFixed(2)}/mês</option>
                `).join('')}
              </select>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div>
                <label class="form-label" style="display: block; font-size: 0.8rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">Faixa de Jiu-Jítsu</label>
                <select id="authRegFaixa" class="form-select" style="width: 100%; box-sizing: border-box; background: #0F172A; border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 0.88rem;">
                  <option value="Branca">Faixa Branca</option>
                  <option value="Azul">Faixa Azul</option>
                  <option value="Roxa">Faixa Roxa</option>
                  <option value="Marrom">Faixa Marrom</option>
                  <option value="Preta">Faixa Preta</option>
                </select>
              </div>
              <div>
                <label class="form-label" style="display: block; font-size: 0.8rem; font-weight: 700; color: #CBD5E1; margin-bottom: 6px;">Objetivo Principal</label>
                <input type="text" id="authRegObjetivo" class="form-input" placeholder="Hipertrofia, Jiu-Jítsu..." style="width: 100%; box-sizing: border-box; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 0.88rem;">
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 10px 12px; margin-bottom: 16px;">
              <label style="display: flex; align-items: flex-start; gap: 8px; font-size: 0.78rem; color: #CBD5E1; cursor: pointer; line-height: 1.4;">
                <input type="checkbox" id="authRegLgpd" required style="margin-top: 3px;">
                <span>
                  Autorizo o tratamento dos meus dados pessoais e antropométricos (peso, altura e frequência) conforme a <strong>LGPD (Lei nº 13.709/2018)</strong>.
                  <button type="button" id="openLgpdPolicyModalBtn" style="background: none; border: none; color: #00E5FF; text-decoration: underline; font-size: 0.78rem; padding: 0; cursor: pointer;">Ler Termos e Política de Privacidade</button>
                </span>
              </label>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 13px; font-size: 0.95rem; font-weight: 800; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 6px 20px rgba(0, 245, 155, 0.35); cursor: pointer;">
              ${Icons.check('', 18)}
              <span>Concluir Cadastro e Iniciar</span>
            </button>
          </form>
        `)}

      </div>

      <div id="lgpdPolicyModal" class="modal-overlay">
        <div class="modal-content" style="max-width: 540px; background: #0D131F; border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; color: #fff;">
          <div class="modal-header">
            <h3 class="modal-title">Política de Privacidade & Termos de Uso (LGPD)</h3>
            <button type="button" id="closeLgpdPolicyModalBtn" class="modal-close">&times;</button>
          </div>
          <div class="modal-body" style="font-size: 0.85rem; color: #CBD5E1; line-height: 1.6; max-height: 60vh; overflow-y: auto; padding: 16px 0;">
            <p><strong>1. Finalidade da Coleta de Dados:</strong> Os dados informados (nome, e-mail, telefone, peso, estatura, bioimpedância, graduação e histórico de presenças) são utilizados exclusivamente para prescrição de treinos, acompanhamento de evolução física e gestão da matrícula em <strong>${gymConfig.name}</strong>.</p>
            <p><strong>2. Segurança e Sigilo:</strong> As senhas são armazenadas com hash criptográfico irreversível e os pagamentos são processados por gateway externo certificado sem armazenamento de dados de cartão no aplicativo.</p>
            <p><strong>3. Direitos do Titular (Art. 18 da LGPD):</strong> Você pode consultar, corrigir ou solicitar a exclusão definitiva da sua conta e de todos os seus dados pessoais a qualquer momento acessando a aba <em>Meu Perfil → Excluir Minha Conta (LGPD)</em>.</p>
          </div>
          <div class="modal-footer">
            <button type="button" id="closeLgpdPolicyModalBtn2" class="btn btn-primary">Entendi e Concordo</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
