"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Scale, Briefcase, CalendarClock, Users, Shield, Settings, LogOut } from "lucide-react";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Botão Hambúrguer */}
      <button 
        onClick={() => setIsOpen(true)} 
        className="text-white border border-white/10 flex items-center justify-center h-10 w-10 rounded-md bg-juridico-plate hover:bg-white/5 transition-colors shadow-[0_0_10px_rgba(212,175,55,0.05)]"
      >
        <Menu className="h-5 w-5 text-juridico-gold" />
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md transition-opacity" onClick={() => setIsOpen(false)}>
          {/* Menu Lateral */}
          <div 
            className="fixed inset-y-0 left-0 w-72 bg-juridico-dark border-r border-white/10 shadow-2xl flex flex-col transition-transform animate-in slide-in-from-left duration-300" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-juridico-plate/30">
              <Link href="/" className="flex items-center gap-3 font-bold text-lg text-white" onClick={() => setIsOpen(false)}>
                <div className="bg-juridico-plate p-2 rounded-lg border border-white/10 shadow-[0_0_10px_rgba(212,175,55,0.15)]">
                  <Scale className="h-4 w-4 text-juridico-gold" />
                </div>
                <span>SaaS Jurídico</span>
              </Link>
              <button onClick={() => setIsOpen(false)} className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-white/10 text-zinc-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-white bg-white/5 border border-white/5 shadow-sm transition-colors hover:border-juridico-gold/30 hover:shadow-[0_0_10px_rgba(212,175,55,0.1)]">
                <Briefcase className="h-5 w-5 text-juridico-gold" /> Dashboard
              </Link>
              <Link href="/processos" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
                <Briefcase className="h-5 w-5" /> Processos
              </Link>
              <Link href="/prazos" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
                <CalendarClock className="h-5 w-5" /> Prazos
              </Link>
              <Link href="/clientes" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
                <Users className="h-5 w-5" /> Clientes
              </Link>
              <Link href="/equipe" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
                <Shield className="h-5 w-5" /> Equipe
              </Link>
              <Link href="/configuracoes" onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
                <Settings className="h-5 w-5" /> Configurações
              </Link>
            </nav>
            
            <div className="p-4 border-t border-white/5 mb-6 bg-juridico-plate/20">
              <form action="/api/auth/signout" method="POST">
                <button type="submit" className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-zinc-400 hover:bg-juridico-brand/20 hover:text-red-400 transition-colors border border-transparent hover:border-juridico-brand/30">
                  <LogOut className="h-5 w-5" /> Sair do Sistema
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
