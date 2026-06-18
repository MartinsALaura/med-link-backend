# MedLink — Backend API

> Projeto Integrador – Sistema Mobile  
> Universidade do Vale do Rio dos Sinos (UNISINOS) — Curso de Sistemas para Internet  
> São Leopoldo/RS  
> **Equipe:** Luana Hedlund de Bona · Renata da Silva · Laura Alves Martins

---

## Visão Geral

O **MedLink** é um aplicativo mobile que funciona como uma **farmácia comunitária digital**, conectando pessoas que desejam doar medicamentos a pessoas que precisam deles.

A plataforma organiza o processo de doação de forma segura e controlada: não há contato direto entre doador e beneficiário. A retirada é realizada em **pontos físicos autorizados**, com triagem feita por profissionais de saúde.

---

## Problema

O acesso a medicamentos é um dos principais desafios para populações vulneráveis no Brasil:

- Alto custo de medicamentos leva à interrupção de tratamentos
- Falta de disponibilidade em farmácias e no SUS
- Burocracia para acesso via Estado (longas esperas)
- Medicamentos sobram em residências e expiram sem uso
- Descarte incorreto gera impactos ambientais

### Impactos sociais

- Agravamento de doenças por falta de medicação contínua
- Retorno frequente e desnecessário a serviços de saúde
- Uso inadequado de medicamentos
- Baixa qualidade de vida de pacientes crônicos

---

## Solução

Aplicativo mobile que conecta:

- Pessoas que querem **doar** medicamentos
- Pessoas que **precisam** de medicamentos

**Diferencial:** organização digital, intermediação segura, triagem por profissional da saúde e retirada em pontos físicos confiáveis.

---

## Funcionalidades

| # | Funcionalidade |
|---|---|
| 1 | Cadastro e login de usuários |
| 2 | Busca de medicamentos por nome, princípio ativo ou localização |
| 3 | Visualização de detalhes (validade, quantidade, ponto de retirada) |
| 4 | Solicitação de medicamentos com envio de receita médica |
| 5 | Doação guiada com checklist de segurança |
| 6 | Acompanhamento do status do pedido |
| 7 | Mapa com pontos de retirada autorizados |
| 8 | Perfil do usuário |
| 9 | Área administrativa |

---

## Telas do Aplicativo

- Início
- Login
- Cadastro
- Medicamentos
- Detalhes do medicamento
- Doar medicamento
- Contato
- Parceiros
- Perfil
- Configurações
- Ajuda
- Admin

---

## Regras de Segurança

- Verificação da validade dos medicamentos
- Exigência de embalagem original
- Armazenamento adequado nos pontos físicos
- Triagem por profissional da saúde na retirada
- Obrigatoriedade de receita médica para solicitação

---

## Público-Alvo

### Beneficiários
- Pessoas de baixa renda
- Pacientes com doenças crônicas
- Usuários do sistema público de saúde (SUS)
- Indivíduos com dificuldade de acesso a medicamentos

### Doadores
- Pessoas com medicamentos não utilizados
- Famílias com sobras de tratamentos médicos

### Profissionais e Parceiros
- Farmacêuticos
- Técnicos em farmácia
- Instituições de saúde

---

## Validação da Ideia

Foram realizadas entrevistas com:
- 1 beneficiário
- 1 doador
- 1 farmacêutica
- 1 técnica em farmácia

**Resultados:**
- Todos conhecem casos de falta de acesso ou desperdício
- Profissionais destacaram a importância do controle sanitário
- Alta aceitação da proposta e interesse real de uso

---

## Análise de Mercado

Soluções atuais são limitadas e desorganizadas:
- Farmácias solidárias com alcance reduzido
- Doações informais sem controle
- Ausência de solução digital ampla e segura no Brasil

**Oportunidade:** criar uma solução escalável, acessível e com controle sanitário.

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Mobile (frontend) | Ionic + Angular |
| Backend (API) | Node.js + TypeScript + Express |
| Banco de dados | MySQL (driver `mysql2`) |
| Autenticação | JWT (`jsonwebtoken`) + hash de senha (`bcrypt`) |
| Validação | Zod |
| Documentação da API | OpenAPI 3 + Swagger UI |
| Testes | Jest + ts-jest |
| Armazenamento de arquivos | BLOB no MySQL (MEDIUMBLOB/LONGBLOB) |

## Por que Node.js + TypeScript (sem framework)?

### Vantagens

**Controle total da arquitetura**
Sem um framework opinativo como NestJS, a estrutura do projeto é definida conforme as necessidades reais da aplicação, sem camadas ou abstrações desnecessárias.

**Leveza e simplicidade**
Menos dependências, menos configuração, menos overhead. O código resultante é mais direto e fácil de entender por qualquer desenvolvedor Node.js.

**TypeScript compartilhado com o Angular**
O Angular já utiliza TypeScript nativamente. Com o backend em TypeScript também, é possível compartilhar tipos, interfaces e contratos de API entre frontend e backend, reduzindo erros de integração.

**Flexibilidade na escolha de bibliotecas**
É possível escolher exatamente as bibliotecas certas para cada responsabilidade (ex: Fastify ou Express para rotas, Zod para validação, Prisma para ORM), em vez de depender do que o framework impõe.

**Performance**
Node.js tem excelente desempenho para APIs com I/O intensivo (requisições de banco de dados, chamadas externas), que é o padrão de uso de um backend para app mobile.

