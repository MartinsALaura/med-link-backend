# Decisões Técnicas — MedLink

Registro das decisões técnicas relevantes do backend, com justificativa. Decisões revisadas após a análise do protótipo frontend estão marcadas com **(revisada)**.

---

## 1. Dados do medicamento embutidos na doação *(revisada)*

**Decisão atual:** os dados do medicamento ficam **embutidos na entidade `donations`**. Não há catálogo de medicamentos pré-cadastrado.

**Contexto da revisão:** a proposta inicial previa uma tabela `medications` (catálogo de referência). A análise do protótipo mostrou que, na tela **Doar Medicamento**, o doador digita livremente todos os dados (nome, princípio ativo, concentração, forma, laboratório, categoria, tarja). Não existe seleção a partir de um catálogo.

**Justificativa:**
- Fidelidade ao protótipo e ao fluxo real de doação
- Simplicidade para o MVP
- Cada doação é única (validade, lote, quantidade próprios)

**Trade-off:** haverá duplicação de dados clínicos (indicação, contraindicação, cuidados) entre doações do mesmo medicamento. Caso isso se torne um problema, considerar futuramente uma tabela `medications` de referência apenas para os dados clínicos e a bula.

---

## 2. Parceiro e ponto de retirada são a mesma entidade *(revisada)*

**Decisão atual:** uma única entidade `partners` representa as **farmácias/instituições parceiras**, que também são os **pontos de retirada**.

**Contexto da revisão:** a proposta inicial separava `partners` e `pickup_points`. No protótipo, a tela **Parceiro** cadastra a farmácia (com endereço e geolocalização) e essas mesmas farmácias aparecem como locais de retirada (`ondeRetirar`).

**Justificativa:** evita uma entidade redundante; o local de retirada é sempre uma farmácia parceira.

---

## 3. Papéis de usuário (role)

**Decisão:** enum `role` com `USER`, `PROFESSIONAL`, `ADMIN`. Um `USER` pode doar **e** solicitar.

**Confirmado pelo protótipo:** existe uma tela **Admin** (gerencia doações e usuários) e o fluxo de triagem. Doador e beneficiário são o mesmo tipo de usuário — o perfil mostra histórico de doações **e** solicitações para a mesma pessoa.

---

## 4. Status do usuário (ativo/bloqueado)

**Decisão:** campo `status` (`ativo` / `bloqueado`) em `users`.

**Justificativa:** a tela Admin → aba Usuários permite **bloquear/desbloquear** usuários.

---

## 5. Regra de cancelamento de solicitação: 5 horas

**Decisão:** uma solicitação só pode ser cancelada em até **5 horas** após sua criação (`requested_at`).

**Justificativa:** regra de negócio explícita no protótipo (`perfil.page.ts` → `verificarPrazoCancelamento`, `diffHoras <= 5`). Deve ser validada no backend, não apenas no app.

---

## 6. Autenticação via JWT

**Decisão:** autenticação stateless com JWT (`Authorization: Bearer`).

**Justificativa:** adequado para mobile, simples de validar via middleware, boa integração com Ionic/Angular. O protótipo tem telas de login e cadastro separadas, com fluxo compatível.

---

## 7. Status canônicos em português

**Decisão:** a API expõe os valores de status em português para ficar compatível com o frontend (`pendente`, `aprovado`, `recusado`, `concluido`, `entregue`, `cancelado`, etc.).

**Justificativa:** evita um passo extra de mapeamento no app e mantém a mesma linguagem usada nas telas. A API e o frontend passam a compartilhar a mesma semântica de status. Ver tabela em [modelo-de-dados.md](modelo-de-dados.md).

---

## 8. Tela de Contato não exige backend

**Decisão:** **não** haverá endpoint para a tela de Contato.

**Justificativa:** a tela `contato` é puramente informativa (telefone, e-mail, WhatsApp, endereço, redes sociais) e abre apps externos via links. Não há formulário de envio.

---

## 9. Configurações ficam no cliente

**Decisão:** as preferências do usuário (notificações, tema escuro, idioma, tamanho de fonte, etc.) **não** são persistidas no backend no MVP.

**Justificativa:** no protótipo (`config.page.ts`) tudo é salvo em `localStorage`. Caso seja necessário sincronizar entre dispositivos no futuro, criar uma entidade `user_settings`.

