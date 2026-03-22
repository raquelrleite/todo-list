<div align="center">

<h1>✅ Todo List</h1>

<p>Aplicação full stack de gerenciamento de tarefas com autenticação híbrida (JWT + OAuth2), login social via Google e GitHub, confirmação de conta por e-mail e editor rich text.</p>

<br/>

![Java](https://img.shields.io/badge/Java_21-007396?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)
![OAuth2](https://img.shields.io/badge/OAuth2-000000?style=for-the-badge&logo=auth0&logoColor=white)
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
- [Autenticação e Segurança](#-autenticação-e-segurança)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Configuração do Ambiente](#-configuração-do-ambiente)
- [Como Executar](#-como-executar)
- [Documentação da API](#-documentação-da-api)
- [Estrutura do Projeto](#-estrutura-do-projeto)

---

## 💡 Sobre o Projeto

O **Todo List** é uma aplicação full stack construída com **Spring Boot** no backend e **React + Vite** no frontend.

O projeto suporta três formas de autenticação — e-mail/senha, Google e GitHub — com uma arquitetura de segurança híbrida: tokens JWT transportados via header `Authorization` no login local, e via **Cookies HttpOnly** no login social, protegendo contra XSS.

---

## ✨ Funcionalidades

- 📝 Cadastro e login com e-mail e senha
- 🌐 Login social com **Google** e **GitHub** via OAuth2
- 🔐 Autenticação com JWT (access token + refresh token)
- 🍪 Sessão OAuth2 protegida via **Cookies HttpOnly**
- ✉️ Confirmação de conta por e-mail e reenvio de token
- 🔑 Recuperação e redefinição de senha
- 📂 CRUD completo de categorias
- ✅ CRUD completo de tarefas
- 🟢 Marcação de tarefas como concluídas
- 🔍 Busca e filtro de tarefas (pendentes / concluídas)
- ✍️ Editor **rich text** na descrição das tarefas (Tiptap)
- 🛡️ Sanitização de HTML com **DOMPurify**
- 📱 Interface responsiva

---

## 🔐 Autenticação e Segurança

A aplicação suporta dois fluxos que coexistem sem conflito, validados pelo mesmo filtro JWT:

### Fluxo Local — E-mail + Senha

1. Usuário se cadastra com nome, e-mail e senha
2. Recebe link de confirmação por e-mail (`?token=...`)
3. Após confirmar, faz login e recebe `accessToken` + `refreshToken` no corpo da resposta
4. Frontend armazena no `localStorage` e envia via header `Authorization: Bearer`

### Fluxo Social — Google / GitHub

1. Usuário clica em "Continue with Google" ou "Continue with GitHub"
2. É redirecionado ao provedor, que autentica e retorna ao backend
3. O backend busca ou cria o usuário no banco — sem senha, campo `nullable`
4. Gera o JWT e o envia como **Cookie HttpOnly**, invisível para JavaScript
5. Todas as requisições seguintes enviam o cookie automaticamente

> **Detalhe GitHub:** quando o e-mail do perfil é privado, o backend faz uma chamada adicional para `https://api.github.com/user/emails` para buscar o e-mail primário verificado.

### SecurityFilter — leitura dupla de token

O filtro JWT tenta recuperar o token em dois lugares, nessa ordem:
1. Header `Authorization: Bearer` — login local
2. Cookie `accessToken` — login social

---

## 🏗️ Arquitetura

```
Frontend (React SPA)
    │
    ├── Authorization: Bearer xxx  ──→  Login local
    └── Cookie: accessToken=xxx    ──→  Login social
                    │
                    ▼
        Backend (Spring Boot REST)
                    │
          ┌─────────┴──────────┐
          ▼                    ▼
        MySQL           Google / GitHub
                         (OAuth2)
```

---

## 🛠️ Tecnologias

### Backend
| Tecnologia | Descrição |
|---|---|
| Java 21 | Linguagem principal |
| Spring Boot | Framework base |
| Spring Security | Autenticação, autorização e filtros |
| Spring OAuth2 Client | Integração com Google e GitHub |
| Spring Data JPA | Persistência e ORM |
| MySQL + Flyway | Banco de dados e migrations |
| JWT (`java-jwt`) | Geração e validação de tokens |
| Spring Mail + Thymeleaf | E-mails transacionais com templates HTML |
| Lombok + MapStruct | Redução de boilerplate |
| Maven | Build e dependências |

### Frontend
| Tecnologia | Descrição |
|---|---|
| React 19 | Biblioteca de UI |
| Vite | Bundler e servidor de desenvolvimento |
| Fetch API | Requisições HTTP com `credentials: "include"` |
| Tiptap | Editor rich text |
| DOMPurify | Sanitização de HTML |
| npm | Gerenciador de pacotes |

---

## 📋 Pré-requisitos

- **Java 21**
- **Maven 3.9+**
- **MySQL 8+**
- **Node.js 18+ (LTS)**
- Conta **SMTP** para envio de e-mails (Gmail recomendado com App Password)
- Credenciais OAuth2 do **Google** e/ou **GitHub** (opcional)

---

## ⚙️ Configuração do Ambiente

### 1. Crie o arquivo `.env` na pasta `backend/`

```env
# Banco de Dados
DB_URL=jdbc:mysql://localhost:3306/todolist
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha

# E-mail (Gmail)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=seu_email@gmail.com
MAIL_PASSWORD=sua_app_password   # App Password, não a senha normal
MAIL_FROM=seu_email@gmail.com

# JWT
JWT_SECRET=chave_longa_e_segura
JWT_EXPIRATION_MINUTES=15
JWT_REFRESH_EXPIRATION_DAYS=7
JWT_CONFIRMATION_EXPIRATION_HOURS=24

# URL do Frontend
APP_URL=http://localhost:5173

# OAuth2 — Google
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret

# OAuth2 — GitHub
GITHUB_CLIENT_ID=seu_github_client_id
GITHUB_CLIENT_SECRET=seu_github_client_secret
```

### 2. Configurar OAuth2 no Google

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto → **Credenciais → ID do cliente OAuth → Aplicativo da Web**
3. URI de redirecionamento autorizado: `http://localhost:8080/login/oauth2/code/google`
4. Copie o Client ID e Client Secret para o `.env`

### 3. Configurar OAuth2 no GitHub

1. **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**
2. Authorization callback URL: `http://localhost:8080/login/oauth2/code/github`
3. Copie o Client ID e Client Secret para o `.env`

---

## 🚀 Como Executar

### Backend

```bash
cd backend
mvn spring-boot:run
```

API disponível em `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend disponível em `http://localhost:5173`

---

## 📡 Documentação da API

### Usuários — `/v1/users`

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/register` | Cadastra novo usuário | ❌ |
| `GET` | `/account-confirmation?token=` | Confirma conta via e-mail | ❌ |
| `POST` | `/resend-confirmation` | Reenvia e-mail de confirmação | ❌ |
| `POST` | `/login` | Login e retorna access + refresh token | ❌ |
| `POST` | `/refresh` | Renova tokens via refresh token | ❌ |
| `POST` | `/forgot-password` | Envia link de recuperação de senha | ❌ |
| `POST` | `/reset-password` | Redefine a senha com token | ❌ |

### Login Social — OAuth2

| Rota | Descrição |
|---|---|
| `/oauth2/authorization/google` | Inicia fluxo OAuth2 com Google |
| `/oauth2/authorization/github` | Inicia fluxo OAuth2 com GitHub |

> Após autenticação, redireciona para `{APP_URL}/oauth2/callback` com tokens em Cookies HttpOnly.

### Categorias — `/v1/categories` 🔒

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/` | Cria categoria |
| `GET` | `/` | Lista categorias do usuário |
| `GET` | `/{title}` | Busca por título |
| `PATCH` | `/{id}` | Atualiza categoria |
| `DELETE` | `/{id}` | Remove categoria |

### Tarefas — `/v1/tasks` 🔒

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/` | Cria tarefa |
| `GET` | `/?done={true\|false}` | Lista por status |
| `GET` | `/title/{title}` | Busca por título |
| `GET` | `/category/{id}` | Lista por categoria |
| `PATCH` | `/{id}` | Atualiza tarefa |
| `PATCH` | `/complete/{id}` | Marca como concluída |
| `DELETE` | `/{id}` | Remove tarefa |

> 🔒 Requer `Authorization: Bearer` (login local) ou Cookie `accessToken` (login social).

---

## 📁 Estrutura do Projeto

```
todo-list/
├── backend/
│   ├── src/main/java/br/com/todolist/
│   │   ├── controller/        # Endpoints REST
│   │   ├── service/           # Lógica de negócio
│   │   ├── repository/        # Acesso ao banco
│   │   ├── model/             # Entidades JPA
│   │   ├── dto/               # Requests e Responses
│   │   ├── mapper/            # MapStruct
│   │   ├── enums/             # UserRole, AuthProvider, EmailType, ErrorCode
│   │   ├── exception/         # GlobalExceptionHandler, BusinessException
│   │   └── infra/
│   │       ├── security/      # JWT, SecurityConfig, SecurityFilter, UserDetailsImpl
│   │       ├── oauth2/        # CustomOAuth2UserService, OAuth2SuccessHandler, OAuth2UserPrincipal
│   │       └── email/         # EmailService + templates Thymeleaf
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   ├── db/migration/      # V1__initial_schema.sql
│   │   └── templates/email/   # account-confirmation, password-reset, password-changed
│   └── pom.xml
├── frontend/
│   ├── src/App.jsx
│   ├── vite.config.js
│   └── package.json
├── requisicoes-postman/
├── .env.example
└── .gitignore
```

---

<div align="center">
  <sub>Desenvolvido por <a href="https://github.com/raquelrleite">@raquelrleite</a></sub>
</div>