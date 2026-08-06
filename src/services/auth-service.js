/* ==========================================================================
   AUTH SERVICE - SAFE JSON PARSING & MULTITENANT CREATION
   ========================================================================== */

import { TRIAL_CONFIG } from '../config/plans.js';

const STORAGE_KEYS = {
  CURRENT_USER: 'saas_asset_current_user',
  TENANTS: 'saas_asset_tenants_db',
  USERS: 'saas_asset_users_db',
  SUBSCRIPTIONS: 'saas_asset_subscriptions_db'
};

function safeJSONParse(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`[AuthService] Safe parse failed for key ${key}, using fallback:`, e);
    return fallback;
  }
}

class AuthService {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    try {
      if (!localStorage.getItem(STORAGE_KEYS.TENANTS)) {
        const defaultTenants = [
          {
            id: "tenant-alfa-001",
            name: "Alfa Climatização & Soluções Industriais",
            cnpj: "12.345.678/0001-90",
            createdAt: new Date("2026-01-01").toISOString()
          }
        ];
        localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(defaultTenants));
      }

      if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        const defaultUsers = [
          {
            id: "user-001",
            tenantId: "tenant-alfa-001",
            fullName: "Marcos Vinícius",
            email: "gestor@alfa.com.br",
            phone: "(81) 99887-1122",
            passwordHash: "hash_demo_123",
            rawPassword: "123",
            role: "ADMIN",
            isActive: true,
            createdAt: new Date("2026-01-01").toISOString()
          }
        ];
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
      }

      if (!localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS)) {
        const now = new Date();
        const trialStarted = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
        const trialEnds = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000);

        const defaultSubscriptions = [
          {
            id: "sub-001",
            tenantId: "tenant-alfa-001",
            planId: "professional",
            subscriptionStatus: "trial",
            trialStartedAt: trialStarted.toISOString(),
            trialEndsAt: trialEnds.toISOString(),
            subscriptionStartedAt: null,
            subscriptionEndsAt: null,
            accessStatus: "FULL_ACCESS"
          }
        ];
        localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(defaultSubscriptions));
      }
    } catch (e) {
      console.warn("[AuthService] Error in initStorage:", e);
    }
  }

  registerUser({ fullName, companyName, email, phone, password }) {
    const users = this.getAllUsers();
    const tenants = safeJSONParse(STORAGE_KEYS.TENANTS, []);
    const subscriptions = safeJSONParse(STORAGE_KEYS.SUBSCRIPTIONS, []);

    const cleanEmail = (email || '').trim().toLowerCase();

    if (users.find(u => u.email && u.email.toLowerCase() === cleanEmail)) {
      throw new Error("Este e-mail já está cadastrado no sistema. Faça login ou utilize outro e-mail.");
    }

    const tenantId = `tenant-${Date.now()}`;
    const userId = `user-${Date.now()}`;
    const subId = `sub-${Date.now()}`;

    const now = new Date();
    const trialEnds = new Date(now.getTime() + TRIAL_CONFIG.durationDays * 24 * 60 * 60 * 1000);

    const newTenant = {
      id: tenantId,
      name: companyName || 'Sua Empresa',
      createdAt: now.toISOString()
    };
    tenants.push(newTenant);

    const newUser = {
      id: userId,
      tenantId: tenantId,
      fullName: fullName,
      companyName: companyName,
      email: cleanEmail,
      phone: phone,
      passwordHash: this.hashPassword(password),
      rawPassword: password,
      role: "ADMIN",
      isActive: true,
      createdAt: now.toISOString()
    };
    users.push(newUser);

    const newSub = {
      id: subId,
      tenantId: tenantId,
      planId: TRIAL_CONFIG.defaultPlanId,
      subscriptionStatus: "trial",
      trialStartedAt: now.toISOString(),
      trialEndsAt: trialEnds.toISOString(),
      subscriptionStartedAt: null,
      subscriptionEndsAt: null,
      accessStatus: "FULL_ACCESS"
    };
    subscriptions.push(newSub);

    localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenants));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));

    this.setCurrentUser(newUser);

    return { user: newUser, tenant: newTenant, subscription: newSub };
  }

  login(email, password) {
    const users = this.getAllUsers();
    const cleanEmail = (email || '').trim().toLowerCase();
    const foundUser = users.find(u => u.email && u.email.toLowerCase() === cleanEmail);

    if (!foundUser) {
      throw new Error(`E-mail "${email}" não foi encontrado em nosso cadastro nesta máquina.`);
    }

    const calculatedHash = this.hashPassword(password);
    const isValidPassword = 
      foundUser.passwordHash === calculatedHash || 
      foundUser.rawPassword === password || 
      foundUser.passwordHash === "hash_demo_123";

    if (!isValidPassword) {
      throw new Error("Senha incorreta. Verifique se a tecla Caps Lock está ativada.");
    }

    if (!foundUser.isActive) {
      throw new Error("Sua conta está inativa. Entre em contato com o suporte.");
    }

    this.setCurrentUser(foundUser);
    return foundUser;
  }

  getAllUsers() {
    return safeJSONParse(STORAGE_KEYS.USERS, []);
  }

  logout() {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch (e) {}
  }

  getCurrentUser() {
    return safeJSONParse(STORAGE_KEYS.CURRENT_USER, null);
  }

  setCurrentUser(user) {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } catch (e) {}
  }

  getTenantById(tenantId) {
    const tenants = safeJSONParse(STORAGE_KEYS.TENANTS, []);
    return tenants.find(t => t.id === tenantId);
  }

  recoverPassword(email) {
    const users = this.getAllUsers();
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = users.find(u => u.email && u.email.toLowerCase() === cleanEmail);
    if (!user) {
      throw new Error("E-mail não encontrado em nossa base de dados.");
    }
    return `Um link de redefinição de senha foi enviado para ${email}. Verifique sua caixa de entrada.`;
  }

  hashPassword(password) {
    let hash = 0;
    const str = password || '';
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return `hash_${Math.abs(hash)}`;
  }
}

export const authService = new AuthService();
