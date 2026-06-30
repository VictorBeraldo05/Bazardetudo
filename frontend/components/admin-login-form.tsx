"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useNavigationFeedback } from "@/components/navigation-feedback-provider";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";

export function AdminLoginForm({ next }: { next: string }) {
  const router = useRouter();
  const { startNavigation } = useNavigationFeedback();
  const { showToast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password")
        })
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message ?? "Acesso administrativo invalido.");
      }

      showToast({
        tone: "success",
        title: "Login admin realizado",
        description: "Abrindo o painel gerencial."
      });
      startNavigation(next);
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao entrar.");
      showToast({
        tone: "error",
        title: "Falha no acesso admin",
        description: "Confira as credenciais e tente novamente."
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-[2rem] bg-[#111111] p-8 text-white shadow-card">
      <p className="text-sm uppercase tracking-[0.24em] text-white/55">Area gerencial</p>
      <h1 className="mt-3 font-display text-4xl">Login admin</h1>
      <p className="mt-3 text-sm text-white/70">Apenas contas administrativas podem abrir o painel.</p>
      <form action={handleSubmit} className="mt-6 grid gap-4">
        <input name="email" type="email" placeholder="E-mail admin" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
        <input name="password" type="password" placeholder="Senha" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
        <Button type="submit" disabled={loading} className="bg-white text-black hover:bg-white/90">
          {loading ? "Entrando..." : "Entrar no painel"}
        </Button>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
      </form>
    </div>
  );
}
