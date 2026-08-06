/* ==========================================================================
   TENANT DATA SERVICE - STRICT MULTITENANT DATA ISOLATION & CLEAN INITIAL STATE
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

    // Demo tenant gets initial sample data
    if (tenantId === 'tenant-alfa-001') {
      const demoData = {
        assets: demoAssets,
        workOrders: demoWorkOrders,
        pmocPlans: demoPmocPlans,
        partsInventory: demoParts,
        aiInsights: demoAiInsights,
        customers: demoCustomers
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
      customers: []
    };
    localStorage.setItem(key, JSON.stringify(cleanData));
    return cleanData;
  }

  saveTenantData(tenantId, data) {
    const key = `${TENANT_DATA_PREFIX}${tenantId}`;
    localStorage.setItem(key, JSON.stringify(data));
  }

  addAsset(tenantId, asset) {
    const data = this.getTenantData(tenantId);
    data.assets.unshift(asset);
    this.saveTenantData(tenantId, data);
    return asset;
  }

  addWorkOrder(tenantId, wo) {
    const data = this.getTenantData(tenantId);
    data.workOrders.unshift(wo);
    this.saveTenantData(tenantId, data);
    return wo;
  }

  addPart(tenantId, part) {
    const data = this.getTenantData(tenantId);
    data.partsInventory.unshift(part);
    this.saveTenantData(tenantId, data);
    return part;
  }

  addPMOCPlan(tenantId, plan) {
    const data = this.getTenantData(tenantId);
    data.pmocPlans.unshift(plan);
    this.saveTenantData(tenantId, data);
    return plan;
  }

  addCustomer(tenantId, customer) {
    const data = this.getTenantData(tenantId);
    data.customers.unshift(customer);
    this.saveTenantData(tenantId, data);
    return customer;
  }
}

export const tenantDataService = new TenantDataService();
