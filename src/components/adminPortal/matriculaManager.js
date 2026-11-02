import { store } from '../../data/store.js';
import { Icons } from '../icons.js';

export function renderMatriculaManager() {
  const matriculas = store.getMatriculas();
  const usuarios = store.getUsuarios('ALUNOS');
  const planos = store.getPlanos();

  return `
    <div class="admin-matricula-manager">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 24px;">
        <div>
          <h2>Gestão de Matrículas dos Alunos</h2>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">
            Controle de contratos, planos vinculados, períodos de vigência e status de renovação.
          </p>
        </div>
        <button id="openNewMatriculaModalBtn" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 8px;">
          ${Icons.plus('', 16)}
          <span>Nova Matrícula</span>
        </button>
      </div>

      <div class="measurements-table-card" style="background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 16px; padding: 20px; overflow-x: auto;">
        <table class="app-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Aluno</th>
              <th>Plano Vinculado</th>
              <th>Data de Início</th>
              <th>Data de Término</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${matriculas.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align: center; padding: 36px; color: var(--text-muted);">
                  Nenhuma matrícula cadastrada no sistema.
                </td>
              </tr>
            ` : matriculas.map(mat => {
              const aluno = store.getUsuario(mat.usuario_id) || { nome: 'Aluno Não Identificado' };
              const plano = store.getPlano(mat.plano_id) || { nome: 'Plano Padrão', valor: 99.90 };
              const isAtiva = mat.status === 'Ativa';
              return `
                <tr>
                  <td><code>#${mat.id.substring(0, 8)}</code></td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <img src="${aluno.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" style="width: 36px; height: 36px; border-radius: var(--radius-full); object-fit: cover;" alt="">
                      <div>
                        <strong style="color: #fff; display: block;">${aluno.nome}</strong>
                        <span style="font-size: 0.78rem; color: var(--text-muted);">${aluno.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge badge-cyan" style="font-weight: 700;">${plano.nome} (R$ ${plano.valor ? plano.valor.toFixed(2) : '99.90'})</span>
                  </td>
                  <td>${mat.inicio ? mat.inicio.split('-').reverse().join('/') : '-'}</td>
                  <td>${mat.termino ? mat.termino.split('-').reverse().join('/') : '-'}</td>
                  <td>
                    <span class="badge ${isAtiva ? 'badge-success' : mat.status === 'Pendente' ? 'badge-warning' : 'badge-danger'}">
                      ${mat.status}
                    </span>
                  </td>
                  <td>
                    <div style="display: flex; gap: 6px;">
                      <button class="btn btn-secondary btn-sm toggle-mat-status-btn" data-mat-id="${mat.id}" data-current-status="${mat.status}" style="font-size: 0.75rem; padding: 4px 8px;">
                        ${isAtiva ? 'Suspender' : 'Ativar'}
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div id="newMatriculaModal" class="modal-overlay">
        <div class="modal-content" style="max-width: 500px; background: var(--jet-card); border: 1px solid var(--jet-border); border-radius: 20px;">
          <div class="modal-header" style="border-bottom: 1px solid var(--jet-border); padding-bottom: 14px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${Icons.idCard('', 20)}
              <h3 class="modal-title" style="font-family: 'Outfit', sans-serif;">Cadastrar Nova Matrícula</h3>
            </div>
            <button id="closeNewMatriculaModalBtn" class="modal-close">&times;</button>
          </div>
          <form id="newMatriculaForm">
            <div class="modal-body" style="padding: 16px 0;">
              <div class="form-group" style="margin-bottom: 14px;">
                <label class="form-label">Aluno</label>
                <select id="newMatUsuarioSelect" class="form-select" required style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff; padding: 10px 12px;">
                  ${usuarios.map(u => `
                    <option value="${u.id}">${u.nome} (${u.email})</option>
                  `).join('')}
                </select>
              </div>

              <div class="form-group" style="margin-bottom: 14px;">
                <label class="form-label">Plano</label>
                <select id="newMatPlanoSelect" class="form-select" required style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff; padding: 10px 12px;">
                  ${planos.map(p => `
                    <option value="${p.id}">${p.nome} - R$ ${p.valor ? p.valor.toFixed(2) : '99.90'} (${p.duracao})</option>
                  `).join('')}
                </select>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
                <div class="form-group">
                  <label class="form-label">Data de Início</label>
                  <input type="date" id="newMatInicio" class="form-input" value="${new Date().toISOString().split('T')[0]}" required style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                </div>
                <div class="form-group">
                  <label class="form-label">Data de Término</label>
                  <input type="date" id="newMatTermino" class="form-input" value="${new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}" required style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff;">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Status Inicial</label>
                <select id="newMatStatus" class="form-select" style="background: var(--jet-card-elevated); border: 1px solid var(--jet-border); border-radius: 8px; color: #fff; padding: 10px 12px;">
                  <option value="Ativa" selected>Ativa</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Vencida">Vencida</option>
                </select>
              </div>
            </div>
            <div class="modal-footer" style="border-top: 1px solid var(--jet-border); padding-top: 14px;">
              <button type="button" id="closeNewMatriculaModalBtn2" class="btn btn-secondary">Cancelar</button>
              <button type="submit" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px;">
                ${Icons.check('', 16)}
                <span>Confirmar Matrícula</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}