**Ecossistema npm maduro**
Acesso a um dos maiores ecossistemas de pacotes do mundo, com soluções para autenticação, validação, documentação (OpenAPI), testes e muito mais.

### Trade-offs conhecidos

- A estrutura precisa ser definida e mantida manualmente (sem scaffolding automático do framework).
- Requer disciplina de arquitetura para manter o projeto organizado conforme cresce.

---

## Banco de Dados

**MySQL** foi escolhido como banco de dados relacional principal, pela familiaridade da equipe com a tecnologia.

| Dado | Solução |
|---|---|
| Usuários, doações, solicitações, parceiros | MySQL |
| Fotos, documentos (RG/CNH), bulas em PDF | BLOB no próprio MySQL (ver [docs/decisoes-tecnicas.md](docs/decisoes-tecnicas.md), decisão 10) |

---

## Estrutura do Projeto

```
src/
├── config/         # env, conexão MySQL (db.ts), schema.sql, setup-user.sql
├── controllers/    # Handlers das requisições HTTP (validação com Zod)
├── docs/           # Especificação OpenAPI (Swagger)
├── middlewares/    # auth (JWT), requireRole, errorHandler
├── models/         # Acesso a dados (SQL) e tipos do domínio
├── routes/         # Definição das rotas da API
├── services/       # Regras de negócio
├── types/          # Augmentações de tipos (ex: Express.Request.user)
├── utils/          # AppError, conversão base64, asyncHandler
└── index.ts        # Entrypoint da aplicação

tests/              # Testes unitários (Jest)
```

Fluxo de camadas: `routes → controllers → services → models`

---

## Divisão da Equipe

| Membro | Responsabilidades |
|---|---|
| Renata | Questionários, entrevistas e validação |
| Luana | Slides, protótipos e front-end |
| Laura | Back-end, revisão de código e funcionamento |

---

## Desafios do Projeto

- Adequação às normas da ANVISA
- Estrutura física para armazenamento dos medicamentos
- Estabelecimento de parcerias com pontos de retirada
- Garantia de segurança e confiabilidade dos medicamentos
- Confiança dos usuários na plataforma

---

## Cronograma

| Semanas | Etapa |
|---|---|
| 1–2 | Definição do tema |
| 3–4 | Pesquisa e entrevistas |
| 5–6 | Definição de requisitos |
| 7–8 | Protótipos e front-end |
| 9–10 | Back-end |
| 11 | Testes e ajustes |
| 12 | Entrega |

---

## Configuração e Execução

### Pré-requisitos

- Node.js 18+ e npm
- MySQL 8+ em execução

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e ajuste os valores conforme o seu ambiente:

```bash
cp .env.example .env
```

| Variável | Descrição | Padrão |
|---|---|---|
| `PORT` | Porta do servidor HTTP | `3000` |
| `NODE_ENV` | Ambiente de execução | `development` |
| `DB_HOST` | Host do MySQL | `localhost` |
| `DB_PORT` | Porta do MySQL | `3306` |
| `DB_USER` | Usuário do banco | `medlink` |
| `DB_PASSWORD` | Senha do banco | — |
| `DB_NAME` | Nome do banco | `medlink` |
| `JWT_SECRET` | Segredo para assinar os tokens JWT | — |
| `JWT_EXPIRES_IN` | Validade do token | `7d` |

> Se a senha contiver caracteres especiais (ex: `#`), coloque-a entre aspas no `.env`.

### 3. Criar o banco de dados

Crie o banco e um usuário dedicado (rode como root/admin do MySQL):

```bash
sudo mysql --defaults-file=/etc/mysql/debian.cnf < src/config/setup-user.sql
```

Em seguida, crie as tabelas a partir do schema:

```bash
mysql -u medlink -p medlink < src/config/schema.sql
```

> Ajuste o usuário/senha em `src/config/setup-user.sql` antes de rodar. As tabelas e seus campos estão documentados em [docs/modelo-de-dados.md](docs/modelo-de-dados.md).

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

O servidor sobe em `http://localhost:3000`. Verifique com `GET /api/health`.

### 5. Compilar e rodar em produção

```bash
npm run build
npm start
```

---

## Documentação da API

- **Swagger UI (interativo):** `http://localhost:3000/api/docs`
- **Especificação OpenAPI (JSON):** `http://localhost:3000/api/openapi.json`
- **Referência em Markdown:** [docs/endpoints.md](docs/endpoints.md)

A autenticação usa JWT no header `Authorization: Bearer <token>`. No Swagger UI, use o botão **Authorize** para enviar o token nas requisições protegidas.

---

## Testes

Testes unitários com Jest cobrindo as regras de negócio dos services (validações, máquinas de estado, janela de cancelamento de 5h, controle de acesso) e utilitários.

```bash
npm test           # roda toda a suíte
npm run test:watch # modo watch
```

---

## Documentação Complementar

| Documento | Conteúdo |
|---|---|
| [docs/plano-de-implementacao.md](docs/plano-de-implementacao.md) | Plano de implementação em fases |
| [docs/modelo-de-dados.md](docs/modelo-de-dados.md) | Entidades, ER e máquinas de estado |
| [docs/endpoints.md](docs/endpoints.md) | Referência de todos os endpoints |
| [docs/fluxos.md](docs/fluxos.md) | Fluxos do sistema (sequência) |
| [docs/decisoes-tecnicas.md](docs/decisoes-tecnicas.md) | Decisões técnicas e justificativas |
