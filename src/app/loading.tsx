import { Spinner } from "@/components/ui/spinner";

/**
 * Loading root do App Router.
 * Enquanto o servidor busca dados do Supabase ou ORM e a página ainda
 * não foi desenhada, o Next.js suspende o render e mostra esta tela.
 */
export default function Loading() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-50/50">
      <Spinner size={32} className="mb-4 text-zinc-900" />
      <p className="text-sm font-medium text-zinc-500 blink-anim">
        Carregando ambiente...
      </p>
    </div>
  );
}
