"use client";

import { useState, useEffect } from "react";
import { Users, FileText, DollarSign, MoreHorizontal, ChevronRight, PlayCircle, AlertCircle, CheckCircle2, Clock, CalendarDays, ExternalLink } from "lucide-react";

export interface DashboardProps {
  tenantInfo: { status: string; trialEndsAt: string | null };
  totalClients: number;
  totalActiveCases: number;
  overdueCount: number;
  recentCases: Array<{ id: string; name: string; client: string; status: string; due: string; lead: string }>;
  urgentDeadlines: Array<{ id: string; description: string; dueDate: string; caseName: string; caseId: string }>;
  calendarEvents: {
    atrasados: Array<{ time: string; title: string; color: string; caseName: string; caseId: string }>;
    today: Array<{ time: string; title: string; color: string; caseName: string; caseId: string }>;
    tomorrow: Array<{ time: string; title: string; color: string; caseName: string; caseId: string }>;
  };
}

// ── COMPONENTE PRINCIPAL ───────────────────────────────────────────────────
export function DashboardClientView({ tenantInfo, totalClients, totalActiveCases, overdueCount, recentCases, urgentDeadlines, calendarEvents }: DashboardProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"hoje" | "atrasados">("hoje");

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  // Calcula dias restantes no Trial se o status for trial
  let trialRemainingDays = null;
  if (tenantInfo.status === "trial" && tenantInfo.trialEndsAt) {
    const trialEnd = new Date(tenantInfo.trialEndsAt);
    const today = new Date();
    const diffTime = trialEnd.getTime() - today.getTime();
    trialRemainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const hasAtrasados = calendarEvents.atrasados.length > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 mt-[-10px]">

      {/* ── BANNER TRIAL ─────────────────────────────────────────────────── */}
      {tenantInfo.status === "trial" && trialRemainingDays !== null && (
        <div className="rounded-2xl border border-[#cca77b]/50 bg-gradient-to-r from-[#1b150c] via-[#2a2212] to-[#121212] p-4 shadow-xl flex items-center justify-between mb-4 mt-2">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-[#cca77b]/20 flex items-center justify-center">
               <Clock className="w-5 h-5 text-[#cca77b]" />
             </div>
             <div>
               <p className="text-[15px] font-medium text-[#f5f5f5]">Período de Teste Gratuito</p>
               <p className="text-[13px] text-[#cca77b]">Restam {trialRemainingDays} dias para o fim do seu trial.</p>
             </div>
          </div>
          <button className="px-5 py-2.5 rounded-xl bg-[#cca77b] text-zinc-900 text-[13px] font-semibold hover:bg-[#d8b88f] transition-all shadow-md">
             Assinar Agora
          </button>
        </div>
      )}

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8 mt-4">
        <h1 className="text-3xl font-semibold text-[#f5f5f5] tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 rounded-xl bg-[#141414] border border-white/5 text-sm text-[#cca77b] hover:bg-[#1a1a1a] transition-all font-medium">
            Visão Geral
          </button>
        </div>
      </div>

      {/* ── ROW 1: KPI CARDS ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-[#cca77b]/35 bg-[#121212] p-7 shadow-lg relative overflow-hidden group hover:border-[#cca77b]/50 transition-all cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-[#cca77b]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-[15px] font-medium text-zinc-300 mb-5 relative z-10 tracking-wide">Processos Ativos</p>
          <p className="text-[52px] font-medium text-[#cca77b] relative z-10 leading-none">{totalActiveCases}</p>
        </div>

        <div className="rounded-2xl border border-[#cca77b]/35 bg-[#121212] p-7 shadow-lg relative overflow-hidden group hover:border-[#cca77b]/50 transition-all cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-[#cca77b]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-[15px] font-medium text-zinc-300 mb-5 relative z-10 tracking-wide">Novos Clientes</p>
          <p className="text-[52px] font-medium text-[#cca77b] relative z-10 leading-none">{totalClients}</p>
        </div>

        <div className="rounded-2xl border border-[#8b0000]/50 bg-gradient-to-br from-[#121212] to-[#1a1010] p-7 shadow-lg relative overflow-hidden group hover:border-[#8b0000]/70 transition-all cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-[#8b0000]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start">
             <p className="text-[15px] font-medium text-[#ff4d4d] mb-5 relative z-10 tracking-wide">Prazos Atrasados</p>
             <AlertCircle className="w-5 h-5 text-[#8b0000]" />
          </div>
          <p className="text-[52px] font-medium text-[#8b0000] relative z-10 leading-none">{overdueCount}</p>
        </div>
      </div>

      {/* ── ROW 2: TABELA DE PROCESSOS + AGENDA ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Processos Recentes (2/3) */}
        <div className="lg:col-span-2 rounded-2xl border border-[#cca77b]/35 bg-[#121212] flex flex-col shadow-lg relative min-h-[400px]">
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#cca77b]/5 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />

          <div className="flex items-center justify-between px-7 py-6 relative z-10 border-b border-white/5">
            <h2 className="text-lg font-medium text-[#f5f5f5]">Processos Recentes</h2>
            <button className="text-zinc-500 hover:text-[#cca77b] transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <div className="px-7 pt-4 pb-2 grid grid-cols-5 text-[13px] text-zinc-400 font-medium mb-3 relative z-10">
            <span className="col-span-1">Processo</span>
            <span className="col-span-1">Cliente</span>
            <span className="col-span-1">Status</span>
            <span className="col-span-1">Adicionado Em</span>
            <span className="col-span-1 text-right">Responsável</span>
          </div>
          <div className="flex-1 px-5 space-y-1 pb-4 relative z-10">
            {recentCases.map((c, i) => {
              const isActive = i === 0; // Primeiro em destaque
              return (
                <div
                  key={c.id}
                  className={`grid grid-cols-5 items-center px-4 py-3.5 rounded-[14px] transition-all cursor-pointer ${isActive
                    ? "bg-gradient-to-r from-[#cca77b]/30 via-[#cca77b]/5 to-transparent border border-[#cca77b]/35 shadow-[0_0_20px_rgba(212,175,55,0.05)]"
                    : "border border-transparent hover:bg-white/[0.03]"
                    }`}
                >
                  <span className={`col-span-1 text-[13px] truncate pr-2 ${isActive ? "text-[#f5f5f5]" : "text-zinc-300"}`}>{c.name}</span>
                  <span className={`col-span-1 text-[13px] truncate pr-2 ${isActive ? "text-zinc-300" : "text-zinc-400"}`}>{c.client}</span>
                  <span className="col-span-1 flex items-center gap-2 text-[13px] text-zinc-400">
                    {c.status === "Ativo" && <PlayCircle className="w-[14px] h-[14px] text-[#cca77b]" />}
                    {c.status === "Pendente" && <AlertCircle className="w-[14px] h-[14px] text-[#8b0000]" />}
                    {c.status === "Fechado" && <CheckCircle2 className="w-[14px] h-[14px] text-zinc-500" />}
                    <span className={c.status === "Ativo" ? "text-zinc-300" : "text-zinc-500"}>{c.status}</span>
                  </span>
                  <span className={`col-span-1 text-[13px] ${isActive ? "text-zinc-300" : "text-zinc-500"}`}>{c.due}</span>
                  <span className={`col-span-1 text-[13px] text-right truncate ${isActive ? "text-[#f5f5f5]" : "text-zinc-400"}`}>{c.lead}</span>
                </div>
              );
            })}
            {recentCases.length === 0 && (
                <div className="text-center text-zinc-500 text-sm py-10">Nenhum processo encontrado.</div>
            )}
          </div>
        </div>

        {/* Resumo da Agenda (1/3) */}
        <div className="lg:col-span-1 rounded-2xl border border-[#cca77b]/35 bg-[#121212] overflow-hidden p-7 flex flex-col shadow-lg relative min-h-[400px]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#cca77b]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

          <h2 className="text-lg font-medium text-[#f5f5f5] mb-5 relative z-10 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#cca77b]" />
            Resumo de Prazos
          </h2>

          <div className="flex gap-2 mb-6 relative z-10">
             <button 
                onClick={() => setActiveTab("hoje")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${activeTab === "hoje" ? "bg-[#1f1f1f] border-[#cca77b]/50 text-[#cca77b]" : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/5"}`}
             >
                Próximos
             </button>
             <button 
                onClick={() => setActiveTab("atrasados")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all flex items-center justify-center gap-1.5 ${activeTab === "atrasados" ? "bg-[#1f1616] border-[#8b0000]/50 text-[#ff4d4d]" : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/5"}`}
             >
                Atrasados {hasAtrasados && <span className="w-2 h-2 rounded-full bg-[#8b0000]"></span>}
             </button>
          </div>

          <div className="space-y-6 relative z-10 h-full overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cca77b transparent' }}>
            {activeTab === "hoje" && (
                <>
                <div>
                  <p className="text-[13px] font-medium text-zinc-300 mb-3">Hoje</p>
                  <div className="space-y-3">
                    {calendarEvents.today.map((ev, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-xl bg-[#181818] border border-white/5 shadow-sm hover:border-[#cca77b]/20 transition-all cursor-pointer">
                        <div className={`w-0.5 rounded-full shrink-0 ${ev.color}`} />
                        <div>
                          <p className="text-[13px] font-medium text-[#f5f5f5] leading-snug">{ev.title}</p>
                          <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1.5 pt-0.5 overflow-hidden">
                              <span className="shrink-0">{ev.time}</span> <span className="shrink-0">•</span> <span className="truncate flex-1 max-w-[130px]">{ev.caseName}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                    {calendarEvents.today.length === 0 && <p className="text-xs text-zinc-600">Nenhum prazo para hoje.</p>}
                  </div>
                </div>

                <div>
                  <p className="text-[13px] font-medium text-zinc-300 mb-3 mt-4">Amanhã</p>
                  <div className="space-y-3">
                    {calendarEvents.tomorrow.map((ev, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-xl bg-[#181818] border border-white/5 shadow-sm hover:border-white/10 transition-all cursor-pointer">
                        <div className={`w-0.5 rounded-full shrink-0 ${ev.color}`} />
                        <div>
                          <p className="text-[13px] font-medium text-zinc-300 leading-snug">{ev.title}</p>
                          <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1.5 pt-0.5 overflow-hidden">
                              <span className="shrink-0">{ev.time}</span> <span className="shrink-0">•</span> <span className="truncate flex-1 max-w-[130px]">{ev.caseName}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                    {calendarEvents.tomorrow.length === 0 && <p className="text-xs text-zinc-600">Nenhum prazo para amanhã.</p>}
                  </div>
                </div>
                </>
            )}

            {activeTab === "atrasados" && (
                <div>
                   <p className="text-[13px] font-medium text-[#ff4d4d] mb-3">Pendentes de Solução</p>
                   <div className="space-y-3">
                    {calendarEvents.atrasados.map((ev, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-xl bg-[#1c1212] border border-[#8b0000]/20 shadow-sm hover:border-[#8b0000]/50 transition-all cursor-pointer">
                        <div className={`w-0.5 rounded-full shrink-0 ${ev.color}`} />
                        <div>
                          <p className="text-[13px] font-medium text-[#ff4d4d] leading-snug">{ev.title}</p>
                          <p className="text-[11px] text-red-500/60 mt-1 flex items-center gap-1.5 pt-0.5 overflow-hidden">
                              <span className="shrink-0">Era para {ev.time}</span> <span className="shrink-0">•</span> <span className="truncate flex-1 text-zinc-400 max-w-[100px]">{ev.caseName}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                    {calendarEvents.atrasados.length === 0 && <p className="text-xs text-zinc-500">Parabéns! Nenhum prazo em atraso.</p>}
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* ── ROW 3: PRAZOS URGENTES ─────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="rounded-2xl border border-[#cca77b]/35 bg-[#100c09] overflow-hidden p-7 shadow-lg relative min-h-[220px]">
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#cca77b]/5 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
          
          <div className="flex items-center justify-between mb-6 relative z-10 border-b border-white/5 pb-4">
            <h2 className="text-lg font-medium text-[#f5f5f5] flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[##cca77b] text-[#cca77b] animate-pulse" />
                Prazos Urgentes Globais
            </h2>
          </div>

          <div className="space-y-3 relative z-10">
              {urgentDeadlines.map((deadline) => (
                  <div key={deadline.id} className="flex items-center justify-between p-4 rounded-xl bg-[#1f1a16] border border-[#cca77b]/20 hover:border-[#cca77b]/50 transition-all group">
                      <div className="flex items-center gap-4">
                          <div className="w-1.5 h-8 bg-[#8b0000] rounded-full"></div>
                          <div>
                              <p className="text-[14px] font-medium text-zinc-200">{deadline.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#8b0000]/20 text-[#ff4d4d]">Prazo: {deadline.dueDate}</span>
                                  <span className="text-zinc-500 text-[12px] flex items-center gap-1">  •  Processo: <span className="text-zinc-400">{deadline.caseName}</span></span>
                              </div>
                          </div>
                      </div>
                      <a href={`/tenant/${tenantInfo.status}/processos/${deadline.caseId}`} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg bg-white/5 hover:bg-white/10 text-[#cca77b] hidden">
                          <ExternalLink className="w-4 h-4" />
                      </a>
                      {/* Temporary hidden link. Using a proper proxy aware link for now */}
                      <a href={`./processos/${deadline.caseId}`} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg bg-white/5 hover:bg-white/10 text-[#cca77b]">
                          <ExternalLink className="w-4 h-4" />
                      </a>
                  </div>
              ))}
              {urgentDeadlines.length === 0 && (
                  <div className="text-center py-6 text-zinc-500 text-[13px] border border-dashed border-white/10 rounded-xl">
                      Excelente! Você não possui nenhum prazo marcado como Urgente no momento.
                  </div>
              )}
          </div>
        </div>
      </div>

    </div>
  );
}
