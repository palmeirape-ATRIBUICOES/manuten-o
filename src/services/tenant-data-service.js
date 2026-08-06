/* ==========================================================================
   TENANT DATA SERVICE - MULTITENANT DATA ISOLATION (SERVICES, CLIENTS, EQUIPMENT, PHOTOS)
   ========================================================================== */

import { assets as demoAssets, workOrders as demoWorkOrders, pmocPlans as demoPmocPlans, partsInventory as demoParts, aiInsights as demoAiInsights, customers as demoCustomers } from '../mock-data.js';

const TENANT_DATA_PREFIX = 'saas_asset_tenant_data_';

class TenantDataService {

  getTenantData(tenantId) {
    const key = `${TENANT_DATA_PREFIX}${tenantId}`;
    const stored = localStorage.getItem(key);

    if (stored) {
      return JSON.parse(stored);
    }

    // Initial seed for demo tenant
    if (tenantId === 'tenant-alfa-001') {
      const demoClients = demoCustomers.map(c => ({
        id: c.id,
        companyId: tenantId,
        name: c.name,
        phone: c.phone,
        address: c.locations[0] ? c.locations[0].name : 'Endereço Principal',
        notes: 'Cliente em contrato mensal',
        createdAt: new Date().toISOString()
      }));

      const demoEquipment = demoAssets.map(a => ({
        id: a.id,
        companyId: tenantId,
        clientId: a.customerId,
        type: a.categoryName,
        brand: a.model.split(' ')[0],
        model: a.model,
        serialNumber: a.serialNumber,
        location: a.locationName,
        notes: a.tagName,
        createdAt: new Date().toISOString()
      }));

      const demoServicesList = demoWorkOrders.map(w => ({
        id: w.id,
        companyId: tenantId,
        serviceNumber: w.osNumber,
        clientId: w.customerId === 'Condomínio Empresarial Torre Sul' ? 'cust-002' : 'cust-001',
        clientName: w.customerName,
        clientPhone: '(81) 99887-6655',
        equipmentId: w.assetId,
        equipmentTag: w.assetTag,
        equipmentModel: 'Chiller / Gerador',
        reportedProblem: w.notes,
        status: w.status === 'FINISHED' ? 'Concluído' : w.status === 'IN_PROGRESS' ? 'Em andamento' : 'Aberto',
        responsibleUserId: 'user-001',
        responsibleUserName: w.technicianName,
        totalCost: w.totalCost,
        createdAt: w.openedAt,
        photos: [
          { id: 'p1', photoType: 'before', fileUrl: w.photos.beforeUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400', caption: 'Estado inicial', createdAt: w.openedAt },
          { id: 'p2', photoType: 'after', fileUrl: w.photos.afterUrl || 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=400', caption: 'Serviço concluído', createdAt: w.openedAt }
        ]
      }));

      const demoData = {
        assets: demoAssets,
        workOrders: demoWorkOrders,
        pmocPlans: demoPmocPlans,
        partsInventory: demoParts,
        aiInsights: demoAiInsights,
        customers: demoCustomers,
        clients: demoClients,
        equipment: demoEquipment,
        services: demoServicesList
      };
      localStorage.setItem(key, JSON.stringify(demoData));
      return demoData;
    }

    // BRAND NEW REGISTERED TENANT -> 100% CLEAN EMPTY WORKSPACE
    const cleanData = {
      assets: [],
      workOrders: [],
      pmocPlans: [],
      partsInventory: [],
      aiInsights: [],
      customers: [],
      clients: [],
      equipment: [],
      services: []
    };
    localStorage.setItem(key, JSON.stringify(cleanData));
    return cleanData;
  }

  saveTenantData(tenantId, data) {
    const key = `${TENANT_DATA_PREFIX}${tenantId}`;
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Clients CRUD
  getClients(tenantId) {
    return this.getTenantData(tenantId).clients || [];
  }

  addClient(tenantId, clientData) {
    const data = this.getTenantData(tenantId);
    if (!data.clients) data.clients = [];

    const newClient = {
      id: `client-${Date.now()}`,
      companyId: tenantId,
      name: clientData.name,
      phone: clientData.phone,
      address: clientData.address || '',
      notes: clientData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.clients.unshift(newClient);
    this.saveTenantData(tenantId, data);
    return newClient;
  }

  // Equipment CRUD
  getEquipment(tenantId, clientId = null) {
    const list = this.getTenantData(tenantId).equipment || [];
    return clientId ? list.filter(e => e.clientId === clientId) : list;
  }

  addEquipment(tenantId, equipData) {
    const data = this.getTenantData(tenantId);
    if (!data.equipment) data.equipment = [];

    const newEquip = {
      id: `equip-${Date.now()}`,
      companyId: tenantId,
      clientId: equipData.clientId,
      type: equipData.type,
      brand: equipData.brand,
      model: equipData.model,
      serialNumber: equipData.serialNumber || '',
      location: equipData.location || 'Local Principal',
      notes: equipData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.equipment.unshift(newEquip);
    this.saveTenantData(tenantId, data);
    return newEquip;
  }

  // Services CRUD (+ Novo Serviço)
  getServices(tenantId) {
    return this.getTenantData(tenantId).services || [];
  }

  getServiceById(tenantId, serviceId) {
    const services = this.getServices(tenantId);
    return services.find(s => s.id === serviceId);
  }

  createService(tenantId, servicePayload) {
    const data = this.getTenantData(tenantId);
    if (!data.services) data.services = [];

    const serviceCount = data.services.length + 1;
    const serviceNumber = `OS-${new Date().getFullYear()}-${String(serviceCount).padStart(3, '0')}`;

    const newService = {
      id: `serv-${Date.now()}`,
      companyId: tenantId,
      serviceNumber: serviceNumber,
      clientId: servicePayload.clientId,
      clientName: servicePayload.clientName,
      clientPhone: servicePayload.clientPhone,
      equipmentId: servicePayload.equipmentId,
      equipmentTag: servicePayload.equipmentTag || servicePayload.equipmentModel,
      equipmentType: servicePayload.equipmentType,
      equipmentBrand: servicePayload.equipmentBrand,
      equipmentModel: servicePayload.equipmentModel,
      reportedProblem: servicePayload.reportedProblem,
      status: "Aberto", // Aberto, Em andamento, Concluído, Cancelado
      responsibleUserId: servicePayload.responsibleUserId || "user-001",
      responsibleUserName: servicePayload.responsibleUserName || "Técnico Responsável",
      photos: servicePayload.photos || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.services.unshift(newService);

    // Also mirror into workOrders for summary KPIs
    if (!data.workOrders) data.workOrders = [];
    data.workOrders.unshift({
      id: newService.id,
      osNumber: newService.serviceNumber,
      assetTag: newService.equipmentTag,
      customerName: newService.clientName,
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      totalCost: 0
    });

    this.saveTenantData(tenantId, data);
    return newService;
  }

  updateServiceStatus(tenantId, serviceId, newStatus) {
    const data = this.getTenantData(tenantId);
    const service = (data.services || []).find(s => s.id === serviceId);
    if (service) {
      service.status = newStatus;
      service.updatedAt = new Date().toISOString();
      this.saveTenantData(tenantId, data);
    }
    return service;
  }
}

export const tenantDataService = new TenantDataService();
