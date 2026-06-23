"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { hasRealCategoryIds, type Category } from "@/lib/api";
import type { Product } from "@/lib/data";
import { money } from "@/lib/utils";

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function createShortDescription(value: string) {
  const name = value.trim();
  if (!name) {
    return "";
  }

  return `${name} com visual atrativo, boa apresentacao na vitrine e destaque para venda imediata.`;
}

function normalizeValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, " ")
    .trim();
}

function createSku(name: string, categoryName: string) {
  const cleanName = normalizeValue(name);
  const cleanCategory = normalizeValue(categoryName);

  if (!cleanName) {
    return "";
  }

  const categoryCode = (cleanCategory.match(/[a-zA-Z0-9]/g)?.join("").slice(0, 3) || "CAT").toUpperCase();
  const nameCode = cleanName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((word) => word.slice(0, 3).toUpperCase())
    .join("");

  const base = `${cleanCategory}-${cleanName}`.toUpperCase();
  const hash =
    base.split("").reduce((total, character, index) => total + character.charCodeAt(0) * (index + 1), 0) % 9000 + 1000;

  return `${categoryCode}-${nameCode || "ITEM"}-${hash}`;
}

function FieldHelp({ label, help }: { label: string; help: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-semibold text-black">{label}</p>
      <p className="text-xs leading-5 text-black/50">{help}</p>
    </div>
  );
}

type ProductResponse = {
  id: string;
  slug: string;
  name: string;
  description: string;
  damage_notes: string;
  condition: string;
  status: string;
  category_id: string;
  subcategory_id?: string | null;
  sku: string;
  cost_price: string | number;
  sale_price: string | number;
  compare_at_price?: string | number | null;
  quantity: number;
  tags?: string | null;
  featured: boolean;
  is_offer: boolean;
  images?: Array<{
    image_url: string;
    alt_text?: string | null;
    position: number;
  }>;
};

type ProductFormState = {
  name: string;
  slug: string;
  description: string;
  damageNotes: string;
  condition: string;
  status: string;
  categoryId: string;
  subcategoryId: string;
  sku: string;
  costPrice: string;
  salePrice: string;
  compareAtPrice: string;
  quantity: string;
  tags: string;
  featured: boolean;
  isOffer: boolean;
};

const EMPTY_FORM: ProductFormState = {
  name: "",
  slug: "",
  description: "",
  damageNotes: "",
  condition: "Muito bom",
  status: "available",
  categoryId: "",
  subcategoryId: "",
  sku: "",
  costPrice: "",
  salePrice: "",
  compareAtPrice: "",
  quantity: "1",
  tags: "",
  featured: false,
  isOffer: false
};

