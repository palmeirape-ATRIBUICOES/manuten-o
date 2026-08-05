# Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

---

## [1.1.0] - Sprint 1 (UI/UX App MVP Baseline) - 2026-08-05

### Added
- **Design System CSS Core (`src/assets/styles/main.css`)**: Tokens de cores HSL, tema escuro elegante, Glassmorphism, badges de status, botões com gradiente e layout responsivo.
- **App Shell SPA (`index.html` e `src/app.js`)**: Navegação fluida sem recarregamento de página entre Dashboard, Ativos, Leitor de QR Code, Ordens de Serviço, Clientes e Configurações.
- **Prontuário Digital do Ativo com QR Code (`src/mock-data.js`)**: Leitura instantânea via QR Code, detalhes técnicos do ativo, histórico imutável de eventos e gerador de etiqueta térmica para impressão.
- **Módulo PWA Técnico & Ordens de Serviço**: Execução de checklist da categoria, simulação de upload visual de fotos (Antes / Depois) e **Canvas de Assinatura Digital Touch** em campo (`src/components/canvas-signature.js`).
- **Dashboard de Gestão**: Métricas de KPIs (Total de Ativos, OS Abertas, Ativos em Alerta, Conformidade PMOC) e gráficos de distribuição por categoria.

---

## [1.0.0] - 2026-08-05

### Added
- Repositório inicial estruturado e conectado ao repositório GitHub `palmeirape-ATRIBUICOES/manuten-o`.
- README.md completo com arquitetura visual, visão geral e instruções de execução.
- Convenção de commits no padrão **Conventional Commits**.
- Bíblia do Produto (`docs/17-product-bible.md`) e 16 documentos técnicos em `docs/`.
