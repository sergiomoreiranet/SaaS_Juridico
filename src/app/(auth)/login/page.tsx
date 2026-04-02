"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("E-mail ou senha inválidos. Verifique suas credenciais.");
      } else {
        // Usa navegação HTTP completa para evitar RSC fetch em subdomínios
        window.location.href = "/";
      }
    } catch {
      setError("Erro interno. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#0a0a0a", fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* Glow de fundo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-8"
          style={{ background: "radial-gradient(circle, #8b0000, transparent 70%)" }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-2xl" style={{ color: "#d4af37" }}>⚖</span>
            <span className="text-xl font-bold text-white">JuriADM</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">Bem-vindo de volta</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            Acesse sua conta para continuar
          </p>
        </div>

        {/* Card do Form */}
        <div
          className="p-7 rounded-2xl border"
          style={{ background: "rgba(14,14,14,0.95)", borderColor: "rgba(255,255,255,0.07)" }}
        >
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all border"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderColor: "rgba(255,255,255,0.08)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#8b0000")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </div>

            {/* Senha */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  Senha
                </label>
                <a href="#" className="text-xs" style={{ color: "#d4af37", opacity: 0.7 }}>
                  Esqueceu a senha?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-xl text-sm text-white outline-none transition-all border"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#8b0000")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  {showPassword ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div
                className="p-3 rounded-xl text-sm border"
                style={{
                  background: "rgba(139,0,0,0.1)",
                  borderColor: "rgba(139,0,0,0.3)",
                  color: "#fca5a5",
                }}
              >
                {error}
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{
                background: "linear-gradient(135deg, #8b0000, #a31111)",
                boxShadow: "0 0 25px rgba(139,0,0,0.2)",
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Entrando...
                </span>
              ) : (
                "Entrar no Sistema"
              )}
            </button>
          </form>

          <p className="text-center text-xs mt-5" style={{ color: "rgba(255,255,255,0.25)" }}>
            Não tem conta?{" "}
            <Link href="/cadastro" className="hover:underline" style={{ color: "#d4af37", opacity: 0.8 }}>
              Solicitar acesso
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
