"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users, FileText, DollarSign, MoreHorizontal, ChevronRight, PlayCircle, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ── Mock Data ──────────────────────────────────────────────────────────────
const billingData = [
  { month: "Jan", horas: 10 },
  { month: "Fev", horas: 32 },
  { month: "Mar", horas: 25 },
  { month: "Abr", horas: 45 },
  { month: "Mai", horas: 40 },
  { month: "Jun", horas: 72 },
  { month: "Jul", horas: 55 },
  { month: "Ago", horas: 65 },
  { month: "Set", horas: 85 },
];

const recentCases = [
  { id: 1, name: "Caso Empresa A", client: "Washingham", status: "Ativo", due: "05/1/2024", lead: "Jone Wrighe" },
  { id: 2, name: "Fusão Internacional", client: "Lexington", status: "Pendente", due: "03/1/2024", lead: "Jonathan" },
  { id: 3, name: "Contrato XYZ", client: "Lexington", status: "Pendente", due: "05/1/2024", lead: "Jone Wrighe" },
  { id: 4, name: "Processo Trabalhista", client: "Washingham", status: "Fechado", due: "06/1/2024", lead: "Jone Mopis" },
  { id: 5, name: "Análise Tributária", client: "Lexington", status: "Fechado", due: "06/1/2024", lead: "Jonathan" },
];

const calendarEvents = {
  today: [
    { time: "10:00 - 2:00PM", title: "Compromisso agendado", color: "bg-[#cca77b]" },
    { time: "10:00 - 19:00", title: "Compromissos agendados", color: "bg-red-900" },
  ],
  tomorrow: [
    { time: "Sun. - 3:30 PM", title: "Compromisso agendado", color: "bg-zinc-600" },
  ],
};

const activityFeed = [
  { icon: <Users className="w-4 h-4 text-[#cca77b]" />, text: "Ações recentes de clientes", time: "Remember 1 days ago" },
  { icon: <FileText className="w-4 h-4 text-[#cca77b]" />, text: "Documentos enviados/assinados", time: "20 hours ago" },
  { icon: <AlertCircle className="w-4 h-4 text-[#8b0000]" />, text: "Verificação de documentos", time: "30 hours ago" },
  { icon: <FileText className="w-4 h-4 text-zinc-500" />, text: "Ações do sistema", time: "6 hours ago" },
];