---

## 10. Arquivos armazenados diretamente no banco de dados (BLOB)

**Decisão:** arquivos binários (fotos, PDFs, documentos) são armazenados como `MEDIUMBLOB` / `LONGBLOB` diretamente no MySQL. Não há serviço externo de object storage.

**Arquivos afetados:**
1. Foto do medicamento doado (`donations.photo`) — obrigatória
2. Documento de identidade RG/CNH (`users.identity_document`) — obrigatório no cadastro
3. Foto de perfil / avatar (`users.photo`) — opcional

**Bula:** não é armazenada digitalmente. Fica fisicamente com o medicamento no ponto de retirada (ver decisão 14).

Cada campo de arquivo é acompanhado de `_name` (nome original) e `_type` (MIME type), para permitir o download correto no frontend.

**Justificativa:** simplicidade para o MVP, sem dependência de serviço externo.

**Trade-off conhecido:** bancos com muitos BLOBs crescem rapidamente e podem impactar performance de backup e consultas. Caso o volume de arquivos se torne um problema, migrar para object storage externo e substituir os campos BLOB por colunas de URL.
---

## 11. Estrutura em camadas

**Decisão:** `routes → controllers → services → models`, conforme `CLAUDE.md`.

---

## 12. Receita médica exigida na retirada física

**Decisão:** a receita médica é verificada **presencialmente no ponto de retirada**, no momento da entrega do medicamento. Não há upload digital de receita no app.

**Justificativa:** a triagem sanitária já ocorre no ponto físico (farmacêutico/técnico). Exigir a receita na retirada mantém o controle sem adicionar complexidade de validação de documentos na API.

**Impacto no modelo:** a entidade `requests` não precisa de um campo de receita. O campo `donations.requires_prescription` sinaliza ao beneficiário que deverá apresentar a receita ao retirar — informação exibida na tela de detalhes do medicamento.

---

---

## 13. Atribuição do ponto de retirada na triagem

**Decisão:** o ponto de retirada é atribuído **automaticamente** no momento da aprovação, com base na farmácia vinculada ao usuário que aprova.

**Fluxo:**
1. O doador cadastra o medicamento pelo app (doação fica `pendente`).
2. O doador leva o medicamento fisicamente até a farmácia parceira mais próxima.
3. O farmacêutico ou responsável, já cadastrado no sistema como `PROFESSIONAL` ou `ADMIN`, aprova a doação.
4. O backend lê o `partner_id` do aprovador e grava esse valor em `donations.pickup_point_id` automaticamente — sem nenhuma entrada manual.

**Impacto no modelo:**
- `users.partner_id` (FK → `partners.id`, nullable) vincula um usuário responsável à sua farmácia.
- `PATCH /users/:id/partner` (ADMIN) permite atribuir ou remover esse vínculo.
- `PATCH /donations/:id/status` não recebe mais `pickupPointId` no corpo — o campo é ignorado. Se o aprovador não tiver `partner_id`, a API retorna 422.

**Justificativa:** elimina redundância (o farmacêutico já está na farmácia) e previne erros de atribuição manual do ponto de retirada.

---

## Itens em aberto

- [X] Definir serviço de armazenamento de arquivos — armazenado no banco (decisão 10)
- [X] Confirmar o momento de exigência da receita — exigida na retirada física (decisão 12)
- [X] Definir se haverá notificações push — Não, no MVP
- [X] Definir como o ponto de retirada é atribuído a uma doação na triagem — atribuído automaticamente pela farmácia do aprovador (decisão 13)

---

## 14. Bula armazenada fisicamente, não no banco

**Decisão:** a bula do medicamento **não é armazenada no banco de dados**. Ela permanece fisicamente com o medicamento no ponto de retirada.

**Impacto no modelo:** os campos `donations.leaflet`, `donations.leaflet_name` e `donations.leaflet_type` foram removidos da tabela e de toda a camada de aplicação. O `POST /api/donations` não aceita mais campos `leafletBase64`, `leafletName` ou `leafletType`.

**Justificativa:** a bula já acompanha o medicamento físico. Armazená-la no banco adicionaria volume considerável (PDFs em LONGBLOB) sem benefício operacional, pois o beneficiário acessa a bula no ponto de retirada.
