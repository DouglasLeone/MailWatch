# 📧 MailWatch — Sistema Inteligente de Gestão de E-mails

MailWatch é uma solução completa para **captura, organização, classificação e análise de e-mails corporativos**, desenvolvida para o *Hackathon IFPI – Sistema de Gestão de E-mails*.

Colaboradores enviam e-mails para clientes com **cópia automática (CC)** para um endereço controlado. O sistema captura esses e-mails, armazena e disponibiliza tudo em uma interface moderna, com filtros avançados, dashboard e histórico completo.

---

## 🚀 Funcionalidades Principais

- **📥 Captura Automática de E-mails** via Mailgun  
- **📊 Dashboard em Tempo Real**  
- **🗂 Classificação de Estado e Município**  
- **📑 Lista Completa de E-mails** com filtros avançados  
- **⌛ Gestão de Pendentes**  
- **📝 Cadastro Manual de E-mails**  
- **🔍 Busca e Histórico Completo**  
- **📤 Exportação CSV**  
- **📱 Interface Responsiva (Desktop/Mobile)**  

---

## 🏗 Tecnologias Utilizadas

- **Frontend:** React + Vite + TailwindCSS  
- **Backend:** Node.js / Express  
- **Banco de Dados:** PostgreSQL  
- **Serviço de E-mails:** Mailgun  
- **Hospedagem:** Vercel / Render

---

## ⚙️ Instruções de Execução  
📌 *Conforme o edital do Hackathon IFPI, o participante deve entregar o código-fonte completo e as instruções de execução. As instruções estão descritas abaixo.*

## 🖥️ Pré-requisitos

Antes de iniciar, você precisa ter instalado:

- **Node.js** (versão 18 ou superior)
- **Git**
- **Gerenciador de pacotes:** npm, yarn ou pnpm
- **Banco de Dados:** PostgreSQL (ou outro definido no projeto)
- Conta configurada no **Mailgun** (para captura de e-mails em CC)

---

### 🔧 Clonar o repositório

```bash
git clone https://github.com/DouglasLeone/MailWatch.git
cd MailWatch
```
## Para o Backend
```bash
# === MAILGUN CONFIG ===
MAILGUN_API_KEY=INSIRA_SUA_CHAVE_AQUI
MAILGUN_WEBHOOK_SECRET=SEU_WEBHOOK_SECRET_AQUI

# === DATABASE ===
DATABASE_URL=postgresql://usuario:senha@localhost:5432/mailwatch

# === SERVER CONFIG ===
PORT=3000

cd backend
npm install
npm run dev

```

## Para o Frontend
```bash
O VITE no inicio é obrigatório para o Frontend

VITE_API_URL=http://localhost:3000 (Para cada chave no .env)

cd frontend
npm install
npm run dev
```

## 👥 Integrantes da Equipe

| Integrante | Função no Projeto | GitHub |
|-----------|------------------|--------|
| **Heber Bringel** | Desenvolvedor Backend — responsável pela API, integração com Mailgun e lógica de captura automática | [github.com/Heber-Bringel](https://github.com/Heber-Bringel) |
| **Nilson Rodrigo** | Desenvolvedor Frontend & Design de Slides — responsável pelas telas, UX e elaboração da apresentação oficial | [github.com/Nilson-Rodrigo](https://github.com/Nilson-Rodrigo) |
| **Douglas Leone** | Desenvolvedor Frontend & Integração — responsável pela comunicação entre frontend e backend, refinamento das interfaces e integração geral do sistema | [github.com/DouglasLeone](https://github.com/DouglasLeone) |
