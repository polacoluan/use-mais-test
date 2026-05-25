# Teste - Use Mais RH

Projeto desenvolvido como solução para o teste técnico de cadastro e gestão de clientes, com frontend e backend separados no mesmo repositório.

## Stack adotada

### Frontend

- React com Next.js
- shadcn/ui
- React Query
- Axios
- Zod
- React Hook Form

### Backend

- Laravel
- MySQL

## Decisões técnicas

### Frontend

- Optei por React/Next.js para entregar uma interface moderna, componentizada e com boa experiência de desenvolvimento.
- Usei `shadcn/ui` para acelerar a construção da interface mantendo controle sobre os componentes.
- Usei `React Query` para cache, sincronização de estado assíncrono e paginação da listagem.
- Usei `Axios` para padronizar chamadas HTTP e tratamento de erros.
- Usei `Zod` e `React Hook Form` para validação, tipagem e controle de formulários.
- Organizei a aplicação separando `api`, `hooks`, `schemas`, `types` e `components` para manter o código simples e escalável.
- Extraí tipos compartilhados para a pasta `types` para evitar acoplamento e deixar os componentes e hooks mais limpos.

### Backend

- Optei por Laravel com MySQL pela produtividade, organização da camada HTTP e facilidade para modelar regras de negócio.
- Separei responsabilidades com `Service` e `Repository`.
  - `Service`: regras de negócio e orquestração.
  - `Repository`: acesso e manipulação dos dados.
- Usei transações para reduzir riscos de condição de corrida em cenários de concorrência, principalmente nas operações de cliente.
- Adicionei rate limit para reduzir abuso e excesso de requisições em rotas autenticadas e na consulta de CEP.

## Consulta de CEP

Inicialmente a intenção era usar a API dos Correios. Durante a implementação, identifiquei que a utilização da API oficial exigia credenciais vinculadas a pessoa jurídica. Como o objetivo era entregar uma solução funcional e testável no contexto do desafio, adaptei a integração para a API pública do ViaCEP:

- https://viacep.com.br/

Também tratei cenários de retorno inválido, indisponibilidade do serviço externo e respostas vazias.

## Funcionalidades implementadas

- Autenticação com Clerk
- Listagem paginada de clientes
- Cadastro de cliente
- Edição de cliente
- Exclusão lógica de cliente
- Consulta de CEP com preenchimento automático do endereço
- Tratamento amigável de mensagens para o usuário
- Testes automatizados no backend

## Estrutura do projeto

```text
.
├── backend
├── frontend
├── docker
├── docker-compose.yml
└── Makefile
```

## Como executar

### Requisitos

- Docker
- Docker Compose

### Subir o projeto

Na raiz do repositório:

```bash
make up
```

Ou:

```bash
docker compose up --build
```

### Endereços

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- MySQL: `localhost:3306`

### Encerrar

```bash
make down
```

## Variáveis de ambiente

Os arquivos `.env.example` do frontend e do backend já estão prontos para facilitar a avaliação.

Mantive as chaves de teste do Clerk nesses arquivos para evitar configuração manual durante a análise do projeto. Essa decisão foi tomada exclusivamente para simplificar a execução por quem estiver avaliando a entrega.

Em um ambiente real:

- segredos não devem ser versionados
- as chaves devem ser injetadas por variáveis de ambiente seguras

## Validação do projeto

### Backend

```bash
cd backend
php artisan test --compact
```

### Frontend

```bash
cd frontend
pnpm lint
pnpm typecheck
pnpm build
```

## Observações

- A autenticação da API usa Clerk.
- O projeto contém proteção para excesso de requisições e cuidado com concorrência nas operações principais.
- O endereço do cliente é preenchido a partir do CEP consultado no backend.
