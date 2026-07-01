"use client";

import { BellRing, Heart, Mail, Sparkles, Star } from "lucide-react";
import { useState } from "react";

import { NavigationLink } from "@/components/navigation-link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast-provider";
import { createProductArrivalAlert, type Category } from "@/lib/api";
import type { Product } from "@/lib/data";

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
  const { showToast } = useToast();

  const quickSuggestions = products.slice(0, 8);

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
      showToast({ title: "Alerta salvo", description: result.message, tone: "success" });
      setDesiredProduct("");
      setCategoryName("");
      setNotes("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel salvar seu alerta.";
      setFeedback(message);
      showToast({ title: "Nao foi possivel salvar", description: message, tone: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell pb-8 pt-4 md:pt-8">
      <div className="space-y-5 md:space-y-6">
        <section className="rounded-[1.6rem] border border-black/5 bg-white px-4 py-4 shadow-card md:rounded-[2rem] md:px-6 md:py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.22em] text-black/38">Favoritos e alertas</p>
              <h1 className="mt-1 text-[1.65rem] font-semibold leading-tight text-black md:text-4xl">
                Avise-me quando esse produto chegar
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-black/55">
                Salve seus interesses e receba aviso por e-mail quando um item parecido entrar na loja.
              </p>
            </div>

            <NavigationLink
              href="/catalogo"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-[1rem] border border-black/10 bg-white px-4 text-sm font-semibold text-black"
            >
              Abrir catalogo
            </NavigationLink>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {[
            {
              label: "Alertas por e-mail",
              value: "Ativo",
              hint: "O aviso chega no mesmo e-mail cadastrado.",
              icon: <Mail size={16} />
            },
            {
              label: "Sugestoes rapidas",
              value: String(quickSuggestions.length),
              hint: "Produtos da vitrine para usar como referencia.",
              icon: <Sparkles size={16} />
            },
            {
              label: "Favoritos da conta",
              value: user ? "Conta conectada" : "Visitante",
              hint: user ? "Seus dados ja entram preenchidos." : "Entre para agilizar o cadastro.",
              icon: <Heart size={16} />
            }
          ].map((item) => (
            <div key={item.label} className="rounded-[1.35rem] border border-black/5 bg-white p-4 shadow-card md:rounded-[1.6rem] md:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-black/45">{item.label}</p>
                <div className="rounded-full bg-[#f7f3ec] p-2 text-[#8b6743]">{item.icon}</div>
              </div>
              <p className="mt-3 text-xl font-semibold leading-tight text-black md:text-2xl">{item.value}</p>
              <p className="mt-2 text-sm text-black/55">{item.hint}</p>
            </div>
          ))}
        </section>

        <div className="grid gap-5 xl:grid-cols-[0.88fr_1.12fr]">
          <section className="rounded-[1.6rem] border border-black/5 bg-white p-5 shadow-card md:rounded-[2rem] md:p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-[1rem] bg-[#f7f2ea] p-2.5 text-[#8b6743]">
                <BellRing size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-black md:text-xl">Cadastrar alerta</h2>
                <p className="mt-1 text-sm text-black/55">
                  Descreva o item que voce procura e a loja avisa quando aparecer no sistema.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-black">Seu nome</span>
                  <input
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="Como devemos identificar voce"
                    className="h-12 rounded-[1rem] border border-black/10 px-4 text-sm outline-none transition focus:border-[#8b6743]"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-black">Seu e-mail</span>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(event) => setCustomerEmail(event.target.value)}
                    placeholder="nome@exemplo.com"
                    className="h-12 rounded-[1rem] border border-black/10 px-4 text-sm outline-none transition focus:border-[#8b6743]"
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-black">Produto desejado</span>
                <input
                  required
                  value={desiredProduct}
                  onChange={(event) => setDesiredProduct(event.target.value)}
                  placeholder="Ex.: Geladeira Brastemp Frost Free"
                  className="h-12 rounded-[1rem] border border-black/10 px-4 text-sm outline-none transition focus:border-[#8b6743]"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-black">Categoria</span>
                <select
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)}
                  className="h-12 rounded-[1rem] border border-black/10 px-4 text-sm outline-none transition focus:border-[#8b6743]"
                >
                  <option value="">Categoria opcional</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-black">Observacoes</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Marca, voltagem, tamanho, cor, modelo ou qualquer detalhe que ajude na busca."
                  className="min-h-28 rounded-[1rem] border border-black/10 px-4 py-3 text-sm outline-none transition focus:border-[#8b6743]"
                />
              </label>

              <div className="rounded-[1.2rem] bg-[#f8f4ed] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-black/35">Como funciona</p>
                <div className="mt-3 grid gap-2 text-sm text-black/60">
                  <p>1. O pedido fica salvo com seu e-mail de contato.</p>
                  <p>2. Quando a loja cadastrar um item parecido, o sistema registra o disparo.</p>
                  <p>3. Voce recebe o aviso para voltar e concluir a compra.</p>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="h-12 rounded-[1rem] bg-[#e05a36] text-white hover:bg-[#c94c2a]">
                {loading ? "Salvando alerta..." : "Quero ser avisado"}
              </Button>

              {feedback ? <p className="text-sm text-black/60">{feedback}</p> : null}
            </form>
          </section>

          <section className="space-y-4">
            <section className="rounded-[1.6rem] border border-black/5 bg-white p-5 shadow-card md:rounded-[2rem] md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-black md:text-xl">Sugestoes rapidas</h2>
                  <p className="mt-1 text-sm text-black/55">
                    Toque em um item para preencher o nome e a categoria automaticamente.
                  </p>
                </div>
                <div className="hidden rounded-full bg-[#f7f3ec] px-3 py-1 text-xs font-semibold text-[#8b6743] md:inline-flex">
                  {quickSuggestions.length} itens
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {quickSuggestions.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      setDesiredProduct(product.name);
                      setCategoryName(product.category);
                    }}
                    className="rounded-[1.3rem] border border-black/8 bg-[#f8f4ed] p-4 text-left transition hover:-translate-y-0.5 hover:bg-[#f1e8da]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-black/38">{product.category}</p>
                      <Star size={14} className="text-[#8b6743]" />
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-black md:text-base">
                      {product.name}
                    </p>
                    <p className="mt-3 text-xs font-medium text-[#8b6743]">Usar no meu alerta</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[1.6rem] border border-black/5 bg-white p-5 shadow-card md:rounded-[2rem] md:p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-[1rem] bg-[#f7f2ea] p-2.5 text-[#8b6743]">
                  <Heart size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-black md:text-xl">Busca assistida</h2>
                  <p className="mt-1 text-sm text-black/55">
                    Se voce ainda nao viu o item na vitrine, abra o catalogo, copie o nome aproximado e deixe o alerta salvo.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <NavigationLink
                  href="/catalogo"
                  className="inline-flex h-11 items-center justify-center rounded-[1rem] bg-[#111111] px-4 text-sm font-semibold text-white"
                >
                  Explorar catalogo
                </NavigationLink>
                {!user ? (
                  <NavigationLink
                    href="/login"
                    className="inline-flex h-11 items-center justify-center rounded-[1rem] border border-black/10 bg-white px-4 text-sm font-semibold text-black"
                  >
                    Entrar na conta
                  </NavigationLink>
                ) : null}
              </div>
            </section>
          </section>
        </div>
      </div>
    </main>
  );
}
