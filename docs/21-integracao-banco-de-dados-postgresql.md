# 21 - Integração de Banco de Dados Cloud PostgreSQL (Supabase / RLS)

Este documento instrui passo a passo como conectar a aplicação SaaS ao banco de dados relacional **Supabase (PostgreSQL Cloud)** com segurança de isolamento por empresa (**Row Level Security - RLS**).

---

## 1. Passo a Passo para Criar o Banco no Supabase

1. Acesse **[https://supabase.com](https://supabase.com)** e crie uma conta gratuita (Free Tier).
2. Clique em **"New Project"**, informe o nome da sua empresa e defina uma senha forte para o banco de dados PostgreSQL.
3. Após a criação do projeto, clique no menu lateral **SQL Editor**.
4. Abra o arquivo [database/schema.sql](file:///c:/Users/thiag/OneDrive/Área%20de%20Trabalho/PRESTADOR%20DE%20SERVIÇOS/database/schema.sql) no projeto, copie todo o conteúdo e cole no SQL Editor do Supabase.
5. Clique no botão **"Run"** para executar a criação de todas as 10 tabelas e políticas RLS.

---

## 2. Conectando a Aplicação ao Banco Cloud

1. No Supabase Dashboard, acesse **Project Settings -> API**.
2. Copie a **Project URL** (ex: `https://xyzcompany.supabase.co`) e a **Project API Key (anon public)**.
3. No painel principal da aplicação, clique no módulo **"Banco de Dados Cloud"**.
4. Cole a URL e a Chave Anon nos campos e clique em **"Testar Conexão com a Nuvem"**.
5. O indicador mudará para **`🟢 Conectado ao Supabase PostgreSQL Cloud`** e todos os novos cadastros serão sincronizados diretamente no banco de dados remoto em nuvem.

---

## 3. Estrutura de Tabelas Criadas (`database/schema.sql`)

- `tenants`: Cadastro das empresas prestadoras de serviço.
- `users`: Usuários administradores e técnicos.
- `subscriptions`: Gerenciador do trial de 30 dias e planos pagos.
- `clients`: Clientes da prestadora de serviço.
- `equipment`: Máquinas e ativos patrimoniais.
- `services`: Ordens de serviço e atendimentos de manutenção.
- `service_photos`: Galeria de evidências fotográficas (*Antes*, *Durante*, *Depois*).
- `service_notes`: Apontamentos técnicos do serviço.
- `service_parts`: Peças e materiais com custos unitários e totais.
- `service_status_history`: Linha do tempo auditável de alterações.
