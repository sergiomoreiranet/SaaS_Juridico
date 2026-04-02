"use client";

import { useState } from "react";
import Link from "next/link";

type FormStep = "form" | "success";

// Converte qualquer texto para slug de subdomínio válido
// Ex: "ADV São Paulo" -> "adv-sao-paulo"
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")                      // separa letras dos acentos
    .replace(/[\u0300-\u036f]/g, "")        // remove os acentos
    .replace(/[^a-z0-9\s-]/g, "")          // remove caracteres especiais
    .trim()
    .replace(/\s+/g, "-")                   // espaços -> hífens
    .replace(/-+/g, "-");                   // remove hífens duplos
}

const plans = [
  { id: "basico", label: "Básico", price: "R$ 97/mês", desc: "1 usuário • até 50 processos" },
  { id: "pro", label: "Pro", price: "R$ 247/mês", desc: "5 usuários • processos ilimitados" },
  { id: "elite", label: "Elite", price: "R$ 497/mês", desc: "Usuários ilimitados • IA + CNJ" },
];

export default function CadastroPage() {
  const [step, setStep] = useState<FormStep>("form");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    nome: "",
    escritorio: "",
    oab: "",
    email: "",
    telefone: "",
    senha: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          escritorio: form.escritorio,
          oab: form.oab,
          email: form.email,
          telefone: form.telefone,
          senha: form.senha,
          plano: selectedPlan,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao enviar cadastro. Tente novamente.");
        return;
      }

      setStep("success");
    } catch {
      setError("Falha na conexão. Verifique sua internet e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#0a0a0a" }}>
        <div className="max-w-md w-full text-center p-10 rounded-2xl border" style={{ background: "rgba(20,20,20,0.9)", borderColor: "rgba(212,175,55,0.2)" }}>
          <div className="text-6xl mb-6">⚖️</div>
          <h1 className="text-2xl font-bold text-white mb-3">Solicitação Enviada!</h1>
          <p className="text-white/50 mb-8 leading-relaxed">
            Recebemos seu cadastro. Nossa equipe vai analisar os dados e liberar seu acesso em até <strong className="text-white">24 horas úteis</strong>. Você receberá um e-mail com o link de acesso.
          </p>
          <div className="p-4 rounded-xl border mb-8 text-left" style={{ background: "rgba(139,0,0,0.08)", borderColor: "rgba(139,0,0,0.2)" }}>
            <p className="text-sm text-white/60">
              <span style={{ color: "#d4af37" }}>✦</span> Fique de olho no seu e-mail <strong className="text-white">{form.email}</strong>
            </p>
          </div>
          <Link href="/" className="text-sm hover:underline" style={{ color: "#d4af37" }}>
            ← Voltar para o início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-16" style={{ background: "#0a0a0a", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #8b0000, transparent 70%)" }}></div>
      </div>

      <div className="relative z-10 max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <span className="text-2xl" style={{ color: "#d4af37" }}>⚖</span>
            <span className="text-xl font-bold text-white">JuriADM</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Solicitar Acesso</h1>
          <p className="text-white/40 text-sm">15 dias grátis • Sem cartão de crédito • Aprovação em 24h</p>
        </div>

        {/* Form Card */}
        <div className="p-8 rounded-2xl border" style={{ background: "rgba(14,14,14,0.95)", borderColor: "rgba(255,255,255,0.07)" }}>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Plano */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-3">
                Plano de interesse
              </label>
              <div className="grid grid-cols-3 gap-3">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlan(p.id)}
                    className="p-3 rounded-xl border text-left transition-all"
                    style={{
                      borderColor: selectedPlan === p.id ? "rgba(139,0,0,0.6)" : "rgba(255,255,255,0.07)",
                      background: selectedPlan === p.id ? "rgba(139,0,0,0.12)" : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <p className="text-sm font-semibold text-white">{p.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: selectedPlan === p.id ? "#d4af37" : "rgba(255,255,255,0.35)" }}>{p.price}</p>
                    <p className="text-xs text-white/30 mt-1 leading-tight">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Divisor */}
            <div className="border-t border-white/5"></div>

            {/* Nome */}
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-white/70 mb-1.5">
                Seu nome completo
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                required
                placeholder="Dr. Roberto Figueiredo"
                value={form.nome}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all placeholder:text-white/20 border focus:border-[#8b0000]"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
              />
            </div>

            {/* Escritório */}
            <div>
              <label htmlFor="escritorio" className="block text-sm font-medium text-white/70 mb-1.5">
                Nome do escritório
              </label>
              <input
                id="escritorio"
                name="escritorio"
                type="text"
                required
                placeholder="Figueiredo Advocacia"
                value={form.escritorio}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all placeholder:text-white/20 border focus:border-[#8b0000]"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
              />
                    <p className="text-xs text-white/25 mt-1.5">
              Seu subdomínio será: <span style={{ color: "#d4af37" }}>
                {form.escritorio ? `${generateSlug(form.escritorio)}.juriadm.com.br` : "nomeescritorio.juriadm.com.br"}
              </span>
            </p>
            </div>

            {/* OAB + Telefone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="oab" className="block text-sm font-medium text-white/70 mb-1.5">
                  Nº OAB
                </label>
                <input
                  id="oab"
                  name="oab"
                  type="text"
                  required
                  placeholder="SP 123456"
                  value={form.oab}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all placeholder:text-white/20 border focus:border-[#8b0000]"
                  style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
                />
              </div>
              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-white/70 mb-1.5">
                  WhatsApp
                </label>
                <input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  required
                  placeholder="(11) 99999-0000"
                  value={form.telefone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all placeholder:text-white/20 border focus:border-[#8b0000]"
                  style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1.5">
                E-mail profissional
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="roberto@figueiredo.adv.br"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all placeholder:text-white/20 border focus:border-[#8b0000]"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
              />
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-white/70 mb-1.5">
                Crie sua senha de acesso
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                required
                minLength={8}
                placeholder="Mínimo 8 caracteres"
                value={form.senha}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all placeholder:text-white/20 border focus:border-[#8b0000]"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
              />
            </div>

            {/* Mensagem de erro da API */}
            {error && (
              <div className="p-4 rounded-xl border text-sm" style={{ background: "rgba(139,0,0,0.1)", borderColor: "rgba(139,0,0,0.3)", color: "#fca5a5" }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ background: "linear-gradient(135deg, #8b0000, #a31111)", boxShadow: "0 0 30px rgba(139,0,0,0.25)" }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Enviando solicitação...
                </span>
              ) : (
                "Solicitar meus 15 dias grátis →"
              )}
            </button>
          </form>

          {/* Footer do form */}
          <p className="text-center text-xs text-white/25 mt-6">
            Já tem acesso?{" "}
            <Link href="/login" className="hover:underline" style={{ color: "#d4af37" }}>
              Fazer login
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-white/20 mt-6">
          Ao solicitar, você concorda com nossos Termos de Uso e Política de Privacidade.
        </p>
      </div>
    </div>
  );
}
