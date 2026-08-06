/* ==========================================================================
   MOCK DATA - SAAS ASSET MANAGEMENT (OPTION 3: PWA OFFLINE SYNC INCLUDED)
   ========================================================================== */

export const currentTenant = {
  id: "tenant-alfa-001",
  name: "Alfa Climatização & Soluções Industriais",
  cnpj: "12.345.678/0001-90",
  plan: "Professional",
  activeUsers: 8,
  defaultLaborRatePerHour: 120.00,
  technicalResponsibilityART: "CREA-PE 048912/D - Eng. Marcos Vinícius"
};

export const offlineSyncQueue = [
  {
    id: "sync-001",
    action: "WORK_ORDER_COMPLETE",
    workOrderId: "wo-1088",
    osNumber: "OS-2026-1088",
    assetTag: "CHILLER-CARRIER-01",
    timestamp: "2026-08-06T00:15:00",
    status: "PENDING_SYNC", // PENDING_SYNC, SYNCED
    details: "Checklist concluído em subsolo 2 sem conectividade. Fotos e assinatura capturadas."
  }
];

export const pmocPlans = [
  {
    id: "pmoc-001",
    assetId: "asset-002",
    assetTag: "CHILLER-CARRIER-01",
    customerName: "Condomínio Empresarial Torre Sul",
    locationName: "Cobertura - Central de Ar",
    frequency: "MENSAL",
    lastInspectionDate: "2026-07-15",
    nextInspectionDate: "2026-08-15",
    status: "SCHEDULED",
    compliancePercent: 96,
    responsibleEngineer: "Eng. Marcos Vinícius (CREA-PE 048912)",
    routineChecklist: [
      "Limpeza e higienização dos serpetinas e bandeja de condensado",
      "Medição do superaquecimento e subresfriamento do fluido refrigerante",
      "Verificação de reaperto das conexões elétricas de potência",
      "Análise microbiológica do ar (Portaria MS 3.523/98)"
    ]
  },
  {
    id: "pmoc-002",
    assetId: "asset-001",
    assetTag: "GER-500KVA-01",
    customerName: "Hospital Central São Lucas",
    locationName: "Subsolo 2 - Casa de Máquinas",
    frequency: "SEMESTRAL",
    lastInspectionDate: "2025-06-15",
    nextInspectionDate: "2025-12-15",
    status: "COMPLETED",
    compliancePercent: 100,
    responsibleEngineer: "Eng. Marcos Vinícius (CREA-PE 048912)",
    routineChecklist: [
      "Troca de óleo lubrificante de motor e elemento filtrante",
      "Teste de carga com acionamento automático da QTA",
      "Checagem do nível de eletrólito do banco de baterias"
    ]
  }
];

export const aiInsights = [
  {
    id: "insight-001",
    assetId: "asset-002",
    assetTag: "CHILLER-CARRIER-01",
    customerName: "Condomínio Empresarial Torre Sul",
    riskScore: 88,
    riskLevel: "CRITICAL",
    predictedFailureDate: "2026-08-25",
    predictedComponent: "Compressor 1 - Rolamento Principal",
    recommendation: "Recomendada intervenção preventiva em até 15 dias. Substituir rolamento NSK 6205-2RS antes de quebra catastrófica.",
    financialSavingsIfPrevented: 4500.00
  }
];

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
  }
];

export const assetCategories = [
  { id: "cat-hvac", name: "HVAC & Climatização", code: "HVAC", icon: "wind" },
  { id: "cat-gen", name: "Geradores & Energia", code: "GEN", icon: "zap" },
  { id: "cat-fleet", name: "Empilhadeiras & Frota", code: "FLEET", icon: "truck" }
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
      { id: "loc-003", name: "Cobertura - Central de Ar" }
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
    healthIndexScore: 96,
    installationDate: "2024-03-10",
    totalMaintenanceCost: 1450.00,
    history: [
      { date: "2024-03-10", type: "INSTALLATION", text: "Instalação e Start-up técnico efetuados." }
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
    healthIndexScore: 42,
    installationDate: "2023-08-20",
    totalMaintenanceCost: 2850.00,
    history: [
      { date: "2023-08-20", type: "INSTALLATION", text: "Instalação da central de água gelada." }
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
    laborCost: 420.00,
    partsCost: 750.00,
    totalCost: 1170.00,
    notes: "Alarme de baixa pressão de óleo acionado no compressor 1.",
    checklists: [
      { id: "c1", label: "Inspeção visual de vazamentos de fluido refrigerante", isChecked: true, obs: "Sem vazamentos" }
    ],
    photos: { beforeUrl: "", afterUrl: "" },
    clientSignature: null
  }
];
