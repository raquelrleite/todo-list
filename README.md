<div align="center">

<h1>✅ Todo List</h1>

<p>Aplicação full stack de gerenciamento de tarefas com autenticação JWT, confirmação de conta por e-mail, recuperação de senha e editor rich text.</p>

<br/>

<!-- Linguagens -->
![Java](https://img.shields.io/badge/Java_21-007396?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Flyway](https://img.shields.io/badge/Flyway-CC0200?style=for-the-badge&logo=flyway&logoColor=white)

![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

</div>

---

## 📑 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Configuração do Ambiente](#-configuração-do-ambiente)
- [Como Executar](#-como-executar)
- [Documentação da API](#-documentação-da-api)
- [Estrutura do Projeto](#-estrutura-do-projeto)

---

## 💡 Sobre o Projeto

O **Todo List** é uma aplicação full stack construída com **Spring Boot** no backend e **React + Vite** no frontend. O projeto foi desenvolvido com foco em boas práticas de arquitetura, autenticação segura e uma interface web moderna e responsiva.

A solução é dividida em duas camadas independentes — backend e frontend — o que facilita manutenção, escalabilidade e evolução do sistema.

---

## ✨ Funcionalidades

- 📝 Cadastro e login de usuários
- 🔐 Autenticação com JWT (access token + refresh token)
- ✉️ Confirmação de conta por e-mail
- 🔁 Reenvio de e-mail de confirmação
- 🔑 Recuperação e redefinição de senha
- 📂 CRUD completo de categorias
- ✅ CRUD completo de tarefas
- 🟢 Marcação de tarefas como concluídas
- 🔍 Busca e filtro de tarefas (pendentes / concluídas)
- ✍️ Editor rich text na descrição das tarefas (Tiptap)
- 🛡️ Sanitização de HTML com DOMPurify

---

## 🏗️ Arquitetura

A aplicação segue o padrão **cliente-servidor**:

- **Backend (`/backend`)** — API REST com Spring Boot: autenticação, gestão de usuários, categorias, tarefas e envio de e-mails.
- **Frontend (`/frontend`)** — SPA em React que consome a API via HTTP com autenticação JWT no header `Authorization`.

```
Frontend (React)  ──→  http://localhost:8080  ──→  Backend (Spring Boot)  ──→  MySQL
```

> Por padrão, o frontend aponta para `http://localhost:8080` (configurado em `frontend/src/App.jsx`).

---

## 🛠️ Tecnologias

### Backend
| Tecnologia | Descrição |
|---|---|
| Java 21 | Linguagem principal |
| Spring Boot | Framework base |
| Spring Security | Controle de autenticação e autorização |
| Spring Data JPA / Hibernate | Persistência e ORM |
| MySQL | Banco de dados relacional |
| Flyway | Migrations do banco de dados |
| JWT (`java-jwt`) | Geração e validação de tokens |
| Spring Mail + Thymeleaf | Envio e templates de e-mail |
| Lombok + MapStruct | Redução de boilerplate |
| Maven | Gerenciamento de build e dependências |

### Frontend
| Tecnologia | Descrição |
|---|---|
| React 19 | Biblioteca de UI |
| Vite | Bundler e servidor de desenvolvimento |
| Tiptap | Editor rich text |
| DOMPurify | Sanitização de HTML |
| ESLint | Linting de código |
| npm | Gerenciador de pacotes |

---

## 📋 Pré-requisitos

Antes de executar o projeto, certifique-se de ter instalado:

- **Java 21**
- **Maven 3.9+**
- **MySQL 8+**
- **Node.js 18+ (LTS recomendado)**
- **npm**
- Uma conta **SMTP** válida (necessária para confirmação de conta e recuperação de senha)

---

## ⚙️ Configuração do Ambiente

### 1. Crie o arquivo `.env` na pasta `backend/`

Copie o exemplo abaixo e preencha com os seus dados:

```env
# Banco de Dados
DB_URL=jdbc:mysql://localhost:3306/todolist
DB_USERNAME=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql

# Servidor de E-mail (SMTP)
MAIL_HOST=seu_host_smtp
MAIL_PORT=sua_porta_smtp
MAIL_USERNAME=seu_email_ou_usuario_smtp
MAIL_PASSWORD=sua_senha_smtp

# JWT
JWT_SECRET=uma_chave_jwt_forte_e_segura
JWT_EXPIRATION_MINUTES=15
JWT_REFRESH_EXPIRATION_DAYS=7
JWT_CONFIRMATION_EXPIRATION_HOURS=24

# URL do Frontend
APP_URL=http://localhost:5173
```

> Um arquivo `.env.example` com o modelo acima está disponível na raiz do projeto para referência.

<details>
<summary>📖 Descrição das variáveis</summary>

| Variável | Descrição |
|---|---|
| `DB_URL` | URL de conexão com o banco MySQL |
| `DB_USERNAME` | Usuário do banco de dados |
| `DB_PASSWORD` | Senha do banco de dados |
| `MAIL_HOST` | Host do servidor SMTP |
| `MAIL_PORT` | Porta do servidor SMTP |
| `MAIL_USERNAME` | Usuário/e-mail da conta SMTP |
| `MAIL_PASSWORD` | Senha da conta SMTP |
| `JWT_SECRET` | Segredo para assinar os tokens JWT |
| `JWT_EXPIRATION_MINUTES` | Expiração do access token (em minutos) |
| `JWT_REFRESH_EXPIRATION_DAYS` | Expiração do refresh token (em dias) |
| `JWT_CONFIRMATION_EXPIRATION_HOURS` | Validade do token de confirmação de conta |
| `APP_URL` | URL base do frontend, usada nos e-mails gerados |

</details>

---

## 🚀 Como Executar

### Ordem recomendada

1. Inicie o **MySQL**
2. Suba o **backend**
3. Suba o **frontend**
4. Acesse a aplicação no navegador

---

### Backend

```bash
cd backend
mvn spring-boot:run
```

A API estará disponível em: `http://localhost:8080`

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend estará disponível em: `http://localhost:5173`

---

## 📡 Documentação da API

### Usuários — `/v1/users`

| Método | Rota | Descrição | Autenticação |
|---|---|---|---|
| `POST` | `/register` | Cadastra um novo usuário | ❌ |
| `GET` | `/account-confirmation?token=...` | Confirma a conta via token | ❌ |
| `POST` | `/resend-confirmation` | Reenvia o e-mail de confirmação | ❌ |
| `POST` | `/login` | Autentica e retorna access + refresh token | ❌ |
| `POST` | `/refresh` | Gera novos tokens a partir do refresh token | ❌ |
| `POST` | `/forgot-password` | Envia e-mail de recuperação de senha | ❌ |
| `POST` | `/reset-password` | Redefine a senha com token de recuperação | ❌ |

### Categorias — `/v1/categories` 🔒

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/` | Cria uma nova categoria |
| `GET` | `/{title}` | Busca categorias pelo título |
| `GET` | `/` | Lista todas as categorias do usuário |
| `PATCH` | `/{id}` | Atualiza uma categoria |
| `DELETE` | `/{id}` | Remove uma categoria |

### Tarefas — `/v1/tasks` 🔒

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/` | Cria uma nova tarefa |
| `GET` | `/?done={true\|false}` | Lista tarefas por status de conclusão |
| `GET` | `/title/{title}` | Busca tarefas pelo título |
| `GET` | `/category/{id}` | Lista tarefas de uma categoria |
| `PATCH` | `/{id}` | Atualiza os dados de uma tarefa |
| `PATCH` | `/complete/{id}` | Marca uma tarefa como concluída |
| `DELETE` | `/{id}` | Remove uma tarefa |

> 🔒 Todos os endpoints de categorias e tarefas exigem autenticação via **Bearer Token** no header `Authorization`.

---

## 📁 Estrutura do Projeto

```
todo-list/
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/          # Código-fonte Java
│   │       └── resources/
│   │           └── application.yml
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   └── App.jsx            # API_URL configurada aqui
│   └── package.json
├── requisicoes-postman/       # Coleção de requisições para testes
├── .env.example
└── .gitignore
```

---

<div align="center">
  <sub>Desenvolvido por <a href="https://github.com/raquelrleite">@raquelrleite</a></sub>
</div>
