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

- `WHATSAPP_PROVIDER=mock|green-api|waha|http|evolution`
- `WHATSAPP_BASE_URL=` URL base do gateway/provedor
- `WHATSAPP_INSTANCE_ID=` id da instÃ¢ncia no GREEN-API
- `WHATSAPP_API_TOKEN=` token do gateway
- `WHATSAPP_SESSION_NAME=default` nome da sessÃ£o no WAHA
- `WHATSAPP_INSTANCE_NAME=` compatibilidade legada com integraÃ§Ãµes anteriores
- `WHATSAPP_AUTO_SEND_PRODUCTS=true`
- `WHATSAPP_SEND_DELAY_MS=5000`
- `WHATSAPP_WORKER_POLL_INTERVAL_SECONDS=10`
- `WHATSAPP_SEND_MAX_RETRIES=3`
- `WHATSAPP_REQUEST_TIMEOUT_SECONDS=30`
- `STOREFRONT_PUBLIC_URL=https://seu-site.vercel.app`

#### Como conectar o WhatsApp

- Em ambiente real, a opÃ§Ã£o mais compatÃ­vel com esta stack Ã© usar um gateway HTTP de WhatsApp e deixar a sessÃ£o persistente nesse gateway.
- O modo `green-api` Ã© agora a integraÃ§Ã£o principal recomendada para este projeto.
- O modo `green-api` usa `WHATSAPP_BASE_URL`, `WHATSAPP_INSTANCE_ID` e `WHATSAPP_API_TOKEN`.
- O modo `waha` usa `WHATSAPP_BASE_URL`, `WHATSAPP_API_TOKEN` e `WHATSAPP_SESSION_NAME`.
- O modo `mock` nÃ£o envia mensagens reais, apenas simula o envio para teste do fluxo.

#### Passo a passo exato com GREEN-API

Base oficial usada nesta integraÃ§Ã£o:
- GREEN-API envia texto por `POST /waInstance{idInstance}/sendMessage/{apiTokenInstance}` com `chatId` e `message`.
- GREEN-API envia imagem por `POST /waInstance{idInstance}/sendFileByUrl/{apiTokenInstance}` com `chatId`, `urlFile`, `fileName` e `caption`.
- IDs de grupos usam formato `1234567890-123456789@g.us`.
- A documentaÃ§Ã£o oficial do GREEN-API tambÃ©m fornece `GetStateInstance` e `QR` para acompanhar conexÃ£o e autenticaÃ§Ã£o.

1. Crie uma conta na GREEN-API e gere uma instÃ¢ncia no plano free.
2. Aguarde a instÃ¢ncia ficar operacional.
3. No painel da GREEN-API, pegue:
   - `apiUrl`
   - `idInstance`
   - `apiTokenInstance`
4. Use o QR oficial da instÃ¢ncia para conectar o WhatsApp que vai divulgar os produtos.
5. Confirme o status da instÃ¢ncia com `GetStateInstance`.
6. Adicione esse nÃºmero nos grupos de divulgaÃ§Ã£o.
7. Obtenha os IDs reais dos grupos no formato `...@g.us`.
8. No Render do backend da loja, configure:
   - `WHATSAPP_PROVIDER=green-api`
   - `WHATSAPP_BASE_URL=https://7105.api.green-api.com`
   - `WHATSAPP_INSTANCE_ID=1101000000`
   - `WHATSAPP_API_TOKEN=seu-apiTokenInstance`
   - `WHATSAPP_AUTO_SEND_PRODUCTS=true`
   - `WHATSAPP_SEND_DELAY_MS=5000`
   - `WHATSAPP_WORKER_POLL_INTERVAL_SECONDS=10`
   - `WHATSAPP_SEND_MAX_RETRIES=3`
   - `WHATSAPP_REQUEST_TIMEOUT_SECONDS=30`
   - `STOREFRONT_PUBLIC_URL=https://seu-site.vercel.app`
9. FaÃ§a novo deploy do backend da loja.
10. No admin da loja, abra `Configuracoes`.
11. Cadastre cada grupo com:
   - nome interno
   - ID do grupo do WhatsApp
   - status ativo
12. Cadastre um produto novo no admin.
13. Confira os resultados em:
   - `Configuracoes` no painel
   - `GET /api/v1/whatsapp/jobs`
   - `GET /api/v1/whatsapp/logs`

#### Como testar sem risco antes do envio real

1. No Render, deixe `WHATSAPP_PROVIDER=mock`.
2. Cadastre um grupo qualquer no admin.
3. Cadastre um produto novo.
4. Verifique se o job e o log foram criados.
5. Depois troque para `WHATSAPP_PROVIDER=green-api` e redeploy.

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
