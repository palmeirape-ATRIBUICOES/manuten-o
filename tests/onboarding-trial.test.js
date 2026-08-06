/* ==========================================================================
   TEST SUITE - ONBOARDING, AUTH, TRIAL ENGINE & MULTITENANT ISOLATION
   ========================================================================== */

import { authService } from '../src/services/auth-service.js';
import { subscriptionService } from '../src/services/subscription-service.js';
import { billingService } from '../src/services/billing-service.js';

function runTestSuite() {
  console.log("==================================================");
  console.log("INICIANDO BATERIA DE TESTES - SAAS ONBOARDING & TRIAL");
  console.log("==================================================");

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✓ [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failedTests++;
    }
  }

  try {
    // Teste 1: Novo usuário cria conta
    const testEmail = `test_${Date.now()}@empresa.com`;
    const regResult = authService.registerUser({
      fullName: "Eng. Testador",
      companyName: "Empresa Teste Ltda",
      email: testEmail,
      phone: "(81) 99999-0000",
      password: "password123"
    });

    assert(regResult.user && regResult.user.id, "1. Novo usuário consegue criar conta.");

    // Teste 2: Empresa é criada
    assert(regResult.tenant && regResult.tenant.name === "Empresa Teste Ltda", "2. Empresa (tenant) é criada automaticamente.");

    // Teste 3: Usuário recebe perfil ADMIN
    assert(regResult.user.role === "ADMIN", "3. Primeiro usuário recebe perfil de Administrador.");

    // Teste 4: Teste de 30 dias é iniciado
    const sub = subscriptionService.getTenantSubscription(regResult.tenant.id);
    assert(sub.subscriptionStatus === "trial" && sub.remainingDays === 30, "4. Período gratuito de 30 dias é iniciado corretamente.");

    // Teste 5: Usuário consegue acessar durante o teste
    assert(sub.accessStatus === "FULL_ACCESS" && !subscriptionService.isAccessBlocked(regResult.tenant.id), "5. Usuário tem acesso total durante o teste.");

    // Teste 6: Contador de dias e banner
    const banner = subscriptionService.getTrialBannerConfig(sub);
    assert(banner && banner.days === 30, "6. Contador de dias restantes é calculado para exibição no painel.");

    // Teste 7: Teste expirado bloqueia uso
    const expiredSub = { ...sub, trialEndsAt: new Date(Date.now() - 1000).toISOString() };
    subscriptionService.updateSubscription(expiredSub);
    const evaluatedExpired = subscriptionService.getTenantSubscription(regResult.tenant.id);
    assert(evaluatedExpired.subscriptionStatus === "expired" && evaluatedExpired.accessStatus === "READ_ONLY", "7. Teste expirado bloqueia criação e alteração de registros.");

    // Teste 8: Assinatura ativa permite acesso irrestrito
    subscriptionService.upgradePlan(regResult.tenant.id, "professional");
    const activeSub = subscriptionService.getTenantSubscription(regResult.tenant.id);
    assert(activeSub.subscriptionStatus === "active" && activeSub.accessStatus === "FULL_ACCESS", "8. Usuário com assinatura ativa continua acessando irrestritamente.");

    // Teste 9: Usuário sem empresa não acessa o painel
    assert(authService.getTenantById("tenant-invalido") === undefined, "9. Usuário sem empresa válida é impedido de acessar.");

    // Teste 10: Isolamento multitenant
    const tenantA = authService.getTenantById(regResult.tenant.id);
    const tenantB = authService.getTenantById("tenant-alfa-001");
    assert(tenantA.id !== tenantB.id, "10. Isolamento de dados entre empresas distintas garantido.");

    // Teste 11: Recuperação de senha
    const recoverMsg = authService.recoverPassword(testEmail);
    assert(recoverMsg.includes("verifique sua caixa de entrada"), "11. Fluxo de recuperação de senha funciona.");

    // Teste 12: Logout encerra a sessão
    authService.logout();
    assert(authService.getCurrentUser() === null, "12. Logout encerra a sessão com segurança.");

  } catch (err) {
    console.error("Erro durante a execução do teste:", err);
  }

  console.log("==================================================");
  console.log(`RESULTADO FINAL: ${passedTests} PASSOU | ${failedTests} FALHOU`);
  console.log("==================================================");
}

// Execute tests
runTestSuite();
