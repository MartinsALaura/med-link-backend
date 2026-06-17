# med-link-backend

API backend para o aplicativo mobile Med Link.

## Stack

- Node.js + TypeScript
- Frontend: Angular
- Banco de dados: MySQL
- Armazenamento de arquivos: a definir

## Documentação

A documentação deve ser mantida atualizada ao longo de todo o desenvolvimento, não apenas no início do projeto.

- Toda nova funcionalidade, entidade ou decisão arquitetural deve ser documentada no `README.md` ou em arquivos dentro de `/docs`
- Usar diagramas sempre que ajudarem na compreensão (ex: fluxos de autenticação, relacionamentos entre entidades, sequência de requisições)
- Formatos aceitos para diagramas: Mermaid (preferido, por ser renderizado no GitHub), imagens `.png`/`.svg`, ou descrições textuais estruturadas quando o diagrama for desnecessário
- Decisões técnicas relevantes (escolha de biblioteca, mudança de abordagem, trade-offs) devem ser registradas em `/docs` com justificativa
- Manter o arquivo `/docs/endpoints.md` sempre atualizado com todos os endpoints da API: método HTTP, rota, descrição, parâmetros esperados e exemplo de resposta. Todo endpoint novo ou alterado deve ser refletido nesse arquivo imediatamente

## Convenções do projeto

- Código e comentários em inglês
- Respostas da API e mensagens de erro em português (Brasil)
- Sem frameworks de backend (sem Express wrappers opinativos) — usar bibliotecas pontuais conforme necessidade
- Estrutura em camadas: routes → controllers → services → models
