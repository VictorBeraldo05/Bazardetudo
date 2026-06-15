import { AdminLoginForm } from "@/components/admin-login-form";

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params?.next ?? "/admin";

  return (
    <main className="shell flex min-h-[80vh] items-center justify-center py-10">
      <AdminLoginForm next={next} />
    </main>
  );
}
