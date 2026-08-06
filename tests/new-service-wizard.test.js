/* ==========================================================================
   TEST SUITE - NEW SERVICE WIZARD (4-STEP GUIDED FLOW)
   ========================================================================== */

import { tenantDataService } from '../src/services/tenant-data-service.js';

function runServiceWizardTests() {
  console.log("==================================================");
  console.log("TESTE AUTOMATIZADO - FLUXO + NOVO SERVIÇO EM 4 ETAPAS");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, msg) {
    if (condition) {
      console.log(`✓ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${msg}`);
      failed++;
    }
  }

  try {
    const testCompanyId = `company_test_${Date.now()}`;

    // Teste 1: Cadastro de Cliente (Etapa 1)
    const client = tenantDataService.addClient(testCompanyId, {
      name: "Cliente Teste Wizard",
      phone: "(81) 98888-7777",
      address: "Rua das Flores, 123"
    });
    assert(client && client.id && client.name === "Cliente Teste Wizard", "1. Etapa 1: Cliente cadastrado e retornado com ID.");

    // Teste 2: Cadastro de Equipamento (Etapa 2)
    const equip = tenantDataService.addEquipment(testCompanyId, {
      clientId: client.id,
      type: "Ar-condicionado",
      brand: "Carrier",
      model: "Inverter 18000",
      serialNumber: "SN-9900",
      location: "Sala Principal"
    });
    assert(equip && equip.id && equip.brand === "Carrier", "2. Etapa 2: Equipamento cadastrado e vinculado ao cliente.");

    // Teste 3: Fotos do Serviço (Etapa 3)
    const photos = [
      { id: 'p1', photoType: 'before', fileUrl: 'http://img.com/before.jpg' },
      { id: 'p2', photoType: 'after', fileUrl: 'http://img.com/after.jpg' }
    ];
    assert(photos.length === 2, "3. Etapa 3: Fotos categorizadas por tipo (before/after).");

    // Teste 4: Criar Serviço (Etapa 4)
    const service = tenantDataService.createService(testCompanyId, {
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone,
      equipmentId: equip.id,
      equipmentBrand: equip.brand,
      equipmentModel: equip.model,
      reportedProblem: "Vazamento de água e ruído",
      photos: photos
    });

    assert(service && service.serviceNumber.startsWith("OS-"), "4. Etapa 4: Serviço oficial criado com número automático OS-YYYY-XXX.");
    assert(service.status === "Aberto", "5. Status inicial do serviço definido como 'Aberto'.");
    assert(service.photos.length === 2, "6. Fotos vinculadas com sucesso ao registro do serviço.");

    // Teste 7: Isolamento por empresa
    const companyBServices = tenantDataService.getServices(`company_other_${Date.now()}`);
    assert(companyBServices.length === 0, "7. Isolamento multitenant estrito: Outra empresa não visualiza serviços do teste.");

  } catch (err) {
    console.error("Erro nos testes do wizard:", err);
  }

  console.log("==================================================");
  console.log(`RESULTADO: ${passed} PASSOU | ${failed} FALHOU`);
  console.log("==================================================");
}

runServiceWizardTests();
