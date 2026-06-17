# Modelo de Dados — MedLink

> Revisado a partir da análise do protótipo frontend (`mobile-medlink`, Ionic + Angular).  
> Os campos refletem os formulários e telas reais do app.

## Diagrama de Entidade-Relacionamento

```mermaid
erDiagram
    USERS ||--o{ DONATIONS : "doa"
    USERS ||--o{ REQUESTS : "solicita"
    USERS ||--o{ DONATIONS : "tria (profissional/admin)"
    PARTNERS ||--o{ DONATIONS : "ponto de retirada"
    DONATIONS ||--o{ REQUESTS : "solicitada em"

    USERS {
        int id PK
        string name
        string cpf UK
        date birth_date
        string phone
        string email UK
        string password_hash
        string cep
        string address
        string number
        string complement
        string neighborhood
        string city
        string state "UF"
        string identity_document_url "RG/CNH"
        string sus_card_number "Cartão SUS"
        string photo_url "avatar, nullable"
        enum role "USER | PROFESSIONAL | ADMIN"
        enum status "ativo | bloqueado"
        datetime created_at
        datetime updated_at
    }

    DONATIONS {
        int id PK
        int donor_id FK
        int pickup_point_id FK "→ partners, nullable até triagem"
        int triaged_by FK "nullable"
        string name "nome do medicamento"
        string active_ingredient "princípio ativo"
        string concentration
        string dosage_form "forma farmacêutica"
        string laboratory
        string category
        string tarja
        int quantity
        string lote "nullable"
        date expiration_date "validade"
        string description "nullable"
        string donor_address
        boolean sealed "lacrado"
        boolean original_packaging "embalagem original"
        boolean requires_prescription "receita"
        string photo_url "foto do medicamento"
        string leaflet_url "bula, nullable"
        string indication "indicação, nullable"
        string contraindication "contraindicação, nullable"
        string care_notes "cuidados, nullable"
        enum status "pendente | aprovado | recusado | concluido"
        datetime created_at
        datetime updated_at
    }

    REQUESTS {
        int id PK
        int beneficiary_id FK
        int donation_id FK
        enum status "pendente | aprovado | recusado | entregue | cancelado"
        datetime requested_at "base para janela de cancelamento"
        datetime created_at
        datetime updated_at
    }

    PARTNERS {
        int id PK
        string trade_name "nome fantasia"
        string legal_name "razão social"
        string cnpj UK
        string responsible "responsável"
        string email
        string phone
        string mobile "celular"
        string cep
        string address
        string number
        string complement
        string neighborhood
        string city
        string state "UF"
        string business_hours "horário de funcionamento"
        decimal latitude
        decimal longitude
        string notes "observações, nullable"
        enum status "pendente | ativo | inativo"
        datetime created_at
        datetime updated_at
    }
```

## Entidades

### users
Todos os usuários da plataforma. Campos derivados da tela de **cadastro** e do **perfil**:

- Dados pessoais: nome, CPF, data de nascimento, celular, e-mail, senha
- Endereço completo: CEP, endereço, número, complemento, bairro, cidade, UF
- Documentos: RG/CNH (`identity_document_url`) e número do Cartão SUS
- `photo_url`: avatar exibido no perfil
- `status`: `ativo` / `bloqueado` — controlado pelo admin (tela Admin → aba Usuários)
- `role`: `USER` (doa e solicita), `PROFESSIONAL` (triagem) ou `ADMIN`

### donations
**Medicamento doado.** No protótipo, o doador preenche todos os dados do medicamento diretamente no formulário **Doar Medicamento** — não há catálogo pré-existente. Por isso os dados do medicamento ficam embutidos na própria doação (ver [decisoes-tecnicas.md](decisoes-tecnicas.md), decisão 1 — revisada).

- Dados do medicamento: nome, princípio ativo, concentração, forma farmacêutica, laboratório, categoria, tarja
- Quantidade, lote, validade, descrição
- Condições obrigatórias: `sealed` (lacrado) e `original_packaging` (embalagem original)
- `requires_prescription`: medicamento controlado exige receita
- Arquivos: `photo_url` (foto obrigatória) e `leaflet_url` (bula)
- Informações clínicas (exibidas na tela de detalhes): indicação, contraindicação, cuidados
- `pickup_point_id`: ponto de retirada (definido na triagem)
- `status`: ver máquina de estado abaixo

### requests
**Solicitação** de um medicamento doado por um beneficiário. A tela de detalhes permite "Solicitar", e o perfil mostra a solicitação ativa e o histórico.

- `requested_at`: usado para a **regra de cancelamento de 5 horas** (ver [fluxos.md](fluxos.md))

### partners
**Farmácias/instituições parceiras** que também funcionam como **pontos de retirada**. Unifica o cadastro de parceiro (tela Parceiro) e os locais de retirada exibidos no app.

- Dados cadastrais: nome fantasia, razão social, CNPJ, responsável, contatos
- Endereço + geolocalização (`latitude`/`longitude`) para exibição no mapa
- `business_hours`: horário de funcionamento
- `status`: `pendente` (aguardando aprovação após cadastro), `ativo`, `inativo`

## Valores de Status (PT-BR)

O frontend já usa rótulos em português. Para manter compatibilidade, a API deve expor os mesmos valores em português, sem necessidade de um segundo mapeamento no app.

| Entidade | Valor canônico (API) | Rótulo exibido no app |
|---|---|---|
| donations | pendente | Pendente |
| donations | aprovado | Aprovado |
| donations | recusado | Recusado |
| donations | concluido | Concluído |
| requests | pendente | Pendente |
| requests | aprovado | Aprovado |
| requests | recusado | Recusado |
| requests | entregue | Entregue |
| requests | cancelado | Cancelado |
| users | ativo | Ativo |
| users | bloqueado | Bloqueado |
| partners | pendente | Pendente |
| partners | ativo | Ativo |
| partners | inativo | Inativo |

## Máquinas de Estado

### donations.status

```mermaid
stateDiagram-v2
    [*] --> PENDENTE: doador cadastra
    PENDENTE --> APROVADO: admin/profissional aprova
    PENDENTE --> RECUSADO: admin/profissional recusa
    APROVADO --> CONCLUIDO: entrega confirmada
```

### requests.status

```mermaid
stateDiagram-v2
    [*] --> PENDENTE: beneficiário solicita
    PENDENTE --> APROVADO: triagem aprova
    PENDENTE --> RECUSADO: triagem recusa
    PENDENTE --> CANCELADO: cancelada (até 5h após requested_at)
    APROVADO --> ENTREGUE: retirada confirmada no ponto
```

## Armazenamento de Arquivos

Quatro tipos de arquivo precisam de object storage (serviço **a definir** — ver [decisoes-tecnicas.md](decisoes-tecnicas.md)):

1. Foto do medicamento doado (`donations.photo_url`)
2. Bula do medicamento (`donations.leaflet_url`)
3. Documento de identidade RG/CNH (`users.identity_document_url`)
4. Foto de perfil / avatar (`users.photo_url`)

O banco guarda apenas as URLs; os binários ficam no storage externo.
