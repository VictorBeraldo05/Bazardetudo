# Bazar de Tudo

Plataforma full-stack para digitalizar a operação da Bazar de Tudo com catálogo premium, controle transacional de estoque, checkout com reserva temporária e base pronta para automações de WhatsApp.

## Stack

- Backend: FastAPI, SQLAlchemy, Pydantic, Alembic, JWT
- Banco: PostgreSQL / Supabase
- Frontend: Next.js 15, TypeScript, TailwindCSS, React Hook Form, Zod, Zustand
- Deploy: Render (API) e Vercel (web)

## Estrutura

```text
backend/     API FastAPI, regras de negócio e seeds
frontend/    Aplicação Next.js mobile-first
database/    SQL de schema e dados iniciais
docs/        Arquitetura, fluxos e diagrama ER
```

## Como rodar

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -e .
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Fluxo crítico de estoque

1. Produto entra como `available`.
2. Ao iniciar checkout, o sistema cria uma reserva por 15 minutos.
3. Enquanto a reserva estiver ativa, o item não pode ser vendido novamente.
4. Pagamento confirmado converte a reserva em pedido e reduz o estoque.
5. Expiração automática ou cancelamento devolvem o item para `available`.

## Entregáveis incluídos

- Arquitetura da solução
- Estrutura de pastas
- Modelagem relacional
- Scripts SQL
- Backend com módulos REST principais
- Frontend com páginas cliente e admin
- Seeds iniciais
- `.env.example`
- Diagramas e fluxos de negócio
- Instruções de deploy para Render e Vercel

## Deploy

- Render: publicar `backend` com `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Vercel: apontar a raiz para `frontend`
- Supabase: aplicar [database/schema.sql](database/schema.sql) e [database/seeds.sql](database/seeds.sql)

### Keepalive do Render

- O backend possui heartbeat interno iniciado no startup da aplicaÃ§Ã£o.
- Para ativar no Render, configure:
  - `APP_PUBLIC_URL=https://bazardetudo.onrender.com`
  - `HEARTBEAT_ENABLED=true`
  - `HEARTBEAT_INTERVAL_MINUTES=10`
- Quando ativo, a API faz um `GET` periÃ³dico em `APP_PUBLIC_URL/health`.
- Importante: no plano gratuito isso ajuda a manter a instÃ¢ncia ativa enquanto ela estiver rodando, mas nÃ£o substitui totalmente um ping externo caso o serviÃ§o jÃ¡ tenha sido suspenso.

### Disparo automÃ¡tico para grupos de WhatsApp

- O projeto possui fila interna em banco para disparar produtos novos para grupos de WhatsApp sem travar o cadastro do produto.
- O job Ã© criado automaticamente quando um produto novo Ã© cadastrado no admin.
- O worker roda junto com a API no startup da aplicaÃ§Ã£o, entÃ£o nÃ£o existe comando separado para iniciar worker neste momento.

#### VariÃ¡veis de ambiente

- `WHATSAPP_PROVIDER=mock|evolution|http`
- `WHATSAPP_BASE_URL=` URL base do gateway/provedor
- `WHATSAPP_API_TOKEN=` token do gateway
- `WHATSAPP_INSTANCE_NAME=` nome da instÃ¢ncia no provedor (usado no modo `evolution`)
- `WHATSAPP_AUTO_SEND_PRODUCTS=true`
- `WHATSAPP_SEND_DELAY_MS=5000`
- `WHATSAPP_WORKER_POLL_INTERVAL_SECONDS=10`
- `WHATSAPP_SEND_MAX_RETRIES=3`
- `WHATSAPP_REQUEST_TIMEOUT_SECONDS=30`
- `STOREFRONT_PUBLIC_URL=https://seu-site.vercel.app`

#### Como conectar o WhatsApp

- Em ambiente real, a opÃ§Ã£o mais compatÃ­vel com esta stack Ã© usar um gateway HTTP de WhatsApp e deixar a sessÃ£o persistente nesse gateway.
- O modo `evolution` foi preparado para integraÃ§Ã£o com Evolution API, usando `WHATSAPP_BASE_URL`, `WHATSAPP_API_TOKEN` e `WHATSAPP_INSTANCE_NAME`.
- O modo `mock` nÃ£o envia mensagens reais, apenas simula o envio para teste do fluxo.

#### Passo a passo exato com Evolution API

1. Suba sua Evolution API em um ambiente com sessÃ£o persistente.
2. Crie uma instÃ¢ncia para a loja. Exemplo de nome: `bazar-de-tudo`.
3. Conecte o WhatsApp lendo o QR Code dessa instÃ¢ncia.
4. No painel do grupo de divulgaÃ§Ã£o, obtenha o ID real do grupo. Normalmente ele termina com `@g.us`.
5. No Render do backend, configure:
   - `WHATSAPP_PROVIDER=evolution`
   - `WHATSAPP_BASE_URL=https://sua-evolution.exemplo.com`
   - `WHATSAPP_API_TOKEN=seu-token`
   - `WHATSAPP_INSTANCE_NAME=bazar-de-tudo`
   - `WHATSAPP_AUTO_SEND_PRODUCTS=true`
   - `WHATSAPP_SEND_DELAY_MS=5000`
   - `WHATSAPP_WORKER_POLL_INTERVAL_SECONDS=10`
   - `WHATSAPP_SEND_MAX_RETRIES=3`
   - `WHATSAPP_REQUEST_TIMEOUT_SECONDS=30`
   - `STOREFRONT_PUBLIC_URL=https://seu-site.vercel.app`
6. FaÃ§a novo deploy do backend no Render.
7. No admin da loja, abra `Configuracoes`.
8. Cadastre cada grupo com:
   - nome interno
   - ID do grupo do WhatsApp
   - status ativo
9. Cadastre um produto novo no admin.
10. Confira os resultados em:
   - `Configuracoes` no painel
   - `GET /api/v1/whatsapp/jobs`
   - `GET /api/v1/whatsapp/logs`

#### Como testar sem risco antes do envio real

1. No Render, deixe `WHATSAPP_PROVIDER=mock`.
2. Cadastre um grupo qualquer no admin.
3. Cadastre um produto novo.
4. Verifique se o job e o log foram criados.
5. Depois troque para `WHATSAPP_PROVIDER=evolution` e redeploy.

#### Como cadastrar IDs dos grupos

- Use a API admin `POST /api/v1/whatsapp/groups`.
- Campos:
  - `name`
  - `whatsapp_group_id`
  - `active`
- Em integraÃ§Ãµes baseadas em WhatsApp Web/gateways, o ID do grupo costuma estar em formato parecido com `1203630xxxxxxxx@g.us`.

#### Como testar o envio

- Cadastre um grupo ativo pela API admin.
- Cadastre um produto novo no admin.
- O produto gera automaticamente um job `send-product-to-whatsapp-groups`.
- Consulte:
  - `GET /api/v1/whatsapp/jobs`
  - `GET /api/v1/whatsapp/logs`
- Para reenfileirar manualmente um produto:
  - `POST /api/v1/whatsapp/jobs/send-product`
  - body: `{ "product_id": "..." }`

Mais detalhes em [docs/architecture.md](docs/architecture.md), [docs/deploy.md](docs/deploy.md) e [docs/erd.md](docs/erd.md).
