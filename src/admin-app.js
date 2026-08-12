/* ==========================================================================
   ADMIN APP - BOOTSTRAPPER E CONTROLADOR DO PORTAL MASTER ADMIN
   ========================================================================== */

import { masterAdminPortal } from './views/master-admin-portal.js';

class AdminAppController {
  constructor() {
    this.init();
  }

  init() {
    console.log('[AdminAppController] Inicializando Portal Master Admin...');
    this.render();
  }

  render() {
    const container = document.getElementById('admin-main-content');
    const topbarRight = document.getElementById('admin-topbar-right');

    if (!container) return;

    if (masterAdminPortal.isLoggedIn) {
      if (topbarRight) {
        topbarRight.innerHTML = `
          <button class="btn btn-secondary" id="btn-topbar-logout" style="background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); font-size: 0.8rem; margin-right: 10px;">
            Sair do Master
          </button>
          <a href="index.html" class="btn btn-primary" style="font-size: 0.8rem; background: #6366f1; text-decoration: none;">
            🌐 Ir para o App Clientes
          </a>
        `;

        document.getElementById('btn-topbar-logout').addEventListener('click', () => {
          sessionStorage.removeItem('saas_master_admin_session');
          masterAdminPortal.isLoggedIn = false;
          this.render();
        });
      }

      container.innerHTML = masterAdminPortal.renderDashboard();
      masterAdminPortal.attachDashboardEvents(() => this.render());

    } else {
      if (topbarRight) {
        topbarRight.innerHTML = `
          <a href="index.html" class="btn btn-secondary" style="font-size: 0.8rem; color: #fff; border-color: rgba(255,255,255,0.2); text-decoration: none;">
            🌐 Ir para o App Clientes
          </a>
        `;
      }

      container.innerHTML = masterAdminPortal.renderLoginPage();
      masterAdminPortal.attachLoginEvents(() => this.render());
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.adminAppController = new AdminAppController();
});
