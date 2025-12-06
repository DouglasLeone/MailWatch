# MailWatch — Frontend

Frontend da aplicação MailWatch: interface de usuário para listagem, filtragem, classificação e visualização de e-mails capturados. Construído com React, Vite e TailwindCSS.

---

## 🎯 Propósito

Este repositório contém apenas a **camada de apresentação (UI/UX)** do sistema MailWatch — responsável por consumir a API do backend, exibir dados, oferecer filtros, dashboard, formulários, responsividade, dentre outras funcionalidades de interface.

---

## 🏗 Tecnologias Utilizadas

- **React**  
- **Vite**  
- **TailwindCSS**  
- TypeScript / TSX  
- Fetch para consumo da API backend  

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos

- Node.js 18+  
- npm (ou yarn / pnpm) instalado  
- Backend do MailWatch rodando (API disponível)  


### 2. Clonar o repositório

```bash
git clone https://github.com/DouglasLeone/MailWatch.git
cd MailWatch/frontend
```



### 3. Instalar dependências
```bash
npm install
```
### 4. Configurar variáveis de ambiente.

Crie um arquivo .env na raiz da pasta `frontend`, com o conteúdo:
```bash
VITE_API_URL=http://localhost:3000
```

> Ajuste a URL se sua API backend estiver rodando em outra porta ou domínio.

### 5. Rodar em modo de desenvolvimento

```bash
npm run dev
```

### Estrutura do projeto

```bash
frontend/
├── public/           # arquivos públicos (index.html, favicon, etc.)
├── src/              # código-fonte React (components, pages, services, styles, etc.)
├── package.json      
├── vite.config.js
└── READMe.md
```

## 📝 Observações

- Este projeto depende do **backend** — sem ele, a interface não exibirá os dados corretamente.  
- As variáveis de ambiente **não devem ser enviadas** para o repositório público (.env deve ser ignorado pelo Git).  
- Para deploy em produção, reconfigure a variável:
