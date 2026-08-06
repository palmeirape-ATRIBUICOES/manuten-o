# 18 - Autenticação, Motor de Trial de 30 Dias e Gestão de Assinaturas (Billing)

Este documento descreve detalhadamente o funcionamento do fluxo de onboarding, autenticação de usuários, isolamento multitenant, regras de cobrança e motor de teste gratuito de 30 dias da plataforma SaaS.

---

## 1. Visão Geral da Arquitetura de Onboarding

O fluxo de entrada de novos clientes no SaaS foi projetado para ser **zero atrito** e **100% automatizado**:

```
[ Landing Page Pública ] 
       │
       ▼ (Botão "Começar teste grátis")
[ Formulário de Cadastro ] (Nome, Empresa, E-mail, Senha, Termos)
       │
       ▼
[ Registro no Banco de Dados ] 
  ├── Cria Empresa (Tenant)
  ├── Cria Usuário Administrador
  ├── Inicia Período de Teste de 30 Dias (trial_started_at / trial_ends_at)
  └── Define status: subscription_status = 'trial', access_status = 'FULL_ACCESS'
       │
       ▼
[ Redirecionamento Automático para o Painel ] (Exibição da Faixa Amarela/Azul de Trial)
```

---

## 2. Estrutura de Tabelas e Entidades

### `tenants` (Empresas)
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID / String | Identificador único do tenant |
| `name` | String | Nome da empresa prestadora |
| `created_at` | Timestamp | Data de cadastro |

### `users` (Usuários)
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID / String | ID do usuário |
| `tenant_id` | UUID / String | FK para `tenants` |
| `full_name` | String | Nome completo |
| `email` | String (Unique) | E-mail de acesso |
| `password_hash` | String | Hash seguro da senha |
| `role` | String | Perfil (`ADMIN`, `TECHNICIAN`) |
| `is_active` | Boolean | Status da conta |

### `subscriptions` (Assinaturas e Trial)
| Coluna | Tipo | Descrição |
|---|---|---|
| `tenant_id` | UUID / String | FK única para `tenants` |
| `plan_id` | String | ID do plano (`basic`, `professional`, `enterprise`) |
| `subscription_status` | String | `trial`, `active`, `past_due`, `canceled`, `expired`, `blocked` |
| `trial_started_at` | Timestamp | Data de início dos 30 dias |
| `trial_ends_at` | Timestamp | Data exata de término do teste |
| `access_status` | String | `FULL_ACCESS` ou `READ_ONLY` |

---

## 3. Regras de Negócio do Período Gratuito de 30 Dias

1. **Sem Cartão de Crédito Inicial**: O cadastro não exige dados financeiros.
2. **Faixa Informativa Superior**:
   - **Dias > 7**: Banner azul com texto *"Você está utilizando o período gratuito. Restam X dias."*
   - **7 dias a 4 dias**: Banner amarelo em destaque.
   - **3 dias a 2 dias**: Banner laranja em destaque.
   - **1 dia (Último dia)**: Banner vermelho de alerta crítico: *"Último dia do seu teste gratuito! O acesso será limitado ao final do período."*
3. **Fim do Período (Expiração)**:
   - Nenhum dado é deletado.
   - O status da assinatura passa para `expired`.
   - O status de acesso passa para `READ_ONLY`.
   - Tentativas de cadastro de novos ativos ou conclusão de OSs exibem o aviso de expiração e redirecionam para a escolha de plano.

---

## 4. Camada de Abstração de Pagamento (Gateway Agnostic)

O serviço `src/services/billing-service.js` está preparado para integração com gateways de pagamento através do padrão de porta/adaptador (Adapter Pattern):

```javascript
// Exemplo de integração via Webhook Mercado Pago / Stripe
billingService.handleWebhookEvent("MERCADO_PAGO", "payment.approved", {
  tenantId: "tenant-123",
  planId: "professional"
});
```

Gateways Suportados:
- **Mercado Pago** (Pix, Cartão de Crédito e Boleto Recorrente)
- **Asaas** (Cobranças SaaS)
- **Stripe Billing** (Assinaturas Internacionais)

---

## 5. Como Testar o Fluxo Localmente

1. Acesse o sistema na URL local ou em produção.
2. Clique em **"Começar Teste Grátis"**.
3. Preencha os dados da nova empresa e crie a conta.
4. Observe a faixa de aviso no topo indicando `Restam 30 dias`.
5. No Nível 0 do painel, clique no bloco **"Plano e Assinatura"** para visualizar os detalhes do trial e simular a ativação de um plano pago.
