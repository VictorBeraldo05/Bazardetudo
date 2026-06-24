"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { Category } from "@/lib/api";
import { optimizeImageForUpload } from "@/lib/image-upload";

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function formatApiError(result: any): string {
  if (!result) return "";
  if (typeof result === "string") return result;
  if (Array.isArray(result)) return result.map((r) => (typeof r === "string" ? r : JSON.stringify(r))).join("; ");
  if (typeof result === "object") {
    if (result.detail) return formatApiError(result.detail);
    if (result.message) return String(result.message);
    return JSON.stringify(result);
  }
  return String(result);
}

type CategoryForm = {
  name: string;
  slug: string;
  description: string;
};

type SubcategoryForm = {
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  image?: string | null;
};

const EMPTY_CATEGORY_FORM: CategoryForm = {
  name: "",
  slug: "",
  description: ""
};

const EMPTY_SUBCATEGORY_FORM: SubcategoryForm = {
  categoryId: "",
  name: "",
  slug: "",
  description: "",
  image: null
};

export function AdminCategoriesManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [managementMode, setManagementMode] = useState<"category" | "subcategory">("category");
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategories[0]?.id ?? "");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(EMPTY_CATEGORY_FORM);
  const [subcategoryForm, setSubcategoryForm] = useState<SubcategoryForm>({
    ...EMPTY_SUBCATEGORY_FORM,
    categoryId: initialCategories[0]?.id ?? ""
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadStage, setUploadStage] = useState<"idle" | "optimizing" | "uploading">("idle");
  const [categorySlugEdited, setCategorySlugEdited] = useState(false);
  const [subcategorySlugEdited, setSubcategorySlugEdited] = useState(false);

  const totalSubcategories = useMemo(
    () => categories.reduce((total, category) => total + (category.subcategories?.length ?? 0), 0),
    [categories]
  );

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? categories[0] ?? null,
    [categories, selectedCategoryId]
  );

  const selectedSubcategory = useMemo(
    () => selectedCategory?.subcategories?.find((subcategory) => subcategory.id === selectedSubcategoryId) ?? null,
    [selectedCategory, selectedSubcategoryId]
  );

  async function loadCategories() {
    try {
      const response = await fetch("/api/admin/categories", { cache: "no-store" });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result) {
        throw new Error(formatApiError(result) || "Nao foi possivel carregar as categorias.");
      }
      setCategories(result as Category[]);
      setSelectedCategoryId((current) => current || result[0]?.id || "");
      setSelectedSubcategoryId((current) => {
        if (current) {
          const exists = result.some((category: Category) => (category.subcategories ?? []).some((subcategory) => subcategory.id === current));
          if (exists) {
            return current;
          }
        }
        return result[0]?.subcategories?.[0]?.id ?? "";
      });
      setSubcategoryForm((current) => ({
        ...current,
        categoryId: current.categoryId || result[0]?.id || ""
      }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nao foi possivel carregar as categorias.");
    }
  }

  useEffect(() => {
    if (categories.length === 0) {
      loadCategories();
    }
  }, []);

  useEffect(() => {
    if (!selectedCategoryId && categories[0]?.id) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  useEffect(() => {
    if (managementMode !== "subcategory") {
      return;
    }

    const firstSubcategoryId = selectedCategory?.subcategories?.[0]?.id ?? "";
    const stillExists = (selectedCategory?.subcategories ?? []).some((subcategory) => subcategory.id === selectedSubcategoryId);
    if (!stillExists) {
      setSelectedSubcategoryId(firstSubcategoryId);
    }
  }, [managementMode, selectedCategory, selectedSubcategoryId]);

  function resetCategoryForm() {
    setCategoryForm(EMPTY_CATEGORY_FORM);
    setEditingCategoryId(null);
    setCategorySlugEdited(false);
  }

  function resetSubcategoryForm() {
    setSubcategoryForm({
      ...EMPTY_SUBCATEGORY_FORM,
      categoryId: categories[0]?.id ?? ""
    });
    setEditingSubcategoryId(null);
    setSubcategorySlugEdited(false);
  }

  function startEditCategory(category: Category) {
    setEditingCategoryId(category.id);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? ""
    });
    setCategorySlugEdited(true);
  }

  function startEditSubcategory(category: Category, subcategory: NonNullable<Category["subcategories"]>[number]) {
    setEditingSubcategoryId(subcategory.id);
    setSubcategoryForm({
      categoryId: category.id,
      name: subcategory.name,
      slug: subcategory.slug,
      description: subcategory.description ?? "",
      image: subcategory.image ?? null
    });
    setSubcategorySlugEdited(true);
  }

  async function handleCategorySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const target = editingCategoryId ? `/api/admin/categories/${editingCategoryId}` : "/api/admin/categories";
    const method = editingCategoryId ? "PUT" : "POST";

    try {
      const response = await fetch(target, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm)
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(formatApiError(result) || "Nao foi possivel salvar a categoria.");
      }
      await loadCategories();
      resetCategoryForm();
      setMessage(editingCategoryId ? "Categoria atualizada com sucesso." : "Categoria criada com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nao foi possivel salvar a categoria.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubcategorySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const target = editingSubcategoryId
      ? `/api/admin/subcategories/${editingSubcategoryId}`
      : `/api/admin/categories/${subcategoryForm.categoryId}/subcategories`;
    const method = editingSubcategoryId ? "PUT" : "POST";
    const payload = editingSubcategoryId
      ? {
          category_id: subcategoryForm.categoryId,
          name: subcategoryForm.name,
          slug: subcategoryForm.slug,
          description: subcategoryForm.description,
          image: subcategoryForm.image ?? null
        }
      : {
          name: subcategoryForm.name,
          slug: subcategoryForm.slug,
          description: subcategoryForm.description,
          image: subcategoryForm.image ?? null
        };

    try {
      const response = await fetch(target, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(formatApiError(result) || "Nao foi possivel salvar a subcategoria.");
      }
      await loadCategories();
      resetSubcategoryForm();
      setMessage(editingSubcategoryId ? "Subcategoria atualizada com sucesso." : "Subcategoria criada com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nao foi possivel salvar a subcategoria.");
    } finally {
      setLoading(false);
    }
  }

  async function handleImageSelect(file?: File | null) {
    if (!file) return;
    setUploadingImage(true);
    setUploadStage("optimizing");
    setMessage(null);
    try {
      const optimizedFile = await optimizeImageForUpload(file, { maxDimension: 640, quality: 0.8 });
      const form = new FormData();
      form.append("file", optimizedFile);
      form.append("slug", subcategoryForm.slug || "subcategory");

      setUploadStage("uploading");
      const response = await fetch("/api/admin/uploads/products", { method: "POST", body: form });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(formatApiError(result) || "Falha ao enviar a imagem.");
      }
      // result.publicUrl expected
      setSubcategoryForm((current) => ({ ...current, image: result.publicUrl }));
      setMessage("Imagem enviada com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao enviar imagem.");
    } finally {
      setUploadingImage(false);
      setUploadStage("idle");
    }
  }

  async function handleDelete(target: "category" | "subcategory", id: string) {
    setDeletingId(id);
    setMessage(null);
    const endpoint = target === "category" ? `/api/admin/categories/${id}` : `/api/admin/subcategories/${id}`;

    try {
      const response = await fetch(endpoint, { method: "DELETE" });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(formatApiError(result) || "Nao foi possivel excluir.");
      }
      await loadCategories();
      if (editingCategoryId === id) {
        resetCategoryForm();
      }
      if (editingSubcategoryId === id) {
        resetSubcategoryForm();
      }
      setMessage(target === "category" ? "Categoria excluida com sucesso." : "Subcategoria excluida com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nao foi possivel excluir.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
        <p className="text-sm uppercase tracking-[0.24em] text-black/45">Estrutura do catalogo</p>
        <h1 className="mt-2 font-display text-4xl text-black">Categorias e subcategorias</h1>
        <p className="mt-3 max-w-3xl text-sm text-black/60">
          Organize a navegacao da loja e vincule os produtos corretamente no catalogo mobile e desktop.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Categorias", value: categories.length, hint: "Grupos principais do catalogo" },
          { label: "Subcategorias", value: totalSubcategories, hint: "Niveis secundarios de navegacao" },
          { label: "Categorias com itens", value: categories.filter((category) => (category.subcategories?.length ?? 0) > 0).length, hint: "Prontas para a vitrine" }
        ].map((item) => (
          <div key={item.label} className="rounded-[1.6rem] border border-black/5 bg-white p-5 shadow-card">
            <p className="text-sm text-black/45">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold text-black">{item.value}</p>
            <p className="mt-2 text-sm text-black/55">{item.hint}</p>
          </div>
        ))}
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[380px_380px_minmax(0,1fr)]">
        <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
          <div className="space-y-1">
            <p className="text-sm uppercase tracking-[0.24em] text-black/45">Categoria principal</p>
            <h2 className="text-2xl font-semibold text-black">{editingCategoryId ? "Editar categoria" : "Nova categoria"}</h2>
          </div>

          <form onSubmit={handleCategorySubmit} className="mt-5 grid gap-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-black">Nome</p>
              <input
                value={categoryForm.name}
                onChange={(event) =>
                  setCategoryForm((current) => ({
                    ...current,
                    name: event.target.value,
                    slug: categorySlugEdited ? current.slug : createSlug(event.target.value)
                  }))
                }
                className="w-full rounded-2xl border border-black/10 px-4 py-3"
                placeholder="Ex.: Decoracao"
                required
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-black">Slug</p>
              <input
                value={categoryForm.slug}
                onChange={(event) => {
                  setCategoryForm((current) => ({ ...current, slug: createSlug(event.target.value) }));
                  setCategorySlugEdited(true);
                }}
                className="w-full rounded-2xl border border-black/10 px-4 py-3"
                placeholder="decoracao"
                required
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-black">Descricao</p>
              <textarea
                value={categoryForm.description}
                onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))}
                className="min-h-24 w-full rounded-2xl border border-black/10 px-4 py-3"
                placeholder="Resumo da categoria para organizacao interna."
              />
            </div>
            <div className="flex flex-col gap-3">
              <Button type="submit" disabled={loading}>{loading ? "Salvando..." : editingCategoryId ? "Salvar categoria" : "Criar categoria"}</Button>
              {editingCategoryId ? <Button type="button" variant="outline" onClick={resetCategoryForm}>Cancelar</Button> : null}
            </div>
          </form>
        </section>

        <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
          <div className="space-y-1">
            <p className="text-sm uppercase tracking-[0.24em] text-black/45">Subcategoria</p>
            <h2 className="text-2xl font-semibold text-black">{editingSubcategoryId ? "Editar subcategoria" : "Nova subcategoria"}</h2>
          </div>

          <form onSubmit={handleSubcategorySubmit} className="mt-5 grid gap-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-black">Categoria mae</p>
              <select
                value={subcategoryForm.categoryId}
                onChange={(event) => setSubcategoryForm((current) => ({ ...current, categoryId: event.target.value }))}
                className="w-full rounded-2xl border border-black/10 px-4 py-3"
                required
              >
                <option value="">Selecione</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-black">Nome</p>
              <input
                value={subcategoryForm.name}
                onChange={(event) =>
                  setSubcategoryForm((current) => ({
                    ...current,
                    name: event.target.value,
                    slug: subcategorySlugEdited ? current.slug : createSlug(event.target.value)
                  }))
                }
                className="w-full rounded-2xl border border-black/10 px-4 py-3"
                placeholder="Ex.: Espelhos"
                required
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-black">Slug</p>
              <input
                value={subcategoryForm.slug}
                onChange={(event) => {
                  setSubcategoryForm((current) => ({ ...current, slug: createSlug(event.target.value) }));
                  setSubcategorySlugEdited(true);
                }}
                className="w-full rounded-2xl border border-black/10 px-4 py-3"
                placeholder="espelhos"
                required
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-black">Imagem (opcional)</p>
              <div className="flex items-center gap-3">
                <div className="h-20 w-20 overflow-hidden rounded-md bg-[#f3f2ef]">
                  {subcategoryForm.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={subcategoryForm.image} alt={subcategoryForm.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-black/45">Sem imagem</div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="inline-flex cursor-pointer items-center rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageSelect(e.target.files?.[0] ?? null)}
                      className="hidden"
                    />
                    {uploadingImage ? (uploadStage === "optimizing" ? "Preparando..." : "Enviando...") : "Escolher imagem"}
                  </label>
                  {subcategoryForm.image ? (
                    <button
                      type="button"
                      onClick={() => setSubcategoryForm((current) => ({ ...current, image: null }))}
                      className="text-sm text-[#b13f2b]"
                    >
                      Remover imagem
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-black">Descricao</p>
              <textarea
                value={subcategoryForm.description}
                onChange={(event) => setSubcategoryForm((current) => ({ ...current, description: event.target.value }))}
                className="min-h-24 w-full rounded-2xl border border-black/10 px-4 py-3"
                placeholder="Resumo curto da subcategoria."
              />
            </div>
            <div className="flex flex-col gap-3">
              <Button type="submit" disabled={loading || !subcategoryForm.categoryId}>
                {loading ? "Salvando..." : editingSubcategoryId ? "Salvar subcategoria" : "Criar subcategoria"}
              </Button>
              {editingSubcategoryId ? <Button type="button" variant="outline" onClick={resetSubcategoryForm}>Cancelar</Button> : null}
            </div>
            {message ? <p className="text-sm text-black/60">{message}</p> : null}
          </form>
        </section>

        <section className="space-y-6">
          <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm uppercase tracking-[0.24em] text-black/45">Mapa da loja</p>
                <h2 className="text-2xl font-semibold text-black">Estrutura cadastrada</h2>
                <p className="mt-1 max-w-md text-sm leading-6 text-black/50">Selecione exatamente o item que quer manter, editar ou excluir.</p>
              </div>
              <Button type="button" variant="outline" onClick={loadCategories} className="w-full sm:w-auto">Atualizar</Button>
            </div>

            {categories.length > 0 ? (
              <div className="mt-5 space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold leading-5 text-black">O que voce quer gerenciar?</p>
                    <select
                      value={managementMode}
                      onChange={(event) => setManagementMode(event.target.value as "category" | "subcategory")}
                      className="w-full min-w-0 rounded-2xl border border-black/10 px-4 py-3 text-sm"
                    >
                      <option value="category">Categoria</option>
                      <option value="subcategory">Subcategoria</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold leading-5 text-black">Categoria base</p>
                    <select
                      value={selectedCategoryId}
                      onChange={(event) => setSelectedCategoryId(event.target.value)}
                      className="w-full min-w-0 rounded-2xl border border-black/10 px-4 py-3 text-sm"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {managementMode === "subcategory" ? (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-black">Subcategoria selecionada</p>
                    <select
                      value={selectedSubcategoryId}
                      onChange={(event) => setSelectedSubcategoryId(event.target.value)}
                      className="w-full min-w-0 rounded-2xl border border-black/10 px-4 py-3 text-sm"
                      disabled={!selectedCategory || (selectedCategory.subcategories?.length ?? 0) === 0}
                    >
                      {(selectedCategory?.subcategories ?? []).length > 0 ? (
                        (selectedCategory?.subcategories ?? []).map((subcategory) => (
                          <option key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                          </option>
                        ))
                      ) : (
                        <option value="">Nenhuma subcategoria nessa categoria</option>
                      )}
                    </select>
                  </div>
                ) : null}

                {managementMode === "category" && selectedCategory ? (
                  <div className="rounded-[1.5rem] border border-black/6 bg-[#fbfaf7] p-4 sm:p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-black/38">Categoria selecionada</p>
                    <h3 className="mt-2 break-words text-xl font-semibold text-black sm:text-2xl">{selectedCategory.name}</h3>
                    <p className="mt-1 text-sm text-black/45">{selectedCategory.slug}</p>
                    {selectedCategory.description ? <p className="mt-3 text-sm leading-6 text-black/58">{selectedCategory.description}</p> : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-xs text-black/55">
                        {(selectedCategory.subcategories?.length ?? 0)} subcategorias vinculadas
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => startEditCategory(selectedCategory)}
                        className="min-h-12 rounded-[1.25rem] border border-black/10 bg-white px-4 py-3 text-sm font-medium leading-5 text-black transition hover:bg-[#f4efe7]"
                      >
                        Editar categoria selecionada
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete("category", selectedCategory.id)}
                        disabled={deletingId === selectedCategory.id}
                        className="min-h-12 rounded-[1.25rem] border border-[#d87b65]/20 bg-[#fff4f1] px-4 py-3 text-sm font-medium leading-5 text-[#b13f2b] transition hover:bg-[#fde8e2] disabled:opacity-60"
                      >
                        {deletingId === selectedCategory.id ? "Excluindo..." : "Excluir categoria selecionada"}
                      </button>
                    </div>
                  </div>
                ) : null}

                {managementMode === "subcategory" ? (
                  selectedSubcategory && selectedCategory ? (
                    <div className="rounded-[1.5rem] border border-black/6 bg-[#fbfaf7] p-4 sm:p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f4f1ea]">
                          {selectedSubcategory.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={selectedSubcategory.image} alt={selectedSubcategory.name} className="h-full w-full object-contain p-2" />
                          ) : (
                            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">Sem</span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-[0.22em] text-black/38">Subcategoria selecionada</p>
                          <h3 className="mt-2 break-words text-xl font-semibold text-black sm:text-2xl">{selectedSubcategory.name}</h3>
                          <p className="mt-1 text-sm text-black/45">{selectedSubcategory.slug}</p>
                          <p className="mt-1 text-sm text-black/50">Categoria mae: {selectedCategory.name}</p>
                          {selectedSubcategory.description ? (
                            <p className="mt-3 text-sm leading-6 text-black/58">{selectedSubcategory.description}</p>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => startEditSubcategory(selectedCategory, selectedSubcategory)}
                          className="min-h-12 rounded-[1.25rem] border border-black/10 bg-white px-4 py-3 text-sm font-medium leading-5 text-black transition hover:bg-[#f4efe7]"
                        >
                          Editar subcategoria selecionada
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete("subcategory", selectedSubcategory.id)}
                          disabled={deletingId === selectedSubcategory.id}
                          className="min-h-12 rounded-[1.25rem] border border-[#d87b65]/20 bg-[#fff4f1] px-4 py-3 text-sm font-medium leading-5 text-[#b13f2b] transition hover:bg-[#fde8e2] disabled:opacity-60"
                        >
                          {deletingId === selectedSubcategory.id ? "Excluindo..." : "Excluir subcategoria selecionada"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[1.5rem] border border-dashed border-black/10 bg-[#fbfaf7] px-4 py-6 text-sm text-black/45">
                      Essa categoria ainda nao possui subcategorias para editar ou excluir.
                    </div>
                  )
                ) : null}
              </div>
            ) : (
              <div className="mt-5 rounded-[1.5rem] border border-dashed border-black/10 px-4 py-8 text-center text-sm text-black/45">
                Nenhuma categoria cadastrada ainda.
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
