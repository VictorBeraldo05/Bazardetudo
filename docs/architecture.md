# Arquitetura

## Visao geral

A solucao foi organizada como monorepo com separacao clara entre frontend, backend, banco e documentacao. O objetivo principal e substituir o fluxo manual via WhatsApp por uma plataforma transacional, mobile-first e preparada para crescimento.

## Camadas

- `frontend`: Next.js 15 com App Router, Tailwind e Zustand para UX rapida, fluida e orientada a catalogo.
- `backend`: FastAPI modularizado por dominio com regras de reserva de estoque, checkout e notificacoes.
- `database`: schema SQL para Supabase/PostgreSQL com constraints e indices voltados a integridade operacional.
- `docs`: apoio para onboarding, deploy, fluxos e modelagem.

## Principais decisoes

- Reserva temporaria de estoque de 15 minutos via `StockReservationService`.
- Servico `WhatsAppNotificationService` desacoplado para futura troca entre Evolution API, Z-API ou Meta Cloud API.
- Status de produto controlado no backend para impedir venda duplicada.
- Estrutura pronta para dividir autenticacao de clientes e administradores.
- Frontend inspirado na marca, com visual premium e destaque maximo para as fotos.

## Modulos da API

- `auth`
- `products`
- `categories`
- `inventory`
- `orders`
- `dashboard`
- `customers`
- `reports`
- `whatsapp`

## Evolucoes recomendadas

1. Adicionar refresh token persistido em tabela e revogacao.
2. Implementar rate limiting com Redis.
3. Criar worker assíncrono para expiracao de reservas e disparos de notificacao.
4. Substituir token header temporario por RBAC com JWT real para admin.
5. Integrar uploads de imagem com Supabase Storage.

