# Endpoints da API

Base URL: `/api`

**Legenda de status:**
- ✅ Implementado
- 📋 Planejado (derivado da análise do protótipo — ver [analise-prototipo.md](analise-prototipo.md))

> Todo endpoint novo ou alterado deve ser refletido aqui imediatamente.

---

## Geral

### ✅ GET /api/health

Verifica se o servidor está no ar.

**Autenticação:** não requerida

**Resposta — 200**
```json
{ "status": "ok" }
```

---

## Autenticação · ✅

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Cadastra um novo usuário | Não |
| POST | `/api/auth/login` | Autentica e retorna o token JWT | Não |
| GET | `/api/auth/me` | Dados do usuário autenticado | Sim |

**POST /api/auth/register** — corpo (campos da tela de cadastro):
```json
{
  "name": "Ana Silva",
  "cpf": "000.000.000-00",
  "birthDate": "1990-05-12",
  "phone": "(51) 99999-8888",
  "email": "ana@email.com",
  "password": "senha123",
  "cep": "93000-000",
  "address": "Rua das Flores",
  "number": "123",
  "complement": "Apto 4",
  "neighborhood": "Centro",
  "city": "São Leopoldo",
  "state": "RS",
  "susCardNumber": "123456789012345"
}
```
> O documento de identidade (RG/CNH) é enviado via upload — ver seção **Arquivos**.

**POST /api/auth/login** — corpo `{ "email", "password" }`. Resposta — 200:
```json
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

---

## Usuários · ✅

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/api/users/:id` | Detalhes do perfil | Sim |
| PUT | `/api/users/:id` | Atualiza o perfil (nome, contato, endereço, Cartão SUS, documento) | Sim (dono) |
| PATCH | `/api/users/:id/password` | Altera a senha | Sim (dono) |
| GET | `/api/users` | Lista usuários (tela Admin) | Sim (admin) |
| PATCH | `/api/users/:id/status` | Bloqueia/desbloqueia usuário | Sim (admin) |

**PATCH /api/users/:id/status** — corpo: `{ "status": "bloqueado" }` ou `{ "status": "ativo" }`.

**PATCH /api/users/:id/partner** — corpo: `{ "partnerId": 3 }` (ou `null` para desvincular). Vincula um PROFESSIONAL à farmácia onde trabalha. Esse vínculo define automaticamente o ponto de retirada ao aprovar doações.

**PATCH /api/users/:id/password** — corpo: `{ "currentPassword": "...", "newPassword": "..." }` (mínimo 6 caracteres).

---

## Doações · ✅

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/api/donations` | Cadastra uma doação | Sim |
| GET | `/api/donations` | Lista doações (filtros: `status`, `search` por nome/princípio ativo) | Sim |
| GET | `/api/donations/:id` | Detalhes da doação (inclui indicação, contraindicação, cuidados, ponto de retirada) | Sim |
| PATCH | `/api/donations/:id/status` | Aprova / recusa / conclui (triagem e retirada) | Sim (profissional/admin) |
| PUT | `/api/donations/:id` | Edita dados da doação (tela Admin) | Sim (admin) |
| DELETE | `/api/donations/:id` | Cancela uma doação | Sim (doador) |

**GET /api/donations** alimenta a tela **Medicamentos** com `?status=aprovado`.

**POST /api/donations** — corpo (campos da tela Doar Medicamento):
```json
{
  "name": "Amoxicilina",
  "activeIngredient": "Amoxicilina",
  "concentration": "500mg",
  "dosageForm": "comprimido",
  "laboratory": "TEUTO",
  "category": "Antibiótico",
  "tarja": "Vermelha (com retenção de receita)",
  "quantity": 2,
  "lote": "ABC123",
  "expirationDate": "2027-03-31",
  "description": "Caixa fechada",
  "donorAddress": "Rua das Flores, 123 - RS",
  "sealed": true,
  "originalPackaging": true,
  "requiresPrescription": true
}
```
> A foto do medicamento (obrigatória) é enviada em base64 no corpo da requisição — ver seção **Arquivos**. A bula fica fisicamente com o medicamento e não é armazenada no banco (ver [decisoes-tecnicas.md](decisoes-tecnicas.md), decisão 14).

**PATCH /api/donations/:id/status** — corpo: `{ "status": "aprovado" }` (`pendente` → `aprovado`/`recusado`, `aprovado` → `concluido`). Ao aprovar, o `pickup_point_id` é definido automaticamente pela farmácia vinculada ao aprovador (`users.partner_id`). Retorna 422 se o aprovador não estiver vinculado a nenhuma farmácia ativa.

---

## Solicitações · ✅

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/api/requests` | Solicita um medicamento doado | Sim |
| GET | `/api/requests` | Lista as solicitações do usuário (histórico do perfil) | Sim |
| GET | `/api/requests/:id` | Detalhes da solicitação | Sim |
| PATCH | `/api/requests/:id/status` | Atualiza status (triagem/entrega) | Sim (profissional/admin) |
| DELETE | `/api/requests/:id` | Cancela a solicitação (**somente até 5h após criação**) | Sim (dono) |

