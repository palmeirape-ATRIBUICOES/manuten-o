/* ==========================================================================
   PLANS CONFIGURATION - CENTRALIZED SAAS SUBSCRIPTION TIERS
   ========================================================================== */

export const SAAS_PLANS = [
  {
    id: "basic",
    name: "Básico",
    description: "Ideal para pequenos prestadores em fase inicial de estruturação.",
    priceMonthly: 89.00,
    priceYearly: 890.00,
    maxUsers: 2,
    maxCustomers: 10,
    maxAssets: 50,
    status: "ACTIVE",
    badgeClass: "badge-info",
    features: [
      "Até 2 Usuários / Técnicos",
      "Até 50 Ativos com QR Code",
      "Ordens de Serviço Preventivas e Corretivas",
      "Assinatura Digital do Cliente no Celular",
      "Checklists Personalizados por Categoria",
      "Suporte por E-mail"
    ]
  },
  {
    id: "professional",
    name: "Profissional",
    description: "Para empresas de manutenção em rápido crescimento.",
    priceMonthly: 189.00,
    priceYearly: 1890.00,
    maxUsers: 10,
    maxCustomers: 50,
    maxAssets: 300,
    status: "ACTIVE",
    popular: true,
    badgeClass: "badge-success",
    features: [
      "Tudo do Plano Básico",
      "Até 10 Usuários / Técnicos",
      "Até 300 Ativos Patrimoniais",
      "Módulo PMOC & Laudos Técnicos em PDF",
      "Auditoria por Visão Computacional / IA",
      "Matriz Preditiva de Falhas por IA",
      "Modo PWA Offline para Subsolos",
      "Suporte Prioritário por WhatsApp"
    ]
  },
  {
    id: "enterprise",
    name: "Empresa",
    description: "Para grandes operações e alta demanda de atendimentos.",
    priceMonthly: 389.00,
    priceYearly: 3890.00,
    maxUsers: 999,
    maxCustomers: 999,
    maxAssets: 9999,
    status: "ACTIVE",
    badgeClass: "badge-warning",
    features: [
      "Tudo do Plano Profissional",
      "Usuários e Técnicos Ilimitados",
      "Ativos e Clientes Ilimitados",
      "Multitenancy Avançado com RLS PostgreSQL",
      "Assistente Inteligente IA Dedicado",
      "Gestão de Almoxarifado Central & Vans",
      "Gerente de Conta Dedicado & Onboarding VIP"
    ]
  }
];

export const TRIAL_CONFIG = {
  durationDays: 30,
  defaultPlanId: "professional",
  warningThresholdsDays: {
    highlightYellow: 7,
    highlightOrange: 3,
    highlightRed: 1
  }
};
