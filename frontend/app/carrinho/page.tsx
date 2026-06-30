"use client";

import { NavigationLink } from "@/components/navigation-link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast-provider";
import { money } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const { showToast } = useToast();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main className="shell py-8">
      <div className="mb-8 rounded-[2rem] bg-[#111111] px-6 py-8 text-white md:px-8">
        <p className="text-sm uppercase tracking-[0.24em] text-white/55">Carrinho</p>
        <h1 className="mt-2 font-display text-4xl">Revise seus itens antes de finalizar.</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="space-y-4">
          {items.length === 0 ? (
            <div className="rounded-[2rem] border border-black/5 bg-white p-8 text-black/60 shadow-card">
              Seu carrinho ainda esta vazio.
            </div>
          ) : null}

          {items.map((item) => (
            <div key={item.id} className="rounded-[2rem] border border-black/5 bg-white p-5 shadow-card">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-black">{item.name}</p>
                  <p className="mt-1 text-sm text-black/50">{item.category}</p>
                  <p className="mt-2 text-sm text-black/58">Quantidade: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-black">{money(item.price * item.quantity)}</p>
                  <button
                    className="mt-2 text-sm text-black/50 transition hover:text-black active:scale-[0.985]"
                    onClick={() => {
                      removeItem(item.id);
                      showToast({
                        tone: "info",
                        title: "Item removido do carrinho",
                        description: item.name
                      });
                    }}
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

        <aside className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
          <h2 className="text-2xl font-semibold text-black">Resumo</h2>
          <div className="mt-6 space-y-3 text-sm text-black/60">
            <div className="flex justify-between"><span>Subtotal</span><span>{money(total)}</span></div>
            <div className="flex justify-between"><span>Frete estimado</span><span>{money(items.length ? 39.9 : 0)}</span></div>
            <div className="flex justify-between"><span>Descontos</span><span>{money(0)}</span></div>
          </div>
          <div className="mt-6 border-t border-black/5 pt-4">
            <div className="flex justify-between text-lg font-semibold text-black">
              <span>Total</span>
              <span>{money(total + (items.length ? 39.9 : 0))}</span>
            </div>
          </div>
          <NavigationLink href="/checkout" className="block">
            <Button className="mt-6 w-full" disabled={items.length === 0}>Finalizar compra</Button>
          </NavigationLink>
        </aside>
      </div>
    </main>
  );
}
