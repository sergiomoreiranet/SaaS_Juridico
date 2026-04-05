"use client";

import Link from "next/link";
import { LogOut, Clock } from "lucide-react";
import { signOut } from "next-auth/react";

export default function PendingPage() {
  async function handleSignOut() {
    // signOut do next-auth/react no cliente garante limpeza correta do cookie
    // e redireciona para /login no mesmo subdomínio
    await signOut({ redirect: true, callbackUrl: "/login" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a] font-sans antialiased text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #d4af37, transparent 70%)" }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <span className="text-3xl text-[#d4af37]">⚖</span>
            <span className="text-2xl font-bold">JuriADM</span>
          </Link>
          <div className="mx-auto bg-[#d4af37]/10 w-20 h-20 rounded-full flex items-center justify-center mb-6">
            <Clock className="w-10 h-10 text-[#d4af37]" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Escritório em Análise</h1>
          <p className="text-white/60 text-sm leading-relaxed mb-8 px-4">
            Sua solicitação está sendo cuidadosamente revisada pela nossa equipe de consultores. Em breve, você receberá um e-mail com a liberação do seu acesso de 15 dias gratuitos ao JuriADM.
          </p>

          <button
            onClick={handleSignOut}
            className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl font-medium text-white/80 hover:text-white transition-all bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sair desta conta
          </button>
        </div>
      </div>
    </div>
  );
}
