"use client";

import Link from "next/link";
import { useState } from "react";

import { createProductArrivalAlert, type Category } from "@/lib/api";
import type { Product } from "@/lib/data";
import { Button } from "@/components/ui/button";

type AuthUser = {
  full_name?: string;
  email?: string;
};

export function FavoritesAlertsClient({
  categories,
  products,
  user
}: {
  categories: Category[];
  products: Product[];
  user: AuthUser | null;
}) {
  const [customerName, setCustomerName] = useState(user?.full_name ?? "");
  const [customerEmail, setCustomerEmail] = useState(user?.email ?? "");
  const [desiredProduct, setDesiredProduct] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const result = await createProductArrivalAlert({
        customer_name: customerName || undefined,
        customer_email: customerEmail,
        desired_product: desiredProduct,
        category_name: categoryName || undefined,
        notes: notes || undefined
      });

      setFeedback(result.message);
      setDesiredProduct("");
      setCategoryName("");
      setNotes("");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel salvar seu alerta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell space-y-6 py-6 md:py-8">
      <section className="rounded-[2rem] bg-[#111111] p-6 text-white shadow-card md:p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-white/55">Favoritos e alertas</p>
        <h1 className="mt-2 font-display text-4xl">Avise-me quando chegar</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/70">
          Escolha o produto que voce quer encontrar. Quando ele entrar no sistema, o cliente recebe um aviso por e-mail.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
          <h2 className="text-2xl font-semibold text-black">Cadastrar alerta</h2>
          <p className="mt-2 text-sm text-black/58">
            Preencha o produto desejado e nos avisamos quando ele for cadastrado.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Seu nome"
              className="rounded-2xl border border-black/10 px-4 py-3"
            />
            <input
              type="email"
              required
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
              placeholder="Seu e-mail"
              className="rounded-2xl border border-black/10 px-4 py-3"
            />
            <input
              required
              value={desiredProduct}
              onChange={(event) => setDesiredProduct(event.target.value)}
              placeholder="Ex.: Geladeira Brastemp Frost Free"
              className="rounded-2xl border border-black/10 px-4 py-3"
            />
            <select
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              className="rounded-2xl border border-black/10 px-4 py-3"
            >
              <option value="">Categoria opcional</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Detalhes para ajudar a identificar o produto: marca, tamanho, cor, modelo..."
              className="min-h-28 rounded-2xl border border-black/10 px-4 py-3"
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando alerta..." : "Quero ser avisado"}
            </Button>
            {feedback ? <p className="text-sm text-black/60">{feedback}</p> : null}
          </form>
        </section>

        <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-black">Sugestoes rapidas</h2>
              <p className="mt-2 text-sm text-black/58">Toque em um item para preencher o nome automaticamente.</p>
            </div>
            <Link href="/catalogo" className="hidden text-sm font-medium text-black/70 md:block">
              Abrir catalogo
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {products.slice(0, 6).map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => {
                  setDesiredProduct(product.name);
                  setCategoryName(product.category);
                }}
                className="rounded-[1.5rem] border border-black/8 bg-[#f8f4ed] p-4 text-left transition hover:bg-[#f1e8da]"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-black/42">{product.category}</p>
                <p className="mt-2 line-clamp-2 font-semibold text-black">{product.name}</p>
                <p className="mt-2 text-sm text-black/55">Usar este nome no meu alerta</p>
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-[1.5rem] bg-[#111111] p-5 text-white">
            <p className="text-sm uppercase tracking-[0.24em] text-white/55">Como funciona</p>
            <div className="mt-3 grid gap-3 text-sm text-white/75">
              <p>1. O cliente informa qual produto deseja encontrar.</p>
              <p>2. O pedido fica salvo no sistema com o e-mail de contato.</p>
              <p>3. Quando o admin cadastra um item compatível, o sistema registra a notificacao e tenta enviar e-mail.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
