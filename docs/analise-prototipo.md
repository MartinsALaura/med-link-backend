# Análise do Protótipo Frontend

> Mapeamento de cada tela do app `mobile-medlink` (Ionic + Angular) para as necessidades do backend.  
> Base para o modelo de dados e os endpoints. O protótipo usa dados mockados (sem chamadas HTTP ainda).

## Resumo

O frontend é um protótipo funcional de UI, com dados estáticos embutidos nos componentes. Não há `services` nem `environment` com URL de API — a integração com o backend ainda será feita. Esta análise extrai dos componentes os **campos**, **ações** e **regras de negócio** que o backend precisa suportar.

## Tela → Backend

| Tela (rota) | Função | Entidades | Endpoints |
|---|---|---|---|
| `home` | Landing/boas-vindas | — | — |
| `login` | E-mail + senha | users | `POST /auth/login` |
| `cadastro` | Cadastro completo do usuário + upload RG/CNH + Cartão SUS | users | `POST /auth/register`, `POST /uploads/identity-document` |
| `medicamentos` | Lista/busca de medicamentos disponíveis | donations | `GET /donations?status=aprovado&search=` |
| `detalhes-med/:id` | Detalhe clínico + "Solicitar" + baixar bula | donations, requests | `GET /donations/:id`, `POST /requests` |
| `doar-med` | Formulário de doação + foto obrigatória | donations | `POST /donations`, `POST /uploads/donation-photo` |
| `perfil` | Dados do usuário, estatísticas, histórico, solicitação ativa, cancelar | users, requests, donations | `GET /auth/me`, `PUT /users/:id`, `GET /requests`, `DELETE /requests/:id` |
| `admin` | Gestão de doações (aprovar/recusar/concluir/editar) e usuários (bloquear) | donations, users | `GET /donations`, `PATCH /donations/:id/status`, `PUT /donations/:id`, `GET /users`, `PATCH /users/:id/status` |
| `parceiro` | Cadastro de farmácia parceira + lista de pontos | partners | `POST /partners`, `GET /partners` |
| `contato` | Informações de contato (estático) | — | — (decisão 8) |
| `config` | Preferências (localStorage) | — | — (decisão 9) |
| `ajuda` | FAQ/ajuda (estático) | — | — |

## Campos extraídos por tela

### cadastro (`cadastro.page.html`)
`nome`, `cpf`, `dataNascimento`, `celular`, `email`, `senha`, `confirmarSenha`, `cep`, `endereco`, `numero`, `complemento`, `bairro`, `cidade`, `estado` (UF), upload `identidade` (RG/CNH), `numeroCartaoSus`.

### doar-med (`doar-med.page.ts`)
`nomeMedicamento`, `principioAtivo`, `concentracao`, `formaFarmaceutica`, `laboratorio`, `categoria`, `tarja`, `quantidade`, `lote`, `validade`, `descricao`, `enderecoDoador`, `lacrado`, `embalagemOriginal`, `fotoMedicamento` (obrigatória).

- **Categorias:** Analgésico, Antibiótico, Anti-inflamatório, Antialérgico, Antidepressivo, Antidiabético, Antihipertensivo, Ansiolítico, Corticosteroide, Relaxante muscular, Suplemento, Vitamínico, Outro.
- **Tarjas:** Vermelha (com retenção de receita), Vermelha (sem retenção), Preta, Amarela, Sem tarja.
- **Formas farmacêuticas:** comprimido, cápsula, solução, suspensão, pomada, creme, inalador, outro.

### detalhes-med (`detalhes-med.page.ts`)
Adiciona aos dados do medicamento: `laboratorio`, `indicacao`, `contraIndicacao`, `cuidados`, `categoria`, `receita` (bool), `validade`, `tarja`, `ondeRetirar`, bula em PDF.

### admin (`admin.page.ts`)
- **MedicamentoDoado:** todos os campos da doação + `status` (`pendente`/`aprovado`/`recusado`/`concluido`), `doador`, `dataDoacao`, `bula`, `indicacao`, `contraIndicacao`, `cuidados`.
- **Usuario:** `nome`, `email`, `telefone`, `endereco`, `dataCadastro`, `status` (`ativo`/`bloqueado`), `documentos` (identidade, cartaoSus).

### parceiro (`parceiro.page.ts`)
- **Cadastro:** `nomeFantasia`, `razaoSocial`, `cnpj`, `responsavel`, `email`, `telefone`, `celular`, `cep`, `endereco`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, `horarioFuncionamento`, `observacoes`.
- **Farmácia (ponto de retirada):** `nome`, `endereco`, `bairro`, `cidade`, `telefone`, `horario`, `latitude`, `longitude`.

### perfil (`perfil.page.ts`)
- **Usuário:** `nome`, `email`, `telefone`, `endereco`, `dataCadastro`, `foto`, `cartaoSus`, documento (nome/base64/tipo).
- **Estatísticas:** total de doações e solicitações.
- **Histórico:** itens com `tipo` (`doacao`/`solicitacao`) e `status` (`concluído`/`pendente`/`entregue`).
- **Solicitação ativa:** com `timestamp` para a regra de cancelamento.

## Regras de negócio identificadas

1. **Cancelamento de solicitação:** permitido apenas até **5 horas** após a criação (`perfil.page.ts` → `verificarPrazoCancelamento`). Deve ser validado no backend.
2. **Validação de doação:** medicamento não pode estar vencido; deve estar `lacrado` **e** em `embalagemOriginal`; foto é obrigatória (`doar-med.page.ts` → `enviarDoacao`).
3. **Medicamento controlado:** exige receita médica (campo `receita`/`requiresPrescription`; regra citada em doar-med).
4. **Triagem:** toda doação entra como `pendente` e passa por aprovação antes de ficar disponível.
5. **Bloqueio de usuário:** admin pode bloquear/desbloquear contas.

## Pendências para alinhar com o frontend

- O app ainda **não consome API** — será necessário criar os `services` Angular e definir a `environment.apiUrl`.
- Definir o momento exato de envio da receita médica (doação de controlados e/ou solicitação).
- Definir atribuição do ponto de retirada (`ondeRetirar`) durante a triagem.
