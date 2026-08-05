/* ==========================================================================
   MOCK DATA - SAAS ASSET MANAGEMENT (SPRINT 2 INCLUDED)
   ========================================================================== */

export const currentTenant = {
  id: "tenant-alfa-001",
  name: "Alfa Climatização & Soluções Industriais",
  cnpj: "12.345.678/0001-90",
  plan: "Professional",
  activeUsers: 8,
  defaultLaborRatePerHour: 120.00 // R$/hora
};

export const partsInventory = [
  {
    id: "part-001",
    sku: "PECA-FIL-01",
    name: "Filtro de Óleo Lubrificante Cummins 500kVA",
    category: "Filtros",
    unitCost: 145.00,
    unitPrice: 220.00,
    stockQuantity: 14,
    minStockQuantity: 5,
    location: "Almoxarifado Central - Prateleira A2",
    warrantyMonths: 6
  },
  {
    id: "part-002",
    sku: "PECA-OLEO-15W40",
    name: "Óleo Lubrificante Mineral 15W40 (Litro)",
    category: "Insumos",
    unitCost: 28.00,
    unitPrice: 45.00,
    stockQuantity: 120,
    minStockQuantity: 30,
    location: "Almoxarifado Central - Tambor 01",
    warrantyMonths: 0
  },
  {
    id: "part-003",
    sku: "PECA-CAR-COMP-01",
    name: "Válvula Solenóide de Expansão Carrier",
    category: "Componentes HVAC",
    unitCost: 480.00,
    unitPrice: 750.00,
    stockQuantity: 3,
    minStockQuantity: 2,
    location: "Van 04 (Técnico Carlos)",
    warrantyMonths: 12
  },
  {
    id: "part-004",
    sku: "PECA-GAS-R134A",
    name: "Gás Refrigerante Ecológico R-134a (Kg)",
    category: "Insumos",
    unitCost: 65.00,
    unitPrice: 110.00,
    stockQuantity: 45,
    minStockQuantity: 15,
    location: "Almoxarifado Central - Cilindros",
    warrantyMonths: 0
  },
  {
    id: "part-005",
    sku: "PECA-ROL-6205",
    name: "Rolamento Blindado 6205-2RS NSK",
    category: "Rolamentos",
    unitCost: 35.00,
    unitPrice: 65.00,
    stockQuantity: 18,
    minStockQuantity: 6,
    location: "Van 04 (Técnico Carlos)",
    warrantyMonths: 6
  }
];

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
    contractValueMonthly: 4500.00,
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
    contractValueMonthly: 3800.00,
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
    status: "INSTALLED",
    criticality: "CRITICAL",
    installationDate: "2024-03-10",
    warrantyExpiry: "2027-03-10",
    totalMaintenanceCost: 1450.00,
    attributes: {
      potenciaKva: 500,
      tensaoVolts: 380,
      combustivel: "Diesel S10",
      horimetroAtual: 1420
    },
    installedPartsHistory: [
      {
        partId: "part-001",
        partName: "Filtro de Óleo Lubrificante Cummins",
        installedAt: "2025-06-15",
        warrantyExpiresAt: "2025-12-15",
        workOrderId: "wo-1042"
      }
    ],
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
    totalMaintenanceCost: 2850.00,
    attributes: {
      capacidadeTr: 100,
      refrigerante: "R-134a",
      compressores: 2
    },
    installedPartsHistory: [
      {
        partId: "part-003",
        partName: "Válvula Solenóide de Expansão Carrier",
        installedAt: "2026-01-10",
        warrantyExpiresAt: "2027-01-10",
        workOrderId: "wo-0992"
      }
    ],
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
    totalMaintenanceCost: 350.00,
    attributes: {
      capacidadeCargaKg: 2500,
      combustivel: "GLP",
      horimetroAtual: 850
    },
    installedPartsHistory: [],
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
    type: "CORRECTIVE",
    priority: "HIGH",
    status: "IN_PROGRESS",
    technicianName: "Carlos Eduardo (Técnico de Campo)",
    openedAt: "2026-08-04T14:30:00",
    laborHours: 3.5,
    laborCost: 420.00, // 3.5 hrs * R$ 120,00
    partsCost: 750.00,
    totalCost: 1170.00,
    isWarrantyService: false,
    usedParts: [
      { partId: "part-003", partName: "Válvula Solenóide de Expansão Carrier", qty: 1, unitPrice: 750.00, isUnderWarranty: false }
    ],
    notes: "Alarme de baixa pressão de óleo acionado no compressor 1.",
    checklists: [
      { id: "c1", label: "Inspeção visual de vazamentos de fluido refrigerante", isChecked: true, obs: "Sem vazamentos aparentes" },
      { id: "c2", label: "Medição de tensão elétrica de alimentação (R-S-T)", isChecked: true, obs: "380V estável" },
      { id: "c3", label: "Substituição da válvula de expansão", isChecked: true, obs: "Substituída peça usada PECA-CAR-COMP-01" },
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
    laborHours: 3.0,
    laborCost: 360.00,
    partsCost: 310.00,
    totalCost: 670.00,
    isWarrantyService: false,
    usedParts: [
      { partId: "part-001", partName: "Filtro de Óleo Lubrificante Cummins", qty: 1, unitPrice: 220.00, isUnderWarranty: false },
      { partId: "part-002", partName: "Óleo Lubrificante 15W40 (Litro)", qty: 2, unitPrice: 45.00, isUnderWarranty: false }
    ],
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
