"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { useNavigationFeedback } from "@/components/navigation-feedback-provider";
import { useToast } from "@/components/toast-provider";
import { checkoutOrder, reserveProduct, upsertCustomer } from "@/lib/api";
import { money } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

const checkoutSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(8),
  document: z.string().min(11),
  address: z.string().min(5),
  shipping: z.enum(["entrega", "retirada"]),
  payment: z.enum(["pix", "cartao", "manual"])
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const router = useRouter();
  const { startNavigation } = useNavigationFeedback();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const shippingAmount = 39.9;
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      phone: "",
      document: "",
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
        phone: values.phone,
        document: values.document.replace(/\D/g, "")
      });

      const order = await checkoutOrder({
        customer_id: customer.id,
        cart_id: cartId,
        shipping_amount: values.shipping === "retirada" ? 0 : shippingAmount,
        discount_amount: 0,
        notes: `Endereco: ${values.address} | Entrega: ${values.shipping} | Pagamento: ${values.payment}`
      });

      clearCart();
      showToast({
        tone: "success",
        title: "Pedido confirmado",
        description: `Numero ${order.order_number}`
      });
      startNavigation(`/pedidos?sucesso=${order.order_number}`);
      router.push(`/pedidos?sucesso=${order.order_number}`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel concluir o checkout.");
      showToast({
        tone: "error",
        title: "Falha ao concluir pedido",
        description: "Confira os dados e tente novamente."
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="shell py-8">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-6">
          <div className="rounded-[2rem] bg-[#111111] p-8 text-white shadow-card">
            <p className="text-sm uppercase tracking-[0.24em] text-white/55">Checkout</p>
            <h1 className="mt-3 font-display text-4xl">Finalize sua compra em poucos passos.</h1>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
            <input className="rounded-2xl border border-black/10 px-4 py-3" placeholder="Nome completo" {...form.register("fullName")} />
            <input className="rounded-2xl border border-black/10 px-4 py-3" placeholder="E-mail" {...form.register("email")} />
            <input className="rounded-2xl border border-black/10 px-4 py-3" placeholder="WhatsApp" {...form.register("phone")} />
            <input className="rounded-2xl border border-black/10 px-4 py-3" placeholder="CPF" {...form.register("document")} />
            <input className="rounded-2xl border border-black/10 px-4 py-3" placeholder="Endereco" {...form.register("address")} />
            <select className="rounded-2xl border border-black/10 px-4 py-3" {...form.register("shipping")}>
              <option value="entrega">Entrega</option>
              <option value="retirada">Retirada na loja</option>
            </select>
            <select className="rounded-2xl border border-black/10 px-4 py-3" {...form.register("payment")}>
              <option value="pix">Pix</option>
              <option value="cartao">Cartao</option>
              <option value="manual">Pagamento combinado</option>
            </select>
            <Button type="submit" disabled={submitting || items.length === 0}>
              {submitting ? "Processando..." : "Confirmar pedido"}
            </Button>
            {feedback ? <p className="text-sm text-red-600">{feedback}</p> : null}
          </form>
        </section>

        <aside className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
          <h2 className="text-2xl font-semibold text-black">Resumo do pedido</h2>
          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="rounded-[1.5rem] bg-[#f6f2eb] p-4">
                <p className="font-semibold text-black">{item.name}</p>
                <p className="mt-1 text-sm text-black/55">{money(item.price)} x {item.quantity}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3 text-sm text-black/60">
            <div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div>
            <div className="flex justify-between"><span>Frete</span><span>{money(form.watch("shipping") === "retirada" ? 0 : shippingAmount)}</span></div>
          </div>
          <div className="mt-6 border-t border-black/5 pt-4">
            <div className="flex justify-between text-lg font-semibold text-black">
              <span>Total</span>
              <span>{money(subtotal + (form.watch("shipping") === "retirada" ? 0 : shippingAmount))}</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
