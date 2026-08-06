# 19 - Fluxo Guiado de Manutenção (+ Novo Serviço em 4 Etapas)

Este documento descreve detalhadamente o funcionamento do fluxo assistido de cadastro rápido de cliente, registro de equipamento, anexação de fotos (antes, durante e depois), revisão e prontuário de atendimento do SaaS Asset Management.

---

## 1. Visão Geral do Fluxo Guiado em 4 Etapas

O botão principal **`+ Novo serviço`** no painel principal inicia um assistente interativo com progresso visual:

```
[ + Novo Serviço ]
       │
       ├── ETAPA 1 — CLIENTE: Selecionar existente (busca) OU Cadastrar Novo (Nome + Telefone)
       │
       ├── ETAPA 2 — EQUIPAMENTO: Selecionar existente OU Cadastrar Novo (Tipo, Marca, Modelo, Problema Relatado)
       │
       ├── ETAPA 3 — FOTOS DO SERVIÇO: 3 Blocos (Antes, Durante, Depois) com miniaturas e exclusão
       │
       └── ETAPA 4 — REVISAR E SALVAR: Resumo dos dados e criação da OS (Status 'Aberto')
```

---

## 2. Estrutura de Tabelas e Entidades

### `clients` (Clientes)
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID / String | Identificador do cliente |
| `company_id` | UUID / String | FK do tenant para isolamento multitenant |
| `name` | String (Required) | Nome completo ou razão social |
| `phone` | String (Required) | Telefone / WhatsApp de contato |
| `address` | String (Optional) | Endereço de atendimento |
| `notes` | Text (Optional) | Observações adicionais |

### `equipment` (Produtos ou Equipamentos)
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID / String | ID do equipamento |
| `company_id` | UUID / String | FK do tenant |
| `client_id` | UUID / String | FK do proprietário |
| `type` | String | Tipo (Ar-condicionado, Geladeira, Forno, Outro) |
| `brand` | String | Fabricante/Marca |
| `model` | String | Modelo do equipamento |
| `serial_number` | String (Optional) | Número de série |
| `location` | String (Optional) | Localização física no cliente |

### `services` (Ordens de Serviço / Atendimentos)
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID / String | ID do serviço |
| `company_id` | UUID / String | FK do tenant |
| `service_number` | String | Número ex: `OS-2026-001` |
| `client_id` | UUID / String | FK do cliente |
| `equipment_id` | UUID / String | FK do equipamento |
| `reported_problem` | Text | Problema relatado pelo cliente |
| `status` | String | `Aberto`, `Em andamento`, `Concluído`, `Cancelado` |
| `responsible_user_id` | UUID / String | Usuário criador/técnico |

### `service_photos` (Fotos do Serviço)
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID / String | ID da foto |
| `company_id` | UUID / String | FK do tenant |
| `service_id` | UUID / String | FK do serviço relacionado |
| `photo_type` | String | `before`, `during`, `after` |
| `file_url` | String | URL/Base64 da imagem |
| `caption` | String (Optional) | Legenda descritiva |

---

## 3. Isolamento Multitenant por `company_id`

Todos os métodos de gravação e consulta em `src/services/tenant-data-service.js` aplicam o filtro obrigatório por `companyId`:

```javascript
// Exemplo de consulta isolada por empresa
const tenantClients = tenantDataService.getClients(currentCompanyId);
const tenantServices = tenantDataService.getServices(currentCompanyId);
```

---

## 4. Como Testar o Fluxo em 4 Etapas Localmente

1. Acesse o Painel do Gestor.
2. Clique no botão verde de destaque **`+ Novo serviço`**.
3. **Etapa 1**: Cadastre um novo cliente digitando Nome e Telefone.
4. **Etapa 2**: Selecione o tipo de equipamento (ex: Ar-condicionado), informe a marca, modelo e a descrição do problema.
5. **Etapa 3**: Clique para adicionar fotos de simulação nas categorias *Antes*, *Durante* ou *Depois*.
6. **Etapa 4**: Revise o resumo e clique em *"Criar Serviço Oficial"*.
7. Acesse a tela do serviço criado e teste os 5 blocos de ação técnica.
