import { products } from "@/lib/data";
import { money } from "@/lib/utils";

export default function AdminProductsPage() {
  return (
    <main className="shell py-8">
      <h1 className="font-display text-4xl">Gestao de Produtos</h1>
      <div className="mt-6 overflow-hidden rounded-[2rem] border border-black/5 bg-white/75 shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-black text-white">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Preco</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-black/5">
                <td className="px-4 py-4">{product.name}</td>
                <td className="px-4 py-4 capitalize">{product.status}</td>
                <td className="px-4 py-4">{money(product.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

