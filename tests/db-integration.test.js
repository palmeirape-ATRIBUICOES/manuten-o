/* ==========================================================================
   TEST SUITE - SUPABASE POSTGRESQL CLOUD DATABASE ADAPTER & DUAL PERSISTENCE
   ========================================================================== */

import { dbService } from '../src/services/db-service.js';

function runDBIntegrationTests() {
  console.log("==================================================");
  console.log("TESTE AUTOMATIZADO - BANCO DE DADOS CLOUD SUPABASE / POSTGRESQL");
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
    // Teste 1: Gerenciamento de credenciais
    dbService.saveCredentials("https://demo.supabase.co", "sample_anon_key_123");
    const creds = dbService.getCredentials();
    assert(creds.hasCredentials && creds.url === "https://demo.supabase.co", "1. Leitura e salvamento das credenciais do Supabase.");

    // Teste 2: Modos de persistência (Dual Persistence)
    assert(dbService.isConnected === false, "2. Modo de persistência local ativo quando offline/sem conexão remota.");

  } catch (err) {
    console.error("Erro nos testes de banco de dados:", err);
  }

  console.log("==================================================");
  console.log(`RESULTADO: ${passed} PASSOU | ${failed} FALHOU`);
  console.log("==================================================");
}

runDBIntegrationTests();
