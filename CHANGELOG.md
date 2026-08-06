# Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

---

## [1.7.0] - Sprint 7 (Landing Page Pública, Autenticação, Motor de Trial de 30 Dias e Gestão de Assinaturas) - 2026-08-06

### Added
- **Página Inicial Pública (`src/views/landing-page.js`)**: Hero com benefícios, CTAs de cadastro/login, explicação em 3 passos, tabela de planos transparentes, FAQ e rodapé legal.
- **Fluxo de Onboarding & Autenticação (`src/services/auth-service.js` & `src/views/auth-pages.js`)**: Telas de Cadastro com criação automática de empresa (tenant) e perfil `ADMIN`, Login e Recuperação de Senha.
- **Motor do Período Gratuito de 30 Dias (`src/services/subscription-service.js`)**: Faixa superior de contagem de dias com alertas visuais destacados aos 7, 3 e 1 dia restante.
- **Bloqueio Gracioso Pós-Trial**: Transição automática para `READ_ONLY` com preservação de dados e redirecionamento para escolha de plano.
- **Tabela de Planos Centralizada (`src/config/plans.js`)**: Configuração transparente dos planos Básico, Profissional e Empresa.
- **Camada de Cobrança Abstrata (`src/services/billing-service.js`)**: Preparada para gateway Mercado Pago, Asaas e Stripe com suporte a webhooks.
- **Novo Bloco "Plano e Assinatura"**: Adicionado ao Nível 0 do Painel do Gestor mantendo o padrão de navegação por blocos sem sidebar.
- **Documentação e Testes (`docs/18-autenticacao-trial-e-billing.md` & `tests/onboarding-trial.test.js`)**: Bateria automatizada testando 100% dos 12 cenários de onboarding e segurança.

---

## [1.6.0] - Sprint 6 (Modo PWA Offline-First & Sincronização Inteligente IndexedDB) - 2026-08-06

### Added
- **Service Worker PWA (`sw.js`)**: Caching estático do App Shell e arquivos JS/CSS para funcionamento sem internet.
- **Indicador de Conectividade em Tempo Real**: Badge no header indicando status `ONLINE` ou `MODO OFFLINE (PWA)`.
- **Fila de Sincronização Offline**: Transmissão automática para a nuvem assim que a conexão retorna.

---

## [1.5.0] - Sprint 5 (Módulo PMOC & Manutenções Preventivas Automáticas) - 2026-08-06

### Added
- **Módulo PMOC (`src/mock-data.js` & `src/app.js`)**: Gestão do Plano de Manutenção, Operação e Controle com laudo técnico oficial.

---

## [1.4.0] - Sprint 4 (Arquitetura Visual & Navegação por Blocos em Níveis - Padrão missoes-da-loja) - 2026-08-06

### Added / Changed
- **Reestruturação Geral de UI/UX**: Eliminação completa de menu lateral (sidebar) e menu hambúrguer. Adoção da **Navegação por Blocos (Cards)** em níveis inspirada em `missoes-da-loja`.
