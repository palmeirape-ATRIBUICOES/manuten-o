# 14 - Guia de Contribuição e Onboarding do Desenvolvedor

> **Objetivo**: Permitir que qualquer novo desenvolvedor compreenda a arquitetura e faça sua primeira contribuição no projeto em **menos de 1 dia**.

---

## 1. Passo a Passo de Setup Local (< 15 minutos)

### Passo 1: Clonar o Repositório
```bash
git clone https://github.com/palmeirape-ATRIBUICOES/manuten-o.git
cd manuten-o
```

### Passo 2: Instalar Dependências
```bash
npm install
```

### Passo 3: Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz baseado no `.env.example`:
```bash
cp .env.example .env
```

### Passo 4: Subir o Ambiente Local
```bash
npm run dev
```
Acesse a aplicação no navegador em: `http://localhost:3000`.

---

## 2. Leitura Obrigatória de Onboarding

Antes de iniciar qualquer tarefa no código, leia a seguinte sequência de documentos:

1. 📖 [17-product-bible.md](17-product-bible.md) (Entenda a essência do produto em 10 minutos).
2. 📐 [02-arquitetura.md](02-arquitetura.md) (Entenda as camadas de Clean Architecture).
3. 📊 [03-banco-de-dados.md](03-banco-de-dados.md) (Entenda a entidade `assets` e o RLS Multitenant).
4. 📝 [13-padroes-de-codigo.md](13-padroes-de-codigo.md) (Entenda o padrão de Conventional Commits).

---

## 3. Fluxo de Trabalho (Git Workflow)

1. Crie uma branch a partir de `main`:
   - `git checkout -b feature/adiciona-leitor-qr`
   - `git checkout -b fix/corrige-calculo-sla`
2. Escreva o código e garanta que os testes passem:
   - `npm run test`
3. Faça commits utilizando **Conventional Commits**:
   - `git commit -m "feat(qr): implementa leitura de câmeras no PWA"`
4. Abra um Pull Request (PR) com a descrição detalhada das mudanças.
