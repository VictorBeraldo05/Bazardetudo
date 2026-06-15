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

Mais detalhes em [docs/architecture.md](docs/architecture.md), [docs/deploy.md](docs/deploy.md) e [docs/erd.md](docs/erd.md).

