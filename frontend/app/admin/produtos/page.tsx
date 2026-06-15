import { AdminProductForm } from "@/components/admin-product-form";
import { getCategories, getProducts } from "@/lib/api";
import { money } from "@/lib/utils";

export default async function AdminProductsPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
        <p className="text-sm uppercase tracking-[0.24em] text-black/45">Produtos</p>
        <h1 className="mt-2 font-display text-4xl text-black">Cadastro e exibicao da vitrine</h1>
        <p className="mt-3 max-w-2xl text-sm text-black/60">
          Defina o que entra na home, o que vira promocao e o que fica apenas no catalogo completo.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <AdminProductForm categories={categories} />

        <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-black">Produtos publicados</h2>
            <span className="text-sm text-black/45">{products.length} itens</span>
          </div>
          <div className="mt-5 space-y-3">
            {products.map((product) => (
              <div key={product.id} className="rounded-[1.5rem] bg-[#f6f2eb] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-black">{product.name}</p>
                    <p className="mt-1 text-sm text-black/50">{product.category}</p>
                  </div>
                  <p className="font-semibold text-black">{money(product.price)}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {product.featured ? <span className="rounded-full bg-black px-3 py-1 text-white">Destaque</span> : null}
                  {product.isOffer ? <span className="rounded-full bg-[#dfd6c7] px-3 py-1 text-black">Promocao</span> : null}
                  <span className="rounded-full border border-black/10 px-3 py-1 capitalize text-black/60">{product.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

