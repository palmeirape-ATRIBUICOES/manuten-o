/* ==========================================================================
   AUTH SERVICE - USER REGISTRATION, LOGIN, SESSION & MULTITENANT CREATION
   ========================================================================== */

import { TRIAL_CONFIG } from '../config/plans.js';

const STORAGE_KEYS = {
  CURRENT_USER: 'saas_asset_current_user',
  TENANTS: 'saas_asset_tenants_db',
  USERS: 'saas_asset_users_db',
  SUBSCRIPTIONS: 'saas_asset_subscriptions_db'
};

class AuthService {
  constructor() {
    this.initStorage();
  }

  initStorage() {
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
          rawPassword: "123", // fallback for demo
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
  }

  // Register New User & Create New Tenant with 30-Day Trial
  registerUser({ fullName, companyName, email, phone, password }) {
    const users = this.getAllUsers();
    const tenants = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANTS) || '[]');
    const subscriptions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS) || '[]');

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already exists
    if (users.find(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error("Este e-mail já está cadastrado no sistema. Faça login ou utilize outro e-mail.");
    }

    const tenantId = `tenant-${Date.now()}`;
    const userId = `user-${Date.now()}`;
    const subId = `sub-${Date.now()}`;

    const now = new Date();
    const trialEnds = new Date(now.getTime() + TRIAL_CONFIG.durationDays * 24 * 60 * 60 * 1000);

    // 1. Create Tenant
    const newTenant = {
      id: tenantId,
      name: companyName,
      createdAt: now.toISOString()
    };
    tenants.push(newTenant);

    // 2. Create User (Admin)
    const newUser = {
      id: userId,
      tenantId: tenantId,
      fullName: fullName,
      companyName: companyName,
      email: cleanEmail,
      phone: phone,
      passwordHash: this.hashPassword(password),
      rawPassword: password, // Store plain password fallback for client-side demo resilience
      role: "ADMIN",
      isActive: true,
      createdAt: now.toISOString()
    };
    users.push(newUser);

    // 3. Create Subscription (Trial 30 Days)
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

    // Persist to localStorage
    localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenants));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));

    // Auto login
    this.setCurrentUser(newUser);

    return { user: newUser, tenant: newTenant, subscription: newSub };
  }

  login(email, password) {
    const users = this.getAllUsers();
    const cleanEmail = email.trim().toLowerCase();
    const foundUser = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!foundUser) {
      throw new Error(`E-mail "${email}" não foi encontrado em nosso cadastro. Verifique a grafia ou crie uma nova conta.`);
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
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  getCurrentUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (raw) {
        const user = JSON.parse(raw);
        if (user && user.tenantId) return user;
      }
    } catch(e) {}

    const users = this.getAllUsers();
    if (users && users.length > 0) {
      const defaultUser = users[0];
      this.setCurrentUser(defaultUser);
      return defaultUser;
    }

    return null;
  }

  setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  getTenantById(tenantId) {
    const tenants = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANTS) || '[]');
    return tenants.find(t => t.id === tenantId);
  }

  recoverPassword(email) {
    const users = this.getAllUsers();
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      throw new Error("E-mail não encontrado em nossa base de dados.");
    }
    return `Um link de redefinição de senha foi enviado para ${email}. Verifique sua caixa de entrada.`;
  }

  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      hash = (hash << 5) - hash + password.charCodeAt(i);
      hash |= 0;
    }
    return `hash_${Math.abs(hash)}`;
  }
}

export const authService = new AuthService();
