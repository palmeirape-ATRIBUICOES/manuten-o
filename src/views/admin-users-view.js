/* ==========================================================================
   ADMIN USERS VIEW - PAINEL ADMIN DE GESTÃO DE USUÁRIOS E CONTAS CLOUD
   ========================================================================== */

import { authService } from '../services/auth-service.js';
import { firebaseDBService } from '../services/firebase-db-service.js';

export function renderAdminUsersView() {
  const currentUser = authService.getCurrentUser();
  const users = authService.getAllUsers();
  const tenants = JSON.parse(localStorage.getItem('saas_asset_tenants_db') || '[]');
  const subscriptions = JSON.parse(localStorage.getItem('saas_asset_subscriptions_db') || '[]');

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive !== false).length;
  const totalTenants = tenants.length;

  return `
    <div style="max-width: 1050px; margin: 0 auto;" id="admin-users-root">
      
      <!-- Top Banner Header -->
      <div class="card" style="margin-bottom: 24px; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); color: #fff; border: none; padding: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <span class="badge badge-info" style="background: rgba(255,255,255,0.2); color: #fff; margin-bottom: 8px;">ADMINISTRAÇÃO DE CONTAS</span>
            <h2 style="margin: 0; font-size: 1.6rem; color: #fff;">👥 Painel Admin de Controle de Usuários</h2>
            <p style="margin: 4px 0 0 0; font-size: 0.88rem; color: #c7d2fe;">
              Gerencie todas as contas, e-mails de login, permissões e sincronização em nuvem do OS Cloud.
            </p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary" id="btn-admin-sync-cloud" style="font-size: 0.85rem; background: #fff; color: #312e81; font-weight: 700; border: none;">
              🔄 Sincronizar com a Nuvem
            </button>
            <button class="btn btn-primary" id="btn-admin-add-user" style="font-size: 0.85rem; background: #6366f1; border: none;">
              ➕ Cadastrar Novo Usuário
            </button>
          </div>
        </div>

        <!-- Metrics Row -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 20px;">
          <div>
            <span style="font-size: 0.75rem; color: #a5b4fc; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">TOTAL DE USUÁRIOS</span>
            <div style="font-size: 1.6rem; font-weight: 800;">${totalUsers}</div>
          </div>
          <div>
            <span style="font-size: 0.75rem; color: #a5b4fc; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">CONTAS ATIVAS</span>
            <div style="font-size: 1.6rem; font-weight: 800; color: #4ade80;">${activeUsers}</div>
          </div>
          <div>
            <span style="font-size: 0.75rem; color: #a5b4fc; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">EMPRESAS CADASTRADAS</span>
            <div style="font-size: 1.6rem; font-weight: 800; color: #38bdf8;">${totalTenants}</div>
          </div>
          <div>
            <span style="font-size: 0.75rem; color: #a5b4fc; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">SERVIDOR CLOUD</span>
            <div style="font-size: 0.95rem; font-weight: 700; color: #4ade80; margin-top: 6px;">🟢 ONLINE & ATIVO</div>
          </div>
        </div>
      </div>

      <!-- Users Table Card -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <h3 style="margin: 0; font-size: 1.1rem; color: #0f172a;">📋 Lista de Usuários & Credenciais de Acesso</h3>
          <input type="text" id="admin-user-search" class="form-control" placeholder="🔍 Buscar por nome, e-mail ou empresa..." style="max-width: 320px; font-size: 0.85rem;">
        </div>

        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left;">
                <th style="padding: 12px; color: #475569; font-weight: 700;">Usuário / Nome</th>
                <th style="padding: 12px; color: #475569; font-weight: 700;">E-mail de Login</th>
                <th style="padding: 12px; color: #475569; font-weight: 700;">Empresa / Tenant</th>
                <th style="padding: 12px; color: #475569; font-weight: 700;">Telefone</th>
                <th style="padding: 12px; color: #475569; font-weight: 700;">Função</th>
                <th style="padding: 12px; color: #475569; font-weight: 700;">Status</th>
                <th style="padding: 12px; color: #475569; font-weight: 700; text-align: right;">Ações</th>
              </tr>
            </thead>
            <tbody id="admin-users-table-body">
              ${renderUsersTableRows(users, tenants, subscriptions, currentUser)}
            </tbody>
          </table>
        </div>
      </div>

      <div id="admin-modal-container"></div>
    </div>
  `;
}

