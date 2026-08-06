# 12 - Registros de Decisões Técnicas (ADRs)

Este documento registra as decisões arquiteturais de maior impacto tomadas na construção da plataforma, apresentando o contexto, alternativas consideradas, vantagens e limitações.

---

## ADR-001: Adotar PostgreSQL com Row Level Security (RLS) para Multitenancy

### Contexto
O sistema precisa atender centenas de prestadores de serviços de forma segura, garantindo que o tenant A nunca visualize dados do tenant B.

### Alternativas Consideradas
1. **Database por Tenant**: Um banco PostgreSQL isolado para cada prestador.
2. **Schema por Tenant**: Um schema PostgreSQL separado dentro do mesmo banco.
3. **Tabela Única com `tenant_id` filtrado por aplicação (Código ORM)**.
4. **Tabela Única com PostgreSQL Row Level Security (RLS) nativo no banco**.

### Decisão Tomada
Opção 4: **PostgreSQL com RLS Nativo**.

### Vantagens
- **Segurança Absoluta**: Mesmo que um desenvolvedor esqueça de incluir `.where('tenant_id', id)` na query, o banco de dados recusa e filtra as linhas automaticamente.
- **Custo Operacional Reduzido**: Um único cluster de banco de dados para gerenciar, realizar backups e escalar.

### Limitações
- Exige que toda conexão HTTP configure o parâmetro `app.current_tenant_id` antes de executar queries de usuário.

---

## ADR-002: Modelo de Ativos com Atributos Flexíveis em JSONB

### Contexto
Um ativo pode ser um Ar Condicionado (com BTU, tensão e refrigerante), um Veículo (com placa, ano, combustível e quilometragem) ou um Gerador (com kVA e horímetro).

### Alternativas Consideradas
1. Criar tabelas filhas separadas para cada tipo de ativo (`hvac_assets`, `vehicle_assets`, `generator_assets`).
2. Tabela de EAV (Entity-Attribute-Value).
3. Tabela única com coluna `custom_attributes` em `JSONB` no PostgreSQL.

### Decisão Tomada
Opção 3: **Coluna `custom_attributes` JSONB com JSON Schema validation por Categoria**.

### Vantagens
- Suporta qualquer novo tipo de ativo patrimonial sem necessidade de alterar o schema do banco (migrações DDL).
- Alta performance de busca utilizando índices GIN no PostgreSQL.

### Limitações
- Requer validação rigorosa no código da aplicação antes de salvar atributos dinâmicos.

---

## ADR-003: Filosofia Centrada na Gestão de Ativos (Asset Management)

### Contexto
Muitos sistemas concorrentes focam em emitir Ordens de Serviço como papéis avulsos.

### Decisão Tomada
Todo o modelo do sistema orbita em torno do **Ciclo de Vida do Ativo Patrimonial** (`assets`). A Ordem de Serviço é apenas um evento mutacional na linha do tempo do ativo.

### Vantagens
- Cria um histórico valioso de longo prazo para o cliente final.
- Permite calcular métricas avançadas de manutenção (MTTR, MTBF, Depreciação e Custo Total de Propriedade).
