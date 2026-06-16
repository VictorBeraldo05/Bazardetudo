import { cookies } from "next/headers";

import { FavoritesAlertsClient } from "@/components/favorites-alerts-client";
import { AUTH_USER_COOKIE } from "@/lib/admin-auth";
import { getCategories, getProducts } from "@/lib/api";

type AuthUser = {
  id: string;
  full_name: string;
  email: string;
  is_admin: boolean;
};

export default async function FavoritesPage() {
  const rawUser = (await cookies()).get(AUTH_USER_COOKIE)?.value;
  const user = rawUser ? (JSON.parse(rawUser) as AuthUser) : null;
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  return <FavoritesAlertsClient categories={categories} products={products} user={user} />;
}
