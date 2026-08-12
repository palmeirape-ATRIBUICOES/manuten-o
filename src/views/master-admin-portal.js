/* ==========================================================================
   MASTER ADMIN PORTAL - PAINEL EXCLUSIVO DO DONO DO SISTEMA (MASTER SUPERADMIN)
   ========================================================================== */

import { authService } from '../services/auth-service.js';
import { firebaseDBService } from '../services/firebase-db-service.js';
import { tenantDataService } from '../services/tenant-data-service.js';

export class MasterAdminPortal {
  constructor() {
    this.isLoggedIn = sessionStorage.getItem('saas_master_admin_session') === 'true';
  }

  renderLoginPage() {
    return `
      <div style="max-width: 420px; margin: 60px auto 0 auto;">
        <div class="card" style="padding: 32px; border: 1px solid rgba(99, 102, 241, 0.3); background: #1e293b;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="width: 56px; height: 56px; background: #6366f1; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 12px;">
              👑
            </div>
            <h2 style="margin: 0; color: #fff; font-size: 1.4rem;">Acesso Master — Dono do Sistema</h2>
            <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 6px;">
              Digite suas credenciais universais para gerenciar todas as contas e clientes.
            </p>
          </div>

          <div id="master-login-error" style="display: none; padding: 12px; background: #fef2f2; color: #991b1b; border-radius: 8px; font-size: 0.85rem; margin-bottom: 16px;"></div>

          <form id="form-master-login">
            <div class="form-group">
              <label class="form-label" style="color: #cbd5e1;">E-mail Master Admin</label>
              <input type="email" class="form-control" id="master-email" value="admin@oscloud.com" required style="background: #0f172a; color: #fff; border-color: #334155;">
            </div>

            <div class="form-group">
              <label class="form-label" style="color: #cbd5e1;">Senha Master</label>
              <input type="password" class="form-control" id="master-password" value="admin123" required style="background: #0f172a; color: #fff; border-color: #334155;">
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px; margin-top: 16px; font-weight: 700; background: #6366f1;">
              🔑 Entrar no Portal Master
            </button>
          </form>

          <div style="margin-top: 20px; text-align: center; font-size: 0.8rem; color: #64748b;">
            Credenciais padrão: <strong>admin@oscloud.com</strong> | Senha: <strong>admin123</strong>
          </div>
        </div>
      </div>
    `;
  }

