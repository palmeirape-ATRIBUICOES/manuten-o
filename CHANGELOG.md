# Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

---

## [1.6.0] - Sprint 6 (Modo PWA Offline-First & Sincronização Inteligente IndexedDB) - 2026-08-06

### Added
- **Service Worker PWA (`sw.js`)**: Caching estático do App Shell e arquivos JS/CSS para funcionamento sem internet.
- **Web App Manifest (`manifest.json`)**: Suporte a instalação como aplicativo nativo no smartphone do técnico.
- **Indicador de Conectividade em Tempo Real**: Badge no header indicando status `ONLINE` ou `MODO OFFLINE (PWA)`.
- **Fila de Sincronização Offline (`src/app.js`)**: Execução de checklists, fotos e assinaturas em locais sem sinal (subsolos/casas de máquinas) com transmissão automática para a nuvem assim que a conexão retorna.
- **Simulador de Queda de Conexão**: Bloco de teste de alternância de rede para validação de salvamento em campo.

---

## [1.5.0] - Sprint 5 (Módulo PMOC & Manutenções Preventivas Automáticas) - 2026-08-06

### Added
- **Módulo PMOC (`src/mock-data.js` & `src/app.js`)**: Gestão do Plano de Manutenção, Operação e Controle (Portaria MS 3.523/1998 & Lei 13.589/2018).
- **Gerador de Laudo Técnico Oficial PMOC**: Emissão e simulação para impressão do laudo com ART.

---

## [1.4.0] - Sprint 4 (Arquitetura Visual & Navegação por Blocos em Níveis - Padrão missoes-da-loja) - 2026-08-06

### Added / Changed
- **Reestruturação Geral de UI/UX**: Eliminação completa de menu lateral (sidebar) e menu hambúrguer. Adoção da **Navegação por Blocos (Cards)** em níveis inspirada em `missoes-da-loja`.
