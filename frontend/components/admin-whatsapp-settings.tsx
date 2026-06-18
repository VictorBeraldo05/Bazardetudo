"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

type WhatsAppGroup = {
  id: string;
  name: string;
  whatsapp_group_id: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

type WhatsAppJob = {
  id: string;
  product_id: string;
  job_type: string;
  status: string;
  attempts: number;
  max_attempts: number;
  last_error?: string | null;
  created_at: string;
  completed_at?: string | null;
};

type WhatsAppLog = {
  id: string;
  product_id: string;
  whatsapp_group_id: string;
  status: string;
  error_message?: string | null;
  provider?: string | null;
  sent_at?: string | null;
  created_at: string;
};

type OverviewResponse = {
  groups: WhatsAppGroup[];
  jobs: WhatsAppJob[];
  logs: WhatsAppLog[];
};

const EMPTY_FORM = {
  name: "",
  whatsapp_group_id: "",
  active: true
};

function statusBadge(status: string) {
  if (status === "sent" || status === "completed") {
    return "bg-[#dff2e4] text-[#2f6a43]";
  }
  if (status === "failed") {
    return "bg-[#f7d8d2] text-[#9d3d2d]";
  }
  if (status === "processing" || status === "pending") {
    return "bg-[#f8ecd3] text-[#8a6230]";
  }
  return "bg-black/5 text-black/65";
}

export function AdminWhatsAppSettings() {
  const [groups, setGroups] = useState<WhatsAppGroup[]>([]);
  const [jobs, setJobs] = useState<WhatsAppJob[]>([]);
  const [logs, setLogs] = useState<WhatsAppLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const activeGroupsCount = useMemo(() => groups.filter((group) => group.active).length, [groups]);
  const sentLogsCount = useMemo(() => logs.filter((log) => log.status === "sent").length, [logs]);
  const failedLogsCount = useMemo(() => logs.filter((log) => log.status === "failed").length, [logs]);

  async function loadOverview() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/whatsapp/overview", { cache: "no-store" });
      const result = (await response.json().catch(() => null)) as OverviewResponse | { detail?: string; message?: string } | null;
      if (!response.ok || !result || !("groups" in result)) {
        throw new Error((result as { detail?: string; message?: string } | null)?.detail ?? (result as { message?: string } | null)?.message ?? "Nao foi possivel carregar configuracoes do WhatsApp.");
      }
      setGroups(result.groups);
      setJobs(result.jobs);
      setLogs(result.logs);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nao foi possivel carregar configuracoes do WhatsApp.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOverview();
  }, []);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const target = editingId ? `/api/admin/whatsapp/groups/${editingId}` : "/api/admin/whatsapp/groups";
    const method = editingId ? "PUT" : "POST";

    try {
      const response = await fetch(target, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.detail ?? result?.message ?? "Nao foi possivel salvar o grupo.");
      }

      await loadOverview();
      resetForm();
      setMessage(editingId ? "Grupo atualizado com sucesso." : "Grupo cadastrado com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nao foi possivel salvar o grupo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(groupId: string) {
    setDeletingId(groupId);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/whatsapp/groups/${groupId}`, {
        method: "DELETE"
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.detail ?? result?.message ?? "Nao foi possivel excluir o grupo.");
      }
      await loadOverview();
      if (editingId === groupId) {
        resetForm();
      }
      setMessage("Grupo removido com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nao foi possivel excluir o grupo.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
        <p className="text-sm uppercase tracking-[0.24em] text-black/45">Configuracoes</p>
        <h1 className="mt-2 font-display text-4xl text-black">WhatsApp automatico da loja</h1>
        <p className="mt-3 max-w-3xl text-sm text-black/60">
          Cadastre os grupos de divulgacao, acompanhe os envios e mantenha o disparo automatico dos produtos sob controle.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Grupos ativos", value: activeGroupsCount, hint: "Listas prontas para disparo" },
          { label: "Total de grupos", value: groups.length, hint: "Configuracoes cadastradas" },
          { label: "Envios com sucesso", value: sentLogsCount, hint: "Logs marcados como sent" },
          { label: "Falhas recentes", value: failedLogsCount, hint: "Verifique token, sessao ou grupo" }
        ].map((item) => (
          <div key={item.label} className="rounded-[1.6rem] border border-black/5 bg-white p-5 shadow-card">
            <p className="text-sm text-black/45">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold text-black">{item.value}</p>
            <p className="mt-2 text-sm text-black/55">{item.hint}</p>
          </div>
        ))}
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
          <div className="space-y-1">
            <p className="text-sm uppercase tracking-[0.24em] text-black/45">Grupos</p>
            <h2 className="text-2xl font-semibold text-black">{editingId ? "Editar grupo" : "Novo grupo"}</h2>
            <p className="text-sm text-black/58">
              Use o ID real do grupo no gateway, geralmente em formato `120...@g.us`.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-black">Nome interno</p>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Ex.: Promocoes moveis"
                className="w-full rounded-2xl border border-black/10 px-4 py-3"
                required
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-black">ID do grupo</p>
              <input
                value={form.whatsapp_group_id}
                onChange={(event) => setForm((current) => ({ ...current, whatsapp_group_id: event.target.value }))}
                placeholder="1203630xxxxxxxx@g.us"
                className="w-full rounded-2xl border border-black/10 px-4 py-3"
                required
              />
            </div>

            <label className="flex items-center gap-2 rounded-full bg-[#f5f1e8] px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))}
              />
              Grupo ativo para receber novos produtos
            </label>

            <div className="flex flex-col gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : editingId ? "Salvar grupo" : "Cadastrar grupo"}
              </Button>
              {editingId ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar edicao
                </Button>
              ) : null}
            </div>
            {message ? <p className="text-sm text-black/60">{message}</p> : null}
          </form>

          <div className="mt-6 rounded-[1.5rem] bg-[#f8f3ea] p-4 text-sm text-black/62">
            <p className="font-semibold text-black">Checklist Evolution API</p>
            <p className="mt-2">1. Instancia conectada por QR.</p>
            <p>2. Grupo existente e com ID correto.</p>
            <p>3. `WHATSAPP_PROVIDER=evolution` no Render.</p>
            <p>4. `WHATSAPP_INSTANCE_NAME`, `WHATSAPP_BASE_URL` e `WHATSAPP_API_TOKEN` preenchidos.</p>
            <p>5. `STOREFRONT_PUBLIC_URL` apontando para a Vercel.</p>
          </div>
        </section>

        <section className="space-y-6">
          <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-black/45">Grupos cadastrados</p>
                <h2 className="text-2xl font-semibold text-black">Destinos de divulgacao</h2>
              </div>
              <Button type="button" variant="outline" onClick={loadOverview} disabled={loading}>
                {loading ? "Atualizando..." : "Atualizar"}
              </Button>
            </div>

            <div className="mt-5 space-y-3">
              {groups.map((group) => (
                <div key={group.id} className="rounded-[1.5rem] bg-[#f6f2eb] p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold text-black">{group.name}</p>
                      <p className="mt-1 text-sm text-black/55">{group.whatsapp_group_id}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${group.active ? "bg-[#dff2e4] text-[#2f6a43]" : "bg-black/8 text-black/60"}`}>
                      {group.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(group.id);
                        setForm({
                          name: group.name,
                          whatsapp_group_id: group.whatsapp_group_id,
                          active: group.active
                        });
                      }}
                      className="text-sm font-medium text-black"
                    >
                      Editar grupo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(group.id)}
                      disabled={deletingId === group.id}
                      className="text-sm font-medium text-[#b13f2b] disabled:opacity-60"
                    >
                      {deletingId === group.id ? "Excluindo..." : "Excluir grupo"}
                    </button>
                  </div>
                </div>
              ))}

              {groups.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-black/10 px-4 py-8 text-center text-sm text-black/45">
                  Nenhum grupo cadastrado ainda.
                </div>
              ) : null}
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-black/45">Fila</p>
                <h2 className="text-2xl font-semibold text-black">Jobs recentes</h2>
              </div>

              <div className="mt-5 space-y-3">
                {jobs.slice(0, 8).map((job) => (
                  <div key={job.id} className="rounded-[1.35rem] bg-[#f8f4ed] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-black">{job.job_type}</p>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(job.status)}`}>{job.status}</span>
                    </div>
                    <p className="mt-2 text-xs text-black/55">Produto: {job.product_id}</p>
                    <p className="mt-1 text-xs text-black/55">Tentativas: {job.attempts}/{job.max_attempts}</p>
                    {job.last_error ? <p className="mt-2 text-xs text-[#a04331]">{job.last_error}</p> : null}
                  </div>
                ))}
                {jobs.length === 0 ? <p className="text-sm text-black/45">Nenhum job registrado ainda.</p> : null}
              </div>
            </section>

            <section className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-card">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-black/45">Envios</p>
                <h2 className="text-2xl font-semibold text-black">Logs recentes</h2>
              </div>

              <div className="mt-5 space-y-3">
                {logs.slice(0, 8).map((log) => (
                  <div key={log.id} className="rounded-[1.35rem] bg-[#f8f4ed] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-black">{log.whatsapp_group_id}</p>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(log.status)}`}>{log.status}</span>
                    </div>
                    <p className="mt-2 text-xs text-black/55">Produto: {log.product_id}</p>
                    <p className="mt-1 text-xs text-black/55">Provider: {log.provider ?? "-"}</p>
                    {log.error_message ? <p className="mt-2 text-xs text-[#a04331]">{log.error_message}</p> : null}
                  </div>
                ))}
                {logs.length === 0 ? <p className="text-sm text-black/45">Nenhum log de envio ainda.</p> : null}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
