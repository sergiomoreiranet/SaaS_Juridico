import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#0a0a0a", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="text-center max-w-sm">
        <p className="text-7xl font-bold mb-4" style={{ color: "#8b0000" }}>403</p>
        <h1 className="text-2xl font-bold text-white mb-3">Acesso Negado</h1>
        <p className="text-white/40 mb-8 text-sm leading-relaxed">
          Você não tem permissão para acessar esta área.<br />
          Esta página é restrita ao administrador do sistema.
        </p>
        <Link href="/" className="text-sm hover:underline" style={{ color: "#d4af37" }}>
          ← Voltar ao início
        </Link>
      </div>
    </div>
  );
}
