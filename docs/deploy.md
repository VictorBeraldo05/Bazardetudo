# Deploy

## Backend no Render

- Runtime: Python 3.11+
- Root directory: `backend`
- Build command: `pip install -e .`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Variaveis: usar os valores de `.env.example`

## Frontend na Vercel

- Root directory: `frontend`
- Framework preset: Next.js
- Build command: `npm run build`
- Variaveis: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Banco no Supabase

1. Criar projeto PostgreSQL.
2. Executar `database/schema.sql`.
3. Executar `database/seeds.sql`.
4. Configurar Storage para imagens de produtos.
5. Criar politicas RLS conforme perfis de cliente e admin.

