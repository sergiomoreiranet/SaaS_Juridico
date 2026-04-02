"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

type Tenant = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  trialEndsAt: Date | null;
  createdAt: Date;
  userName: string | null;
  userEmail: string | null;
  userOab: string | null;
  userPhone: string | null;
};

type Stats = {
  pending: number;
  trial: number;
  active: number;
  blocked: number;
  total: number;
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Aguardando", color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
  trial:   { label: "Trial",      color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
  active:  { label: "Ativo",      color: "#34d399", bg: "rgba(52,211,153,0.1)" },
  blocked: { label: "Bloqueado",  color: "#f87171", bg: "rgba(248,113,113,0.1)" },
};

const planLabels: Record<string, string> = {
  basico: "Básico",
  pro: "Pro",
  elite: "Elite",
};

export default function AdminClientPage({
  tenants,
  stats,
}: {
  tenants: Tenant[];
  stats: Stats;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  async function handleAction(tenantId: string, action: "approve" | "block" | "activate") {
    setLoadingId(tenantId);
    try {
      const res = await fetch("/api/admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setToast({ msg: data.message, type: "success" });
      startTransition(() => router.refresh());
    } catch (e) {
      setToast({ msg: (e as Error).message || "Erro ao executar ação.", type: "error" });
    } finally {
      setLoadingId(null);
      setTimeout(() => setToast(null), 4000);
    }
  }

  const filtered = filterStatus === "all"
    ? tenants
    : tenants.filter((t) => t.status === filterStatus);

  const daysLeft = (date: Date | null) => {
    if (!date) return null;
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
    return diff;
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", minHeight: "100vh", background: "#0a0a0a", color: "white" }}>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium"
          style={{ background: toast.type === "success" ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)",
            border: `1px solid ${toast.type === "success" ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
            color: toast.type === "success" ? "#34d399" : "#f87171" }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between"
        style={{ background: "rgba(10,10,10,0.9)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 40 }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl" style={{ color: "#d4af37" }}>⚖</span>
          <div>
            <h1 className="text-lg font-bold text-white">JuriADM</h1>
            <p className="text-xs" style={{ color: "#d4af37" }}>Super Admin</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/40 hidden sm:flex">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Painel Interno
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#f87171]/20 text-xs text-[#f87171] hover:bg-[#f87171]/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Aguardando", value: stats.pending, color: "#fbbf24" },
            { label: "Em Trial",   value: stats.trial,   color: "#60a5fa" },
            { label: "Ativos",     value: stats.active,  color: "#34d399" },
            { label: "Bloqueados", value: stats.blocked, color: "#f87171" },
          ].map((s) => (
            <div key={s.label} className="p-5 rounded-2xl border"
              style={{ background: "rgba(14,14,14,0.8)", borderColor: "rgba(255,255,255,0.07)" }}>
              <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-sm text-white/40 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="text-xl font-semibold text-white">
            Escritórios <span className="text-white/30">({filtered.length})</span>
          </h2>
          <div className="flex gap-2 flex-wrap">
            {["all", "pending", "trial", "active", "blocked"].map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all border"
                style={{
                  background: filterStatus === s ? "rgba(139,0,0,0.2)" : "transparent",
                  borderColor: filterStatus === s ? "rgba(139,0,0,0.5)" : "rgba(255,255,255,0.1)",
                  color: filterStatus === s ? "#d4af37" : "rgba(255,255,255,0.4)",
                }}>
                {s === "all" ? "Todos" : statusConfig[s]?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tenants List */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <div className="text-center py-20 text-white/20">
              <p className="text-4xl mb-3">📭</p>
              <p>Nenhum escritório neste status.</p>
            </div>
          )}

          {filtered.map((tenant) => {
            const sc = statusConfig[tenant.status] || statusConfig.pending;
            const days = daysLeft(tenant.trialEndsAt);
            const isLoading = loadingId === tenant.id;

            return (
              <div key={tenant.id} className="p-5 sm:p-6 rounded-2xl border transition-all"
                style={{ background: "rgba(14,14,14,0.8)", borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                  {/* Infos do Escritório */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h3 className="text-white font-semibold text-base">{tenant.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border"
                        style={{ background: sc.bg, borderColor: sc.color + "40", color: sc.color }}>
                        {sc.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-xs border border-white/10 text-white/30">
                        {planLabels[tenant.plan] || tenant.plan}
                      </span>
                    </div>

                    <p className="text-sm mb-3" style={{ color: "#d4af37", opacity: 0.7 }}>
                      {tenant.slug}.juriadm.com.br
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm text-white/40">
                      <span>👤 {tenant.userName || "—"}</span>
                      <span>📧 {tenant.userEmail || "—"}</span>
                      <span>⚖ OAB: {tenant.userOab || "—"}</span>
                      <span>📱 {tenant.userPhone || "—"}</span>
                    </div>

                    {days !== null && (
                      <p className="mt-2 text-xs" style={{ color: days <= 3 ? "#f87171" : "#60a5fa" }}>
                        {days > 0 ? `⏱ Trial expira em ${days} dia(s)` : "⚠ Trial expirado"}
                      </p>
                    )}

                    <p className="text-xs text-white/20 mt-2">
                      Cadastrado em: {new Date(tenant.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                    {tenant.status === "pending" && (
                      <button onClick={() => handleAction(tenant.id, "approve")} disabled={isLoading}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                        style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}>
                        {isLoading ? "..." : "✓ Aprovar"}
                      </button>
                    )}
                    {tenant.status === "trial" && (
                      <button onClick={() => handleAction(tenant.id, "activate")} disabled={isLoading}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                        style={{ background: "rgba(96,165,250,0.12)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.25)" }}>
                        {isLoading ? "..." : "⭐ Ativar"}
                      </button>
                    )}
                    {tenant.status !== "blocked" && (
                      <button onClick={() => handleAction(tenant.id, "block")} disabled={isLoading}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                        style={{ background: "rgba(248,113,113,0.08)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
                        {isLoading ? "..." : "✕ Bloquear"}
                      </button>
                    )}
                    {tenant.status === "blocked" && (
                      <button onClick={() => handleAction(tenant.id, "approve")} disabled={isLoading}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                        style={{ background: "rgba(251,191,36,0.08)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>
                        {isLoading ? "..." : "↩ Reativar"}
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
