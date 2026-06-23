"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { Category } from "@/lib/api";

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
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
  description: ""
};

export function AdminCategoriesManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(EMPTY_CATEGORY_FORM);
  const [subcategoryForm, setSubcategoryForm] = useState<SubcategoryForm>({
    ...EMPTY_SUBCATEGORY_FORM,
    categoryId: initialCategories[0]?.id ?? ""
  });

  const totalSubcategories = useMemo(
    () => categories.reduce((total, category) => total + (category.subcategories?.length ?? 0), 0),
    [categories]
  );

  async function loadCategories() {
    try {
      const response = await fetch("/api/admin/categories", { cache: "no-store" });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result) {
        throw new Error(result?.detail ?? result?.message ?? "Nao foi possivel carregar as categorias.");
      }
      setCategories(result as Category[]);
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

  function resetCategoryForm() {
    setCategoryForm(EMPTY_CATEGORY_FORM);
    setEditingCategoryId(null);
  }

  function resetSubcategoryForm() {
    setSubcategoryForm({
      ...EMPTY_SUBCATEGORY_FORM,
      categoryId: categories[0]?.id ?? ""
    });
    setEditingSubcategoryId(null);
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
        throw new Error(result?.detail ?? result?.message ?? "Nao foi possivel salvar a categoria.");
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
    const payload = editingSubcategoryId ? subcategoryForm : {
      name: subcategoryForm.name,
      slug: subcategoryForm.slug,
      description: subcategoryForm.description
    };

    try {
      const response = await fetch(target, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.detail ?? result?.message ?? "Nao foi possivel salvar a subcategoria.");
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

  async function handleDelete(target: "category" | "subcategory", id: string) {
    setDeletingId(id);
    setMessage(null);
    const endpoint = target === "category" ? `/api/admin/categories/${id}` : `/api/admin/subcategories/${id}`;

    try {
      const response = await fetch(endpoint, { method: "DELETE" });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.detail ?? result?.message ?? "Nao foi possivel excluir.");
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
                    slug: current.slug ? current.slug : createSlug(event.target.value)
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
                onChange={(event) => setCategoryForm((current) => ({ ...current, slug: createSlug(event.target.value) }))}
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
                    slug: current.slug ? current.slug : createSlug(event.target.value)
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
                onChange={(event) => setSubcategoryForm((current) => ({ ...current, slug: createSlug(event.target.value) }))}
                className="w-full rounded-2xl border border-black/10 px-4 py-3"
                placeholder="espelhos"
                required
              />
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-black/45">Mapa da loja</p>
                <h2 className="text-2xl font-semibold text-black">Estrutura cadastrada</h2>
              </div>
              <Button type="button" variant="outline" onClick={loadCategories}>Atualizar</Button>
            </div>

            <div className="mt-5 space-y-4">
              {categories.map((category) => (
                <div key={category.id} className="rounded-[1.5rem] bg-[#f6f2eb] p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold text-black">{category.name}</p>
                      <p className="mt-1 text-sm text-black/50">{category.slug}</p>
                      {category.description ? <p className="mt-2 text-sm text-black/58">{category.description}</p> : null}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategoryId(category.id);
                          setCategoryForm({
                            name: category.name,
                            slug: category.slug,
                            description: category.description ?? ""
                          });
                        }}
                        className="font-medium text-black"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete("category", category.id)}
                        disabled={deletingId === category.id}
                        className="font-medium text-[#b13f2b] disabled:opacity-60"
                      >
                        {deletingId === category.id ? "Excluindo..." : "Excluir"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(category.subcategories ?? []).map((subcategory) => (
                      <button
                        key={subcategory.id}
                        type="button"
                        onClick={() => {
                          setEditingSubcategoryId(subcategory.id);
                          setSubcategoryForm({
                            categoryId: category.id,
                            name: subcategory.name,
                            slug: subcategory.slug,
                            description: subcategory.description ?? ""
                          });
                        }}
                        className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm text-black transition hover:bg-[#f1ece3]"
                      >
                        {subcategory.name}
                      </button>
                    ))}
                  </div>

                  {(category.subcategories ?? []).length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-3 text-sm">
                      {(category.subcategories ?? []).map((subcategory) => (
                        <button
                          key={`${subcategory.id}-delete`}
                          type="button"
                          onClick={() => handleDelete("subcategory", subcategory.id)}
                          disabled={deletingId === subcategory.id}
                          className="text-[#b13f2b] disabled:opacity-60"
                        >
                          {deletingId === subcategory.id ? `Excluindo ${subcategory.name}...` : `Excluir ${subcategory.name}`}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-black/45">Nenhuma subcategoria cadastrada ainda.</p>
                  )}
                </div>
              ))}

              {categories.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-black/10 px-4 py-8 text-center text-sm text-black/45">
                  Nenhuma categoria cadastrada ainda.
                </div>
              ) : null}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
