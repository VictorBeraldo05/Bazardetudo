"use client";

import { useState } from "react";

import type { Category } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function AdminProductForm({ categories }: { categories: Category[] }) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
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
      is_offer: formData.get("is_offer") === "on"
    };

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setMessage("Produto cadastrado com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao cadastrar produto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="grid gap-4 rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
      <div className="grid gap-4 md:grid-cols-2">
        <input name="name" required placeholder="Nome do produto" className="rounded-2xl border border-black/10 px-4 py-3" />
        <input name="slug" required placeholder="slug-do-produto" className="rounded-2xl border border-black/10 px-4 py-3" />
      </div>

      <textarea name="description" required placeholder="Descricao comercial para a vitrine" className="min-h-28 rounded-2xl border border-black/10 px-4 py-3" />
      <textarea name="product_notes" placeholder="Observacoes internas ou detalhes do item" className="min-h-24 rounded-2xl border border-black/10 px-4 py-3" />

      <div className="grid gap-4 md:grid-cols-3">
        <select name="category_id" required className="rounded-2xl border border-black/10 px-4 py-3">
          <option value="">Categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <input name="condition" defaultValue="Muito bom" placeholder="Estado geral" className="rounded-2xl border border-black/10 px-4 py-3" />
        <input name="sku" required placeholder="SKU" className="rounded-2xl border border-black/10 px-4 py-3" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <input name="cost_price" type="number" step="0.01" placeholder="Preco de custo" className="rounded-2xl border border-black/10 px-4 py-3" />
        <input name="sale_price" type="number" step="0.01" required placeholder="Preco de venda" className="rounded-2xl border border-black/10 px-4 py-3" />
        <input name="compare_at_price" type="number" step="0.01" placeholder="Preco de referencia" className="rounded-2xl border border-black/10 px-4 py-3" />
        <input name="quantity" type="number" min="1" defaultValue="1" placeholder="Quantidade" className="rounded-2xl border border-black/10 px-4 py-3" />
      </div>

      <input name="tags" placeholder="Tags separadas por virgula" className="rounded-2xl border border-black/10 px-4 py-3" />

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2 rounded-full bg-[#f5f1e8] px-4 py-2">
          <input type="checkbox" name="featured" />
          Mostrar em destaque
        </label>
        <label className="flex items-center gap-2 rounded-full bg-[#f5f1e8] px-4 py-2">
          <input type="checkbox" name="is_offer" />
          Marcar como promocional
        </label>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Cadastrar produto"}
      </Button>
      {message ? <p className="text-sm text-black/60">{message}</p> : null}
    </form>
  );
}