function renderUsersTableRows(users, tenants, subscriptions, currentUser) {
  if (!users || users.length === 0) {
    return `<tr><td colspan="7" style="text-align: center; padding: 24px; color: #64748b;">Nenhum usuário cadastrado.</td></tr>`;
  }

  return users.map(user => {
    const tenant = tenants.find(t => t.id === user.tenantId) || { name: user.companyName || 'Empresa Padrão' };
    const sub = subscriptions.find(s => s.tenantId === user.tenantId);
    const isMe = currentUser && currentUser.id === user.id;

    return `
      <tr style="border-bottom: 1px solid #e2e8f0; ${isMe ? 'background: #f0fdf4;' : ''}">
        <td style="padding: 12px;">
          <strong>${user.fullName || 'Usuário Sem Nome'}</strong>
          ${isMe ? '<span style="font-size: 0.75rem; background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">Você</span>' : ''}
        </td>
        <td style="padding: 12px; font-weight: 600; color: #4f46e5;">
          ${user.email || '—'}
        </td>
        <td style="padding: 12px; color: #334155;">
          🏢 ${tenant.name}
        </td>
        <td style="padding: 12px; color: #64748b;">
          ${user.phone || '—'}
        </td>
        <td style="padding: 12px;">
          <span style="background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 700;">
            ${user.role || 'ADMIN'}
          </span>
        </td>
        <td style="padding: 12px;">
          <span style="background: ${user.isActive !== false ? '#dcfce7' : '#fee2e2'}; color: ${user.isActive !== false ? '#166534' : '#991b1b'}; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 700;">
            ${user.isActive !== false ? '🟢 ATIVO' : '🔴 INATIVO'}
          </span>
        </td>
        <td style="padding: 12px; text-align: right;">
          <div style="display: flex; justify-content: flex-end; gap: 6px;">
            <button class="btn btn-secondary btn-edit-user" data-user-id="${user.id}" style="padding: 4px 8px; font-size: 0.8rem;" title="Editar Dados">
              ✏️
            </button>
            <button class="btn btn-secondary btn-toggle-user-status" data-user-id="${user.id}" style="padding: 4px 8px; font-size: 0.8rem;" title="${user.isActive !== false ? 'Desativar Conta' : 'Ativar Conta'}">
              ${user.isActive !== false ? '🚫' : '✅'}
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

export function attachAdminUsersEvents(refreshCallback) {
  const modalContainer = document.getElementById('admin-modal-container');
  const searchInput = document.getElementById('admin-user-search');
  const tableBody = document.getElementById('admin-users-table-body');
  const btnSyncCloud = document.getElementById('btn-admin-sync-cloud');
  const btnAddUser = document.getElementById('btn-admin-add-user');

  // Search filter
  if (searchInput && tableBody) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const users = authService.getAllUsers().filter(u => 
        (u.fullName || '').toLowerCase().includes(term) ||
        (u.email || '').toLowerCase().includes(term) ||
        (u.companyName || '').toLowerCase().includes(term)
      );
      const tenants = JSON.parse(localStorage.getItem('saas_asset_tenants_db') || '[]');
      const subscriptions = JSON.parse(localStorage.getItem('saas_asset_subscriptions_db') || '[]');
      const currentUser = authService.getCurrentUser();
      tableBody.innerHTML = renderUsersTableRows(users, tenants, subscriptions, currentUser);
      attachRowEvents();
    });
  }

  // Sync Cloud
  if (btnSyncCloud) {
    btnSyncCloud.addEventListener('click', async () => {
      btnSyncCloud.textContent = '⏳ Buscando na Nuvem...';
      try {
        const cloudUsers = await firebaseDBService.fetchDocumentFromCloud('global_auth', 'users_list');
        if (Array.isArray(cloudUsers) && cloudUsers.length > 0) {
          localStorage.setItem('saas_asset_users_db', JSON.stringify(cloudUsers));
        }
        btnSyncCloud.textContent = '✓ Sincronizado!';
        if (refreshCallback) refreshCallback();
      } catch (err) {
        alert("Erro ao buscar dados na nuvem: " + err.message);
        btnSyncCloud.textContent = '🔄 Sincronizar com a Nuvem';
      }
    });
  }

  // Add User Modal
  if (btnAddUser) {
    btnAddUser.addEventListener('click', () => {
      openAddUserModal();
    });
  }

  function openAddUserModal() {
    modalContainer.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-card" style="max-width: 500px;">
          <div class="modal-header">
            <h3>➕ Cadastrar Novo Usuário / Empresa</h3>
            <button class="btn btn-secondary btn-close-modal">✕</button>
          </div>

          <form id="form-admin-add-user">
            <div class="form-group">
              <label class="form-label">Nome Completo *</label>
              <input type="text" class="form-control" id="adm-fullname" placeholder="Ex: Carlos Andrade" required>
            </div>

            <div class="form-group">
              <label class="form-label">E-mail de Login *</label>
              <input type="email" class="form-control" id="adm-email" placeholder="carlos@empresa.com" required>
            </div>

            <div class="form-group">
              <label class="form-label">Nome da Empresa / Cliente *</label>
              <input type="text" class="form-control" id="adm-company" placeholder="Ex: ClimaTech Serviços" required>
            </div>

            <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Telefone</label>
                <input type="tel" class="form-control" id="adm-phone" placeholder="(81) 99999-8888">
              </div>
              <div class="form-group">
                <label class="form-label">Senha Inicial *</label>
                <input type="password" class="form-control" id="adm-password" placeholder="Mínimo 3 caracteres" required>
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
              <button type="button" class="btn btn-secondary btn-close-modal">Cancelar</button>
              <button type="submit" class="btn btn-primary">Criar Conta na Nuvem</button>
            </div>
          </form>
        </div>
      </div>
    `;

    modalContainer.querySelectorAll('.btn-close-modal').forEach(b => b.addEventListener('click', () => modalContainer.innerHTML = ''));

    document.getElementById('form-admin-add-user').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('adm-fullname').value.trim();
      const email = document.getElementById('adm-email').value.trim().toLowerCase();
      const companyName = document.getElementById('adm-company').value.trim();
      const phone = document.getElementById('adm-phone').value.trim();
      const password = document.getElementById('adm-password').value;

      try {
        const res = authService.registerUser({ fullName, companyName, email, phone, password });
        alert(`✓ Usuário ${fullName} cadastrado com sucesso e sincronizado na nuvem!`);
        modalContainer.innerHTML = '';
        if (refreshCallback) refreshCallback();
      } catch (err) {
        alert("Erro ao cadastrar usuário: " + err.message);
      }
    });
  }

  function attachRowEvents() {
    document.querySelectorAll('.btn-toggle-user-status').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const userId = e.currentTarget.getAttribute('data-user-id');
        const users = authService.getAllUsers();
        const user = users.find(u => u.id === userId);
        if (user) {
          user.isActive = user.isActive === false ? true : false;
          localStorage.setItem('saas_asset_users_db', JSON.stringify(users));
          await firebaseDBService.saveDocumentToCloud('global_auth', 'users_list', users);
          if (refreshCallback) refreshCallback();
        }
      });
    });

    document.querySelectorAll('.btn-edit-user').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const userId = e.currentTarget.getAttribute('data-user-id');
        openEditUserModal(userId);
      });
    });
  }

  function openEditUserModal(userId) {
    const users = authService.getAllUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return;

    modalContainer.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-card" style="max-width: 500px;">
          <div class="modal-header">
            <h3>✏️ Editar Usuário: ${user.fullName}</h3>
            <button class="btn btn-secondary btn-close-modal">✕</button>
          </div>

          <form id="form-admin-edit-user">
            <div class="form-group">
              <label class="form-label">Nome Completo *</label>
              <input type="text" class="form-control" id="edit-fullname" value="${user.fullName || ''}" required>
            </div>

            <div class="form-group">
              <label class="form-label">E-mail de Login *</label>
              <input type="email" class="form-control" id="edit-email" value="${user.email || ''}" required>
            </div>

            <div class="form-group">
              <label class="form-label">Nome da Empresa</label>
              <input type="text" class="form-control" id="edit-company" value="${user.companyName || ''}">
            </div>

            <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Telefone</label>
                <input type="tel" class="form-control" id="edit-phone" value="${user.phone || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Nova Senha (Opcional)</label>
                <input type="password" class="form-control" id="edit-password" placeholder="Preencha p/ alterar">
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
              <button type="button" class="btn btn-secondary btn-close-modal">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar na Nuvem</button>
            </div>
          </form>
        </div>
      </div>
    `;

    modalContainer.querySelectorAll('.btn-close-modal').forEach(b => b.addEventListener('click', () => modalContainer.innerHTML = ''));

    document.getElementById('form-admin-edit-user').addEventListener('submit', async (e) => {
      e.preventDefault();
      user.fullName = document.getElementById('edit-fullname').value.trim();
      user.email = document.getElementById('edit-email').value.trim().toLowerCase();
      user.companyName = document.getElementById('edit-company').value.trim();
      user.phone = document.getElementById('edit-phone').value.trim();
      const pass = document.getElementById('edit-password').value;
      if (pass) {
        user.rawPassword = pass;
        user.passwordHash = authService.hashPassword(pass);
      }

      localStorage.setItem('saas_asset_users_db', JSON.stringify(users));
      await firebaseDBService.saveUserRecordToCloud(user.email, { user, tenant: null });
      await firebaseDBService.saveDocumentToCloud('global_auth', 'users_list', users);

      alert("✓ Dados do usuário atualizados com sucesso!");
      modalContainer.innerHTML = '';
      if (refreshCallback) refreshCallback();
    });
  }

  attachRowEvents();
}
