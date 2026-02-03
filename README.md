# Umbra AI

**Plataforma completa de criação de conteúdo com inteligência artificial para marketing digital.**

Umbra AI é uma solução all-in-one que combina múltiplos agentes especializados para gerar conteúdo de alta qualidade, analisar dados de mercado e otimizar estratégias digitais.

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura](#-arquitetura)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Uso](#-uso)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Agentes](#-agentes)

---

## 🎯 Visão Geral

A **Umbra AI** é uma plataforma SaaS que utiliza múltiplos agentes de IA especializados para automatizar e otimizar a criação de conteúdo digital. Com foco em marketing, a plataforma oferece desde a criação de posts para redes sociais até análise de mercado em tempo real.

### Principais Diferenciais

- **Sistema Multi-Agente**: Agentes especializados para diferentes tipos de conteúdo
- **Agente Interceptador**: Roteamento inteligente de requisições
- **Base de Conhecimento**: RAG (Retrieval-Augmented Generation) personalizada
- **Análise em Tempo Real**: Integração com pesquisa web (DuckDuckGo)
- **Interface Moderna**: UI desenvolvida com Next.js e Tailwind CSS

---

## 🏗 Arquitetura

```
umbra-ai/
├── frontend/          # Next.js + React (Interface)
│   ├── src/
│   │   ├── app/           # Rotas e páginas
│   │   ├── components/    # Componentes reutilizáveis
│   │   └── lib/           # Utilitários e configs
│   └── public/            # Assets estáticos
│
└── backend/           # FastAPI (Servidor de IA)
    ├── agents/            # Agentes especializados
    ├── knowledge_base/    # Sistema RAG
    ├── agent.py           # Agente Interceptador
    └── main.py            # Server FastAPI
```

### Stack Tecnológico

**Frontend:**
- Next.js 16.1.5
- React 19.2.3
- TypeScript
- Tailwind CSS 4
- Supabase (Auth + Database)
- Three.js (Visualizações 3D)

**Backend:**
- FastAPI
- Python 3.x
- Agno Framework
- OpenAI GPT-4o / GPT-4o-mini
- PostgreSQL (via Supabase)
- DuckDuckGo Search API

---

## ✨ Funcionalidades

### 1. **Dashboard**
- Visão geral da conta
- Estatísticas de uso
- Atalhos rápidos

### 2. **Estratégia**

#### Produtos
Cadastro de produtos, serviços ou infoprodutos que serão promovidos.

#### Públicos
Definição de públicos-alvo e avatares para personalização de conteúdo.

#### Especialistas
Cadastro de personas/autores que assinam o conteúdo (tom de voz, arquétipo).

### 3. **Criação de Conteúdo**

#### Copy Center
**Agente:** `ContentAgent`  
**Função:** Criar posts, legendas e artigos para redes sociais.  
**Rota:** `/dashboard/copy-center`

#### Gerador de UGC
**Agente:** `UGCAgent`  
**Função:** Roteiros para vídeos virais (TikTok/Reels).  
**Rota:** `/dashboard/generator/ugc`

#### Anúncios Estáticos
**Agente:** `StaticAdAgent`  
**Função:** Copy para anúncios de imagem.  
**Rota:** `/dashboard/generator/static`

#### Email Marketing
**Agente:** `EmailAgent`  
**Função:** Campanhas de email e newsletters.  
**Rota:** `/dashboard/generator/email`

#### Mensagens Diretas
**Agente:** `MessageAgent`  
**Função:** Scripts para DM, WhatsApp ou respostas a comentários.  
**Rota:** `/dashboard/generator/messages`

### 4. **Inteligência**

#### Cérebro (Brain)
**Rota:** `/dashboard/brain`  
**Função:** Upload de documentos (PDF, DOCX) para treinar a IA com a voz e conhecimento do usuário.

#### Analytics
**Agente:** `AnalyticsAgent`  
**Rota:** `/dashboard/analytics`  
**Função:** Análise de dados e pesquisa web em tempo real.

### 5. **Chat IA**

**Agente:** `InterceptorAgent` (Router)  
**Interface:** Popup flutuante (canto inferior direito)  
**Função:**
- Responder dúvidas sobre a plataforma
- Rotear requisições para agentes especializados
- Executar tarefas rápidas
- Redirecionar para ferramentas complexas

---

## 🛠 Tecnologias

### Frontend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Next.js | 16.1.5 | Framework React |
| React | 19.2.3 | UI Library |
| TypeScript | 5.x | Type Safety |
| Tailwind CSS | 4.x | Styling |
| Supabase | 2.93.1 | Auth + Database |
| Three.js | 0.182.0 | 3D Graphics |
| Framer Motion | 12.29.2 | Animations |

### Backend

| Tecnologia | Uso |
|------------|-----|
| FastAPI | REST API Server |
| Agno | Multi-Agent Framework |
| OpenAI | GPT-4o, GPT-4o-mini |
| DuckDuckGo | Web Search Tool |
| PostgreSQL | Database (via Supabase) |
| SQLAlchemy | ORM |
| pgvector | Vector Storage |

---

## 📦 Instalação

### Pré-requisitos

- Node.js 20+
- Python 3.10+
- npm ou yarn
- Conta Supabase
- Chave API OpenAI

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/umbra-ai.git
cd umbra-ai
```

### 2. Configure o Frontend

```bash
cd frontend
npm install
```

Crie o arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_supabase
```

### 3. Configure o Backend

```bash
cd ../backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

Crie o arquivo `.env`:

```env
OPENAI_API_KEY=sua_chave_openai
```

---

## ⚙️ Configuração

### Banco de Dados (Supabase)

O projeto utiliza o Supabase com PostgreSQL 17.6. Abaixo está o esquema completo das tabelas:

#### Tabela `profiles` (Perfis de Usuários)
- **RLS:** Habilitado
- **Colunas principais:**
  - `id` (uuid, PK) → FK para `auth.users.id`
  - `username` (text, unique, min 3 chars)
  - `full_name` (text)
  - `avatar_url` (text)
  - `website` (text)
  - `subscription_tier` (text, default: 'starter')
  - `cpf_cnpj` (text)
  - `birth_date` (date)
  - `phone` (text)
  - `address_*` (text) - CEP, rua, número, complemento, bairro, cidade, estado
  - `bio` (text)
  - `updated_at` (timestamptz)

#### Tabela `products` (Produtos/Serviços)
- **RLS:** Habilitado
- **Colunas principais:**
  - `id` (uuid, PK)
  - `user_id` (uuid) → FK para `auth.users.id`
  - `name` (text, obrigatório)
  - `type` (text) - Tipo do produto
  - `description` (text)
  - `target_audience` (text)
  - `unique_selling_points` (jsonb)
  - `price_range` (text)
  - `created_at` (timestamptz)

#### Tabela `experts` (Especialistas/Personas)
- **RLS:** Habilitado
- **Colunas principais:**
  - `id` (uuid, PK)
  - `user_id` (uuid) → FK para `auth.users.id`
  - `name` (text, obrigatório)
  - `occupation` (text)
  - `bio` (text)
  - `archetype` (text)
  - `tone_of_voice` (text)
  - `writing_style` (text)
  - `expertise_areas` (jsonb)
  - `avatar_url` (text)
  - `created_at` (timestamptz)

#### Tabela `audiences` (Públicos-Alvo)
- **RLS:** Habilitado
- **Colunas principais:**
  - `id` (uuid, PK)
  - `user_id` (uuid) → FK para `auth.users.id`
  - `name` (text, obrigatório)
  - `demographics` (jsonb)
  - `interests` (jsonb)
  - `pain_points` (jsonb)
  - `aspirations` (jsonb)
  - `platforms` (jsonb)
  - `created_at` (timestamptz)

#### Tabela `campaigns` (Campanhas)
- **RLS:** Habilitado
- **Colunas principais:**
  - `id` (uuid, PK)
  - `user_id` (uuid) → FK para `auth.users.id`
  - `name` (text, obrigatório)
  - `product_id` (uuid) → FK para `products.id`
  - `audience_id` (uuid) → FK para `audiences.id`
  - `expert_id` (uuid) → FK para `experts.id`
  - `objective` (text)
  - `status` (text, default: 'active')
  - `created_at` (timestamptz)

#### Tabela `generated_content` (Conteúdo Gerado)
- **RLS:** Habilitado
- **Colunas principais:**
  - `id` (uuid, PK)
  - `user_id` (uuid) → FK para `auth.users.id`
  - `campaign_id` (uuid, nullable) → FK para `campaigns.id`
  - `type` (text) - Tipo de conteúdo (post, email, ugc, etc.)
  - `title` (text)
  - `content` (jsonb) - Conteúdo estruturado
  - `created_at` (timestamptz)

**Observações:**
- Todas as tabelas possuem RLS (Row Level Security) habilitado
- O projeto está na região `us-west-2`
- PostgreSQL versão: `17.6.1.063`
- Status: `ACTIVE_HEALTHY`

### Variáveis de Ambiente

**Frontend (`.env.local`):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

**Backend (`.env`):**
```env
OPENAI_API_KEY=sk-...
```

---

## 🚀 Uso

### Desenvolvimento

**Frontend:**
```bash
cd frontend
npm run dev
```
Acesse: `http://localhost:3000`

**Backend:**
```bash
cd backend
python -m uvicorn main:app --reload
```
API disponível em: `http://localhost:8000`

### Produção

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

**Backend:**
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 📁 Estrutura do Projeto

```
umbra-ai/
├── frontend/
│   ├── src/
│   │   ├── app/                    # Rotas Next.js (App Router)
│   │   │   ├── dashboard/          # Área autenticada
│   │   │   │   ├── analytics/      # Página de Analytics
│   │   │   │   ├── brain/          # Knowledge Base UI
│   │   │   │   ├── copy-center/    # Editor de conteúdo
│   │   │   │   ├── experts/        # CRUD Especialistas
│   │   │   │   ├── products/       # CRUD Produtos
│   │   │   │   ├── audiences/      # CRUD Públicos
│   │   │   │   └── generator/      # Ferramentas de geração
│   │   │   ├── auth/               # Callback Supabase
│   │   │   └── login/              # Página de login
│   │   ├── components/
│   │   │   ├── auth/               # Auth Context
│   │   │   ├── chat/               # AI Chatbox
│   │   │   ├── dashboard/          # Componentes do dashboard
│   │   │   ├── landing/            # Landing page
│   │   │   ├── layout/             # Layout (Sidebar, Navbar)
│   │   │   └── ui/                 # Componentes UI reutilizáveis
│   │   ├── lib/
│   │   │   ├── supabase.ts         # Cliente Supabase
│   │   │   └── utils.ts            # Utilities
│   │   └── hooks/                  # React Hooks customizados
│   └── public/                     # Assets estáticos
│
├── backend/
│   ├── agents/                     # Agentes especializados
│   │   ├── analytics_agent.py      # Análise + Web Search
│   │   ├── brain_agent.py          # RAG Knowledge Base
│   │   ├── content_agent.py        # Posts/Artigos
│   │   ├── email_agent.py          # Email Marketing
│   │   ├── message_agent.py        # Mensagens DM
│   │   ├── static_ad_agent.py      # Anúncios
│   │   └── ugc_agent.py            # UGC Scripts
│   ├── knowledge_base/             # Sistema RAG
│   │   └── core.py                 # KB Core Logic
│   ├── agent.py                    # Interceptor Agent (Router)
│   ├── main.py                     # FastAPI App
│   └── requirements.txt            # Dependências Python
│
└── supabase/                       # Configs Supabase
```

---

## 🤖 Agentes

### 1. **Interceptor Agent** (`agent.py`)

**Modelo:** GPT-4o  
**Função:** Agente principal que:
- Classifica a intenção do usuário
- Roteia para agentes especializados
- Responde dúvidas sobre a plataforma
- Sugere navegação para ferramentas complexas

**Ferramentas:**
- `run_content_agent()`
- `run_analytics_agent()`
- `run_ugc_agent()`

**Endpoint:** `/api/chat`

---

### 2. **Content Agent** (`content_agent.py`)

**Modelo:** GPT-4o-mini  
**Função:** Geração de conteúdo para redes sociais.  
**RAG:** Usa `get_knowledge_base(user_id)` para adaptar ao estilo do usuário.  
**Ferramentas:** DuckDuckGo Search  
**Endpoint:** `/api/content`

---

### 3. **Analytics Agent** (`analytics_agent.py`)

**Modelo:** GPT-4o  
**Função:** Pesquisa web e análise de dados em tempo real.  
**Contexto:** Injeção automática da data atual.  
**Ferramentas:** DuckDuckGo Search  
**Endpoint:** `/api/analytics`

---

### 4. **UGC Agent** (`ugc_agent.py`)

**Função:** Criação de roteiros para vídeos virais (TikTok/Reels).  
**Formato de Saída:** JSON estruturado.  
**Endpoint:** `/api/ugc`

---

### 5. **Static Ad Agent** (`static_ad_agent.py`)

**Função:** Copy para anúncios de imagem.  
**Endpoint:** `/api/static-ad`

---

### 6. **Email Agent** (`email_agent.py`)

**Função:** Campanhas de email marketing.  
**Endpoint:** `/api/email`

---

### 7. **Message Agent** (`message_agent.py`)

**Função:** Scripts para mensagens diretas.  
**Endpoint:** `/api/message`

---

### 8. **Brain Agent** (`brain_agent.py`)

**Função:** RAG (Retrieval-Augmented Generation) com base de conhecimento do usuário.  
**Upload:** `/api/brain/upload`  
**Query:** `/api/brain/query`

---

## 📝 Licença

Este projeto é proprietário e confidencial.

---

## 👥 Autores

Desenvolvido por **Guilherme Miranda** e **@utopia.solutions**.

---

## 📧 Contato

Para mais informações, entre em contato através do dashboard da plataforma.