// ── COMPONENTE PRINCIPAL ───────────────────────────────────────────────────
export function DashboardClientView({ totalClients }: { totalClients: number }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-[#f5f5f5] tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 rounded-xl bg-[#141414] border border-white/5 text-sm text-[#cca77b] hover:bg-[#1a1a1a] transition-all font-medium">
            Today
          </button>
          <button className="w-10 h-10 rounded-xl bg-[#141414] border border-white/5 flex items-center justify-center hover:bg-[#1a1a1a] transition-all">
            <ChevronRight className="w-4 h-4 text-[#cca77b]" />
          </button>
        </div>
      </div>

      {/* ── ROW 1: KPI CARDS ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-[#cca77b]/35 bg-[#121212] p-7 shadow-lg relative overflow-hidden group hover:border-[#cca77b]/50 transition-all cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-[#cca77b]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-[15px] font-medium text-zinc-300 mb-5 relative z-10 tracking-wide">Casos Ativos</p>
          <p className="text-[52px] font-medium text-[#cca77b] relative z-10 leading-none">184</p>
        </div>

        <div className="rounded-2xl border border-[#cca77b]/35 bg-[#121212] p-7 shadow-lg relative overflow-hidden group hover:border-[#cca77b]/50 transition-all cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-[#cca77b]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-[15px] font-medium text-zinc-300 mb-5 relative z-10 tracking-wide">Novos Clientes</p>
          <p className="text-[52px] font-medium text-[#cca77b] relative z-10 leading-none">21</p>
        </div>

        <div className="rounded-2xl border border-[#cca77b]/50 bg-gradient-to-br from-[#121212] to-[#1a1710] p-7 shadow-lg relative overflow-hidden group hover:border-[#cca77b]/70 transition-all cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-[#cca77b]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-[15px] font-medium text-zinc-300 mb-5 relative z-10 tracking-wide">Faturas Pendentes</p>
          <p className="text-[52px] font-medium text-[#cca77b] relative z-10 leading-none">R$ 415k</p>
        </div>
      </div>

      {/* ── ROW 2: TABELA + CALENDÁRIO ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Matters (2/3) */}
        <div className="lg:col-span-2 rounded-2xl border border-[#cca77b]/35 bg-[#121212] overflow-hidden flex flex-col shadow-lg relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#cca77b]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

          <div className="flex items-center justify-between px-7 py-6 relative z-10">
            <h2 className="text-lg font-medium text-[#f5f5f5]">Casos Recentes</h2>
            <button className="text-zinc-500 hover:text-[#cca77b] transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <div className="px-7 pb-2 grid grid-cols-5 text-[13px] text-zinc-400 font-medium mb-3 relative z-10">
            <span className="col-span-1">Nome do Caso</span>
            <span className="col-span-1">Cliente</span>
            <span className="col-span-1">Status</span>
            <span className="col-span-1">Prazo</span>
            <span className="col-span-1">Responsável</span>
          </div>
          <div className="flex-1 px-5 space-y-1 pb-4 relative z-10">
            {recentCases.map((c, i) => {
              const isActive = i === 1; // Highlight second item como na imagem
              return (
                <div
                  key={c.id}
                  className={`grid grid-cols-5 items-center px-4 py-3.5 rounded-[14px] transition-all cursor-pointer ${isActive
                    ? "bg-gradient-to-r from-[#cca77b]/30 via-[#cca77b]/5 to-transparent border border-[#cca77b]/35 shadow-[0_0_20px_rgba(212,175,55,0.05)]"
                    : "border border-transparent hover:bg-white/[0.03]"
                    }`}
                >
                  <span className={`col-span-1 text-[13px] ${isActive ? "text-[#f5f5f5]" : "text-zinc-300"}`}>{c.name}</span>
                  <span className={`col-span-1 text-[13px] ${isActive ? "text-zinc-300" : "text-zinc-400"}`}>{c.client}</span>
                  <span className="col-span-1 flex items-center gap-2 text-[13px] text-zinc-400">
                    {c.status === "Ativo" && <PlayCircle className="w-[14px] h-[14px] text-[#cca77b]" />}
                    {c.status === "Pendente" && <AlertCircle className="w-[14px] h-[14px] text-[#8b0000]" />}
                    {c.status === "Fechado" && <AlertCircle className="w-[14px] h-[14px] text-[#8b0000]" />}
                    <span className={c.status === "Ativo" ? "text-zinc-300" : "text-zinc-500"}>{c.status}</span>
                  </span>
                  <span className={`col-span-1 text-[13px] ${isActive ? "text-zinc-300" : "text-zinc-500"}`}>{c.due}</span>
                  <span className={`col-span-1 text-[13px] ${isActive ? "text-[#f5f5f5]" : "text-zinc-400"}`}>{c.lead}</span>
                </div>
              );
            })}
          </div>
          <div className="px-7 py-5 relative z-10">
            <button className="text-[13px] font-medium text-[#cca77b] hover:underline transition-all">
              Show more
            </button>
          </div>
        </div>

        {/* Calendar Overview (1/3) */}
        <div className="lg:col-span-1 rounded-2xl border border-[#cca77b]/35 bg-[#121212] overflow-hidden p-7 flex flex-col shadow-lg relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#cca77b]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

          <h2 className="text-lg font-medium text-[#f5f5f5] mb-1 relative z-10">Resumo da Agenda</h2>
          <p className="text-[13px] text-zinc-400 mb-8 relative z-10">Próximos compromissos de hoje</p>

          <div className="space-y-8 relative z-10 h-full">
            <div>
              <p className="text-[13px] font-medium text-zinc-300 mb-4">Hoje</p>
              <div className="space-y-3">
                {calendarEvents.today.map((ev, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-[#181818] border border-white/5 shadow-sm">
                    <div className={`w-0.5 rounded-full shrink-0 ${ev.color}`} />
                    <div>
                      <p className="text-[13px] font-medium text-[#f5f5f5]">{ev.title}</p>
                      <p className="text-[11px] text-zinc-500 mt-1">{ev.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[13px] font-medium text-zinc-300 mb-4">Amanhã</p>
              <div className="space-y-3">
                {calendarEvents.tomorrow.map((ev, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-[#181818] border border-white/5 shadow-sm">
                    <div className={`w-0.5 rounded-full shrink-0 ${ev.color}`} />
                    <div>
                      <p className="text-[13px] font-medium text-[#f5f5f5]">{ev.title}</p>
                      <p className="text-[11px] text-zinc-500 mt-1">{ev.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 3: GRÁFICO + FEED ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Monthly Billable Hours (2/3) */}
        <div className="lg:col-span-2 rounded-2xl border border-[#cca77b]/35 bg-[#121212] overflow-hidden p-7 shadow-lg relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#cca77b]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-lg font-medium text-[#f5f5f5]">Horas Faturáveis do Mês</h2>
            <button className="text-zinc-500 hover:text-[#cca77b] transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <div className="h-[220px] w-full relative z-10 ml-[-15px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={billingData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldGradChart" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#cca77b" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#cca77b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.02)" />
                <XAxis dataKey="month" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg bg-[#222] border border-white/10 px-3 py-1.5 shadow-xl flex flex-col items-center">
                          <p className="text-[10px] text-zinc-300 mb-0.5">Tilia data</p>
                          <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-[#cca77b]" />
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="horas"
                  stroke="#cca77b"
                  strokeWidth={2}
                  fill="url(#goldGradChart)"
                  activeDot={{ r: 6, fill: "#fff", stroke: "#cca77b", strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Client Activity Feed (1/3) */}
        <div className="lg:col-span-1 rounded-2xl border border-[#cca77b]/35 bg-[#121212] overflow-hidden p-7 shadow-lg relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#cca77b]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-lg font-medium text-[#f5f5f5]">Feed de Atividades</h2>
            <button className="text-zinc-500 hover:text-[#cca77b] transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-7 relative z-10">
            {activityFeed.map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#cca77b]/50 flex items-center justify-center shrink-0 shadow-inner">
                  {item.icon}
                </div>
                <div className="pt-0.5">
                  <p className="text-[13px] font-medium text-zinc-300 leading-snug">{item.text}</p>
                  <p className="text-[11px] text-zinc-500 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
