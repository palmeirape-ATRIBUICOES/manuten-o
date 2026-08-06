# 12 - Registros de Decisões Técnicas (ADRs)

Este documento registra as decisões arquiteturais de maior impacto tomadas na construção da plataforma, apresentando o contexto, alternativas consideradas, vantagens e limitações.

---

## ADR-001: Adotar PostgreSQL com Row Level Security (RLS) para Multitenancy

### Contexto
O sistema precisa atender centenas de prestadores de serviços de forma segura, garantindo que o tenant A nunca visualize dados do tenant B.

### Decisão Tomada
PostgreSQL com RLS Nativo e parâmetro de sessão `app.current_tenant_id`.

---

## ADR-002: Modelo de Ativos com Atributos Flexíveis em JSONB

### Contexto
Ativos possuem especificações variáveis (ex: HVAC, Veículos, Geradores, Bombas).

### Decisão Tomada
Coluna `custom_attributes` em `JSONB` com índices GIN no PostgreSQL.

---

## ADR-003: Filosofia Centrada na Gestão de Ativos (Asset Management)

### Contexto
Muitos sistemas concorrentes focam em emitir Ordens de Serviço como papéis avulsos.

### Decisão Tomada
Todo o modelo do sistema orbita em torno do **Ciclo de Vida do Ativo Patrimonial** (`assets`).

---

## ADR-004: Pipeline de Deploy Automático em Produção (GitHub Actions + Pages)

### Contexto
O cliente precisa visualizar e testar todas as entregas das sprints imediatamente online.

### Decisão Tomada
Esteira CI/CD em `.github/workflows/deploy.yml` que publica automaticamente cada commit da branch `main` na URL [https://palmeirape-atribuicoes.github.io/manuten-o/](https://palmeirape-atribuicoes.github.io/manuten-o/).

---

## ADR-005: Arquitetura Visual e Navegação por Blocos em Níveis (Padrão missoes-da-loja)

### Contexto
Sistemas tradicionais exibem barras laterais (sidebars) poluídas com dezenas de itens simultâneos, dificultando o uso por técnicos em dispositivos móveis e gerando sobrecarga cognitiva.

### Alternativas Consideradas
1. Sidebar lateral clássica expansível.
2. Menu Hambúrguer suspenso.
3. **Navegação por Blocos em Níveis (Block-Based Level Navigation)** sem sidebar e sem menu hambúrguer.

### Decisão Tomada
Opção 3: **Navegação por Blocos em Níveis inspirada no projeto `missoes-da-loja`**.

### Regras de Negócio de UX:
- **Sem Sidebar / Hambúrguer**: Tela inicial limpa contendo apenas blocos de módulos.
- **Botão Voltar & Breadcrumb Bar**: Presentes em todas as sub-telas para navegação contextual fluida.
- **Regra dos 8 Blocos**: Limite máximo de 8 blocos principais por tela.
- **Meta dos 3 Clicks**: Acesso a qualquer funcionalidade em no máximo 3 cliques a partir da Home.

### Vantagens
- Extrema simplicidade visual e usabilidade impecável em dispositivos touch de técnicos em campo.
- Foco absoluto no contexto da tarefa sem distrações laterais.
