"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { registerCustomer } from "@/lib/api";

const signupSchema = z
  .object({
    fullName: z.string().min(3, "Informe seu nome completo"),
    email: z.string().email("Informe um e-mail valido"),
    phone: z.string().min(8, "Informe um WhatsApp valido"),
    document: z.string().min(11, "Informe um CPF valido"),
    password: z.string().min(6, "A senha precisa ter ao menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirme a senha")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas nao conferem",
    path: ["confirmPassword"]
  });

type SignupForm = z.infer<typeof signupSchema>;

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export default function SignupPage() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      document: "",
      password: "",
      confirmPassword: ""
    }
  });

  async function onSubmit(values: SignupForm) {
    setSubmitting(true);
    setFeedback(null);

    try {
      await registerCustomer({
        full_name: values.fullName,
        email: values.email,
        phone: values.phone,
        document: onlyDigits(values.document),
        password: values.password
      });

      setFeedback("Conta criada com sucesso. Agora voce ja pode entrar.");
      router.push("/login");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nao foi possivel criar a conta.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="shell py-8">
      <div className="mx-auto max-w-lg rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm uppercase tracking-[0.24em] text-black/45">Criar conta</p>
        <h1 className="mt-3 font-display text-4xl text-black">Cadastre-se para comprar</h1>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 grid gap-3">
          <input className="rounded-2xl border border-black/10 px-4 py-3" placeholder="Nome completo" {...form.register("fullName")} />
          <input className="rounded-2xl border border-black/10 px-4 py-3" placeholder="E-mail" {...form.register("email")} />
          <input className="rounded-2xl border border-black/10 px-4 py-3" placeholder="WhatsApp" {...form.register("phone")} />
          <input className="rounded-2xl border border-black/10 px-4 py-3" placeholder="CPF" {...form.register("document")} />
          <input className="rounded-2xl border border-black/10 px-4 py-3" placeholder="Senha" type="password" {...form.register("password")} />
          <input className="rounded-2xl border border-black/10 px-4 py-3" placeholder="Confirmar senha" type="password" {...form.register("confirmPassword")} />

          {Object.values(form.formState.errors).length > 0 ? (
            <div className="rounded-2xl bg-[#fff1e8] px-4 py-3 text-sm text-[#9a3b25]">
              {Object.values(form.formState.errors)[0]?.message}
            </div>
          ) : null}

          {feedback ? (
            <div className="rounded-2xl bg-[#f3eadf] px-4 py-3 text-sm text-black/70">{feedback}</div>
          ) : null}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>
        <div className="mt-6 flex items-center justify-between text-sm text-black/55">
          <Link href="/login">Ja tenho conta</Link>
          <Link href="/contato">Preciso de ajuda</Link>
        </div>
      </div>
    </main>
  );
}
