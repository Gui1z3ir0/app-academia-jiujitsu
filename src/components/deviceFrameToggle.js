if (typeof document !== 'undefined') {
  document.body.classList.remove('mobile-frame-active');
}

let deferredPrompt = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('pwaInstallBtn');
    if (installBtn) installBtn.style.display = 'inline-flex';
  });
}

export function renderDeviceFrameToggle() {
  return `
    <div id="pwaInstallModal" class="modal-overlay">
      <div class="modal-content" style="max-width: 460px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.3rem;">📲</span>
            <h3 class="modal-title">Instalar Aplicativo de Academia</h3>
          </div>
          <button id="closePwaModalBtn" class="modal-close">&times;</button>
        </div>
        <div class="modal-body" style="padding: 24px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #00F59B, #00B4D8); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 2rem; color: #090D16; margin-bottom: 12px; box-shadow: 0 4px 20px rgba(0, 245, 155, 0.4);">
              ⚡
            </div>
            <h4 style="font-size: 1.2rem;">CT Jefferson Calisto no seu Celular</h4>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 6px;">
              Instale o app diretamente na sua tela de início sem precisar da Play Store ou App Store. Funciona offline e com notificações!
            </p>
          </div>

          <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 16px; margin-bottom: 20px;">
            <div style="font-weight: 700; font-size: 0.9rem; color: var(--neon-cyan); margin-bottom: 8px;">
              🍏 No iPhone / iPad (iOS Safari):
            </div>
            <ol style="font-size: 0.82rem; color: var(--text-secondary); padding-left: 18px; display: flex; flex-direction: column; gap: 6px;">
              <li>Toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta para cima).</li>
              <li>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.</li>
              <li>Toque em <strong>Adicionar</strong> no canto superior direito.</li>
            </ol>
          </div>

          <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 16px;">
            <div style="font-weight: 700; font-size: 0.9rem; color: var(--neon-green); margin-bottom: 8px;">
              🤖 No Android (Google Chrome):
            </div>
            <p style="font-size: 0.82rem; color: var(--text-secondary);">
              Clique no botão abaixo para instalar o aplicativo instantaneamente no seu dispositivo:
            </p>
            <button id="triggerNativeInstallBtn" class="btn btn-primary btn-sm" style="margin-top: 10px; width: 100%;">
              <span>⬇️ Instalar Agora no Android</span>
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button id="closePwaModalBtn2" class="btn btn-secondary">Fechar</button>
        </div>
      </div>
    </div>
  `;
}

export function toggleDeviceFrame() {
  if (typeof document !== 'undefined') {
    document.body.classList.remove('mobile-frame-active');
  }
}

export function openPwaInstallModal() {
  const modal = document.getElementById('pwaInstallModal');
  if (modal) modal.classList.add('active');
}

import { showToast } from './toast.js';

export function triggerPwaNativeInstall() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choice) => {
      if (choice.outcome === 'accepted') {
        showToast('success', 'Aplicativo Instalado', 'CT Jefferson Calisto adicionado à sua tela de início.');
      }
      deferredPrompt = null;
    });
  } else {
    showToast('info', 'Instalação do Aplicativo', 'Acesse o menu do seu navegador e selecione "Adicionar à Tela de Início".');
  }
}
