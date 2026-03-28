"use client";

import { useEffect } from "react";

/**
 * Error state padrão do sistema (Error Boundary Global do Next.js).
 * Intercepta qualquer quebra de frontend e fornece uma mensagem clara e um botão de Retry Action.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro silencioso para analytics (fase futura)
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-50">
      <div className="flex max-w-md flex-col items-center space-y-4 rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Algo deu errado!</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Não conseguimos processar esta ação. Verifique sua conexão ou tente novamente.
          </p>
        </div>
        <button
          onClick={() => reset()}
          className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
