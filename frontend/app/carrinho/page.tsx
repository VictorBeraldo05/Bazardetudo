"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { money } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main className="shell py-8">
      <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-4">
          <h1 className="font-display text-4xl">Carrinho</h1>
          {items.length === 0 ? <p className="text-black/60">Seu carrinho ainda esta vazio.</p> : null}
          {items.map((item) => (
            <div key={item.id} className="rounded-[2rem] border border-black/5 bg-white/75 p-5 shadow-card">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-black/50">Quantidade: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{money(item.price * item.quantity)}</p>
                  <button className="text-sm text-black/50" onClick={() => removeItem(item.id)}>
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
        <aside className="rounded-[2rem] border border-black/5 bg-white/75 p-6 shadow-card">
          <h2 className="font-display text-2xl">Resumo</h2>
          <div className="mt-6 space-y-3 text-sm text-black/60">
            <div className="flex justify-between"><span>Subtotal</span><span>{money(total)}</span></div>
            <div className="flex justify-between"><span>Frete estimado</span><span>R$ 39,90</span></div>
            <div className="flex justify-between"><span>Cupom</span><span>- R$ 0,00</span></div>
          </div>
          <div className="mt-6 border-t border-black/5 pt-4">
            <div className="flex justify-between font-semibold"><span>Total</span><span>{money(total + 39.9)}</span></div>
          </div>
          <Link href="/checkout" className="block">
            <Button className="mt-6 w-full" disabled={items.length === 0}>Ir para checkout</Button>
          </Link>
        </aside>
      </div>
    </main>
  );
}
