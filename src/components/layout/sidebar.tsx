"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { handleSignOut } from "@/actions/auth-actions";
import { Scale, LayoutDashboard, Briefcase, CalendarClock, Users, Settings, LogOut, Shield, TrendingUp } from "lucide-react";

const navMain = [
  { href: "/",             label: "Dashboard",     icon: LayoutDashboard },
  { href: "/processos",        label: "Processos",         icon: Briefcase       },
  { href: "/clientes",     label: "Clientes",      icon: Users           },
  { href: "/prazos",       label: "Agenda",        icon: CalendarClock   },
  { href: "/documentos",   label: "Documentos",    icon: Shield          },
  { href: "/faturamento",  label: "Faturamento",   icon: TrendingUp      },
  { href: "/analytics",    label: "Relatórios",    icon: TrendingUp      },
];

const navSettings = [
  { href: "/perfil",        label: "Meu Perfil",    icon: Users },
  { href: "/equipe",        label: "Equipe",        icon: Shield },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

function NavItem({ href, label, icon: Icon }: { href: string; label: string; icon: any }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 group
        ${isActive
          ? "bg-gradient-to-r from-[#cca77b]/35 to-transparent text-[#cca77b]"
          : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03] border border-transparent"
        }`}
    >
      <Icon className={`h-[18px] w-[18px] shrink-0 transition-colors ${isActive ? "text-[#cca77b]" : "text-zinc-600 group-hover:text-zinc-400"}`} />
      <span className="mt-0.5 tracking-wide">{label}</span>
      
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="w-[240px] border-r border-white/5 bg-[#111111] hidden md:flex flex-col h-screen shrink-0 font-sans">
      
      {/* Logo */}
      <div className="flex flex-col items-center py-10 px-4">
        <div className="w-12 h-12 rounded-full border border-[#cca77b]/40 flex items-center justify-center mb-4 bg-gradient-to-br from-[#cca77b]/10 to-transparent">
          <Scale className="w-5 h-5 text-[#cca77b]" strokeWidth={1.5} />
        </div>
        <span className="text-[13px] font-medium tracking-[0.2em] text-[#e5e5e5] uppercase font-serif">SaaS Jurídico</span>
      </div>

      {/* Nav Principal */}
      <nav className="flex-1 overflow-y-auto py-2 px-4 flex flex-col gap-1 custom-scrollbar">
        {navMain.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
        
        {/* Separator */}
        <div className="h-px bg-white/5 my-4 mx-2" />

        <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest px-4 mb-2">Configurações</p>
        {navSettings.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/5">
        <form action={handleSignOut}>
          <button
            type="submit"
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            <span className="tracking-wide">Sair do Sistema</span>
          </button>
        </form>
      </div>
    </aside>
  );
}

