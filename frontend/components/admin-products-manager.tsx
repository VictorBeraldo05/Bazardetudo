"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { hasRealCategoryIds, type Category } from "@/lib/api";
import type { Product } from "@/lib/data";
import { money } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function FieldHelp({ label, help }: { label: string; help: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-semibold text-black">{label}</p>
      <p className="text-xs leading-5 text-black/50">{help}</p>
    </div>
  );
}

export function AdminProductsManager({
  categories,
  initialProducts,
  loadError
}: {
  categories: Category[];
  initialProducts: Product[];
  loadError: string | null;
}) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [filter, setFilter] = useState("todos");
  const [query, setQuery] = useState("");
  const canSubmit = categories.length > 0 && hasRealCategoryIds(categories) && !loadError;

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesQuery =
        query.length === 0 ||
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase());

      const matchesFilter =
        filter === "todos" ||
        (filter === "destaques" && product.featured) ||
        (filter === "promocoes" && product.isOffer) ||
        (filter === "disponiveis" && product.status === "available");

      return matchesQuery && matchesFilter;
    });
  }, [filter, products, query]);

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setPreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPreview(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(formData: FormData) {
    if (!canSubmit) {
      setMessage("As categorias reais do backend nao foram carregadas. O cadastro foi bloqueado para evitar dados invalidos.");
      return;
    }

    setLoading(true);
    setMessage(null);

    const payload = {
      name: String(formData.get("name") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      description: String(formData.get("description") ?? ""),
      damage_notes: String(formData.get("product_notes") ?? ""),
      condition: String(formData.get("condition") ?? "Muito bom"),
      status: "available",
      category_id: String(formData.get("category_id") ?? ""),
      sku: String(formData.get("sku") ?? ""),
      cost_price: Number(formData.get("cost_price") ?? 0),
      sale_price: Number(formData.get("sale_price") ?? 0),
      compare_at_price: Number(formData.get("compare_at_price") ?? 0),
      quantity: Number(formData.get("quantity") ?? 1),
      tags: String(formData.get("tags") ?? ""),
      featured: formData.get("featured") === "on",
      is_offer: formData.get("is_offer") === "on",
      image_url: preview,
      image_alt_text: String(formData.get("name") ?? "")
    };

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => null);
      if (response.status === 401) {
        router.push("/admin/login?next=/admin/produtos");
        router.refresh();
        throw new Error("Sua sessao administrativa expirou. Entre novamente para cadastrar produtos.");
      }
      if (!response.ok || !result) {
        throw new Error(result?.detail ?? result?.message ?? "Falha ao cadastrar produto.");
      }

      setProducts((current) => [
        {
          id: result.id,
          slug: result.slug,
          name: result.name,
          category: categories.find((item) => item.id === result.category_id)?.name ?? "Catalogo",
          description: result.description,
          damageNotes: result.damage_notes,
          condition: result.condition,
          status: result.status,
          price: Number(result.sale_price),
          compareAtPrice: Number(result.compare_at_price ?? result.sale_price),
          tags: result.tags ? result.tags.split(",").map((item: string) => item.trim()).filter(Boolean) : [],
          featured: result.featured,
          isOffer: result.is_offer,
          image: result.images?.[0]?.image_url ?? preview ?? ""
        },
        ...current
      ]);

      setMessage("Produto cadastrado com sucesso.");
      setPreview(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao cadastrar produto.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(productId: string) {
    setMessage(null);
    setDeletingId(productId);

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE"
      });

      if (response.status === 401) {
        router.push("/admin/login?next=/admin/produtos");
        router.refresh();
        throw new Error("Sua sessao administrativa expirou. Entre novamente para excluir produtos.");
      }

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.detail ?? result?.message ?? "Falha ao excluir produto.");
      }

      setProducts((current) => current.filter((product) => product.id !== productId));
      setMessage("Produto excluido com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao excluir produto.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
      <form action={handleSubmit} className="grid gap-5 rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-black">Novo produto</h2>
          <p className="text-sm text-black/58">Preencha os dados da vitrine e escolha uma imagem principal para o cliente ver na home e no catalogo.</p>
        </div>
        {loadError ? (
          <div className="rounded-[1.25rem] bg-[#fff1e8] px-4 py-3 text-sm text-[#9a3b25]">
            {loadError}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="min-w-0 space-y-2">
            <FieldHelp label="Nome do produto" help="Use um titulo claro, como o cliente deve enxergar na vitrine." />
            <input name="name" required placeholder="Ex.: Buffet Aparador Oslo" className="w-full min-w-0 rounded-2xl border border-black/10 px-4 py-3" />
          </div>
          <div className="min-w-0 space-y-2">
            <FieldHelp label="Slug" help="Endereco do produto na URL. Use palavras separadas por hifen." />
            <input name="slug" required placeholder="buffet-aparador-oslo" className="w-full min-w-0 rounded-2xl border border-black/10 px-4 py-3" />
          </div>
        </div>

        <div className="space-y-2">
          <FieldHelp label="Descricao comercial" help="Resumo curto que ajuda a vender. Vai aparecer para o cliente." />
          <textarea name="description" required placeholder="Descreva o produto, estilo, funcao e pontos fortes." className="min-h-28 w-full min-w-0 rounded-2xl border border-black/10 px-4 py-3" />
        </div>

        <div className="space-y-2">
          <FieldHelp label="Detalhes internos ou observacoes" help="Informacoes operacionais e detalhes do item. Nao e o titulo comercial." />
          <textarea name="product_notes" placeholder="Estado, acabamento, informacoes adicionais e observacoes internas." className="min-h-24 w-full min-w-0 rounded-2xl border border-black/10 px-4 py-3" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="min-w-0 space-y-2">
            <FieldHelp label="Categoria" help="Escolha onde esse produto deve aparecer no catalogo." />
            <select name="category_id" required className="w-full min-w-0 rounded-2xl border border-black/10 px-4 py-3">
              <option value="">Selecione</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div className="min-w-0 space-y-2">
            <FieldHelp label="Estado geral" help="Texto curto para o admin entender a condicao do item." />
            <input name="condition" defaultValue="Muito bom" placeholder="Muito bom" className="w-full min-w-0 rounded-2xl border border-black/10 px-4 py-3" />
          </div>
          <div className="min-w-0 space-y-2">
            <FieldHelp label="SKU" help="Codigo interno unico para controle da operacao." />
            <input name="sku" required placeholder="BDT-2001" className="w-full min-w-0 rounded-2xl border border-black/10 px-4 py-3" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="min-w-0 space-y-2">
            <FieldHelp label="Preco de custo" help="Quanto a loja pagou no item." />
            <input name="cost_price" type="number" step="0.01" placeholder="0,00" className="w-full min-w-0 rounded-2xl border border-black/10 px-4 py-3" />
          </div>
          <div className="min-w-0 space-y-2">
            <FieldHelp label="Preco de venda" help="Preco que o cliente vai ver na vitrine." />
            <input name="sale_price" type="number" step="0.01" required placeholder="0,00" className="w-full min-w-0 rounded-2xl border border-black/10 px-4 py-3" />
          </div>
          <div className="min-w-0 space-y-2">
            <FieldHelp label="Preco de referencia" help="Valor antigo ou comparativo para mostrar economia." />
            <input name="compare_at_price" type="number" step="0.01" placeholder="0,00" className="w-full min-w-0 rounded-2xl border border-black/10 px-4 py-3" />
          </div>
          <div className="min-w-0 space-y-2">
            <FieldHelp label="Quantidade" help="Numero disponivel para venda." />
            <input name="quantity" type="number" min="1" defaultValue="1" placeholder="1" className="w-full min-w-0 rounded-2xl border border-black/10 px-4 py-3" />
          </div>
        </div>

        <div className="space-y-2">
          <FieldHelp label="Tags" help="Palavras-chave separadas por virgula. Ex.: novo lote, pronta entrega, promocao" />
          <input name="tags" placeholder="novo lote, pronta entrega, promocao" className="w-full min-w-0 rounded-2xl border border-black/10 px-4 py-3" />
        </div>

        <div className="space-y-3 rounded-[1.5rem] bg-[#f7f2eb] p-4">
          <FieldHelp label="Imagem principal" help="Anexe uma imagem. Essa sera a foto principal usada na home, no catalogo e na pagina do produto." />
          <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm text-black/70" />
          {preview ? (
            <div className="relative h-44 overflow-hidden rounded-[1.25rem] border border-black/10 bg-white">
              <Image src={preview} alt="Preview do produto" fill className="object-cover" />
            </div>
          ) : (
            <div className="rounded-[1.25rem] border border-dashed border-black/15 bg-white px-4 py-10 text-center text-sm text-black/45">
              Nenhuma imagem anexada ainda.
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2 rounded-full bg-[#f5f1e8] px-4 py-2">
            <input type="checkbox" name="featured" />
            Mostrar em destaque na home
          </label>
          <label className="flex items-center gap-2 rounded-full bg-[#f5f1e8] px-4 py-2">
            <input type="checkbox" name="is_offer" />
            Marcar como promocional
          </label>
        </div>

        <Button type="submit" disabled={loading || !canSubmit}>
          {loading ? "Salvando..." : "Cadastrar produto"}
        </Button>
        {message ? <p className="text-sm text-black/60">{message}</p> : null}
      </form>

      <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-black">Produtos publicados</h2>
              <p className="text-sm text-black/50">Filtre o que ja esta na vitrine e remova o que nao deve mais aparecer.</p>
            </div>
            <span className="text-sm text-black/45">{filteredProducts.length} itens</span>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nome ou categoria"
              className="rounded-2xl border border-black/10 px-4 py-3"
            />
            <select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-2xl border border-black/10 px-4 py-3">
              <option value="todos">Todos</option>
              <option value="destaques">Somente destaques</option>
              <option value="promocoes">Somente promocoes</option>
              <option value="disponiveis">Somente disponiveis</option>
            </select>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {filteredProducts.map((product) => (
            <div key={product.id} className="rounded-[1.5rem] bg-[#f6f2eb] p-4">
              <div className="flex gap-4">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-[1rem] bg-white">
                  <Image src={product.image} alt={product.name} fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
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
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                      className="text-sm font-medium text-[#b13f2b] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === product.id ? "Excluindo..." : "Excluir produto"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-black/10 px-4 py-8 text-center text-sm text-black/45">
              Nenhum produto encontrado com esse filtro.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
