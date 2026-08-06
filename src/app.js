import { CanvasSignaturePad } from './components/canvas-signature.js';
import { authService } from './services/auth-service.js';
import { subscriptionService } from './services/subscription-service.js';
import { billingService } from './services/billing-service.js';
import { tenantDataService } from './services/tenant-data-service.js';
import { renderLandingPage } from './views/landing-page.js';
import { renderRegisterPage, renderLoginPage, renderForgotPasswordPage } from './views/auth-pages.js';
import { renderSubscriptionManagementPage } from './views/subscription-page.js';
import { NewServiceWizard } from './views/new-service-wizard.js';
import { renderServiceDetailView, attachServiceDetailEvents } from './views/service-detail-view.js';
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
        kpiRow.innerHTML = `
          <div class="kpi-card">
            <div class="kpi-label">FATURAMENTO MÊS</div>
            <div class="kpi-value" style="color: #10b981;">R$ ${totalCost.toFixed(2)}</div>
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
      }

      // Render Trial Top Banner
      if (trialConfig) {
        trialBannerContainer.innerHTML = `
          <div class="trial-banner" style="${trialConfig.messageStyle}">
            <span>💡 <strong>Aviso de Teste Grátis:</strong> ${trialConfig.text}</span>
            <button class="btn-trial-action" id="btn-trial-upgrade-now">Conhecer Planos</button>
          </div>
        `;
        document.getElementById('btn-trial-upgrade-now').addEventListener('click', () => {
          this.pushLevel(this.getSubscriptionManagementLevel1Config());
        });
      } else {
        trialBannerContainer.innerHTML = '';
      }

      // Update Topbar Right
      topbarRight.innerHTML = `
        <div class="tenant-pill" id="pwa-status-pill">
          <i data-lucide="wifi"></i> <span>ONLINE</span>
        </div>
        <div class="tenant-pill" style="background-color: #f1f5f9; color: #334155;">
          🏢 ${tenant.name}
        </div>
        <div class="user-role-badge">
          <span>👑 ${currentUser.fullName}</span>
        </div>
        <button class="btn btn-secondary" style="padding: 6px 14px; font-size: 0.85rem;" id="btn-app-logout">
          Sair
        </button>
      `;

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
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        errBox.style.display = 'none';

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        try {
          authService.login(email, password);
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

      const displayBlocks = current.blocks.slice(0, 8);

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
          id: "mod-database-config",
          title: "Banco de Dados Cloud",
          desc: "Supabase PostgreSQL & Sincronização",
          icon: "database",
          iconBgClass: "icon-box-emerald",
          badge: "Cloud",
          onClick: async () => {
            const dbMod = await loadDbConfigModule();
            this.pushLevel({
              title: "Configuração de Banco de Dados Cloud",
              breadcrumbTitle: "Banco de Dados",
              renderContent: () => dbMod.renderDatabaseConfigView(),
              onContentLoaded: () => dbMod.attachDatabaseConfigEvents()
            });
          }
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
        }
      ]
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

  // Setup Global Events & Modals
  setupGlobalEvents() {
    const btnHome = document.getElementById('btn-go-home');
    if (btnHome) btnHome.addEventListener('click', () => this.resetToHome());

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
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
