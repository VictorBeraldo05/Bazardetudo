from datetime import UTC, datetime, timedelta
from decimal import Decimal
from uuid import uuid4

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.cart import Cart, CartItem
from app.models.catalog import Product
from app.models.fulfillment import Order, OrderItem
from app.models.inventory import InventoryMovement


RESERVATION_MINUTES = 15


class StockReservationService:
    def add_stock(
        self,
        db: Session,
        product_id: str,
        quantity: int,
        reason: str | None = None,
        reference_id: str | None = None,
    ) -> Product:
        product = db.get(Product, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Produto nao encontrado")
        if quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantidade deve ser maior que zero")

        product.quantity += quantity
        if product.quantity > 0 and product.status in {"sold", "available"}:
            product.status = "available"

        db.add(
            InventoryMovement(
                product_id=product.id,
                movement_type="entry",
                quantity=quantity,
                reason=reason or "Entrada manual de estoque",
                reference_id=reference_id,
            )
        )
        db.commit()
        db.refresh(product)
        return product

    def reserve_product(self, db: Session, product_id: str, session_token: str, quantity: int = 1) -> Cart:
        product = db.get(Product, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Produto nao encontrado")

        cart = db.scalar(select(Cart).where(Cart.session_token == session_token))
        if not cart:
            cart = Cart(session_token=session_token, status="active")
            db.add(cart)
            db.flush()

        cart_item = db.scalar(select(CartItem).where(CartItem.cart_id == cart.id, CartItem.product_id == product_id))
        same_cart_reservation = bool(cart_item and product.status == "reserved")
        if (product.status != "available" and not same_cart_reservation) or product.quantity < quantity:
            raise HTTPException(status_code=409, detail="Produto indisponivel para reserva")

        if cart_item:
            cart_item.quantity = quantity
        else:
            db.add(CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity))

        cart.reserved_until = datetime.now(UTC) + timedelta(minutes=RESERVATION_MINUTES)
        product.status = "reserved"
        db.commit()
        db.refresh(cart)
        return cart

    def release_expired_reservations(self, db: Session) -> int:
        now = datetime.now(UTC)
        carts = db.scalars(select(Cart).where(Cart.reserved_until.is_not(None), Cart.reserved_until < now)).all()
        released = 0
        for cart in carts:
            items = db.scalars(select(CartItem).where(CartItem.cart_id == cart.id)).all()
            for item in items:
                product = db.get(Product, item.product_id)
                if product and product.status == "reserved":
                    product.status = "available"
                    released += 1
            cart.status = "expired"
            cart.reserved_until = None
        db.commit()
        return released

    def checkout(self, db: Session, customer_id: str, cart_id: str, shipping_amount: Decimal, discount_amount: Decimal, notes: str | None) -> Order:
        cart = db.get(Cart, cart_id)
        if not cart:
            raise HTTPException(status_code=404, detail="Carrinho nao encontrado")

        items = db.scalars(select(CartItem).where(CartItem.cart_id == cart.id)).all()
        if not items:
            raise HTTPException(status_code=400, detail="Carrinho vazio")

        subtotal = Decimal("0")
        order = Order(
            customer_id=customer_id,
            order_number=f"BDT-{uuid4().hex[:8].upper()}",
            status="new",
            subtotal=Decimal("0"),
            discount_amount=discount_amount,
            shipping_amount=shipping_amount,
            total_amount=Decimal("0"),
            notes=notes,
        )
        db.add(order)
        db.flush()

        for item in items:
            product = db.get(Product, item.product_id)
            if not product or product.quantity < item.quantity:
                raise HTTPException(status_code=409, detail="Estoque insuficiente no checkout")
            subtotal += Decimal(str(product.sale_price)) * item.quantity
            product.quantity -= item.quantity
            product.status = "sold" if product.quantity == 0 else "available"
            db.add(
                OrderItem(
                    order_id=order.id,
                    product_id=product.id,
                    product_name=product.name,
                    quantity=item.quantity,
                    unit_price=product.sale_price,
                )
            )
            db.add(
                InventoryMovement(
                    product_id=product.id,
                    movement_type="sale",
                    quantity=-item.quantity,
                    reason="Checkout concluido",
                    reference_id=order.id,
                )
            )

        order.subtotal = subtotal
        order.total_amount = subtotal + shipping_amount - discount_amount
        cart.status = "converted"
        cart.reserved_until = None
        db.commit()
        db.refresh(order)
        return order
