/* ==========================================================================
   MOCK DATA - SAAS ASSET MANAGEMENT
   ========================================================================== */

export const currentTenant = {
  id: "tenant-alfa-001",
  name: "Alfa Climatização & Soluções Industriais",
  cnpj: "12.345.678/0001-90",
  plan: "Professional",
  activeUsers: 8
};

export const assetCategories = [
  { id: "cat-hvac", name: "HVAC & Climatização", code: "HVAC", icon: "wind" },
  { id: "cat-gen", name: "Geradores & Energia", code: "GEN", icon: "zap" },
  { id: "cat-fleet", name: "Empilhadeiras & Frota", code: "FLEET", icon: "truck" },
  { id: "cat-solar", name: "Sistemas Solares Fotovoltaicos", code: "SOLAR", icon: "sun" },
  { id: "cat-pump", name: "Bombas & Motores", code: "PUMP", icon: "activity" }
];

export const customers = [
  {
    id: "cust-001",
    name: "Hospital Central São Lucas",
    document: "44.111.222/0001-33",
    contactName: "Dr. Roberto Silva",
    phone: "(81) 99887-6655",
    locations: [
      { id: "loc-001", name: "Subsolo 2 - Casa de Máquinas" },
      { id: "loc-002", name: "Bloco B - Centro Cirúrgico" }
    ]
  },
  {
    id: "cust-002",
    name: "Condomínio Empresarial Torre Sul",
    document: "33.555.666/0001-22",
    contactName: "Eng. Amanda Costa",
    phone: "(81) 98765-4321",
    locations: [
      { id: "loc-003", name: "Cobertura - Central de Ar" },
      { id: "loc-004", name: "Estacionamento G1" }
    ]
  }
];

export const assets = [
  {
    id: "asset-001",
    tagName: "GER-500KVA-01",
    qrCodeHash: "QR-GER-ALFA-9081",
    categoryId: "cat-gen",
    categoryName: "Geradores & Energia",
    customerId: "cust-001",
    customerName: "Hospital Central São Lucas",
    locationName: "Subsolo 2 - Casa de Máquinas",
    model: "STEMAC Cummins C500 D6",
    serialNumber: "SN-CUM-2024-9912",
    status: "INSTALLED", // INSTALLED, MAINTENANCE, DECOMMISSIONED
    criticality: "CRITICAL",
    installationDate: "2024-03-10",
    warrantyExpiry: "2027-03-10",
    attributes: {
      potenciaKva: 500,
      tensaoVolts: 380,
      combustivel: "Diesel S10",
      horimetroAtual: 1420
    },
    history: [
      { date: "2024-03-10", type: "INSTALLATION", text: "Instalação e Start-up técnico com testes de carga efetuados." },
      { date: "2025-06-15", type: "PREVENTIVE", text: "Troca de filtros de óleo e combustível efetuada na OS-1042." }
    ]
  },
  {
    id: "asset-002",
    tagName: "CHILLER-CARRIER-01",
    qrCodeHash: "QR-CHIL-ALFA-4412",
    categoryId: "cat-hvac",
    categoryName: "HVAC & Climatização",
    customerId: "cust-002",
    customerName: "Condomínio Empresarial Torre Sul",
    locationName: "Cobertura - Central de Ar",
    model: "Carrier 30XW AquaForce 100TR",
    serialNumber: "SN-CAR-882211",
    status: "MAINTENANCE",
    criticality: "HIGH",
    installationDate: "2023-08-20",
    warrantyExpiry: "2026-08-20",
    attributes: {
      capacidadeTr: 100,
      refrigerante: "R-134a",
      compressores: 2
    },
    history: [
      { date: "2023-08-20", type: "INSTALLATION", text: "Instalação da central de água gelada." },
      { date: "2026-08-01", type: "CORRECTIVE", text: "Alarme de baixa pressão de óleo ativado. OS-1088 aberta." }
    ]
  },
  {
    id: "asset-003",
    tagName: "EMPILHADEIRA-HYSTER-02",
    qrCodeHash: "QR-EMP-ALFA-7731",
    categoryId: "cat-fleet",
    categoryName: "Empilhadeiras & Frota",
    customerId: "cust-001",
    customerName: "Hospital Central São Lucas",
    locationName: "Subsolo 2 - Casa de Máquinas",
    model: "Hyster H50FT 2.5T",
    serialNumber: "SN-HYS-773344",
    status: "INSTALLED",
    criticality: "MEDIUM",
    installationDate: "2024-11-05",
    warrantyExpiry: "2026-11-05",
    attributes: {
      capacidadeCargaKg: 2500,
      combustivel: "GLP",
      horimetroAtual: 850
    },
    history: [
      { date: "2024-11-05", type: "INSTALLATION", text: "Entrada em operação na logística interna." }
    ]
  }
];

export const workOrders = [
  {
    id: "wo-1088",
    osNumber: "OS-2026-1088",
    assetId: "asset-002",
    assetTag: "CHILLER-CARRIER-01",
    customerName: "Condomínio Empresarial Torre Sul",
    type: "CORRECTIVE", // CORRECTIVE, PREVENTIVE, INSPECTION
    priority: "HIGH",
    status: "IN_PROGRESS", // OPEN, IN_PROGRESS, FINISHED
    technicianName: "Carlos Eduardo (Técnico de Campo)",
    openedAt: "2026-08-04T14:30:00",
    notes: "Alarme de baixa pressão de óleo acionado no compressor 1.",
    checklists: [
      { id: "c1", label: "Inspeção visual de vazamentos de fluido refrigerante", isChecked: true, obs: "Sem vazamentos aparentes" },
      { id: "c2", label: "Medição de tensão elétrica de alimentação (R-S-T)", isChecked: true, obs: "380V estável" },
      { id: "c3", label: "Substituição do elemento filtrante de óleo", isChecked: false, obs: "" },
      { id: "c4", label: "Teste de estanqueidade e start de compressores", isChecked: false, obs: "" }
    ],
    photos: {
      beforeUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60",
      afterUrl: ""
    },
    clientSignature: null
  },
  {
    id: "wo-1042",
    osNumber: "OS-2025-1042",
    assetId: "asset-001",
    assetTag: "GER-500KVA-01",
    customerName: "Hospital Central São Lucas",
    type: "PREVENTIVE",
    priority: "CRITICAL",
    status: "FINISHED",
    technicianName: "Carlos Eduardo (Técnico de Campo)",
    openedAt: "2025-06-15T08:00:00",
    finishedAt: "2025-06-15T11:30:00",
    notes: "Preventiva semestral realizada com sucesso conforme PMOC.",
    checklists: [
      { id: "c10", label: "Troca de óleo lubrificante de motor", isChecked: true, obs: "Óleo 15W40 renovado" },
      { id: "c11", label: "Teste automático de transferência de carga da QTA", isChecked: true, obs: "QTA acionou em 4 segundos" }
    ],
    photos: {
      beforeUrl: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=60",
      afterUrl: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=500&auto=format&fit=crop&q=60"
    },
    clientSignature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }
];
