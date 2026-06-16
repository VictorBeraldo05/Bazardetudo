import { AdminProductsManager } from "@/components/admin-products-manager";
import { getCategories, getProducts } from "@/lib/api";

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

      <AdminProductsManager categories={categories} initialProducts={products} />
    </main>
  );
}
