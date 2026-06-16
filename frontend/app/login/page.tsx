"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.message ?? "Nao foi possivel entrar.");
      }

      router.push(result?.user?.is_admin ? "/admin" : "/perfil");
      router.refresh();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell py-6 md:py-8">
      <div className="mx-auto max-w-lg rounded-[2rem] bg-white p-6 shadow-card md:p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-black/45">Entrar</p>
        <h1 className="mt-2 font-display text-4xl text-black">Acesse sua conta</h1>
        <form onSubmit={handleSubmit} className="mt-5 grid gap-3 md:mt-6">
          <input
            className="rounded-2xl border border-black/10 px-4 py-3"
            placeholder="E-mail"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            className="rounded-2xl border border-black/10 px-4 py-3"
            placeholder="Senha"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {feedback ? <div className="rounded-2xl bg-[#fff1e8] px-4 py-3 text-sm text-[#9a3b25]">{feedback}</div> : null}
          <Button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <div className="mt-6 flex items-center justify-between text-sm text-black/55">
          <Link href="/cadastro">Criar conta</Link>
          <Link href="/admin/login">Acesso admin</Link>
        </div>
      </div>
    </main>
  );
}
