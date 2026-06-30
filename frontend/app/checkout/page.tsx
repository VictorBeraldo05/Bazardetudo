"use client";

import Image from "next/image";
import { CreditCard, MapPin, ShieldCheck, Store, Truck, UserRound } from "lucide-react";
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

function SectionTitle({
  icon,
  title,
  subtitle
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-[1rem] bg-[#f7f2ea] p-2.5 text-[#8b6743]">{icon}</div>
      <div>
        <h2 className="text-lg font-semibold text-black md:text-xl">{title}</h2>
        <p className="mt-1 text-sm text-black/55">{subtitle}</p>
      </div>
    </div>
  );
}

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
  const shippingValue = 0;

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      document: "",
      address: "",
      shipping: "entrega",
      payment: "pix"
    }
  });

  const shippingMode = form.watch("shipping");
  const paymentMode = form.watch("payment");
  const finalShipping = shippingMode === "retirada" ? 0 : shippingAmount;
  const total = subtotal + finalShipping;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  async function onSubmit(values: CheckoutForm) {
    if (items.length === 0) {
      const text = "Seu carrinho esta vazio.";
      setFeedback(text);
      showToast({ tone: "error", title: "Carrinho vazio", description: text });
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
        shipping_amount: finalShipping,
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
      const text = error instanceof Error ? error.message : "Nao foi possivel concluir o checkout.";
      setFeedback(text);
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
    <main className="shell pb-36 pt-4 md:pb-8 md:pt-8">
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="space-y-4">
          <header className="rounded-[1.6rem] border border-black/5 bg-white px-4 py-4 shadow-card md:rounded-[2rem] md:px-6 md:py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-black/38">Checkout</p>
                <h1 className="mt-1 text-[1.65rem] font-semibold leading-tight text-black md:text-4xl">Finalizar compra</h1>
                <p className="mt-2 text-sm text-black/55">
                  Preencha seus dados e confirme a reserva dos produtos.
                </p>
              </div>
              <div className="rounded-[1.1rem] bg-[#f7f3ec] px-3 py-2 text-right">
                <p className="text-[11px] uppercase tracking-[0.18em] text-black/35">Total atual</p>
                <p className="mt-1 text-lg font-semibold text-black md:text-xl">{money(total)}</p>
              </div>
            </div>
          </header>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <section className="rounded-[1.6rem] border border-black/5 bg-white p-4 shadow-card md:rounded-[2rem] md:p-6">
              <SectionTitle
                icon={<UserRound size={18} />}
                title="Seus dados"
                subtitle="Informacoes para contato e identificacao do pedido."
              />

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <input className="rounded-2xl border border-black/10 px-4 py-3" placeholder="Nome completo" {...form.register("fullName")} />
                <input className="rounded-2xl border border-black/10 px-4 py-3" placeholder="E-mail" {...form.register("email")} />
                <input className="rounded-2xl border border-black/10 px-4 py-3" placeholder="WhatsApp" {...form.register("phone")} />
                <input className="rounded-2xl border border-black/10 px-4 py-3" placeholder="CPF" {...form.register("document")} />
              </div>
            </section>

            <section className="rounded-[1.6rem] border border-black/5 bg-white p-4 shadow-card md:rounded-[2rem] md:p-6">
              <SectionTitle
                icon={<MapPin size={18} />}
                title="Entrega ou retirada"
                subtitle="Escolha como quer receber o pedido."
              />

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label
                  className={`cursor-pointer rounded-[1.35rem] border px-4 py-4 transition ${
                    shippingMode === "entrega" ? "border-[#c58b59] bg-[#fbf4eb]" : "border-black/10 bg-white"
                  }`}
                >
                  <input type="radio" value="entrega" className="hidden" {...form.register("shipping")} />
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-white p-2 text-[#8b6743] shadow-sm">
                      <Truck size={16} />
                    </div>
                    <div>
                      <p className="font-semibold text-black">Entrega</p>
                      <p className="mt-1 text-sm text-black/55">Receba no endereco informado.</p>
                    </div>
                  </div>
                </label>

                <label
                  className={`cursor-pointer rounded-[1.35rem] border px-4 py-4 transition ${
                    shippingMode === "retirada" ? "border-[#c58b59] bg-[#fbf4eb]" : "border-black/10 bg-white"
                  }`}
                >
                  <input type="radio" value="retirada" className="hidden" {...form.register("shipping")} />
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-white p-2 text-[#8b6743] shadow-sm">
                      <Store size={16} />
                    </div>
                    <div>
                      <p className="font-semibold text-black">Retirada na loja</p>
                      <p className="mt-1 text-sm text-black/55">Sem custo de frete.</p>
                    </div>
                  </div>
                </label>
              </div>

              <div className="mt-4">
                <input
                  className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  placeholder={shippingMode === "retirada" ? "Opcional: observacoes para retirada" : "Endereco completo"}
                  {...form.register("address")}
                />
              </div>
            </section>

            <section className="rounded-[1.6rem] border border-black/5 bg-white p-4 shadow-card md:rounded-[2rem] md:p-6">
              <SectionTitle
                icon={<CreditCard size={18} />}
                title="Pagamento"
                subtitle="Defina como voce quer concluir o pedido."
              />

              <div className="mt-5 grid gap-3">
                {[
                  { value: "pix", title: "Pix", text: "Confirmacao rapida para agilizar a reserva." },
                  { value: "cartao", title: "Cartao", text: "Pagamento combinado com a loja." },
                  { value: "manual", title: "Pagamento combinado", text: "Ajuste final pelo WhatsApp." }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-[1.2rem] border px-4 py-4 transition ${
                      paymentMode === option.value ? "border-[#c58b59] bg-[#fbf4eb]" : "border-black/10 bg-white"
                    }`}
                  >
                    <input type="radio" value={option.value} className="hidden" {...form.register("payment")} />
                    <p className="font-semibold text-black">{option.title}</p>
                    <p className="mt-1 text-sm text-black/55">{option.text}</p>
                  </label>
                ))}
              </div>

              {feedback ? <p className="mt-4 text-sm text-[#b13f2b]">{feedback}</p> : null}
            </section>

            <section className="hidden rounded-[1.6rem] border border-black/5 bg-white p-4 shadow-card md:block xl:hidden">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-black/45">Total da compra</p>
                  <p className="mt-1 text-2xl font-bold text-black">{money(total)}</p>
                </div>
                <Button
                  type="submit"
                  disabled={submitting || items.length === 0}
                  className="h-11 rounded-[1rem] bg-[#e05a36] px-6 text-white hover:bg-[#d24f2a]"
                >
                  {submitting ? "Processando..." : "Confirmar pedido"}
                </Button>
              </div>
            </section>
          </form>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <section className="rounded-[2rem] border border-black/5 bg-white p-5 shadow-card md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-black md:text-2xl">Resumo do pedido</h2>
                <p className="mt-1 text-sm text-black/55">{itemCount} item(ns) selecionados</p>
              </div>
              <div className="rounded-full bg-[#f7f3ec] px-3 py-1 text-sm font-medium text-black">
                {money(total)}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-[1.35rem] bg-[#f8f4ed] p-3">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[0.9rem] bg-white">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold leading-5 text-black">{item.name}</p>
                    <p className="mt-1 text-xs text-black/45">{item.quantity} x {money(item.price)}</p>
                  </div>
                  <p className="text-sm font-semibold text-black">{money(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3 text-sm text-black/60">
              <div className="flex justify-between gap-4">
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Frete</span>
                <span>{money(finalShipping)}</span>
              </div>
            </div>

            <div className="mt-5 rounded-[1.3rem] bg-[#f8f4ed] p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-white p-2 text-[#8b6743]">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-black">Reserva segura</p>
                  <p className="mt-1 text-xs leading-5 text-black/55">
                    Seus itens sao reservados durante o processo de finalizacao para evitar indisponibilidade.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-black/5 pt-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-base font-medium text-black">Total</span>
                <span className="text-2xl font-bold text-black">{money(total)}</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={submitting || items.length === 0}
              className="mt-6 hidden h-12 w-full rounded-[1.2rem] bg-[#e05a36] text-base text-white hover:bg-[#d24f2a] xl:inline-flex"
            >
              {submitting ? "Processando..." : "Confirmar pedido"}
            </Button>
          </section>
        </aside>
      </div>

      {items.length > 0 ? (
        <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.7rem)] z-40 px-3 md:hidden">
          <div className="rounded-[1.45rem] border border-black/5 bg-white/96 p-3 shadow-[0_18px_50px_-26px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.16em] text-black/38">Total da compra</p>
                <p className="mt-1 text-[1.4rem] font-bold leading-none text-black">{money(total)}</p>
                <p className="mt-1 text-xs text-black/45">{itemCount} item(ns) reservados</p>
              </div>
              <Button
                type="submit"
                onClick={form.handleSubmit(onSubmit)}
                disabled={submitting}
                className="h-11 w-[10.8rem] rounded-[1rem] bg-[#e05a36] text-white hover:bg-[#d24f2a]"
              >
                {submitting ? "Enviando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
