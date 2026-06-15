"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { checkoutOrder, reserveProduct, upsertCustomer } from "@/lib/api";
import { money } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

const checkoutSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(8),
  address: z.string().min(5),
  shipping: z.enum(["entrega", "retirada"]),
  payment: z.enum(["pix", "cartao", "manual"])
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const shippingAmount = 39.9;
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      phone: "",
      shipping: "entrega",
      payment: "pix"
    }
  });

  async function onSubmit(values: CheckoutForm) {
    if (items.length === 0) {
      setFeedback("Seu carrinho esta vazio.");
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      let cartId = "";
      for (const item of items) {
        const reservation = await reserveProduct(item.id, item.quantity);
        cartId = reservation.cart_id;
      }

      const customer = await upsertCustomer({
        full_name: values.fullName,
        email: values.email,
        phone: values.phone
      });

      const order = await checkoutOrder({
        customer_id: customer.id,
        cart_id: cartId,
        shipping_amount: values.shipping === "retirada" ? 0 : shippingAmount,
        discount_amount: 0,
        notes: `Endereco: ${values.address} | Entrega: ${values.shipping} | Pagamento: ${values.payment}`
      });

      clearCart();
      router.push(`/pedidos?sucesso=${order.order_number}`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel concluir o checkout.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="shell py-8">
      <div className="max-w-3xl space-y-6">
        <h1 className="font-display text-4xl">Checkout</h1>
        <div className="rounded-[2rem] border border-black/5 bg-black p-5 text-white">
          <p className="text-sm text-white/70">Resumo do pedido</p>
          <p className="mt-2 text-2xl font-semibold">{money(subtotal + (form.watch("shipping") === "retirada" ? 0 : shippingAmount))}</p>
          <p className="mt-2 text-sm text-white/70">{items.length} item(ns) aguardando reserva transacional.</p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 rounded-[2rem] border border-black/5 bg-white/75 p-6 shadow-card">
          <input className="rounded-2xl border border-black/10 px-4 py-3" placeholder="Nome completo" {...form.register("fullName")} />
          <input className="rounded-2xl border border-black/10 px-4 py-3" placeholder="E-mail" {...form.register("email")} />
          <input className="rounded-2xl border border-black/10 px-4 py-3" placeholder="WhatsApp" {...form.register("phone")} />
          <input className="rounded-2xl border border-black/10 px-4 py-3" placeholder="Endereco" {...form.register("address")} />
          <select className="rounded-2xl border border-black/10 px-4 py-3" {...form.register("shipping")}>
            <option value="entrega">Entrega</option>
            <option value="retirada">Retirada</option>
          </select>
          <select className="rounded-2xl border border-black/10 px-4 py-3" {...form.register("payment")}>
            <option value="pix">Pix</option>
            <option value="cartao">Cartao</option>
            <option value="manual">Pagamento manual</option>
          </select>
          <Button type="submit" disabled={submitting || items.length === 0}>
            {submitting ? "Processando..." : "Confirmar pedido"}
          </Button>
          {feedback ? <p className="text-sm text-red-600">{feedback}</p> : null}
        </form>
      </div>
    </main>
  );
}
