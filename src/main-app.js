import { CanvasSignaturePad } from './components/canvas-signature.js';
import { authService } from './services/auth-service.js';
import { subscriptionService } from './services/subscription-service.js';
import { billingService } from './services/billing-service.js';
import { tenantDataService } from './services/tenant-data-service.js';
import { firebaseDBService } from './services/firebase-db-service.js';
import { renderLandingPage } from './views/landing-page.js';
import { renderRegisterPage, renderLoginPage, renderForgotPasswordPage } from './views/auth-pages.js';
import { renderSubscriptionManagementPage } from './views/subscription-page.js';
import { NewServiceWizard } from './views/new-service-wizard.js';
import { renderServiceDetailView, attachServiceDetailEvents } from './views/service-detail-view.js';
import { renderAdminUsersView, attachAdminUsersEvents } from './views/admin-users-view.js';
import { offlineSyncQueue } from './mock-data.js';

// database-config-view is loaded dynamically to prevent stale SW cache from crashing the app
let _dbConfigModule = null;
async function loadDbConfigModule() {
  if (!_dbConfigModule) {
    try {
      _dbConfigModule = await import('./views/database-config-view.js');
    } catch (e) {
      console.warn('[App] Failed to load database-config-view:', e);
      _dbConfigModule = {
        renderDatabaseConfigView: () => '<div class="card"><h3>Erro ao carregar módulo do banco de dados. Limpe o cache do navegador.</h3></div>',
        attachDatabaseConfigEvents: () => {}
      };
    }
  }
  return _dbConfigModule;
}

class AppController {
  constructor() {
    console.log('[AppController] Constructor chamado...');
    this.navStack = [];
    this.signaturePad = null;
    this.activeWorkOrder = null;
    this.isOnline = navigator.onLine;

    this.currentViewMode = 'PUBLIC_LANDING';
    this.wizardInstance = null;
    try {
      this.hideFinancials = localStorage.getItem('saas_hide_financials') === 'true';
    } catch(e) {
      this.hideFinancials = false;
    }

    this.init();
  }

  init() {
    console.log('[AppController] init() chamado...');
    try {
      this.setupGlobalEvents();
      this.setupNetworkStatusListener();
      this.setupModalHandlers();
      this.setupSignaturePad();
      this.setupForms();

      const user = authService.getCurrentUser();
      if (user) {
        this.currentViewMode = 'ADMIN_PANEL';
      }

      console.log('[AppController] Chamando renderRouterView...');
      this.renderRouterView();
    } catch (err) {
      console.error('[AppController] Erro no init():', err);
    }
  }

  getActiveTenantData() {
    const user = authService.getCurrentUser();
    const tenantId = user ? user.tenantId : 'tenant-alfa-001';
    return tenantDataService.getTenantData(tenantId);
  }

  updateHeaderLogo() {
    const defaultIcon = document.getElementById('brand-default-icon');
    const customLogoImg = document.getElementById('brand-custom-logo');
    const user = authService.getCurrentUser();

    if (user && customLogoImg) {
      const logo = tenantDataService.getTenantLogo(user.tenantId);
      if (logo) {
        customLogoImg.src = logo;
        customLogoImg.style.display = 'block';
        if (defaultIcon) defaultIcon.style.display = 'none';
      } else {
        customLogoImg.style.display = 'none';
        if (defaultIcon) defaultIcon.style.display = 'flex';
      }
    } else if (customLogoImg) {
      customLogoImg.style.display = 'none';
      if (defaultIcon) defaultIcon.style.display = 'flex';
    }
  }

