import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";

/**
 * Layout "Chassi" da aplicação principal (Dashboard).
 * Engloba as barras laterais e superior, deixando a área central flexível para os conteúdos.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <div className="flex h-screen bg-[#0a0a0a] text-zinc-300 overflow-hidden relative font-sans">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
