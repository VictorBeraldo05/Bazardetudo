import { AdminCategoriesManager } from "@/components/admin-categories-manager";
import { getCategories, type Category } from "@/lib/api";

export default async function AdminCategoriesPage() {
  let categories: Category[] = [];

  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }

  return <AdminCategoriesManager initialCategories={categories} />;
}
