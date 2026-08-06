# Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

---

## [1.7.1] - Sprint 7.1 (Workspace Limpo & Isolamento Estrito no Primeiro Cadastro) - 2026-08-06

### Added
- **Isolamento de Dados por Tenant (`src/services/tenant-data-service.js`)**: Ao criar uma nova conta, o espaço de trabalho do novo cliente nasce **100% limpo** (0 ativos, 0 OSs, 0 PMOCs, 0 peças).
- **Cartões de Estado Vazio (Empty State Cards)**: Mensagens elegantes e botões de ação para guiar o novo usuário a cadastrar o seu primeiro ativo e gerar sua primeira etiqueta QR Code.
- **Cálculo Dinâmico dos KPIs**: Os relatórios e números do topo (Faturamento, Ativos Monitorados, Peças) refletem estritamente os dados reais da empresa logada.

---

## [1.7.0] - Sprint 7 (Landing Page Pública, Autenticação, Motor de Trial de 30 Dias e Gestão de Assinaturas) - 2026-08-06

### Added
- **Página Inicial Pública (`src/views/landing-page.js`)**: Hero com benefícios, CTAs de cadastro/login, explicação em 3 passos, tabela de planos transparentes, FAQ e rodapé legal.
- **Fluxo de Onboarding & Autenticação**: Cadastro com criação automática de empresa (tenant) e perfil `ADMIN`.
