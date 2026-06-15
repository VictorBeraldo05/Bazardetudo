"use client";

import { usePathname } from "next/navigation";

import { AdminShell } from "@/components/admin-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return <AdminShell>{children}</AdminShell>;
}
