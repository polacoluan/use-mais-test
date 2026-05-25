# Postman

Arquivos:

- `use-mais-rh.postman_collection.json`
- `use-mais-rh.local.postman_environment.json`

## Como usar

1. Importe a collection e o environment no Postman.
2. Selecione o environment `Use Mais RH Local`.
3. Execute, nesta ordem:
   - `1.1 Listar sessões ativas do usuário`
   - `1.2 Gerar token JWT para o backend`
4. Depois disso, use normalmente as rotas da pasta `2. Backend Laravel`.

## Observação importante

Esse fluxo não depende de abrir o frontend para copiar token manualmente, mas ele ainda depende de existir ao menos uma sessão ativa no Clerk para o usuário configurado em `clerk_user_id`.

## Variáveis principais

- `backend_base_url`
- `clerk_api_base_url`
- `clerk_secret_key`
- `clerk_user_id`
- `clerk_jwt_template_name`
- `clerk_session_id`
- `backend_bearer_token`

## Fluxo técnico

1. A collection consulta a Backend API do Clerk para listar sessões ativas do usuário.
2. A collection salva o primeiro `session_id` encontrado.
3. A collection chama o endpoint de geração de token do template `postman-testing`.
4. O JWT retornado é salvo em `backend_bearer_token`.
5. As rotas do backend Laravel usam esse token em `Authorization: Bearer ...`.