  attachLoginEvents(onLoginSuccess) {
    const form = document.getElementById('form-master-login');
    const errBox = document.getElementById('master-login-error');

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        errBox.style.display = 'none';

        const email = document.getElementById('master-email').value.trim();
        const password = document.getElementById('master-password').value;

        if ((email === 'admin@oscloud.com' || email === 'admin') && (password === 'admin123' || password === 'admin')) {
          sessionStorage.setItem('saas_master_admin_session', 'true');
          this.isLoggedIn = true;
          if (onLoginSuccess) onLoginSuccess();
        } else {
          errBox.style.display = 'block';
          errBox.textContent = "Credenciais Master incorretas. Verifique o e-mail e a senha.";
        }
      });
    }
  }

  renderDashboard() {
    const users = authService.getAllUsers();
    const tenants = JSON.parse(localStorage.getItem('saas_asset_tenants_db') || '[]');
    const subscriptions = JSON.parse(localStorage.getItem('saas_asset_subscriptions_db') || '[]');

    return `
      <div id="master-dashboard-root">
        
        <!-- Header Banner -->
        <div class="card" style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); border: 1px solid rgba(99, 102, 241, 0.4); padding: 24px; margin-bottom: 24px; color: #fff;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
            <div>
              <span class="badge" style="background: #6366f1; color: #fff; margin-bottom: 8px;">CONTROLE DE DONO / SUPERADMIN</span>
              <h2 style="margin: 0; color: #fff; font-size: 1.6rem;">👑 Gestão Geral do Sistema OS Cloud</h2>
              <p style="margin: 4px 0 0 0; font-size: 0.88rem; color: #c7d2fe;">
                Administração centralizada de clientes, empresas, acessos e banco de dados em nuvem.
              </p>
            </div>
            <div style="display: flex; gap: 10px;">
              <button class="btn btn-secondary" id="btn-master-sync" style="background: #fff; color: #312e81; font-weight: 700; border: none; font-size: 0.85rem;">
                🔄 Sincronizar Nuvem
              </button>
              <button class="btn btn-primary" id="btn-master-add-tenant" style="background: #6366f1; border: none; font-size: 0.85rem;">
                🏢 Cadastrar Nova Empresa Cliente
              </button>
              <button class="btn btn-secondary" id="btn-master-logout" style="background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); font-size: 0.85rem;">
                Sair
              </button>
            </div>
          </div>

          <!-- Top Metrics -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 20px;">
            <div>
              <span style="font-size: 0.75rem; color: #a5b4fc; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">TOTAL DE EMPRESAS</span>
              <div style="font-size: 1.7rem; font-weight: 800; color: #38bdf8;">${tenants.length}</div>
            </div>
            <div>
              <span style="font-size: 0.75rem; color: #a5b4fc; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">TOTAL DE USUÁRIOS</span>
              <div style="font-size: 1.7rem; font-weight: 800; color: #4ade80;">${users.length}</div>
            </div>
            <div>
              <span style="font-size: 0.75rem; color: #a5b4fc; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">ASSINATURAS ATIVAS</span>
              <div style="font-size: 1.7rem; font-weight: 800; color: #c084fc;">${subscriptions.length}</div>
            </div>
            <div>
              <span style="font-size: 0.75rem; color: #a5b4fc; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">BANCO CLOUD</span>
              <div style="font-size: 0.95rem; font-weight: 700; color: #4ade80; margin-top: 6px;">🟢 ONLINE & OPERACIONAL</div>
            </div>
          </div>
        </div>

        <!-- Section 1: Gestão de Clientes / Empresas -->
        <div class="card" style="background: #1e293b; border: 1px solid #334155; margin-bottom: 24px; color: #fff;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="margin: 0; color: #fff; font-size: 1.1rem;">🏢 Empresas Clientes Registradas no Sistema</h3>
            <button class="btn btn-secondary" id="btn-master-download-backup" style="font-size: 0.8rem; background: #334155; color: #fff; border: none;">
              📥 Baixar Backup JSON Geral
            </button>
          </div>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
              <thead>
                <tr style="background: #0f172a; color: #94a3b8; text-align: left;">
                  <th style="padding: 12px;">ID / Código</th>
                  <th style="padding: 12px;">Empresa Cliente</th>
                  <th style="padding: 12px;">CNPJ</th>
                  <th style="padding: 12px;">Gestor / Responsável</th>
                  <th style="padding: 12px;">E-mail do Gestor</th>
                  <th style="padding: 12px;">Plano / Status</th>
                  <th style="padding: 12px; text-align: right;">Ações Master</th>
                </tr>
              </thead>
              <tbody>
                ${tenants.map(t => {
                  const owner = users.find(u => u.tenantId === t.id) || {};
                  const sub = subscriptions.find(s => s.tenantId === t.id) || {};
                  return `
                    <tr style="border-bottom: 1px solid #334155;">
                      <td style="padding: 12px; font-family: monospace; font-size: 0.8rem; color: #94a3b8;">${t.id}</td>
                      <td style="padding: 12px;"><strong>🏢 ${t.name}</strong></td>
                      <td style="padding: 12px; color: #cbd5e1;">${t.cnpj || '12.345.678/0001-90'}</td>
                      <td style="padding: 12px; color: #cbd5e1;">${owner.fullName || '—'}</td>
                      <td style="padding: 12px; color: #818cf8; font-weight: 600;">${owner.email || '—'}</td>
                      <td style="padding: 12px;">
                        <span style="background: #065f46; color: #34d399; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 700;">
                          ${sub.subscriptionStatus === 'trial' ? '🟢 Teste Grátis (30d)' : '🟢 Plano Ativo'}
                        </span>
                      </td>
                      <td style="padding: 12px; text-align: right;">
                        <button class="btn btn-secondary btn-master-impersonate" data-tenant-id="${t.id}" data-user-email="${owner.email}" style="font-size: 0.75rem; padding: 4px 8px; background: #4f46e5; color: #fff; border: none;" title="Acessar Sistema como esta Empresa">
                          🚀 Acessar Sistema
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Section 2: Todos os Logins & Usuários do Sistema -->
        <div class="card" style="background: #1e293b; border: 1px solid #334155; color: #fff;">
          <h3 style="margin: 0 0 16px 0; color: #fff; font-size: 1.1rem;">👥 Todos os Logins & Credenciais de Acesso</h3>
          
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
              <thead>
                <tr style="background: #0f172a; color: #94a3b8; text-align: left;">
                  <th style="padding: 12px;">Nome</th>
                  <th style="padding: 12px;">E-mail de Login</th>
                  <th style="padding: 12px;">Empresa</th>
                  <th style="padding: 12px;">Telefone</th>
                  <th style="padding: 12px;">Status</th>
                  <th style="padding: 12px; text-align: right;">Ações</th>
                </tr>
              </thead>
              <tbody>
                ${users.map(u => `
                  <tr style="border-bottom: 1px solid #334155;">
                    <td style="padding: 12px;"><strong>${u.fullName}</strong></td>
                    <td style="padding: 12px; color: #818cf8; font-weight: 600;">${u.email}</td>
                    <td style="padding: 12px; color: #cbd5e1;">${u.companyName || 'Empresa'}</td>
                    <td style="padding: 12px; color: #94a3b8;">${u.phone || '—'}</td>
                    <td style="padding: 12px;">
                      <span style="background: ${u.isActive !== false ? '#065f46' : '#991b1b'}; color: ${u.isActive !== false ? '#34d399' : '#f87171'}; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 700;">
                        ${u.isActive !== false ? '🟢 ATIVO' : '🔴 BLOQUEADO'}
                      </span>
                    </td>
                    <td style="padding: 12px; text-align: right;">
                      <button class="btn btn-secondary btn-master-reset-pass" data-user-email="${u.email}" style="font-size: 0.75rem; padding: 4px 8px; background: #334155; color: #fff; border: none;" title="Redefinir Senha">
                        🔑 Redefinir Senha
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div id="master-modal-container"></div>
      </div>
    `;
  }

  attachDashboardEvents(refreshCallback) {
    const modalContainer = document.getElementById('master-modal-container');
    const btnLogout = document.getElementById('btn-master-logout');
    const btnSync = document.getElementById('btn-master-sync');
    const btnAddTenant = document.getElementById('btn-master-add-tenant');
    const btnDownloadBackup = document.getElementById('btn-master-download-backup');

    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        sessionStorage.removeItem('saas_master_admin_session');
        this.isLoggedIn = false;
        if (refreshCallback) refreshCallback();
      });
    }

    if (btnSync) {
      btnSync.addEventListener('click', async () => {
        btnSync.textContent = '⏳ Sincronizando...';
        try {
          const cloudUsers = await firebaseDBService.fetchDocumentFromCloud('global_auth', 'users_list');
          if (Array.isArray(cloudUsers) && cloudUsers.length > 0) {
            localStorage.setItem('saas_asset_users_db', JSON.stringify(cloudUsers));
          }
          btnSync.textContent = '✓ Sincronizado!';
          setTimeout(() => btnSync.textContent = '🔄 Sincronizar Nuvem', 2000);
          if (refreshCallback) refreshCallback();
        } catch (e) {
          alert("Erro ao buscar dados da nuvem.");
        }
      });
    }

    if (btnDownloadBackup) {
      btnDownloadBackup.addEventListener('click', () => {
        const backupData = {
          tenants: JSON.parse(localStorage.getItem('saas_asset_tenants_db') || '[]'),
          users: JSON.parse(localStorage.getItem('saas_asset_users_db') || '[]'),
          subscriptions: JSON.parse(localStorage.getItem('saas_asset_subscriptions_db') || '[]'),
          exportedAt: new Date().toISOString()
        };
        const jsonStr = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_os_cloud_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    if (btnAddTenant) {
      btnAddTenant.addEventListener('click', () => {
        modalContainer.innerHTML = `
          <div class="modal-overlay active">
            <div class="modal-card" style="max-width: 500px; background: #1e293b; color: #fff;">
              <div class="modal-header">
                <h3 style="color: #fff;">🏢 Cadastrar Nova Empresa Cliente</h3>
                <button class="btn btn-secondary btn-close-modal">✕</button>
              </div>

              <form id="form-master-add-tenant">
                <div class="form-group">
                  <label class="form-label" style="color: #cbd5e1;">Nome da Empresa Cliente *</label>
                  <input type="text" class="form-control" id="m-company" placeholder="Ex: ClimaFrio Soluções" required style="background: #0f172a; color: #fff; border-color: #334155;">
                </div>

                <div class="form-group">
                  <label class="form-label" style="color: #cbd5e1;">Nome do Gestor / Responsável *</label>
                  <input type="text" class="form-control" id="m-fullname" placeholder="Ex: Roberto Silva" required style="background: #0f172a; color: #fff; border-color: #334155;">
                </div>

                <div class="form-group">
                  <label class="form-label" style="color: #cbd5e1;">E-mail de Login do Gestor *</label>
                  <input type="email" class="form-control" id="m-email" placeholder="gestor@climafrio.com" required style="background: #0f172a; color: #fff; border-color: #334155;">
                </div>

                <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <div class="form-group">
                    <label class="form-label" style="color: #cbd5e1;">Telefone</label>
                    <input type="tel" class="form-control" id="m-phone" placeholder="(81) 99999-0000" style="background: #0f172a; color: #fff; border-color: #334155;">
                  </div>
                  <div class="form-group">
                    <label class="form-label" style="color: #cbd5e1;">Senha Inicial *</label>
                    <input type="password" class="form-control" id="m-password" value="123456" required style="background: #0f172a; color: #fff; border-color: #334155;">
                  </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
                  <button type="button" class="btn btn-secondary btn-close-modal">Cancelar</button>
                  <button type="submit" class="btn btn-primary" style="background: #6366f1;">Criar Cliente na Nuvem</button>
                </div>
              </form>
            </div>
          </div>
        `;

        modalContainer.querySelectorAll('.btn-close-modal').forEach(b => b.addEventListener('click', () => modalContainer.innerHTML = ''));

        document.getElementById('form-master-add-tenant').addEventListener('submit', async (e) => {
          e.preventDefault();
          const companyName = document.getElementById('m-company').value.trim();
          const fullName = document.getElementById('m-fullname').value.trim();
          const email = document.getElementById('m-email').value.trim().toLowerCase();
          const phone = document.getElementById('m-phone').value.trim();
          const password = document.getElementById('m-password').value;

          try {
            authService.registerUser({ fullName, companyName, email, phone, password });
            alert(`✓ Empresa "${companyName}" e conta do gestor (${email}) criados com sucesso na nuvem!`);
            modalContainer.innerHTML = '';
            if (refreshCallback) refreshCallback();
          } catch (err) {
            alert("Erro ao cadastrar cliente: " + err.message);
          }
        });
      });
    }

    // Impersonate
    document.querySelectorAll('.btn-master-impersonate').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const userEmail = e.currentTarget.getAttribute('data-user-email');
        const users = authService.getAllUsers();
        const found = users.find(u => u.email === userEmail);
        if (found) {
          authService.setCurrentUser(found);
          window.location.href = 'index.html';
        }
      });
    });

    // Reset password
    document.querySelectorAll('.btn-master-reset-pass').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const userEmail = e.currentTarget.getAttribute('data-user-email');
        const newPass = prompt(`Digite a nova senha para ${userEmail}:`, '123456');
        if (newPass) {
          const users = authService.getAllUsers();
          const user = users.find(u => u.email === userEmail);
          if (user) {
            user.rawPassword = newPass;
            user.passwordHash = authService.hashPassword(newPass);
            localStorage.setItem('saas_asset_users_db', JSON.stringify(users));
            firebaseDBService.saveUserRecordToCloud(userEmail, { user, tenant: null }).catch(() => {});
            firebaseDBService.saveDocumentToCloud('global_auth', 'users_list', users).catch(() => {});
            alert(`✓ Senha do usuário ${userEmail} alterada com sucesso para: ${newPass}`);
            if (refreshCallback) refreshCallback();
          }
        }
      });
    });
  }
}

export const masterAdminPortal = new MasterAdminPortal();
