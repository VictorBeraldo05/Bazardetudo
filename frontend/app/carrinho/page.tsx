"use client";

import Image from "next/image";
import { Minus, Plus, ShieldCheck, Trash2, Truck } from "lucide-react";

import { NavigationLink } from "@/components/navigation-link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast-provider";
import { money } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const { showToast } = useToast();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = items.length > 0 ? 39.9 : 0;
  const total = subtotal + shipping;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="shell pb-36 pt-4 md:pb-8 md:pt-8">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-4">
          <header className="rounded-[1.6rem] border border-black/5 bg-white px-4 py-4 shadow-card md:rounded-[2rem] md:px-6 md:py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-black/38">Carrinho</p>
                <h1 className="mt-1 text-[1.65rem] font-semibold leading-tight text-black md:text-4xl">Sua compra</h1>
                <p className="mt-2 text-sm text-black/55">
                  {items.length > 0
                    ? `${itemCount} item(ns) prontos para finalizar.`
                    : "Adicione produtos para seguir com o checkout."}
                </p>
              </div>
              {items.length > 0 ? (
                <div className="rounded-[1.1rem] bg-[#f7f3ec] px-3 py-2 text-right">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-black/35">Total atual</p>
                  <p className="mt-1 text-lg font-semibold text-black md:text-xl">{money(total)}</p>
                </div>
              ) : null}
            </div>
          </header>

          {items.length === 0 ? (
            <div className="rounded-[1.6rem] border border-dashed border-black/10 bg-white px-5 py-8 text-center shadow-card md:rounded-[2rem] md:px-8 md:py-10">
              <p className="text-lg font-semibold text-black">Seu carrinho esta vazio</p>
              <p className="mt-2 text-sm leading-6 text-black/55">
                Explore o catalogo e adicione os produtos que voce quer reservar.
              </p>
              <NavigationLink href="/catalogo" className="mt-5 inline-flex rounded-full bg-[#e05a36] px-5 py-3 text-sm font-semibold text-white">
                Ir para o catalogo
              </NavigationLink>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {items.map((item) => {
                const hasDiscount = item.compareAtPrice > item.price;
                return (
                  <article
                    key={item.id}
                    className="rounded-[1.45rem] border border-black/5 bg-white p-3 shadow-card transition duration-200 active:scale-[0.995] md:rounded-[1.8rem] md:p-4"
                  >
                    <div className="flex items-start gap-3 md:gap-4">
                      <NavigationLink
                        href={`/produto/${item.slug}`}
                        className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-[1rem] bg-[#f6f1e8] md:h-28 md:w-28 md:rounded-[1.25rem]"
                      >
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </NavigationLink>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-black/38 md:text-[11px]">{item.category}</p>
                            <NavigationLink href={`/produto/${item.slug}`} className="mt-1 block text-[15px] font-semibold leading-5 text-black md:text-lg">
                              {item.name}
                            </NavigationLink>
                            <p className="mt-1 text-xs text-black/45 md:text-sm">{item.condition}</p>
                          </div>

                          <button
                            type="button"
                            className="rounded-full p-2 text-black/45 transition hover:bg-black/5 hover:text-[#b13f2b] active:scale-[0.97]"
                            onClick={() => {
                              removeItem(item.id);
                              showToast({
                                tone: "info",
                                title: "Item removido do carrinho",
                                description: item.name
                              });
                            }}
                            aria-label={`Remover ${item.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                          <div>
                            <p className="text-[1.35rem] font-bold leading-none text-black md:text-[1.55rem]">
                              {money(item.price * item.quantity)}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              {hasDiscount ? (
                                <p className="text-xs text-black/35 line-through md:text-sm">
                                  {money(item.compareAtPrice * item.quantity)}
                                </p>
                              ) : null}
                              <p className="text-xs text-black/52 md:text-sm">
                                {money(item.price)} cada
                              </p>
                            </div>
                          </div>

                          <div className="inline-flex items-center rounded-full border border-black/10 bg-[#faf8f3] p-1 shadow-sm">
                            <button
                              type="button"
                              onClick={() => {
                                const nextQuantity = item.quantity - 1;
                                updateQuantity(item.id, nextQuantity);
                                if (nextQuantity <= 0) {
                                  showToast({
                                    tone: "info",
                                    title: "Item removido do carrinho",
                                    description: item.name
                                  });
                                }
                              }}
                              className="flex h-9 w-9 items-center justify-center rounded-full text-black transition hover:bg-black/5 active:scale-[0.96]"
                              aria-label="Diminuir quantidade"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="min-w-8 px-2 text-center text-sm font-semibold text-black">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="flex h-9 w-9 items-center justify-center rounded-full text-black transition hover:bg-black/5 active:scale-[0.96]"
                              aria-label="Aumentar quantidade"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <section className="hidden rounded-[2rem] border border-black/5 bg-white p-6 shadow-card xl:block">
            <h2 className="text-2xl font-semibold text-black">Resumo da compra</h2>
            <div className="mt-6 space-y-3 text-sm text-black/60">
              <div className="flex justify-between gap-4">
                <span>Produtos</span>
                <span>{money(subtotal)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Frete estimado</span>
                <span>{money(shipping)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Descontos aplicados</span>
                <span>{money(0)}</span>
              </div>
            </div>

            <div className="mt-5 rounded-[1.4rem] bg-[#f8f4ed] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white p-2 text-[#8b6743]">
                  <Truck size={17} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-black">Entrega ou retirada</p>
                  <p className="text-xs text-black/55">Voce escolhe isso no checkout.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-black/5 pt-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-base font-medium text-black">Total</span>
                <span className="text-2xl font-bold text-black">{money(total)}</span>
              </div>
              <p className="mt-2 text-xs text-black/45">Compra segura e reserva rapida dos itens selecionados.</p>
            </div>

            <NavigationLink href="/checkout" className="block">
              <Button className="mt-6 h-12 w-full rounded-[1.2rem] bg-[#e05a36] text-base text-white hover:bg-[#d24f2a]" disabled={items.length === 0}>
                Finalizar compra
              </Button>
            </NavigationLink>
          </section>

          <section className="hidden rounded-[1.5rem] border border-black/5 bg-white p-4 shadow-card md:block xl:hidden">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="text-sm text-black/45">Total com frete estimado</p>
                <p className="mt-1 text-2xl font-bold text-black">{money(total)}</p>
              </div>
              <NavigationLink href="/checkout" className="block">
                <Button className="h-11 w-full rounded-[1rem] bg-[#e05a36] text-white hover:bg-[#d24f2a]" disabled={items.length === 0}>
                  Finalizar compra
                </Button>
              </NavigationLink>
            </div>
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
                <p className="mt-1 text-xs text-black/45">{itemCount} item(ns) no carrinho</p>
              </div>
              <NavigationLink href="/checkout" className="w-[10.5rem] flex-shrink-0">
                <Button className="h-11 w-full rounded-[1rem] bg-[#e05a36] text-white hover:bg-[#d24f2a]">
                  Continuar
                </Button>
              </NavigationLink>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-black/45">
              <ShieldCheck size={14} />
              <span>Reserva e checkout protegidos.</span>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
