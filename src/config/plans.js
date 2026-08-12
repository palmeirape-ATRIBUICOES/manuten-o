/* ==========================================================================
   PLANS CONFIGURATION - SAAS SUBSCRIPTION TIERS (STARTER, PRO, BUSINESS)
   ========================================================================== */

export const SAAS_PLANS = [
  {
    id: "starter",
    name: "Starter",
    description: "Para pequenos prestadores e autônomos.",
    priceMonthly: 19.00,
    priceCurrency: "US$",
    maxUsers: 1,
    status: "ACTIVE",
    badgeClass: "badge-info",
    features: [
      "1 Usuário / Técnico",
      "Clientes e Equipamentos",
      "Ordens de Serviço",
      "Galeria de Fotos (Antes / Depois)"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    description: "Para empresas de manutenção em crescimento.",
    priceMonthly: 39.00,
    priceCurrency: "US$",
    maxUsers: 3,
    status: "ACTIVE",
    popular: true,
    badgeClass: "badge-success",
    features: [
      "3 Usuários / Técnicos",
      "Tudo do Plano Starter",
      "Leitor de QR Code & Histórico",
      "Orçamentos & Invoices",
      "Assinatura Digital & Lembretes de Vencimento"
    ]
  },
  {
    id: "business",
    name: "Business",
    description: "Para grandes operações e equipes de manutenção.",
    priceMonthly: 79.00,
    priceCurrency: "US$",
    maxUsers: 10,
    status: "ACTIVE",
    badgeClass: "badge-warning",
    features: [
      "10 Usuários / Técnicos",
      "Tudo do Plano Pro",
      "Automações & Inteligência Artificial",
      "Relatórios Financeiros Avançados",
      "Personalização Completa com Marca/Logotipo"
    ]
  }
];

export const TRIAL_CONFIG = {
  durationDays: 30,
  defaultPlanId: "pro",
  warningThresholdsDays: {
    highlightYellow: 7,
    highlightOrange: 3,
    highlightRed: 1
  }
};
