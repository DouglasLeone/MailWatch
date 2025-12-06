# 📌 MailWatch — Backend API

Backend da aplicação MailWatch: **API RESTful** responsável por receber e-mails automáticos via Webhook do Mailgun, gerenciar a base de dados (PostgreSQL), aplicar a lógica de negócio e fornecer dados para o Frontend.

---

## 🎯 Propósito

Este repositório contém o **core da aplicação**, lidando com:

- Persistência de dados
- Segurança
- Lógica de negócio

### Funções principais:

✔ Capturar e normalizar e-mails recebidos através do Webhook Mailgun  
✔ Fornecer rotas autenticadas (via `x-api-key`) para o Frontend  
✔ Validar assinatura do Mailgun para segurança dos dados  
✔ Gerenciar status e classificação dos e-mails (Estado/Município)

---

## 🏗 Tecnologias e Arquitetura

O projeto utiliza tecnologias modernas e escaláveis:

### 🔧 Tecnologias Utilizadas
| Camada | Tecnologia |
|--------|------------|
| Linguagem | TypeScript |
| Runtime | Node.js |
| Framework | Express.js |
| Banco de Dados | PostgreSQL |
| ORM | Prisma ORM |
| Integração | Mailgun (Inbound Webhook) |
| Deploy | Render |

---

### 📐 Arquitetura (Controller → Service → Repository)

Separação clara de responsabilidades:

| Camada | Função |
|--------|--------|
| Controller | Recebe requisições HTTP, valida entrada e chama a Service |
| Service | Aplica regras de negócio (normalização de dados, status inicial) |
| Repository | Manipula o banco via Prisma |

---

### 🔒 Segurança

- **Validação de Assinatura (Mailgun Signing Key)**  
  Garante que apenas notificações legítimas do Mailgun sejam aceitas
- **CORS configurado por ambiente**  
  Permite chamadas apenas do Frontend oficial (Vercel) e local

---

## 🚀 Rotas da API

> Todas as rotas começam com: **/api**

| Método | Rota | Descrição |
|--------|------|-----------|
| **POST** | `/webhook/inbound-email` | Recebe e-mails do Mailgun (sem auth, valida assinatura) |
| **POST** | `/emails/manual` | Cadastro manual de e-mail via Frontend |
| **GET** | `/emails/pendentes` | Lista e-mails com status **PENDENTE** |
| **GET** | `/emails/:id` | Detalhes completos do e-mail |
| **PUT** | `/emails/classificar/:id` | Atualiza Estado/Município e status |
| **DELETE** | `/emails/:id` | Remove um e-mail |

---

## ⚙️ Como Executar Localmente

### 1️⃣ Pré-requisitos

- Node.js **18+**
- npm, yarn ou pnpm
- PostgreSQL local ou em container (Docker)

---

### 2️⃣ Configuração do `.env`

Crie um arquivo `.env` na raiz do projeto:

```env
# Configuração do Banco de Dados
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# Chave de Assinatura do Mailgun (Webhooks Signing Key)
MAILGUN_SIGNING_KEY="sua_chave_de_assinatura_aqui"

# Chave da API (usada no Frontend para autenticação)
API_KEY="uma_chave_secreta_longa"

# URLs permitidas no CORS
URL_LOCAL=http://localhost:3000
URL_PROD=https://email-manager-suit.vercel.app

```

### 3️⃣ Instalar Dependências + Migrar Banco

```bash
npm install
npx prisma migrate dev --name init

```
### 4️⃣ Iniciar Servidor
```bash
npm run dev

A API rodará em:

```
👉 http://localhost:PORT
(sendo **PORT** a definida no ambiente ou padrão 3000)

