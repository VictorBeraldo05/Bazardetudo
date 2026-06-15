# Fluxos de Negocio

## Cadastro e divulgacao de produto

1. Admin cadastra produto com fotos, avaria, custo, venda e tags.
2. Produto entra como `available`.
3. Admin dispara campanha em WhatsApp usando `WhatsAppNotificationService`.
4. Clientes acessam o link direto para compra ou catalogo completo.

## Checkout com reserva

1. Cliente adiciona item ao carrinho.
2. API cria reserva por 15 minutos e altera produto para `reserved`.
3. Checkout coleta dados, frete e pagamento.
4. Em sucesso, pedido e movimentacao de estoque sao persistidos.
5. Se expirar, a reserva e liberada e o status volta para `available`.

## Operacao de entrega

1. Pedido sai como `new`.
2. Pagamento confirmado muda para `paid`.
3. Operacao move para `separacao`, `pronto para retirada` ou `em transporte`.
4. Confirmacao finaliza em `entregue`.

