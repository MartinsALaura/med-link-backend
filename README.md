# Med Link — Backend API

API backend para o aplicativo mobile Med Link, construída com Node.js e TypeScript.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js |
| Linguagem | TypeScript |
| Frontend (mobile) | Angular |
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

## Banco de Dados

**MySQL** foi escolhido como banco de dados relacional principal, pela familiaridade da equipe com a tecnologia.

| Dado | Solução |
|---|---|
| Usuários, consultas, registros médicos | MySQL |
| Fotos, exames, PDFs | A definir — serviço de object storage (URL salva no MySQL) |

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
