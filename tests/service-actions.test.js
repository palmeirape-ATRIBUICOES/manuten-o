/* ==========================================================================
   TEST SUITE - 20 SCENARIOS FOR SERVICE ACTIONS, SIGNATURE & LAUDO PDF
   ========================================================================== */

import { tenantDataService } from '../src/services/tenant-data-service.js';
import { pdfGeneratorService } from '../src/services/pdf-generator-service.js';

function runServiceActionsTests() {
  console.log("==================================================");
  console.log("TESTE AUTOMATIZADO - 20 CENÁRIOS DAS AÇÕES DO SERVIÇO");
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

    // Setup base service
    const service = tenantDataService.createService(testCompanyId, {
      clientId: "cust-test-01",
      clientName: "Cliente Teste 20 Cenários",
      clientPhone: "(81) 99999-8888",
      equipmentId: "equip-test-01",
      equipmentBrand: "Carrier",
      equipmentModel: "Split 18000",
      reportedProblem: "Não está refrigerando adequadamente."
    });

    // Cenário 1: Foto antes do serviço
    const photoBefore = tenantDataService.addServicePhoto(testCompanyId, service.id, {
      photoType: "before",
      fileUrl: "http://img.com/before.jpg",
      caption: "Foto inicial"
    });
    assert(photoBefore && photoBefore.photoType === "before", "1. Adicionar foto antes do serviço.");

    // Cenário 2: Fotos durante o serviço
    const photoDuring = tenantDataService.addServicePhoto(testCompanyId, service.id, {
      photoType: "during",
      fileUrl: "http://img.com/during.jpg",
      caption: "Higienização interna"
    });
    assert(photoDuring && photoDuring.photoType === "during", "2. Adicionar várias fotos durante o serviço.");

    // Cenário 3: Fotos depois da criação
    const photoAfter = tenantDataService.addServicePhoto(testCompanyId, service.id, {
      photoType: "after",
      fileUrl: "http://img.com/after.jpg",
      caption: "Equipamento limpo"
    });
    assert(photoAfter && photoAfter.photoType === "after", "3. Adicionar fotos após a criação do serviço.");

    // Cenário 4: Apontamento técnico
    const note = tenantDataService.addServiceNote(testCompanyId, service.id, {
      description: "Higienização completa dos serpentinas e filtros",
      diagnosis: "Acúmulo de poeira",
      solution: "Lavagem química",
      recommendations: "Trocar filtro em 90 dias"
    });
    assert(note && note.description.includes("Higienização"), "4. Registrar um apontamento técnico.");

    // Cenário 5: Apontamento extra
    const note2 = tenantDataService.addServiceNote(testCompanyId, service.id, {
      description: "Reaperto das conexões elétricas e verificação de carga de gás"
    });
    assert(note2 && note2.id !== note.id, "5. Registrar múltiplos apontamentos no mesmo serviço.");

    // Cenário 6: Adicionar uma peça
    const part1 = tenantDataService.addServicePart(testCompanyId, service.id, {
      name: "Filtro de Ar G4",
      quantity: 1,
      unit: "unidade",
      unitPrice: 50.00
    });
    assert(part1 && part1.totalPrice === 50.00, "6. Adicionar uma peça utilizada.");

    // Cenário 7: Adicionar várias peças
    const part2 = tenantDataService.addServicePart(testCompanyId, service.id, {
      name: "Gás Refrigerante R410A",
      quantity: 2,
      unit: "quilo",
      unitPrice: 120.00
    });
    assert(part2 && part2.totalPrice === 240.00, "7. Adicionar várias peças.");

    // Cenário 8: Calcular valor total de peças
    const updatedService1 = tenantDataService.getServiceById(testCompanyId, service.id);
    assert(updatedService1.partsCost === 290.00, "8. Calcular o valor total de materiais (50 + 240 = 290).");

    // Cenário 9: Alterar status para Em andamento
    const updatedStatus1 = tenantDataService.updateServiceStatus(testCompanyId, service.id, "Em andamento", "Técnico no local");
    assert(updatedStatus1.status === "Em andamento", "9. Alterar o status do serviço.");

    // Cenário 10: Registrar histórico da alteração
    assert(updatedStatus1.statusHistory.length >= 2, "10. Registrar o histórico da alteração (Linha do Tempo).");

    // Cenário 11: Finalizar com assinatura
    const finalized = tenantDataService.finalizeService(testCompanyId, service.id, {
      technicalConclusion: "Manutenção concluída com sucesso.",
      laborCost: 150.00,
      discount: 10.00,
      clientSignatoryName: "João Cliente",
      signatureBase64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    });
    assert(finalized.status === "Concluído" && finalized.finalization.signatureBase64 !== null, "11. Finalizar com assinatura em tela.");

    // Cenário 12: Valor Total Calculado (150 Mão de Obra + 290 Peças - 10 Desconto = 430)
    assert(finalized.totalCost === 430.00, "12. Cálculo automático do valor total final.");

    // Cenário 13: Gerar Laudo HTML/PDF
    const htmlReport = pdfGeneratorService.generateServiceReportHTML(testCompanyId, service.id);
    assert(htmlReport.includes("LAUDO TÉCNICO OFICIAL") && htmlReport.includes("R$ 430.00"), "13. Gerar o laudo final em PDF.");

    // Cenário 14: Visualizar Laudo
    assert(htmlReport.length > 500, "14. Layout do laudo formatado para visualização.");

    // Cenário 15: Linha do Tempo Cronológica Completa
    const timeline = tenantDataService.getServiceTimeline(testCompanyId, service.id);
    assert(timeline.length >= 6, "15. Exibir corretamente o histórico completo (Linha do Tempo).");

    // Cenário 16: Isolamento por Empresa (Multitenant)
    const otherCompanyServices = tenantDataService.getServices(`company_other_${Date.now()}`);
    assert(otherCompanyServices.length === 0, "16. Impedir acesso a serviço de outra empresa.");

    // Cenário 17: Persistência no Banco (localStorage)
    const reloadedService = tenantDataService.getServiceById(testCompanyId, service.id);
    assert(reloadedService.notesList.length === 2 && reloadedService.partsList.length === 2, "17. Manter todos os dados salvos após recarregar.");

    // Cenário 18: Finalização sem Assinatura com Justificativa
    const service2 = tenantDataService.createService(testCompanyId, {
      clientId: "cust-test-02",
      clientName: "Cliente Ausente",
      clientPhone: "(81) 97777-6666",
      equipmentId: "equip-test-02",
      equipmentBrand: "Brastemp",
      equipmentModel: "Geladeira Duplex",
      reportedProblem: "Vazamento"
    });
    tenantDataService.addServiceNote(testCompanyId, service2.id, { description: "Troca de borracha" });
    const fin2 = tenantDataService.finalizeService(testCompanyId, service2.id, {
      technicalConclusion: "Troca efetuada",
      noSignatureReason: "Cliente viajou e deixou chave com porteiro"
    });
    assert(fin2.finalization.noSignatureReason.includes("Cliente viajou"), "18. Finalizar sem assinatura informando justificativa.");

    // Cenário 19: Fotos categorizadas no serviço 2
    assert(fin2.status === "Concluído", "19. Alteração de status para Concluído pós-finalização.");

    // Cenário 20: Registro do usuário responsável
    assert(fin2.finalization.finalizedBy !== undefined, "20. Registro do usuário responsável e timestamp de finalização.");

  } catch (err) {
    console.error("Erro nos testes de ações do serviço:", err);
  }

  console.log("==================================================");
  console.log(`RESULTADO: ${passed} PASSOU | ${failed} FALHOU`);
  console.log("==================================================");
}

runServiceActionsTests();
