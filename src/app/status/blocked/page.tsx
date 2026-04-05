"use client";

import Link from "next/link";
import { LogOut, ShieldAlert } from "lucide-react";
import { signOut } from "next-auth/react";

export default function BlockedPage() {
  async function handleSignOut() {
    await signOut({ redirect: true, callbackUrl: "/login" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a] font-sans antialiased text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #8b0000, transparent 70%)" }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <span className="text-3xl text-[#d4af37]">⚖</span>
            <span className="text-2xl font-bold">JuriADM</span>
          </Link>
          <div className="mx-auto bg-[#8b0000]/20 w-20 h-20 rounded-full flex items-center justify-center mb-6 border border-[#8b0000]/30 shadow-[0_0_30px_rgba(139,0,0,0.3)]">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Acesso Suspenso</h1>
          <p className="text-white/60 text-sm leading-relaxed mb-8 px-4">
            Detectamos uma irregularidade ou inadimplência ligada a este escritório. O acesso de toda a equipe encontra-se temporariamente bloqueado. Contate nosso suporte corporativo para regularização.
          </p>

          <div className="space-y-3">
            <a
              href="mailto:suporte@juriadm.com.br"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-medium text-white transition-all bg-gradient-to-r from-[#8b0000] to-[#a31111] shadow-[0_0_20px_rgba(139,0,0,0.2)] hover:opacity-90"
            >
              Falar com o Suporte
            </a>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl font-medium text-white/60 hover:text-white transition-all bg-transparent hover:bg-white/5 border border-transparent hover:border-white/10 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sair desta conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