function mapResultToProduct(result: ProductResponse, categories: Category[], fallbackImage?: string | null): Product {
  const category = categories.find((item) => item.id === result.category_id);
  return {
    id: result.id,
    slug: result.slug,
    name: result.name,
    category: category?.name ?? "Catalogo",
    subcategory: category?.subcategories?.find((item) => item.id === result.subcategory_id)?.name ?? null,
    description: result.description,
    damageNotes: result.damage_notes,
    condition: result.condition,
    status: result.status as Product["status"],
    price: Number(result.sale_price),
    compareAtPrice: Number(result.compare_at_price ?? result.sale_price),
    tags: result.tags ? result.tags.split(",").map((item) => item.trim()).filter(Boolean) : [],
    featured: result.featured,
    isOffer: result.is_offer,
    image: result.images?.[0]?.image_url ?? fallbackImage ?? ""
  };
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [products, setProducts] = useState(initialProducts);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLoading, setEditingLoading] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filter, setFilter] = useState("todos");
  const [query, setQuery] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [skuTouched, setSkuTouched] = useState(false);
  const [descriptionTouched, setDescriptionTouched] = useState(false);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const canSubmit = categories.length > 0 && hasRealCategoryIds(categories) && !loadError;
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === form.categoryId) ?? null,
    [categories, form.categoryId]
  );
  const currentSubcategories = selectedCategory?.subcategories ?? [];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesQuery =
        query.length === 0 ||
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase()) ||
        (product.subcategory?.toLowerCase().includes(query.toLowerCase()) ?? false);

      const matchesFilter =
        filter === "todos" ||
        (filter === "destaques" && product.featured) ||
        (filter === "promocoes" && product.isOffer) ||
        (filter === "disponiveis" && product.status === "available");

      return matchesQuery && matchesFilter;
    });
  }, [filter, products, query]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setPreview(null);
    setSelectedFile(null);
    setSlugTouched(false);
    setSkuTouched(false);
    setDescriptionTouched(false);
    setEditingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function updateForm<K extends keyof ProductFormState>(field: K, value: ProductFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => setPreview(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextName = event.target.value;
    setForm((current) => {
      const nextForm = { ...current, name: nextName };
      if (!slugTouched) {
        nextForm.slug = createSlug(nextName);
      }
      if (!skuTouched) {
        const categoryName = categories.find((category) => category.id === current.categoryId)?.name ?? "";
        nextForm.sku = createSku(nextName, categoryName);
      }
      if (!descriptionTouched) {
        nextForm.description = createShortDescription(nextName);
      }
      return nextForm;
    });
  }

  async function uploadProductImage() {
    if (!selectedFile) {
      return preview && /^https?:\/\//i.test(preview) ? preview : null;
    }

    const uploadFormData = new FormData();
    uploadFormData.append("file", selectedFile);
    uploadFormData.append("slug", form.slug || form.name);

    const response = await fetch("/api/admin/uploads/products", {
      method: "POST",
      body: uploadFormData
    });

    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.publicUrl) {
      throw new Error(result?.message ?? "Nao foi possivel publicar a imagem do produto.");
    }

    return result.publicUrl as string;
  }

  function buildPayload(imageUrl: string | null) {
    return {
      name: form.name,
      slug: form.slug,
      description: form.description,
      damage_notes: form.damageNotes,
      condition: form.condition,
      status: form.status || "available",
      category_id: form.categoryId,
      subcategory_id: form.subcategoryId || null,
      sku: form.sku,
      cost_price: Number(form.costPrice || 0),
      sale_price: Number(form.salePrice || 0),
      compare_at_price: form.compareAtPrice.length > 0 ? Number(form.compareAtPrice) : null,
      quantity: Number(form.quantity || 1),
      tags: form.tags,
      featured: form.featured,
      is_offer: form.isOffer,
      image_url: imageUrl,
      image_alt_text: form.name
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      setMessage("As categorias reais do backend nao foram carregadas. O cadastro foi bloqueado para evitar dados invalidos.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const uploadedImageUrl = await uploadProductImage();
      const payload = buildPayload(uploadedImageUrl);
      const target = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(target, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => null);
      if (response.status === 401) {
        router.push("/admin/login?next=/admin/produtos");
        router.refresh();
        throw new Error("Sua sessao administrativa expirou. Entre novamente para continuar.");
      }
      if (!response.ok || !result) {
        throw new Error(result?.detail ?? result?.message ?? "Falha ao salvar produto.");
      }

      const mappedProduct = mapResultToProduct(result, categories, preview);
      if (editingId) {
        setProducts((current) => current.map((product) => (product.id === editingId ? mappedProduct : product)));
        setMessage("Produto atualizado com sucesso.");
      } else {
        setProducts((current) => [mappedProduct, ...current]);
        setMessage("Produto cadastrado com sucesso.");
      }

      resetForm();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao salvar produto.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(productId: string) {
    setMessage(null);
    setEditingLoading(productId);

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "GET",
        cache: "no-store"
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result) {
        throw new Error(result?.detail ?? result?.message ?? "Nao foi possivel carregar o produto.");
      }

      setForm({
        name: result.name,
        slug: result.slug,
        description: result.description,
        damageNotes: result.damage_notes,
        condition: result.condition,
        status: result.status,
        categoryId: result.category_id,
        subcategoryId: result.subcategory_id ?? "",
        sku: result.sku,
        costPrice: String(Number(result.cost_price)),
        salePrice: String(Number(result.sale_price)),
        compareAtPrice: result.compare_at_price != null ? String(Number(result.compare_at_price)) : "",
        quantity: String(result.quantity),
        tags: result.tags ?? "",
        featured: Boolean(result.featured),
        isOffer: Boolean(result.is_offer)
      });
      setPreview(result.images?.[0]?.image_url ?? null);
      setSelectedFile(null);
      setSlugTouched(true);
      setSkuTouched(true);
      setDescriptionTouched(true);
      setEditingId(productId);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nao foi possivel carregar o produto.");
    } finally {
      setEditingLoading(null);
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
      if (editingId === productId) {
        resetForm();
      }
      setMessage("Produto excluido com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao excluir produto.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[1fr_0.92fr]">
      <form onSubmit={handleSubmit} className="grid self-start gap-5 rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-black">{editingId ? "Editar produto" : "Novo produto"}</h2>
            <p className="text-sm text-black/58">
              {editingId
                ? "Atualize os dados da vitrine, ajuste destaque/promocao e salve sem precisar excluir o item."
                : "Preencha os dados da vitrine e escolha uma imagem principal para o cliente ver na home e no catalogo."}
            </p>
          </div>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-black transition hover:bg-[#f5f1e8]"
            >
              Cancelar edicao
            </button>
          ) : null}
        </div>

        {loadError ? (
          <div className="rounded-[1.25rem] bg-[#fff1e8] px-4 py-3 text-sm text-[#9a3b25]">
            {loadError}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="min-w-0 space-y-2">
            <FieldHelp label="Nome do produto" help="Use um titulo claro, como o cliente deve enxergar na vitrine." />
            <input
              name="name"
              required
              value={form.name}
              onChange={handleNameChange}
              placeholder="Ex.: Buffet Aparador Oslo"
              className="w-full min-w-0 rounded-2xl border border-black/10 px-4 py-3"
            />
          </div>
          <div className="min-w-0 space-y-2">
            <FieldHelp label="Slug" help="Endereco do produto na URL. Use palavras separadas por hifen." />
            <input
              name="slug"
              required
              value={form.slug}
              onChange={(event) => {
                setSlugTouched(true);
                updateForm("slug", createSlug(event.target.value));
              }}
              placeholder="buffet-aparador-oslo"
              className="w-full min-w-0 rounded-2xl border border-black/10 px-4 py-3"
            />
          </div>
        </div>

        <div className="space-y-2">
          <FieldHelp label="Descricao comercial" help="Resumo curto que ajuda a vender. Vai aparecer para o cliente." />
          <textarea
            name="description"
            required
            value={form.description}
            onChange={(event) => {
              setDescriptionTouched(true);
              updateForm("description", event.target.value);
            }}
            placeholder="Descreva o produto, estilo, funcao e pontos fortes."
            className="min-h-28 w-full min-w-0 rounded-2xl border border-black/10 px-4 py-3"
          />
        </div>

        <div className="space-y-2">
          <FieldHelp label="Detalhes internos ou observacoes" help="Informacoes operacionais e detalhes do item. Nao e o titulo comercial." />
          <textarea
            name="product_notes"
            value={form.damageNotes}
            onChange={(event) => updateForm("damageNotes", event.target.value)}
            placeholder="Estado, acabamento, informacoes adicionais e observacoes internas."
            className="min-h-24 w-full min-w-0 rounded-2xl border border-black/10 px-4 py-3"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <div className="min-w-0 space-y-2">
            <FieldHelp label="Categoria" help="Escolha onde esse produto deve aparecer no catalogo." />
            <select
              name="category_id"
              required
              value={form.categoryId}
              onChange={(event) => {
                const nextCategoryId = event.target.value;
                const categoryName = categories.find((category) => category.id === nextCategoryId)?.name ?? "";
                setForm((current) => ({
                  ...current,
                  categoryId: nextCategoryId,
                  subcategoryId: "",
                  sku: skuTouched ? current.sku : createSku(current.name, categoryName)
                }));
              }}
              className="w-full min-w-0 rounded-2xl border border-black/10 px-4 py-3"
            >
              <option value="">Selecione</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0 space-y-2">
            <FieldHelp label="Subcategoria" help="Organize melhor a navegacao do catalogo e a exibicao mobile." />
            <select
              name="subcategory_id"
              value={form.subcategoryId}
              onChange={(event) => updateForm("subcategoryId", event.target.value)}
              disabled={!selectedCategory || currentSubcategories.length === 0}
              className="w-full min-w-0 rounded-2xl border border-black/10 px-4 py-3 disabled:bg-[#f7f5f1] disabled:text-black/35"
            >
              <option value="">{selectedCategory ? "Selecione" : "Escolha a categoria antes"}</option>
              {currentSubcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0 space-y-2">
            <FieldHelp label="Estado geral" help="Texto curto para o admin entender a condicao do item." />
            <input
              name="condition"
              value={form.condition}
              onChange={(event) => updateForm("condition", event.target.value)}
              placeholder="Muito bom"
              className="w-full min-w-0 rounded-2xl border border-black/10 px-4 py-3"
            />
          </div>
          <div className="min-w-0 space-y-2">
            <FieldHelp label="SKU" help="Gerado automaticamente por categoria e nome, mas voce pode ajustar manualmente se quiser." />
            <input
              name="sku"
              required
              value={form.sku}
              onChange={(event) => {
                setSkuTouched(true);
                updateForm("sku", event.target.value.toUpperCase());
              }}
              placeholder="BDT-2001"
              className="w-full min-w-0 rounded-2xl border border-black/10 px-4 py-3"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="min-w-0 space-y-2">
            <FieldHelp label="Preco de custo" help="Quanto a loja pagou no item." />
            <input
              name="cost_price"
              type="number"
              step="0.01"
              value={form.costPrice}
              onChange={(event) => updateForm("costPrice", event.target.value)}
              placeholder="0,00"
              className="w-full min-w-0 rounded-2xl border border-black/10 px-4 py-3"
            />
          </div>
          <div className="min-w-0 space-y-2">
            <FieldHelp label="Preco de venda" help="Preco que o cliente vai ver na vitrine." />
            <input
              name="sale_price"
              type="number"
              step="0.01"
              required
              value={form.salePrice}
              onChange={(event) => updateForm("salePrice", event.target.value)}
              placeholder="0,00"
              className="w-full min-w-0 rounded-2xl border border-black/10 px-4 py-3"
            />
          </div>
          <div className="min-w-0 space-y-2">
            <FieldHelp label="Preco de referencia" help="Valor antigo ou comparativo para mostrar economia." />
            <input
              name="compare_at_price"
              type="number"
              step="0.01"
              value={form.compareAtPrice}
              onChange={(event) => updateForm("compareAtPrice", event.target.value)}
              placeholder="0,00"
              className="w-full min-w-0 rounded-2xl border border-black/10 px-4 py-3"
            />
          </div>
          <div className="min-w-0 space-y-2">
            <FieldHelp label="Quantidade" help="Numero disponivel para venda. Se editar, o estoque sera ajustado." />
            <input
              name="quantity"
              type="number"
              min="0"
              value={form.quantity}
              onChange={(event) => updateForm("quantity", event.target.value)}
              placeholder="1"
              className="w-full min-w-0 rounded-2xl border border-black/10 px-4 py-3"
            />
          </div>
        </div>

        <div className="space-y-2">
          <FieldHelp label="Tags" help="Palavras-chave separadas por virgula. Ex.: novo lote, pronta entrega, promocao" />
          <input
            name="tags"
            value={form.tags}
            onChange={(event) => updateForm("tags", event.target.value)}
            placeholder="novo lote, pronta entrega, promocao"
            className="w-full min-w-0 rounded-2xl border border-black/10 px-4 py-3"
          />
        </div>

        <div className="space-y-3 rounded-[1.5rem] bg-[#f7f2eb] p-4">
          <FieldHelp label="Imagem principal" help="Anexe uma imagem. Essa sera a foto principal usada na home, no catalogo e na pagina do produto." />
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="text-sm text-black/70" />
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
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={(event) => updateForm("featured", event.target.checked)}
            />
            Mostrar em destaque na home
          </label>
          <label className="flex items-center gap-2 rounded-full bg-[#f5f1e8] px-4 py-2">
            <input
              type="checkbox"
              name="is_offer"
              checked={form.isOffer}
              onChange={(event) => updateForm("isOffer", event.target.checked)}
            />
            Marcar como promocional
          </label>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" disabled={loading || !canSubmit} className="sm:flex-1">
            {loading ? "Salvando..." : editingId ? "Salvar alteracoes" : "Cadastrar produto"}
          </Button>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="h-11 rounded-full border border-black/10 px-5 text-sm font-medium text-black transition hover:bg-[#f5f1e8]"
            >
              Cancelar
            </button>
          ) : null}
        </div>
        {message ? <p className="text-sm text-black/60">{message}</p> : null}
      </form>

      <section className="self-start rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-black">Produtos publicados</h2>
              <p className="text-sm text-black/50">Filtre, edite ou exclua itens da vitrine sem perder o controle do cadastro.</p>
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
                      <p className="mt-1 text-sm text-black/50">
                        {product.category}{product.subcategory ? ` • ${product.subcategory}` : ""}
                      </p>
                    </div>
                    <p className="font-semibold text-black">{money(product.price)}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {product.featured ? <span className="rounded-full bg-black px-3 py-1 text-white">Destaque</span> : null}
                    {product.isOffer ? <span className="rounded-full bg-[#dfd6c7] px-3 py-1 text-black">Promocao</span> : null}
                    <span className="rounded-full border border-black/10 px-3 py-1 capitalize text-black/60">{product.status}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => handleEdit(product.id)}
                      disabled={editingLoading === product.id}
                      className="text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {editingLoading === product.id ? "Carregando..." : "Editar produto"}
                    </button>
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
