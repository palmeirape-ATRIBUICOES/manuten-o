# 📚 Central de Documentação Oficial - SaaS Asset Management

Bem-vindo à documentação oficial do **SaaS de Gestão de Ativos para Prestadores de Serviços**.

Esta documentação foi elaborada para ser **autoexplicativa**, permitindo que qualquer desenvolvedor, arquiteto ou gestor de produto compreenda o funcionamento integral do sistema e consiga contribuir em menos de um dia.

---

## 🗂️ Índice de Documentos

| # | Documento | Descrição |
|---|---|---|
| 🌟 | [17-product-bible.md](17-product-bible.md) | **Bíblia do Produto (North Star)**: Visão, posicionamento, personas, ciclo de vida dos ativos e regras imutáveis. |
| 01 | [01-visao-geral.md](01-visao-geral.md) | Visão geral do produto, proposta de valor, problemas resolvidos e público-alvo. |
| 02 | [02-arquitetura.md](02-arquitetura.md) | Arquitetura técnica, camadas do sistema, diagramas de módulos e multitenancy. |
| 03 | [03-banco-de-dados.md](03-banco-de-dados.md) | Modelo ERD relacional, tabelas, campos, chaves primárias/estrangeiras e índices. |
| 04 | [04-fluxos.md](04-fluxos.md) | Diagramas Mermaid dos fluxos de autenticação, QR Code, Ordens de Serviço e Visitas. |
| 05 | [05-regras-de-negocio.md](05-regras-de-negocio.md) | Regras operacionais, ciclo de vida dos ativos, SLAs, garantias e validações. |
| 06 | [06-componentes.md](06-componentes.md) | Design System, catálogo de componentes reutilizáveis UI/UX, props e uso. |
| 07 | [07-api.md](07-api.md) | Contratos de API REST/GraphQL, rotas, payloads de requisição e resposta. |
| 08 | [08-autenticacao.md](08-autenticacao.md) | Módulo de Auth, JWT, Row Level Security (RLS) e RBAC (Controle de Acesso). |
| 09 | [09-storage.md](09-storage.md) | Estrutura de armazenamento de arquivos (fotos de ativos, laudos e assinaturas). |
| 10 | [10-estrutura-de-pastas.md](10-estrutura-de-pastas.md) | Mapeamento detalhado da árvore de diretórios do código-fonte. |
| 11 | [11-roadmap.md](11-roadmap.md) | Planejamento estratégico em 6 Fases (do MVP à API Pública). |
| 12 | [12-decisoes-tecnicas.md](12-decisoes-tecnicas.md) | Architecture Decision Records (ADRs) com justificativas, prós e contras. |
| 13 | [13-padroes-de-codigo.md](13-padroes-de-codigo.md) | Padrões de escrita, linter, formatação e boas práticas de código. |
| 14 | [14-guia-contribuicao.md](14-guia-contribuicao.md) | Guia de Onboarding para novos desenvolvedores com setup em < 1 dia. |
| 15 | [15-deploy.md](15-deploy.md) | Guia de integração contínua (CI/CD), ambientes de staging e produção. |
| 16 | [16-futuras-funcionalidades.md](16-futuras-funcionalidades.md) | Visão de expansão futura, telemetria IoT, integrações e automações. |

---

## 💡 Como Navegar na Documentação

- Para entender o **PROPÓSITO DE NEGÓCIO E A ESSÊNCIA DO SISTEMA**, comece por: [17-product-bible.md](17-product-bible.md).
- Para **NOVOS DESENVOLVEDORES**, leia o guia rápido em: [14-guia-contribuicao.md](14-guia-contribuicao.md).
- Para **ARQUITETURA E ENGENHARIA DE DADOS**, consulte: [02-arquitetura.md](02-arquitetura.md) e [03-banco-de-dados.md](03-banco-de-dados.md).