  openCustomLogoModal() {
    const user = authService.getCurrentUser();
    if (!user) return;

    const existingLogo = tenantDataService.getTenantLogo(user.tenantId);

    const modalHTML = `
      <div class="modal active" id="modal-custom-logo">
        <div class="modal-content" style="max-width: 520px; padding: 24px; border-radius: var(--radius-lg);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
            <h3 style="display: flex; align-items: center; gap: 8px;">
              <i data-lucide="image" style="color: var(--primary);"></i>
              Logotipo da Sua Empresa
            </h3>
            <button id="btn-close-logo-modal" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-muted);">✕</button>
          </div>

          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 20px;">
            Insira o logotipo da sua empresa para exibir no cabeçalho do sistema e nos laudos emitidos.
          </p>

          <div style="text-align: center; margin-bottom: 20px; padding: 20px; background: var(--bg-primary); border: 2px dashed var(--border-color); border-radius: var(--radius-md);">
            <div id="logo-preview-wrapper" style="margin-bottom: 12px;">
              ${existingLogo ? `
                <img id="img-logo-preview" src="${existingLogo}" style="max-height: 80px; max-width: 220px; object-fit: contain; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              ` : `
                <div id="icon-logo-placeholder" style="width: 70px; height: 70px; margin: 0 auto; background: var(--primary); color: #fff; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 2rem;">
                  <i data-lucide="cloud-cog"></i>
                </div>
              `}
            </div>
            <label class="btn btn-secondary" style="cursor: pointer; display: inline-flex; align-items: center; gap: 8px;">
              <i data-lucide="upload"></i> Selecionar Imagem do Logotipo
              <input type="file" id="file-input-logo" accept="image/*" style="display: none;">
            </label>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 8px;">Suporta PNG, JPG, SVG ou WEBP (recomendado fundo transparente)</div>
          </div>

          <div style="display: flex; gap: 12px; justify-content: flex-end;">
            ${existingLogo ? `
              <button id="btn-remove-logo" class="btn" style="background: #fef2f2; color: #991b1b; border: 1px solid #fecaca;">
                <i data-lucide="trash-2"></i> Remover Logotipo
              </button>
            ` : ''}
            <button id="btn-save-logo" class="btn btn-primary" style="display: none;">
              <i data-lucide="check"></i> Salvar Logotipo
            </button>
          </div>
        </div>
      </div>
    `;

    const existingContainer = document.getElementById('custom-logo-modal-container');
    if (existingContainer) existingContainer.remove();

    const container = document.createElement('div');
    container.id = 'custom-logo-modal-container';
    container.innerHTML = modalHTML;
    document.body.appendChild(container);

    if (window.lucide) window.lucide.createIcons();

    let pendingBase64 = null;
    const fileInput = document.getElementById('file-input-logo');
    const previewWrapper = document.getElementById('logo-preview-wrapper');
    const btnSave = document.getElementById('btn-save-logo');
    const btnRemove = document.getElementById('btn-remove-logo');
    const btnClose = document.getElementById('btn-close-logo-modal');

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
          alert('Por favor, selecione uma imagem de até 2MB.');
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          pendingBase64 = event.target.result;
          previewWrapper.innerHTML = `
            <img src="${pendingBase64}" style="max-height: 80px; max-width: 220px; object-fit: contain; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          `;
          btnSave.style.display = 'inline-flex';
        };
        reader.readAsDataURL(file);
      });
    }

    if (btnSave) {
      btnSave.addEventListener('click', () => {
        if (pendingBase64) {
          tenantDataService.saveTenantLogo(user.tenantId, pendingBase64);
          container.remove();
          this.renderRouterView();
          alert('✓ Logotipo da empresa salvo com sucesso!');
        }
      });
    }

    if (btnRemove) {
      btnRemove.addEventListener('click', () => {
        if (confirm('Deseja remover o logotipo personalizado e voltar ao padrão?')) {
          tenantDataService.removeTenantLogo(user.tenantId);
          container.remove();
          this.renderRouterView();
        }
      });
    }

    if (btnClose) {
      btnClose.addEventListener('click', () => container.remove());
    }
  }

  startNewServiceWizard() {
    const user = authService.getCurrentUser();
    if (user && subscriptionService.isAccessBlocked(user.tenantId)) {
      alert("Seu período gratuito de 30 dias terminou. Escolha um plano para cadastrar novos serviços.");
      this.pushLevel(this.getSubscriptionManagementLevel1Config());
      return;
    }

    this.wizardInstance = new NewServiceWizard(
      (createdServiceId) => {
        const tenantId = user ? user.tenantId : 'tenant-alfa-001';
        this.pushLevel({
          title: "Detalhamento do Serviço",
          breadcrumbTitle: "Ver Serviço",
          renderContent: () => renderServiceDetailView(createdServiceId),
          onContentLoaded: () => attachServiceDetailEvents(tenantId, createdServiceId, () => this.renderCurrentLevel())
        });
      },
      () => {
        this.resetToHome();
      }
    );

    this.pushLevel({
      title: "Novo Serviço — Assistente Guiado",
      breadcrumbTitle: "Novo Serviço",
      renderContent: () => this.wizardInstance.render(),
      onContentLoaded: () => this.wizardInstance.attachEvents()
    });
  }

  renderRouterView() {
    const publicContainer = document.getElementById('public-view-container');
    const privateContainer = document.getElementById('private-view-container');
    const trialBannerContainer = document.getElementById('trial-banner-container');
    const topbarRight = document.getElementById('header-topbar-right');
    const companyTitleEl = document.getElementById('header-company-name');

    const currentUser = authService.getCurrentUser();

    if (this.currentViewMode === 'ADMIN_PANEL' && currentUser) {
      publicContainer.style.display = 'none';
      publicContainer.innerHTML = '';
      privateContainer.style.display = 'block';

      const tenant = authService.getTenantById(currentUser.tenantId) || { name: currentUser.companyName || "Sua Empresa" };
      const sub = subscriptionService.getTenantSubscription(currentUser.tenantId);
      const trialConfig = subscriptionService.getTrialBannerConfig(sub);
      const tenantData = this.getActiveTenantData() || {};

      companyTitleEl.textContent = tenant.name;

      // Safe arrays
      const servicesList = tenantData.services || [];
      const clientsList = tenantData.clients || [];
      const equipmentList = tenantData.equipment || [];

      // Update KPI Row values
      const kpiRow = document.getElementById('kpi-summary-row');
      if (kpiRow) {
        const totalCost = servicesList.reduce((acc, w) => acc + (w.totalCost || 0), 0);
        const displayCost = this.hideFinancials ? 'R$ ••••••' : `R$ ${totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        kpiRow.innerHTML = `
          <div class="kpi-card" style="position: relative;">
            <div class="kpi-label" style="display: flex; justify-content: space-between; align-items: center;">
              <span>FATURAMENTO MÊS</span>
              <button id="btn-toggle-financial-privacy" title="${this.hideFinancials ? 'Exibir faturamento' : 'Ocultar faturamento'}" style="background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 2px 6px; border-radius: 6px; display: inline-flex; align-items: center; transition: all 0.2s;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text-muted)'">
                <i data-lucide="${this.hideFinancials ? 'eye-off' : 'eye'}" style="width: 16px; height: 16px;"></i>
              </button>
            </div>
            <div class="kpi-value" style="color: #10b981;">${displayCost}</div>
            <div class="kpi-sub">${servicesList.length} Serviços Registrados</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-label">CLIENTES & ATIVOS</div>
            <div class="kpi-value" style="color: #6366f1;">${clientsList.length}</div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">${equipmentList.length} equipamentos</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-label">EQUIPE EM CAMPO</div>
            <div class="kpi-value">1</div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">${currentUser.fullName || 'Admin'}</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-label">ASSINATURA SAAS</div>
            <div class="kpi-value" style="color: ${sub.remainingDays <= 3 ? 'var(--danger)' : '#3b82f6'};">${sub.remainingDays} dias</div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">${sub.subscriptionStatus === 'trial' ? 'período gratuito' : 'assinatura ativa'}</div>
          </div>
        `;

        const btnEye = document.getElementById('btn-toggle-financial-privacy');
        if (btnEye) {
          btnEye.addEventListener('click', (e) => {
            e.stopPropagation();
            this.hideFinancials = !this.hideFinancials;
            try { localStorage.setItem('saas_hide_financials', this.hideFinancials); } catch(ex) {}
            this.renderRouterView();
          });
        }
      }

      // Render Minimizable Trial Top Banner
      if (trialConfig) {
        if (this.isTrialBannerMinimized) {
          trialBannerContainer.innerHTML = `
            <div class="trial-banner" style="${trialConfig.messageStyle}; padding: 6px 16px; font-size: 0.8rem; display: flex; justify-content: space-between; align-items: center; border-radius: 0;">
              <span>💡 <strong>Teste Grátis:</strong> ${sub.remainingDays} dias restantes</span>
              <div style="display: flex; gap: 8px; align-items: center;">
                <button class="btn-trial-action" id="btn-trial-upgrade-now" style="padding: 2px 10px; font-size: 0.75rem;">Planos</button>
                <button id="btn-toggle-trial-banner" title="Expandir aviso" style="background: none; border: none; color: currentColor; cursor: pointer; padding: 2px; display: inline-flex; align-items: center; opacity: 0.85;">
                  <i data-lucide="chevron-down" style="width: 16px; height: 16px;"></i>
                </button>
              </div>
            </div>
          `;
        } else {
          trialBannerContainer.innerHTML = `
            <div class="trial-banner" style="${trialConfig.messageStyle}; display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; border-radius: 0;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span>💡 <strong>Aviso de Teste Grátis:</strong> ${trialConfig.text}</span>
              </div>
              <div style="display: flex; gap: 10px; align-items: center;">
                <button class="btn-trial-action" id="btn-trial-upgrade-now">Conhecer Planos</button>
                <button id="btn-toggle-trial-banner" title="Minimizar aviso" style="background: rgba(255,255,255,0.25); border: none; color: currentColor; cursor: pointer; padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                  <i data-lucide="chevron-up" style="width: 14px; height: 14px;"></i>
                  <span>Minimizar</span>
                </button>
              </div>
            </div>
          `;
        }

        const btnUpgrade = document.getElementById('btn-trial-upgrade-now');
        if (btnUpgrade) {
          btnUpgrade.addEventListener('click', () => {
            this.pushLevel(this.getSubscriptionManagementLevel1Config());
          });
        }

        const btnToggleTrial = document.getElementById('btn-toggle-trial-banner');
        if (btnToggleTrial) {
          btnToggleTrial.addEventListener('click', () => {
            this.isTrialBannerMinimized = !this.isTrialBannerMinimized;
            try { localStorage.setItem('saas_trial_banner_minimized', this.isTrialBannerMinimized); } catch(ex) {}
            this.renderRouterView();
          });
        }
      } else {
        trialBannerContainer.innerHTML = '';
      }

      // Update Topbar Right
      topbarRight.innerHTML = `
        <div class="tenant-pill" style="background-color: #f1f5f9; color: #334155;">
          🏢 ${tenant.name}
        </div>
        <button class="user-role-badge" id="btn-open-user-menu" style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.2); cursor: pointer; border-radius: 20px; padding: 4px 12px; transition: all 0.2s;" title="Minha Conta & Opções do Usuário">
          <span>👑 ${currentUser.fullName}</span> ⚙️
        </button>
        <button class="btn btn-secondary" style="padding: 6px 14px; font-size: 0.85rem;" id="btn-app-logout">
          Sair
        </button>
      `;

      this.updateHeaderLogo();

      const btnUserMenu = document.getElementById('btn-open-user-menu');
      if (btnUserMenu) {
        btnUserMenu.addEventListener('click', () => this.openAccountProfileModal());
      }

      document.getElementById('btn-app-logout').addEventListener('click', () => {
        authService.logout();
        this.currentViewMode = 'PUBLIC_LANDING';
        this.renderRouterView();
      });

      // If expired, auto-redirect to subscription block
      if (sub.subscriptionStatus === 'expired' || sub.subscriptionStatus === 'blocked') {
        this.navStack = [];
        this.pushLevel(this.getSubscriptionManagementLevel1Config());
      } else if (this.navStack.length === 0) {
        this.pushLevel(this.getLevel0Config());
      } else {
        this.renderCurrentLevel();
      }

    } else {
      // Public Views
      privateContainer.style.display = 'none';
      trialBannerContainer.innerHTML = '';
      publicContainer.style.display = 'block';

      companyTitleEl.textContent = "Plataforma de Manutenção & Ativos";

      topbarRight.innerHTML = `
        <button class="btn btn-secondary" id="btn-top-login">Entrar</button>
        <button class="btn btn-primary" id="btn-top-register">Começar Teste Grátis</button>
      `;

      document.getElementById('btn-top-login').addEventListener('click', () => {
        this.currentViewMode = 'LOGIN';
        this.renderRouterView();
      });

      document.getElementById('btn-top-register').addEventListener('click', () => {
        this.currentViewMode = 'REGISTER';
        this.renderRouterView();
      });

      if (this.currentViewMode === 'REGISTER') {
        publicContainer.innerHTML = renderRegisterPage();
        this.attachRegisterFormEvents();
      } else if (this.currentViewMode === 'LOGIN') {
        publicContainer.innerHTML = renderLoginPage();
        this.attachLoginFormEvents();
      } else if (this.currentViewMode === 'FORGOT') {
        publicContainer.innerHTML = renderForgotPasswordPage();
        this.attachForgotPasswordEvents();
      } else {
        publicContainer.innerHTML = renderLandingPage();
        this.attachLandingPageEvents();
      }
    }

    const appStatusEl = document.getElementById('debug-app-status');
    if (appStatusEl) appStatusEl.textContent = `v2.2.4 (${this.currentViewMode})`;

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  attachLandingPageEvents() {
    const btnHeroTrial = document.getElementById('btn-hero-trial');
    const btnHeroLogin = document.getElementById('btn-hero-login');

    if (btnHeroTrial) {
      btnHeroTrial.addEventListener('click', () => {
        this.currentViewMode = 'REGISTER';
        this.renderRouterView();
      });
    }

    if (btnHeroLogin) {
      btnHeroLogin.addEventListener('click', () => {
        this.currentViewMode = 'LOGIN';
        this.renderRouterView();
      });
    }

    document.querySelectorAll('.btn-choose-plan').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentViewMode = 'REGISTER';
        this.renderRouterView();
      });
    });
  }

  attachRegisterFormEvents() {
    const form = document.getElementById('form-register');
    const errBox = document.getElementById('register-error-box');
    const linkLogin = document.getElementById('link-go-login');

    if (linkLogin) {
      linkLogin.addEventListener('click', (e) => {
        e.preventDefault();
        this.currentViewMode = 'LOGIN';
        this.renderRouterView();
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        errBox.style.display = 'none';

        const fullName = document.getElementById('reg-fullname').value.trim();
        const companyName = document.getElementById('reg-company').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;

        if (password !== confirmPassword) {
          errBox.style.display = 'block';
          errBox.textContent = "As senhas não coincidem. Digite novamente.";
          return;
        }

        try {
          authService.registerUser({ fullName, companyName, email, phone, password });
          alert(`Conta criada com sucesso para ${companyName}! Seu espaço de trabalho está limpo e pronto.`);
          this.currentViewMode = 'ADMIN_PANEL';
          this.navStack = [];
          this.renderRouterView();
        } catch (err) {
          errBox.style.display = 'block';
          errBox.textContent = err.message;
        }
      });
    }
  }

  attachLoginFormEvents() {
    const form = document.getElementById('form-login');
    const errBox = document.getElementById('login-error-box');
    const linkReg = document.getElementById('link-go-register');
    const linkForgot = document.getElementById('link-forgot-password');

    if (linkReg) {
      linkReg.addEventListener('click', (e) => {
        e.preventDefault();
        this.currentViewMode = 'REGISTER';
        this.renderRouterView();
      });
    }

    if (linkForgot) {
      linkForgot.addEventListener('click', (e) => {
        e.preventDefault();
        this.currentViewMode = 'FORGOT';
        this.renderRouterView();
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errBox.style.display = 'none';

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        try {
          await authService.login(email, password);
          this.currentViewMode = 'ADMIN_PANEL';
          this.navStack = [];
          this.renderRouterView();
        } catch (err) {
          errBox.style.display = 'block';
          errBox.textContent = err.message;
        }
      });
    }
  }

  attachForgotPasswordEvents() {
    const form = document.getElementById('form-forgot');
    const msgBox = document.getElementById('forgot-msg-box');
    const linkBack = document.getElementById('link-back-login');

    if (linkBack) {
      linkBack.addEventListener('click', (e) => {
        e.preventDefault();
        this.currentViewMode = 'LOGIN';
        this.renderRouterView();
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value.trim();
        try {
          const msg = authService.recoverPassword(email);
          msgBox.style.display = 'block';
          msgBox.style.backgroundColor = '#ecfdf5';
          msgBox.style.color = '#065f46';
          msgBox.textContent = msg;
        } catch (err) {
          msgBox.style.display = 'block';
          msgBox.style.backgroundColor = '#fef2f2';
          msgBox.style.color = '#991b1b';
          msgBox.textContent = err.message;
        }
      });
    }
  }

  setupNetworkStatusListener() {
    const updatePill = () => {
      this.isOnline = navigator.onLine;
      const pill = document.getElementById('pwa-status-pill');
      if (!pill) return;

      if (this.isOnline) {
        pill.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
        pill.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        pill.style.color = '#059669';
        pill.innerHTML = `<i data-lucide="wifi"></i> <span>ONLINE</span>`;
      } else {
        pill.style.backgroundColor = 'rgba(245, 158, 11, 0.15)';
        pill.style.borderColor = 'rgba(245, 158, 11, 0.3)';
        pill.style.color = '#d97706';
        pill.innerHTML = `<i data-lucide="wifi-off"></i> <span>MODO OFFLINE</span>`;
      }

      if (window.lucide) window.lucide.createIcons();
    };

    window.addEventListener('online', updatePill);
    window.addEventListener('offline', updatePill);
  }

  pushLevel(levelConfig) {
    this.navStack.push(levelConfig);
    this.renderCurrentLevel();
  }

  popLevel() {
    if (this.navStack.length > 1) {
      this.navStack.pop();
      this.renderCurrentLevel();
    }
  }

  resetToHome() {
    if (this.currentViewMode !== 'ADMIN_PANEL') {
      this.currentViewMode = 'PUBLIC_LANDING';
      this.renderRouterView();
      return;
    }
    this.navStack = [this.getLevel0Config()];
    this.renderCurrentLevel();
  }

  renderCurrentLevel() {
    if (this.navStack.length === 0) return;

    const current = this.navStack[this.navStack.length - 1];

    const navBar = document.getElementById('navigation-bar');
    const kpiRow = document.getElementById('kpi-summary-row');
    const sectionHeading = document.getElementById('section-heading');
    const btnBack = document.getElementById('btn-nav-back');
    const breadcrumbTrail = document.getElementById('breadcrumb-trail');

    if (this.navStack.length > 1) {
      navBar.style.display = 'flex';
      btnBack.style.display = 'inline-flex';
      kpiRow.style.display = 'none';
      sectionHeading.textContent = current.title.toUpperCase();
    } else {
      navBar.style.display = 'none';
      btnBack.style.display = 'none';
      kpiRow.style.display = 'grid';
      sectionHeading.textContent = "MÓDULOS OPERACIONAIS";
    }

    breadcrumbTrail.innerHTML = this.navStack.map((item, index) => {
      const isLast = index === this.navStack.length - 1;
      return `<span class="${isLast ? 'active' : ''}">${item.breadcrumbTitle || item.title}</span>`;
    }).join(' <span style="color: var(--text-muted);">/</span> ');

    const blockGridContainer = document.getElementById('block-grid-container');
    const contentViewContainer = document.getElementById('content-view-container');

    if (current.blocks && current.blocks.length > 0) {
      blockGridContainer.style.display = 'grid';
      contentViewContainer.style.display = 'none';
      contentViewContainer.innerHTML = '';

      // Prominent '+ Novo serviço' Bar on Level 0
      let topActionBarHTML = '';
      if (this.navStack.length === 1) {
        topActionBarHTML = `
          <div class="main-new-service-bar" style="grid-column: 1 / -1;">
            <button class="btn-main-new-service" id="btn-home-main-new-service">
              <i data-lucide="plus-circle" style="font-size: 1.4rem;"></i>
              <span>+ Novo serviço</span>
            </button>
          </div>
        `;
      }

      const displayBlocks = current.blocks;

      blockGridContainer.innerHTML = topActionBarHTML + displayBlocks.map(block => `
        <div class="block-card" data-block-id="${block.id}">
          ${block.badge ? `<div class="notification-badge">${block.badge}</div>` : ''}
          <div class="block-icon-box ${block.iconBgClass || 'icon-box-emerald'}">
            <i data-lucide="${block.icon}"></i>
          </div>
          <div class="block-card-title">${block.title}</div>
          ${block.desc ? `<div class="block-card-desc">${block.desc}</div>` : ''}
        </div>
      `).join('');

      const btnHomeNew = document.getElementById('btn-home-main-new-service');
      if (btnHomeNew) {
        btnHomeNew.addEventListener('click', () => this.startNewServiceWizard());
      }

      blockGridContainer.querySelectorAll('.block-card').forEach(card => {
        card.addEventListener('click', () => {
          const blockId = card.getAttribute('data-block-id');
          const targetBlock = displayBlocks.find(b => b.id === blockId);
          if (targetBlock && targetBlock.onClick) {
            targetBlock.onClick();
          }
        });
      });

    } else if (current.renderContent) {
      blockGridContainer.style.display = 'none';
      contentViewContainer.style.display = 'block';
      contentViewContainer.innerHTML = current.renderContent();

      if (current.onContentLoaded) {
        current.onContentLoaded();
      }
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Level 0: Home Dashboard
  getLevel0Config() {
    const user = authService.getCurrentUser();
    const sub = user ? subscriptionService.getTenantSubscription(user.tenantId) : null;
    const tenantData = this.getActiveTenantData();

    return {
      title: "Painel do Gestor",
      subtitle: "Módulos de gestão de ativos e serviços",
      breadcrumbTitle: "Painel Principal",
      blocks: [
        {
          id: "mod-new-service-btn",
          title: "+ Novo serviço",
          desc: "Fluxo curto guiado em 4 etapas",
          icon: "plus-circle",
          iconBgClass: "icon-box-emerald",
          badge: "Novo",
          onClick: () => this.startNewServiceWizard()
        },
        {
          id: "mod-services-list",
          title: "Ordens de Serviço",
          desc: "Visualizar histórico & atendimentos",
          icon: "wrench",
          iconBgClass: "icon-box-purple",
          badge: `${(tenantData.services || []).length}`,
          onClick: () => this.pushLevel(this.getWorkOrdersLevel1Config())
        },
        {
          id: "mod-clients-list",
          title: "Clientes",
          desc: "Cadastro e parques por cliente",
          icon: "users",
          iconBgClass: "icon-box-blue",
          badge: `${(tenantData.clients || []).length}`,
          onClick: () => this.pushLevel(this.getCustomersLevel1Config())
        },
        {
          id: "mod-subscription",
          title: "Plano e Assinatura",
          desc: "Período gratuito & gestão de planos",
          icon: "credit-card",
          iconBgClass: "icon-box-indigo",
          badge: sub ? `${sub.remainingDays} dias` : "30 dias",
          onClick: () => this.pushLevel(this.getSubscriptionManagementLevel1Config())
        },
        {
          id: "mod-assets",
          title: "Ativos Patrimoniais",
          desc: "Gestão do ciclo de vida & QR Code",
          icon: "box",
          iconBgClass: "icon-box-teal",
          badge: `${(tenantData.assets || []).length}`,
          onClick: () => this.pushLevel(this.getAssetsLevel1Config())
        },
        {
          id: "mod-pmoc",
          title: "PMOC & Preventivas",
          desc: "Planos de manutenção & laudo sanitário",
          icon: "calendar-check",
          iconBgClass: "icon-box-cyan",
          badge: (tenantData.pmocPlans || []).length > 0 ? "96%" : "0",
          onClick: () => this.pushLevel(this.getPMOCLevel1Config())
        },
        {
          id: "mod-pwa-offline",
          title: "PWA & Offline Sync",
          desc: "Modo sem internet & fila de sincronização",
          icon: "wifi-off",
          iconBgClass: "icon-box-amber",
          badge: `${offlineSyncQueue.filter(q => q.status === 'PENDING_SYNC').length}`,
          onClick: () => this.pushLevel(this.getPWAOfflineLevel1Config())
        },
        {
          id: "mod-admin-users",
          title: "Controle de Usuários Cloud",
          desc: "Painel admin, logins e permissões de acesso",
          icon: "users",
          iconBgClass: "icon-box-indigo",
          badge: `${authService.getAllUsers().length} usuários`,
          onClick: () => this.pushLevel(this.getAdminUsersLevel1Config())
        }
      ]
    };
  }

  getAdminUsersLevel1Config() {
    return {
      title: "Painel Admin de Controle de Usuários",
      subtitle: "Gestão de e-mails, acessos e sincronização de clientes na nuvem",
      breadcrumbTitle: "Gestão de Usuários",
      renderContent: () => renderAdminUsersView(),
      onContentLoaded: () => attachAdminUsersEvents(() => this.renderCurrentLevel())
    };
  }

  // Level 1: Subscription Management View
  getSubscriptionManagementLevel1Config() {
    const user = authService.getCurrentUser();
    const tenantId = user ? user.tenantId : "tenant-alfa-001";

    return {
      title: "Plano e Assinatura SaaS",
      subtitle: "Gestão do período gratuito de 30 dias e planos contratados.",
      breadcrumbTitle: "Plano e Assinatura",
      renderContent: () => renderSubscriptionManagementPage(tenantId),
      onContentLoaded: () => {
        document.querySelectorAll('.btn-activate-plan').forEach(btn => {
          btn.addEventListener('click', () => {
            const planId = btn.getAttribute('data-plan-id');
            billingService.processSubscriptionPayment({ tenantId, planId, billingCycle: "MONTHLY" });
            alert(`✓ Assinatura ativada com sucesso! O plano ${planId.toUpperCase()} já está em vigor.`);
            this.renderRouterView();
          });
        });
      }
    };
  }

  // Level 1: Customers View
  getCustomersLevel1Config() {
    const tenantData = this.getActiveTenantData();
    const clients = tenantData.clients || [];

    return {
      title: "Clientes Cadastrados",
      subtitle: "Cadastro simples de clientes e locais de atendimento.",
      breadcrumbTitle: "Clientes",
      renderContent: () => {
        if (clients.length === 0) {
          return `
            <div class="card" style="text-align: center; padding: 48px 24px;">
              <i data-lucide="users" style="font-size: 3.5rem; color: var(--text-muted); margin-bottom: 16px;"></i>
              <h3 style="margin-bottom: 8px;">Nenhum Cliente Cadastrado</h3>
              <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 24px;">
                Crie um novo serviço para cadastrar seu primeiro cliente de forma guiada.
              </p>
              <button class="btn btn-primary" id="btn-client-empty-new-service">
                <i data-lucide="plus-circle"></i> + Novo Serviço
              </button>
            </div>
          `;
        }

        return `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
            ${clients.map(c => `
              <div class="card">
                <h3 style="font-size: 1.1rem; color: #0f172a; margin-bottom: 6px;">${c.name}</h3>
                <div style="font-size: 0.85rem; color: var(--text-muted);">📞 ${c.phone}</div>
                <div style="font-size: 0.85rem; color: var(--text-muted);">📍 ${c.address || 'Sem endereço'}</div>
              </div>
            `).join('')}
          </div>
        `;
      },
      onContentLoaded: () => {
        const btnEmpty = document.getElementById('btn-client-empty-new-service');
        if (btnEmpty) btnEmpty.addEventListener('click', () => this.startNewServiceWizard());
      }
    };
  }

  // Level 1: Work Orders Sub-menu
  getWorkOrdersLevel1Config() {
    const tenantData = this.getActiveTenantData();

    return {
      title: "Módulo de Ordens de Serviço",
      subtitle: "Gerencie chamados de campo, preventivas e checklists.",
      breadcrumbTitle: "Ordens de Serviço",
      blocks: [
        {
          id: "sub-new-service-direct",
          title: "+ Novo serviço",
          desc: "Iniciar fluxo curto em 4 etapas",
          icon: "plus-circle",
          iconBgClass: "icon-box-emerald",
          badge: "Novo",
          onClick: () => this.startNewServiceWizard()
        },
        {
          id: "sub-active-os",
          title: "Serviços em Andamento",
          desc: "Atendimentos abertos ou executando",
          icon: "clock",
          iconBgClass: "icon-box-amber",
          badge: `${(tenantData.services || []).filter(w => w.status !== 'Concluído').length}`,
          onClick: () => this.pushLevel(this.getWorkOrdersContentView('Aberto'))
        }
      ]
    };
  }

  getWorkOrdersContentView(statusFilter) {
    const tenantData = this.getActiveTenantData();
    const services = tenantData.services || [];

    return {
      title: "Ordens de Serviço",
      subtitle: "Lista de chamados técnicos e manutenções.",
      breadcrumbTitle: "Lista de OS",
      renderContent: () => {
        if (services.length === 0) {
          return `
            <div class="card" style="text-align: center; padding: 48px 24px;">
              <i data-lucide="wrench" style="font-size: 3.5rem; color: var(--text-muted); margin-bottom: 16px;"></i>
              <h3 style="margin-bottom: 8px;">Nenhuma Ordem de Serviço Encontrada</h3>
              <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 24px;">
                Clique abaixo para cadastrar seu primeiro serviço.
              </p>
              <button class="btn btn-primary" id="btn-os-empty-new-service">
                <i data-lucide="plus-circle"></i> + Novo Serviço
              </button>
            </div>
          `;
        }

        return `
          <div class="table-wrapper">
            <table>
              <thead>
                <tr><th>Nº Serviço</th><th>Cliente</th><th>Equipamento</th><th>Status</th><th>Ações</th></tr>
              </thead>
              <tbody>
                ${services.map(wo => `
                  <tr>
                    <td><strong style="color: var(--primary);">${wo.serviceNumber}</strong></td>
                    <td>${wo.clientName}</td>
                    <td>${wo.equipmentBrand || ''} ${wo.equipmentModel || ''}</td>
                    <td><span class="badge ${wo.status === 'Concluído' ? 'badge-success' : 'badge-info'}">${wo.status}</span></td>
                    <td>
                      <button class="btn btn-secondary btn-open-service-detail" data-id="${wo.id}">
                        <i data-lucide="eye"></i> Ver Serviço
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      },
      onContentLoaded: () => {
        const btnEmpty = document.getElementById('btn-os-empty-new-service');
        if (btnEmpty) btnEmpty.addEventListener('click', () => this.startNewServiceWizard());

        document.querySelectorAll('.btn-open-service-detail').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const user = authService.getCurrentUser();
            const tenantId = user ? user.tenantId : 'tenant-alfa-001';
            this.pushLevel({
              title: "Detalhamento do Serviço",
              breadcrumbTitle: "Ver Serviço",
              renderContent: () => renderServiceDetailView(id),
              onContentLoaded: () => attachServiceDetailEvents(tenantId, id, () => this.renderCurrentLevel())
            });
          });
        });
      }
    };
  }

  // Level 1: Assets Sub-menu
  getAssetsLevel1Config() {
    const tenantData = this.getActiveTenantData();

    return {
      title: "Módulo de Ativos Patrimoniais",
      subtitle: "Escolha uma ação para gerenciar o parque tecnológico.",
      breadcrumbTitle: "Ativos",
      blocks: [
        {
          id: "sub-add-asset",
          title: "Cadastrar Novo Ativo",
          desc: "Registrar equipamento & QR Code",
          icon: "plus-circle",
          iconBgClass: "icon-box-emerald",
          badge: "Novo",
          onClick: () => {
            const user = authService.getCurrentUser();
            if (user && subscriptionService.isAccessBlocked(user.tenantId)) {
              alert("Seu período gratuito de 30 dias terminou. Escolha um plano para cadastrar novos registros.");
              this.pushLevel(this.getSubscriptionManagementLevel1Config());
              return;
            }
            document.getElementById('modal-add-asset').classList.add('active');
          }
        },
        {
          id: "sub-list-assets",
          title: "Buscar & Listar Ativos",
          desc: "Todos os ativos em grade com prontuário",
          icon: "search",
          iconBgClass: "icon-box-blue",
          badge: `${tenantData.assets.length}`,
          onClick: () => this.pushLevel(this.getAssetsListContentView())
        }
      ]
    };
  }

  getAssetsListContentView() {
    const tenantData = this.getActiveTenantData();
    const assetsList = tenantData.assets;

    return {
      title: "Prontuário de Ativos Patrimoniais",
      subtitle: "Clique em um ativo para acessar seu prontuário digital completo.",
      breadcrumbTitle: "Lista de Ativos",
      renderContent: () => {
        if (assetsList.length === 0) {
          return `
            <div class="card" style="text-align: center; padding: 48px 24px;">
              <i data-lucide="box" style="font-size: 3.5rem; color: var(--text-muted); margin-bottom: 16px;"></i>
              <h3 style="margin-bottom: 8px;">Seu Parque de Ativos está Limpo</h3>
              <p style="color: var(--text-muted); font-size: 0.9rem; max-width: 500px; margin: 0 auto 24px;">
                Você ainda não possui nenhum equipamento cadastrado. Clique no botão abaixo para adicionar seu primeiro ativo.
              </p>
              <button class="btn btn-primary" id="btn-empty-add-asset">
                <i data-lucide="plus-circle"></i> Cadastrar Primeiro Ativo
              </button>
            </div>
          `;
        }

        return `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
            ${assetsList.map(a => `
              <div class="card asset-card-item" style="cursor: pointer;" data-id="${a.id}">
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                  <div>
                    <h3 style="font-size: 1.1rem; color: #0f172a;">${a.tagName}</h3>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${a.categoryName}</div>
                  </div>
                  <span class="badge badge-success">Instalado</span>
                </div>
                <div style="font-size: 0.85rem;"><strong>Cliente:</strong> ${a.customerName}</div>
              </div>
            `).join('')}
          </div>
        `;
      },
      onContentLoaded: () => {
        const btnEmpty = document.getElementById('btn-empty-add-asset');
        if (btnEmpty) {
          btnEmpty.addEventListener('click', () => {
            document.getElementById('modal-add-asset').classList.add('active');
          });
        }
      }
    };
  }

  getPMOCLevel1Config() {
    return {
      title: "Módulo PMOC & Preventivas",
      subtitle: "Planos de manutenção.",
      breadcrumbTitle: "PMOC",
      renderContent: () => `<div class="card">Módulo PMOC Ativo.</div>`
    };
  }

  getPWAOfflineLevel1Config() {
    return {
      title: "Modo PWA Offline",
      subtitle: "Sincronização sem internet.",
      breadcrumbTitle: "PWA",
      renderContent: () => `<div class="card">Sincronizador PWA Ativo.</div>`
    };
  }

  getAILevel1Config() {
    return {
      title: "Módulo IA",
      subtitle: "Predição por inteligência artificial.",
      breadcrumbTitle: "IA",
      renderContent: () => `<div class="card">Assistente IA Ativo.</div>`
    };
  }

  getFinancialLevel1Config() {
    return {
      title: "Financeiro & Peças",
      subtitle: "Faturamento e estoque.",
      breadcrumbTitle: "Financeiro",
      renderContent: () => `<div class="card">Módulo Financeiro Ativo.</div>`
    };
  }

  getQRScannerLevel1Config() {
    return {
      title: "Leitor QR Code",
      subtitle: "Câmera PWA.",
      breadcrumbTitle: "QR Scanner",
      renderContent: () => `<div class="card" style="text-align: center; padding: 40px;">Câmera PWA ativa.</div>`
    };
  }

  openAccountProfileModal() {
    const user = authService.getCurrentUser();
    if (!user) return;
    const tenant = authService.getTenantById(user.tenantId) || { name: user.companyName || 'Sua Empresa', cnpj: '' };

    let modal = document.getElementById('modal-user-account');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-user-account';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-card" style="max-width: 540px;">
        <div class="modal-header">
          <h3>⚙️ Minha Conta & Opções do Usuário</h3>
          <button class="btn btn-secondary btn-close-modal">✕</button>
        </div>

        <form id="form-user-account-modal">
          <div style="margin-bottom: 16px; padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <strong style="color: #0f172a;">☁️ Status do Banco de Dados Cloud</strong>
              <div style="font-size: 0.8rem; color: #059669;">🟢 Conectado & Sincronizado em Nuvem</div>
            </div>
            <button type="button" class="btn btn-secondary" id="btn-modal-force-sync" style="font-size: 0.8rem;">
              🔄 Sincronizar
            </button>
          </div>

          <div class="section-heading" style="font-size: 0.85rem; margin-bottom: 12px;">DADOS PESSOAIS</div>
          <div class="form-group">
            <label class="form-label">Nome Completo *</label>
            <input type="text" class="form-control" id="acc-fullname" value="${user.fullName || ''}" required>
          </div>

          <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">E-mail de Login *</label>
              <input type="email" class="form-control" id="acc-email" value="${user.email || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Telefone / WhatsApp *</label>
              <input type="tel" class="form-control" id="acc-phone" value="${user.phone || ''}" required>
            </div>
          </div>

          <div class="section-heading" style="font-size: 0.85rem; margin-top: 16px; margin-bottom: 12px;">DADOS DA EMPRESA</div>
          <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Nome da Empresa</label>
              <input type="text" class="form-control" id="acc-company-name" value="${tenant.name || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">CNPJ (Opcional)</label>
              <input type="text" class="form-control" id="acc-cnpj" value="${tenant.cnpj || ''}" placeholder="00.000.000/0001-00">
            </div>
          </div>

          <div class="section-heading" style="font-size: 0.85rem; margin-top: 16px; margin-bottom: 12px;">SEGURANÇA</div>
          <div class="form-group">
            <label class="form-label">Nova Senha (Deixe em branco para manter a atual)</label>
            <input type="password" class="form-control" id="acc-password" placeholder="Digite uma nova senha se desejar alterar">
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
            <button type="button" class="btn btn-secondary btn-close-modal">Cancelar</button>
            <button type="submit" class="btn btn-primary">💾 Salvar Alterações</button>
          </div>
        </form>
      </div>
    `;

    modal.classList.add('active');

    modal.querySelectorAll('.btn-close-modal').forEach(b => b.addEventListener('click', () => modal.classList.remove('active')));

    const btnForceSync = modal.querySelector('#btn-modal-force-sync');
    if (btnForceSync) {
      btnForceSync.addEventListener('click', async () => {
        btnForceSync.textContent = '⏳ Sincronizando...';
        const tenantData = tenantDataService.getTenantData(user.tenantId);
        await firebaseDBService.saveTenantDataToCloud(user.tenantId, tenantData);
        await firebaseDBService.saveUserRecordToCloud(user.email, { user, tenant, subscription: null });
        btnForceSync.textContent = '✓ Sincronizado!';
        setTimeout(() => btnForceSync.textContent = '🔄 Sincronizar', 2000);
      });
    }

    modal.querySelector('#form-user-account-modal').addEventListener('submit', async (e) => {
      e.preventDefault();

      const fullName = document.getElementById('acc-fullname').value.trim();
      const email = document.getElementById('acc-email').value.trim().toLowerCase();
      const phone = document.getElementById('acc-phone').value.trim();
      const companyName = document.getElementById('acc-company-name').value.trim();
      const cnpj = document.getElementById('acc-cnpj').value.trim();
      const newPassword = document.getElementById('acc-password').value;

      user.fullName = fullName;
      user.email = email;
      user.phone = phone;
      user.companyName = companyName;
      if (newPassword) {
        user.rawPassword = newPassword;
        user.passwordHash = authService.hashPassword(newPassword);
      }

      tenant.name = companyName;
      tenant.cnpj = cnpj;

      authService.setCurrentUser(user);

      // Save Tenants list
      const tenants = safeJSONParse('saas_asset_tenants_db', []);
      const idxT = tenants.findIndex(t => t.id === tenant.id);
      if (idxT >= 0) tenants[idxT] = tenant;
      else tenants.push(tenant);
      localStorage.setItem('saas_asset_tenants_db', JSON.stringify(tenants));

      // Save Users list
      const users = safeJSONParse('saas_asset_users_db', []);
      const idxU = users.findIndex(u => u.id === user.id);
      if (idxU >= 0) users[idxU] = user;
      else users.push(user);
      localStorage.setItem('saas_asset_users_db', JSON.stringify(users));

      // Save to Cloud DB
      await firebaseDBService.saveUserRecordToCloud(email, { user, tenant });
      await firebaseDBService.saveDocumentToCloud('global_auth', 'users_list', users);

      alert("✓ Dados da conta e perfil atualizados com sucesso!");
      modal.classList.remove('active');
      this.renderRouterView();
    });
  }

  // Setup Global Events & Modals
  setupGlobalEvents() {
    const btnHome = document.getElementById('btn-go-home');
    if (btnHome) btnHome.addEventListener('click', () => this.resetToHome());

    const logoWrapper = document.getElementById('brand-logo-wrapper');
    const directFileInput = document.getElementById('direct-logo-file-input');

    if (logoWrapper && directFileInput) {
      logoWrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        const user = authService.getCurrentUser();
        if (user) {
          directFileInput.click();
        } else {
          this.resetToHome();
        }
      });

      directFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 3 * 1024 * 1024) {
          alert('Por favor, selecione uma imagem de até 3MB.');
          return;
        }

        const user = authService.getCurrentUser();
        if (!user) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Data = event.target.result;
          tenantDataService.saveTenantLogo(user.tenantId, base64Data);
          this.updateHeaderLogo();
          alert('✓ Logotipo da empresa atualizado com sucesso!');
        };
        reader.readAsDataURL(file);
      });
    }

    const btnBack = document.getElementById('btn-nav-back');
    if (btnBack) btnBack.addEventListener('click', () => this.popLevel());
  }

  setupModalHandlers() {
    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-overlay').forEach(modal => modal.classList.remove('active'));
      });
    });

    const btnPrintQr = document.getElementById('btn-print-qr-modal');
    if (btnPrintQr) btnPrintQr.addEventListener('click', () => window.print());
  }

  setupSignaturePad() {
    const canvasEl = document.getElementById('signature-canvas');
    if (canvasEl) {
      this.signaturePad = new CanvasSignaturePad(canvasEl);
      const btnClear = document.getElementById('btn-clear-signature');
      if (btnClear) btnClear.addEventListener('click', () => this.signaturePad.clear());
    }

    const btnFinishOs = document.getElementById('btn-finish-os-submit');
    if (btnFinishOs) {
      btnFinishOs.addEventListener('click', () => {
        const user = authService.getCurrentUser();
        if (user && subscriptionService.isAccessBlocked(user.tenantId)) {
          alert("Seu período gratuito de 30 dias terminou. Escolha um plano para concluir Ordens de Serviço.");
          document.getElementById('modal-os-exec').classList.remove('active');
          this.pushLevel(this.getSubscriptionManagementLevel1Config());
          return;
        }

        if (this.activeWorkOrder) {
          this.activeWorkOrder.status = 'FINISHED';
          alert(`Ordem de Serviço ${this.activeWorkOrder.osNumber} concluída com sucesso! Laudo emitido.`);
          document.getElementById('modal-os-exec').classList.remove('active');
          this.renderCurrentLevel();
        }
      });
    }
  }

  setupForms() {
    const formAsset = document.getElementById('form-add-asset');
    if (formAsset) {
      formAsset.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = authService.getCurrentUser();
        if (user && subscriptionService.isAccessBlocked(user.tenantId)) {
          alert("Seu período gratuito de 30 dias terminou. Escolha um plano para cadastrar novos registros.");
          document.getElementById('modal-add-asset').classList.remove('active');
          this.pushLevel(this.getSubscriptionManagementLevel1Config());
          return;
        }

        const tag = document.getElementById('new-asset-tag').value;
        const categoryId = document.getElementById('new-asset-category').value;
        const customerId = document.getElementById('new-asset-customer').value;
        const model = document.getElementById('new-asset-model').value;
        const serial = document.getElementById('new-asset-serial').value;

        const newAsset = {
          id: `asset-${Date.now()}`,
          tagName: tag,
          qrCodeHash: `QR-${tag}-ALFA`,
          categoryId: categoryId,
          categoryName: 'Equipamento Geral',
          customerId: customerId,
          customerName: 'Cliente Cadastrado',
          locationName: 'Local Principal',
          model: model,
          serialNumber: serial,
          status: 'INSTALLED',
          history: [{ date: new Date().toISOString().split('T')[0], type: 'INSTALLATION', text: 'Ativo cadastrado.' }]
        };

        tenantDataService.addAsset(user.tenantId, newAsset);

        document.getElementById('modal-add-asset').classList.remove('active');
        formAsset.reset();
        this.renderRouterView();
        alert(`Ativo ${tag} cadastrado com sucesso!`);
      });
    }
  }
}

function startApp() {
  if (!window.appController) {
    window.appController = new AppController();
    window.app = window.appController;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
