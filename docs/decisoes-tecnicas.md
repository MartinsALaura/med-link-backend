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

## 10. Armazenamento de arquivos — A DEFINIR

**Contexto:** quatro tipos de arquivo precisam de object storage:
1. Foto do medicamento doado
2. Bula (PDF)
3. Documento de identidade RG/CNH
4. Avatar do usuário

**Decisão pendente:** o serviço (AWS S3, Cloudflare R2, Google Cloud Storage, etc.) ainda será escolhido. O banco guarda apenas as URLs.

Decisão: Armazenar arquivos no banco de dados
---

## 11. Estrutura em camadas

**Decisão:** `routes → controllers → services → models`, conforme `CLAUDE.md`.

---

## Itens em aberto

- [X] Definir serviço de armazenamento de arquivos
- [ ] Confirmar o momento de exigência da receita (na doação de controlados e/ou na solicitação)
- [X] Definir se haverá notificações push (toggle existe no app, sem backend) - Não
- [ ] Definir como o ponto de retirada é atribuído a uma doação na triagem
