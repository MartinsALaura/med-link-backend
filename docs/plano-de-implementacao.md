# Plano de Implementação — MedLink Backend

> Plano ordenado para construir a API a partir do esqueleto atual (Express + TypeScript, estrutura em camadas `routes → controllers → services → models`).
> As fases são sequenciais: cada fase só depende do que já foi construído nas anteriores.

## Visão geral da ordem de construção

1. **Fase 0** — Dependências
2. **Fase 1** — Infraestrutura (conexão MySQL, env, utilitários de erro e base64)
3. **Fase 2** — Autenticação (tabela `users`, register, login, middleware JWT)
4. **Fase 3** — Usuários (CRUD de perfil + ações de admin)
5. **Fase 4** — Doações (fluxo central)
6. **Fase 5** — Parceiros (pontos de retirada, usados na triagem)
7. **Fase 6** — Solicitações (depende de doações e usuários)
8. **Fase 7** — Schema SQL e verificação de build

---

## Fase 0 — Dependências

```bash
npm install mysql2 bcrypt jsonwebtoken zod
npm install -D @types/bcrypt @types/jsonwebtoken
```

- `mysql2` — driver MySQL (pool de conexões com Promises)
- `bcrypt` — hash de senha
- `jsonwebtoken` — geração/validação de JWT
- `zod` — validação de payload das requisições

---

## Fase 1 — Infraestrutura

| Arquivo | Ação | Conteúdo |
|---|---|---|
| `src/config/env.ts` | modificar | adicionar `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `JWT_EXPIRES_IN` |
| `src/config/db.ts` | novo | pool `mysql2/promise`, exporta `pool` |
| `src/utils/AppError.ts` | novo | classe de erro com `message` + `statusCode` |
| `src/utils/base64.ts` | novo | `base64ToBuffer` e `bufferToBase64` (único ponto de conversão BLOB ↔ base64) |
| `src/utils/asyncHandler.ts` | novo | encapsula controllers async para propagar erros ao `errorHandler` |
| `src/middlewares/errorHandler.ts` | modificar | tratar `ZodError` (→ 400) e usar a classe `AppError` |

---

## Fase 2 — Autenticação

Arquivos: `models/userModel.ts`, `services/authService.ts`, `middlewares/auth.ts`, `middlewares/requireRole.ts`, `types/express.d.ts`, `controllers/authController.ts`, `routes/authRoutes.ts`.

- **register** — valida CPF/e-mail únicos (409 se duplicado), faz hash da senha (bcrypt), converte documento de identidade base64 → Buffer. Novo usuário entra com `role = USER` e `status = ativo`.
- **login** — valida credenciais, recusa se `status = bloqueado` (403), assina JWT `{ sub: id, role }`.
- **GET /auth/me** — retorna usuário atual (sem `password_hash`, blobs como base64).
- **middleware `auth`** — extrai `Authorization: Bearer`, valida JWT, popula `req.user = { id, role }`.
- **middleware `requireRole(...roles)`** — controle de acesso por papel.

---

## Fase 3 — Usuários

Arquivos: `services/userService.ts`, `controllers/usersController.ts`, `routes/usersRoutes.ts`.

| Método | Rota | Acesso |
|---|---|---|
| GET | `/users` | ADMIN |
| GET | `/users/:id` | autenticado |
| PUT | `/users/:id` | dono |
| PATCH | `/users/:id/password` | dono |
| PATCH | `/users/:id/status` | ADMIN |

- Listagem **não** seleciona colunas BLOB; detalhe seleciona e converte para base64.

---

## Fase 4 — Doações

Arquivos: `models/donationModel.ts`, `services/donationService.ts`, `controllers/donationsController.ts`, `routes/donationsRoutes.ts`.

Regras de negócio (no service):
- `expiration_date` não pode estar no passado (422)
- `sealed` e `original_packaging` devem ser `true`
- Máquina de estado: `pendente → aprovado | recusado`, `aprovado → concluido`
- Ao aprovar, `pickupPointId` é **obrigatório** no corpo (resolve o item em aberto da decisão de triagem); o parceiro deve existir e estar `ativo`

| Método | Rota | Acesso |
|---|---|---|
| POST | `/donations` | autenticado |
| GET | `/donations` | autenticado (filtros `status`, `search`) |
| GET | `/donations/:id` | autenticado |
| PATCH | `/donations/:id/status` | PROFESSIONAL/ADMIN |
| PUT | `/donations/:id` | ADMIN |
| DELETE | `/donations/:id` | doador (dono) |

---

## Fase 5 — Parceiros

Arquivos: `models/partnerModel.ts`, `services/partnerService.ts`, `controllers/partnersController.ts`, `routes/partnersRoutes.ts`.

- `POST /partners` é público; entra com `status = pendente`.
- `GET /partners` retorna parceiros com `latitude`/`longitude` para o mapa.
- Valida CNPJ único (409).

---

## Fase 6 — Solicitações

Arquivos: `models/requestModel.ts`, `services/requestService.ts`, `controllers/requestsController.ts`, `routes/requestsRoutes.ts`.

Regras de negócio (no service):
- Só é possível solicitar doação com `status = aprovado` (422 caso contrário)
- Cancelamento: `agora - requested_at <= 5h`; senão **403** com `"O prazo de 5 horas para cancelamento já expirou."`
- Máquina de estado: `pendente → aprovado | recusado`, `aprovado → entregue`

| Método | Rota | Acesso |
|---|---|---|
| POST | `/requests` | autenticado |
| GET | `/requests` | autenticado (próprias) |
| GET | `/requests/:id` | dono/admin |
| PATCH | `/requests/:id/status` | PROFESSIONAL/ADMIN |
| DELETE | `/requests/:id` | dono (janela de 5h) |

---

## Fase 7 — Schema SQL e build

- Criar `src/config/schema.sql` com as tabelas `users`, `partners`, `donations`, `requests` (BLOBs como `MEDIUMBLOB`/`LONGBLOB`, enums e FKs conforme `modelo-de-dados.md`).
- `npm run build` deve compilar sem erros.

---

## Padrões transversais

| Tema | Regra |
|---|---|
| Mensagens de erro | Português (Brasil) |
| Código e comentários | Inglês |
| Colunas no banco | `snake_case`; DTOs em `camelCase`. O mapeamento vive **apenas** na camada model |
| BLOB | `base64ToBuffer` na entrada, `bufferToBase64` na saída — nunca expor `Buffer` na resposta HTTP |
| Endpoints de listagem | Nunca selecionam colunas BLOB |
| Formato de erro | `{ "error": "Mensagem." }` (+ `details` para erros Zod) |
| Códigos HTTP | 201 criado · 204 delete · 400 validação · 401 não autenticado · 403 proibido · 404 não encontrado · 409 conflito · 422 regra de negócio · 500 servidor |

### Ordem de implementação dentro de cada entidade

1. Model (SQL) → 2. Service (regras) → 3. Controller (Zod + handlers finos) → 4. Routes → 5. Montar em `routes/index.ts`.

---

## Resumo de arquivos

**Novos (~22):** `config/db.ts`, `config/schema.sql`, `types/express.d.ts`, `utils/{AppError,base64,asyncHandler}.ts`, `middlewares/{auth,requireRole}.ts`, `models/{user,donation,request,partner}Model.ts`, `services/{auth,user,donation,request,partner}Service.ts`, `controllers/{auth,users,donations,requests,partners}Controller.ts`, `routes/{auth,users,donations,requests,partners}Routes.ts`.

**Modificados (3):** `config/env.ts`, `middlewares/errorHandler.ts`, `routes/index.ts`.
