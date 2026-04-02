import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Função utilitária global para mesclar classes do Tailwind de forma inteligente,
 * evitando conflitos (ex: p-4 juntando com p-2 o último ganha).
 * Extremamente útil nos componentes UI.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
