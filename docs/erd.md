# Diagrama ER

```mermaid
erDiagram
    categories ||--o{ products : contains
    products ||--o{ product_images : has
    products ||--o{ inventory_movements : tracks
    customers ||--o{ carts : owns
    carts ||--o{ cart_items : contains
    products ||--o{ cart_items : reserved_in
    customers ||--o{ orders : places
    orders ||--o{ order_items : contains
    products ||--o{ order_items : sold_as
    orders ||--|| payments : settles
    orders ||--|| deliveries : ships
    orders ||--|| pickup_orders : pickup
    products ||--o{ whatsapp_campaigns : promotes
    whatsapp_campaigns ||--o{ whatsapp_logs : logs
    customers ||--o{ notifications : receives
```

## Tabelas chave

- `products`: fonte de verdade de status e estoque
- `carts` e `cart_items`: suporte a lock temporario de itens unicos
- `orders`, `payments`, `deliveries`: jornada operacional de venda
- `financial_transactions`: base para fluxo de caixa
- `settings`: configuracoes de loja e integracoes