**POST /api/requests** — corpo: `{ "donationId": 42 }`.

**DELETE /api/requests/:id** — retorna **403** se a janela de 5 horas (`requested_at`) já tiver expirado:
```json
{ "error": "O prazo de 5 horas para cancelamento já expirou." }
```

---

## Parceiros · ✅

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/api/partners` | Cadastra uma farmácia/instituição parceira | Não* |
| GET | `/api/partners` | Lista parceiros / pontos de retirada (mapa) | Sim |
| GET | `/api/partners/:id` | Detalhes do parceiro | Sim |

\* O cadastro de parceiro é público (tela Parceiro); entra com `status = pendente` para aprovação.

**POST /api/partners** — corpo (campos da tela Parceiro):
```json
{
  "tradeName": "Farmácia Solidária Centro",
  "legalName": "Farmácia Solidária LTDA",
  "cnpj": "00.000.000/0001-00",
  "responsible": "João Souza",
  "email": "contato@farmacia.com",
  "phone": "(51) 3123-4567",
  "mobile": "(51) 99999-0000",
  "cep": "93000-000",
  "address": "Rua Lírios, 1000",
  "number": "1000",
  "complement": "",
  "neighborhood": "Bela Vista",
  "city": "São Leopoldo",
  "state": "RS",
  "businessHours": "Seg-Sex: 8h-20h, Sáb: 8h-14h",
  "notes": ""
}
```

---

## Arquivos

Arquivos são armazenados como BLOB no MySQL (ver [decisoes-tecnicas.md](decisoes-tecnicas.md), decisão 10). **Não há rotas de upload separadas** — os arquivos são enviados embutidos nas requisições das entidades correspondentes, em formato base64.

**Campos enviados para cada arquivo:**

```json
{
  "photoBase64": "data:image/jpeg;base64,/9j/4AAQ...",
  "photoName": "remedio.jpg",
  "photoType": "image/jpeg"
}
```

| Campo no corpo | Endpoint | Obrigatório |
|---|---|---|
| `photoBase64`, `photoName`, `photoType` | `POST /api/donations` | Sim |
| `identityDocumentBase64`, `identityDocumentName`, `identityDocumentType` | `POST /api/auth/register` | Sim |
| `photoBase64`, `photoName`, `photoType` | `PUT /api/users/:id` | Não |

Para **download** de um arquivo salvo no banco, os endpoints de detalhes (`GET /api/donations/:id`, `GET /api/users/:id`) retornam o base64 + name + type para que o frontend possa renderizar ou oferecer download.

---

## Não previstos (decisões registradas)

- **Contato:** tela estática, sem endpoint (ver [decisoes-tecnicas.md](decisoes-tecnicas.md), decisão 8)
- **Configurações:** persistidas no `localStorage` do app, sem backend (decisão 9)

---

> Novos endpoints devem ser adicionados aqui assim que criados, com método, rota, descrição, parâmetros e exemplo de resposta.
