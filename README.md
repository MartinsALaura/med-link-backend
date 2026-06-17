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
| Backend (API) | Node.js + TypeScript |
| Banco de dados | MySQL |
| Armazenamento de arquivos | A definir |

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
| Usuários, consultas, registros médicos | MySQL |
| Fotos, exames, PDFs | A definir — serviço de object storage (URL salva no MySQL) |

---

## Estrutura do Projeto

```
src/
├── config/         # Variáveis de ambiente e configurações globais
├── controllers/    # Handlers das requisições HTTP
├── middlewares/    # Middlewares (auth, erros, validação)
├── models/         # Tipos, interfaces e entidades do domínio
├── routes/         # Definição das rotas da API
├── services/       # Regras de negócio
└── index.ts        # Entrypoint da aplicação
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

## Como rodar

```bash
npm install
npm run dev
```

## Como compilar

```bash
npm run build
npm start
```
