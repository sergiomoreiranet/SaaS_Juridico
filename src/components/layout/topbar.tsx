import { Bell, Search, ChevronDown } from "lucide-react";
import { MobileNav } from "./mobile-nav";
import { auth } from "@/auth";

export async function Topbar() {
  const session = await auth();
  const user = session?.user as any;
  const initials = user?.name
    ? user.name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
    : "?";

  return (
    <header className="flex h-24 shrink-0 items-center justify-between bg-transparent px-8">
      {/* Busca */}
      <div className="flex items-center gap-4">
        <MobileNav />
        <div className="relative hidden md:flex items-center group">
          <Search className="absolute left-4 w-4 h-4 text-zinc-500 group-focus-within:text-[#cca77b] transition-colors" />
          <input
            type="text"
            placeholder="Buscar casos, clientes, documentos..."
            className="pl-11 pr-4 py-2.5 rounded-2xl bg-[#141414] border border-white/5 text-sm text-zinc-300 placeholder:text-zinc-600 outline-none focus:border-[#cca77b]/30 focus:bg-[#1a1a1a] transition-all w-96 shadow-sm"
          />
        </div>
      </div>

      {/* Perfil + Bell */}
      <div className="flex items-center gap-4">
        {/* Bell */}
        <button className="relative w-11 h-11 rounded-2xl bg-[#141414] border border-[#cca77b]/30 flex items-center justify-center hover:bg-[#1a1a1a] hover:border-[#cca77b]/50 transition-all shadow-[0_0_15px_rgba(212,175,55,0.05)]">
          <Bell className="w-[18px] h-[18px] text-[#cca77b]" />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-[#cca77b] border-2 border-[#141414]" />
        </button>

        {/* User pill */}
        <div className="flex items-center gap-3 rounded-full bg-[#141414] border border-[#cca77b]/30 pl-1.5 pr-4 py-1.5 hover:bg-[#1a1a1a] hover:border-[#cca77b]/50 transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.05)]">
          <div className="w-9 h-9 rounded-full bg-[#222] overflow-hidden flex items-center justify-center shrink-0 border border-[#cca77b]/20">
            {user?.image ? (
              <img src={user.image} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-[#cca77b]">{initials}</span>
            )}
          </div>
          <div className="hidden sm:flex flex-col">
            <p className="text-[13px] font-medium text-[#e5e5e5] leading-tight">{user?.name ?? "Jonathan Wright"}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5 capitalize">{user?.role ? `${user.role} | Perfil` : "Sócio | Perfil"}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-zinc-500 ml-1" />
        </div>
      </div>
    </header>
  );
}
