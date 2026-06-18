# Fluxos do Sistema — MedLink

> Revisado a partir da análise do protótipo (`mobile-medlink`). Ver [analise-prototipo.md](analise-prototipo.md).

## Autenticação

Autenticação baseada em **JWT** (ver [decisoes-tecnicas.md](decisoes-tecnicas.md), decisão 6).

```mermaid
sequenceDiagram
    participant App as App (Ionic/Angular)
    participant API as API (Express)
    participant DB as MySQL

    App->>API: POST /api/auth/register (dados + Cartão SUS + RG/CNH em base64)
    API->>DB: cria usuário (senha com hash, documento como BLOB, status ativo)
    API-->>App: 201 Created

    App->>API: POST /api/auth/login (email, senha)
    API->>DB: valida credenciais e status (não bloqueado)
    API-->>App: 200 OK (access token JWT)

    App->>API: GET /api/auth/me (Authorization: Bearer)
    API-->>App: 200 OK (dados do usuário)
```

## Fluxo de Doação

```mermaid
sequenceDiagram
    participant Doador
    participant App
    participant API
    participant Admin as Admin/Profissional

    Doador->>App: Preenche medicamento + foto + checklist
    App->>App: Valida (não vencido, lacrado, embalagem original, foto)
    App->>API: POST /api/donations (foto e bula em base64 no corpo)
    Note over API: Backend revalida validade, lacrado e embalagem original
    API-->>App: 201 (status: pendente)

    Note over Doador: Doador leva o medicamento fisicamente até a farmácia parceira
    Admin->>API: PATCH /api/donations/:id/status (aprovado | recusado)
    Note over API: Ao aprovar, pickup_point_id é atribuído automaticamente<br/>pela farmácia do aprovador (users.partner_id)
    alt Aprovada
        API-->>Admin: status: aprovado, pickupPointId preenchido automaticamente
    else Recusada
        API-->>Admin: status: recusado
    end

    Note over API: Após a retirada
    Admin->>API: PATCH /api/donations/:id/status (concluido)
```

## Fluxo de Solicitação / Retirada

```mermaid
sequenceDiagram
    participant Benef as Beneficiário
    participant App
    participant API
    participant Ponto as Ponto de Retirada

    Benef->>App: Busca medicamento (nome / princípio ativo)
    App->>API: GET /api/donations?status=aprovado&search=...
    API-->>App: lista de doações disponíveis

    Benef->>App: Abre detalhes e clica "Solicitar"
    App->>API: GET /api/donations/:id
    App->>API: POST /api/requests { donationId }
    API-->>App: 201 (status: pendente, requested_at)

    Note over API: Triagem aprova → aprovado
    Benef->>Ponto: Vai ao ponto físico autorizado
    Ponto->>API: PATCH /api/requests/:id/status (entregue)
    API-->>Ponto: retirada confirmada
```

## Regra de Cancelamento (5 horas)

Regra de negócio do protótipo — deve ser validada **no backend**.

```mermaid
flowchart TD
    A[Beneficiário pede cancelamento] --> B{Agora - requested_at <= 5h?}
    B -->|Sim| C[DELETE /api/requests/:id<br/>status: cancelado]
    B -->|Não| D[403 — prazo expirado]
```

## Regras de Segurança Aplicadas

Validações obrigatórias no fluxo de doação (origem: `doar-med.page.ts` e [projeto.md](projeto.md)):

- Validade do medicamento não pode estar vencida
- Medicamento deve estar **lacrado** e em **embalagem original**
- Foto do medicamento é obrigatória
- Triagem por admin/profissional antes de disponibilizar
- Medicamentos controlados exigem receita médica
