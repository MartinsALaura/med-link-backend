// OpenAPI 3.0 specification for the MedLink API.
// Served as interactive docs via swagger-ui-express at GET /api/docs.
// Keep this in sync with docs/endpoints.md whenever an endpoint changes.

export const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "MedLink API",
    version: "1.0.0",
    description:
      "API backend do MedLink — farmácia comunitária digital que conecta doadores e beneficiários de medicamentos. " +
      "Respostas e mensagens de erro em português; status canônicos em PT-BR.",
  },
  servers: [{ url: "/api", description: "Base URL da API" }],
  tags: [
    { name: "Geral" },
    { name: "Autenticação" },
    { name: "Usuários" },
    { name: "Doações" },
    { name: "Solicitações" },
    { name: "Parceiros" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: { type: "string", example: "Mensagem de erro em português." },
          details: { type: "array", items: { type: "object" } },
        },
      },
      RegisterInput: {
        type: "object",
        required: [
          "name",
          "cpf",
          "birthDate",
          "phone",
          "email",
          "password",
          "cep",
          "address",
          "number",
          "neighborhood",
          "city",
          "state",
          "susCardNumber",
          "identityDocumentBase64",
          "identityDocumentName",
          "identityDocumentType",
        ],
        properties: {
          name: { type: "string", example: "Ana Silva" },
          cpf: { type: "string", example: "000.000.000-00" },
          birthDate: { type: "string", format: "date", example: "1990-05-12" },
          phone: { type: "string", example: "(51) 99999-8888" },
          email: { type: "string", format: "email", example: "ana@email.com" },
          password: { type: "string", minLength: 6, example: "senha123" },
          cep: { type: "string", example: "93000-000" },
          address: { type: "string", example: "Rua das Flores" },
          number: { type: "string", example: "123" },
          complement: { type: "string", example: "Apto 4" },
          neighborhood: { type: "string", example: "Centro" },
          city: { type: "string", example: "São Leopoldo" },
          state: { type: "string", example: "RS" },
          susCardNumber: { type: "string", example: "123456789012345" },
          identityDocumentBase64: {
            type: "string",
            example: "data:image/jpeg;base64,/9j/4AAQ...",
          },
          identityDocumentName: { type: "string", example: "rg.jpg" },
          identityDocumentType: { type: "string", example: "image/jpeg" },
          photoBase64: { type: "string" },
          photoName: { type: "string" },
          photoType: { type: "string" },
        },
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "ana@email.com" },
          password: { type: "string", example: "senha123" },
        },
      },
      TokenResponse: {
        type: "object",
        properties: { token: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." } },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string" },
          cpf: { type: "string" },
          birthDate: { type: "string", format: "date" },
          phone: { type: "string" },
          email: { type: "string", format: "email" },
          cep: { type: "string" },
          address: { type: "string" },
          number: { type: "string" },
          complement: { type: "string", nullable: true },
          neighborhood: { type: "string" },
          city: { type: "string" },
          state: { type: "string" },
          susCardNumber: { type: "string" },
          identityDocument: {
            type: "string",
            nullable: true,
            description: "data URI base64",
          },
          identityDocumentName: { type: "string", nullable: true },
          identityDocumentType: { type: "string", nullable: true },
          photo: { type: "string", nullable: true, description: "data URI base64" },
          photoName: { type: "string", nullable: true },
          photoType: { type: "string", nullable: true },
          role: { type: "string", enum: ["USER", "PROFESSIONAL", "ADMIN"] },
          status: { type: "string", enum: ["ativo", "bloqueado"] },
          createdAt: { type: "string" },
          updatedAt: { type: "string" },
        },
      },
      DonationInput: {
        type: "object",
        required: [
          "name",
          "activeIngredient",
          "concentration",
          "dosageForm",
          "laboratory",
          "category",
          "tarja",
          "quantity",
          "expirationDate",
          "donorAddress",
          "sealed",
          "originalPackaging",
          "requiresPrescription",
          "photoBase64",
          "photoName",
          "photoType",
        ],
        properties: {
          name: { type: "string", example: "Amoxicilina" },
          activeIngredient: { type: "string", example: "Amoxicilina" },
          concentration: { type: "string", example: "500mg" },
          dosageForm: { type: "string", example: "comprimido" },
          laboratory: { type: "string", example: "TEUTO" },
          category: { type: "string", example: "Antibiótico" },
          tarja: { type: "string", example: "Vermelha (com retenção de receita)" },
          quantity: { type: "integer", example: 2 },
          lote: { type: "string", example: "ABC123" },
          expirationDate: { type: "string", format: "date", example: "2027-03-31" },
          description: { type: "string", example: "Caixa fechada" },
          donorAddress: { type: "string", example: "Rua das Flores, 123 - RS" },
          sealed: { type: "boolean", enum: [true], example: true },
          originalPackaging: { type: "boolean", enum: [true], example: true },
          requiresPrescription: { type: "boolean", example: true },
          photoBase64: { type: "string", example: "data:image/jpeg;base64,/9j/4AAQ..." },
          photoName: { type: "string", example: "remedio.jpg" },
          photoType: { type: "string", example: "image/jpeg" },
          indication: { type: "string" },
          contraindication: { type: "string" },
          careNotes: { type: "string" },
        },
      },
      Donation: {
        type: "object",
        properties: {
          id: { type: "integer" },
          donorId: { type: "integer" },
          name: { type: "string" },
          activeIngredient: { type: "string" },
          concentration: { type: "string" },
          dosageForm: { type: "string" },
          laboratory: { type: "string" },
          category: { type: "string" },
          tarja: { type: "string" },
          quantity: { type: "integer" },
          lote: { type: "string", nullable: true },
          expirationDate: { type: "string", format: "date" },
          description: { type: "string", nullable: true },
          donorAddress: { type: "string" },
          sealed: { type: "boolean" },
          originalPackaging: { type: "boolean" },
          requiresPrescription: { type: "boolean" },
          photo: { type: "string", nullable: true, description: "data URI base64" },
          indication: { type: "string", nullable: true },
          contraindication: { type: "string", nullable: true },
          careNotes: { type: "string", nullable: true },
          status: {
            type: "string",
            enum: ["pendente", "aprovado", "recusado", "concluido"],
          },
          pickupPointId: { type: "integer", nullable: true },
          pickupPointName: { type: "string", nullable: true },
          pickupPointAddress: { type: "string", nullable: true },
          createdAt: { type: "string" },
          updatedAt: { type: "string" },
        },
      },
      Request: {
        type: "object",
        properties: {
          id: { type: "integer" },
          beneficiary_id: { type: "integer" },
          donation_id: { type: "integer" },
          status: {
            type: "string",
            enum: ["pendente", "aprovado", "recusado", "entregue", "cancelado"],
          },
          requested_at: { type: "string" },
          donation_name: { type: "string" },
          donation_status: { type: "string" },
        },
      },
      PartnerInput: {
        type: "object",
        required: [
          "tradeName",
          "legalName",
          "cnpj",
          "responsible",
          "email",
          "phone",
          "mobile",
          "cep",
          "address",
          "number",
          "neighborhood",
          "city",
          "state",
          "businessHours",
        ],
        properties: {
          tradeName: { type: "string", example: "Farmácia Solidária Centro" },
          legalName: { type: "string", example: "Farmácia Solidária LTDA" },
          cnpj: { type: "string", example: "00.000.000/0001-00" },
          responsible: { type: "string", example: "João Souza" },
          email: { type: "string", format: "email" },
          phone: { type: "string" },
          mobile: { type: "string" },
          cep: { type: "string" },
          address: { type: "string" },
          number: { type: "string" },
          complement: { type: "string" },
          neighborhood: { type: "string" },
          city: { type: "string" },
          state: { type: "string" },
          businessHours: { type: "string", example: "Seg-Sex: 8h-20h" },
          latitude: { type: "number", example: -29.76 },
          longitude: { type: "number", example: -51.15 },
          notes: { type: "string" },
        },
      },
      Partner: {
        type: "object",
        properties: {
          id: { type: "integer" },
          trade_name: { type: "string" },
          legal_name: { type: "string" },
          cnpj: { type: "string" },
          responsible: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          mobile: { type: "string" },
          cep: { type: "string" },
          address: { type: "string" },
          number: { type: "string" },
          neighborhood: { type: "string" },
          city: { type: "string" },
          state: { type: "string" },
          business_hours: { type: "string" },
          latitude: { type: "string", nullable: true },
          longitude: { type: "string", nullable: true },
          status: { type: "string", enum: ["pendente", "ativo", "inativo"] },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Geral"],
        summary: "Verifica se o servidor está no ar",
        security: [],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { status: { type: "string", example: "ok" } },
                },
              },
            },
          },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Autenticação"],
        summary: "Cadastra um novo usuário",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterInput" },
            },
          },
        },
        responses: {
          "201": { description: "Usuário cadastrado" },
          "409": {
            description: "CPF ou e-mail já cadastrado",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Autenticação"],
        summary: "Autentica e retorna o token JWT",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/LoginInput" } },
          },
        },
        responses: {
          "200": {
            description: "Token JWT",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TokenResponse" },
              },
            },
          },
          "401": { description: "Credenciais inválidas" },
          "403": { description: "Usuário bloqueado" },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Autenticação"],
        summary: "Dados do usuário autenticado",
        responses: {
          "200": {
            description: "Usuário",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/User" } },
            },
          },
          "401": { description: "Não autenticado" },
        },
      },
    },
    "/users": {
      get: {
        tags: ["Usuários"],
        summary: "Lista usuários (somente ADMIN)",
        responses: {
          "200": { description: "Lista de usuários" },
          "403": { description: "Acesso negado" },
        },
      },
    },
    "/users/{id}": {
      get: {
        tags: ["Usuários"],
        summary: "Detalhes do perfil",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          "200": {
            description: "Usuário",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/User" } },
            },
          },
          "404": { description: "Usuário não encontrado" },
        },
      },
      put: {
        tags: ["Usuários"],
        summary: "Atualiza o perfil (somente o dono)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          "200": { description: "Perfil atualizado" },
          "403": { description: "Acesso negado" },
        },
      },
    },
    "/users/{id}/password": {
      patch: {
        tags: ["Usuários"],
        summary: "Altera a senha (somente o dono)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["currentPassword", "newPassword"],
                properties: {
                  currentPassword: { type: "string" },
                  newPassword: { type: "string", minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Senha alterada" },
          "401": { description: "Senha atual incorreta" },
        },
      },
    },
    "/users/{id}/status": {
      patch: {
        tags: ["Usuários"],
        summary: "Bloqueia/desbloqueia usuário (somente ADMIN)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: { status: { type: "string", enum: ["ativo", "bloqueado"] } },
              },
            },
          },
        },
        responses: {
          "200": { description: "Status atualizado" },
          "403": { description: "Acesso negado" },
        },
      },
    },
    "/users/{id}/partner": {
      patch: {
        tags: ["Usuários"],
        summary: "Vincula/desvincula o usuário a uma farmácia parceira (somente ADMIN)",
        description:
          "Associa um PROFESSIONAL ao parceiro onde ele trabalha. " +
          "Esse vínculo é usado na aprovação de doações: ao aprovar, o sistema registra automaticamente " +
          "a farmácia do aprovador como ponto de retirada. Use partnerId: null para desvincular.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["partnerId"],
                properties: {
                  partnerId: {
                    type: "integer",
                    nullable: true,
                    example: 3,
                    description: "ID do parceiro ativo. null remove o vínculo.",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Farmácia parceira atualizada" },
          "403": { description: "Acesso negado" },
          "404": { description: "Usuário ou farmácia não encontrada" },
          "422": { description: "Farmácia não está ativa" },
        },
      },
    },
    "/donations": {
      post: {
        tags: ["Doações"],
        summary: "Cadastra uma doação",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/DonationInput" },
            },
          },
        },
        responses: {
          "201": { description: "Doação cadastrada" },
          "422": { description: "Validação de negócio (vencido, não lacrado, etc.)" },
        },
      },
      get: {
        tags: ["Doações"],
        summary: "Lista doações",
        parameters: [
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["pendente", "aprovado", "recusado", "concluido"],
            },
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Busca por nome ou princípio ativo",
          },
        ],
        responses: { "200": { description: "Lista de doações" } },
      },
    },
    "/donations/{id}": {
      get: {
        tags: ["Doações"],
        summary: "Detalhes da doação",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          "200": {
            description: "Doação",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Donation" } },
            },
          },
          "404": { description: "Doação não encontrada" },
        },
      },
      put: {
        tags: ["Doações"],
        summary: "Edita dados da doação (somente ADMIN)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { "200": { description: "Doação atualizada" } },
      },
      delete: {
        tags: ["Doações"],
        summary: "Cancela uma doação (somente o doador)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          "204": { description: "Removida" },
          "403": { description: "Acesso negado" },
        },
      },
    },
    "/donations/{id}/status": {
      patch: {
        tags: ["Doações"],
        summary: "Aprova / recusa / conclui (PROFESSIONAL ou ADMIN)",
        description:
          "Transições válidas: pendente→aprovado, pendente→recusado, aprovado→concluido. " +
          "Ao aprovar, o ponto de retirada é definido automaticamente pela farmácia vinculada ao aprovador (partner_id). " +
          "O aprovador deve estar vinculado a uma farmácia ativa via PATCH /users/{id}/partner.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string", enum: ["aprovado", "recusado", "concluido"] },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Status atualizado" },
          "422": { description: "Transição inválida ou ponto de retirada ausente" },
        },
      },
    },
    "/requests": {
      post: {
        tags: ["Solicitações"],
        summary: "Solicita um medicamento doado",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["donationId"],
                properties: { donationId: { type: "integer", example: 42 } },
              },
            },
          },
        },
        responses: {
          "201": { description: "Solicitação registrada" },
          "422": { description: "Medicamento não disponível (status ≠ aprovado)" },
        },
      },
      get: {
        tags: ["Solicitações"],
        summary: "Lista as solicitações do usuário autenticado",
        responses: { "200": { description: "Lista de solicitações" } },
      },
    },
    "/requests/{id}": {
      get: {
        tags: ["Solicitações"],
        summary: "Detalhes da solicitação",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          "200": {
            description: "Solicitação",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Request" } },
            },
          },
          "403": { description: "Acesso negado" },
        },
      },
      delete: {
        tags: ["Solicitações"],
        summary: "Cancela a solicitação (somente o dono, até 5h após a criação)",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          "204": { description: "Cancelada" },
          "403": { description: "Prazo de 5 horas expirado ou não é o dono" },
        },
      },
    },
    "/requests/{id}/status": {
      patch: {
        tags: ["Solicitações"],
        summary: "Atualiza status (PROFESSIONAL ou ADMIN)",
        description: "Transições válidas: pendente→aprovado, pendente→recusado, aprovado→entregue.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string", enum: ["aprovado", "recusado", "entregue"] },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Status atualizado" },
          "422": { description: "Transição inválida" },
        },
      },
    },
    "/partners": {
      post: {
        tags: ["Parceiros"],
        summary: "Cadastra uma farmácia/instituição parceira (público)",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PartnerInput" },
            },
          },
        },
        responses: {
          "201": { description: "Parceiro cadastrado (status pendente)" },
          "409": { description: "CNPJ já cadastrado" },
        },
      },
      get: {
        tags: ["Parceiros"],
        summary: "Lista parceiros ativos (pontos de retirada)",
        responses: { "200": { description: "Lista de parceiros" } },
      },
    },
    "/partners/{id}": {
      get: {
        tags: ["Parceiros"],
        summary: "Detalhes do parceiro",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          "200": {
            description: "Parceiro",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Partner" } },
            },
          },
          "404": { description: "Parceiro não encontrado" },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
};
