import { Loader2 } from "lucide-react";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

/**
 * Loading state padrão do sistema.
 * Reutilizável em botões, telas de carregamento e tabelas vazias.
 */
export function Spinner({ size = 24, className, ...props }: SpinnerProps) {
  return (
    <div
      className={`flex items-center justify-center ${className || ""}`}
      {...props}
    >
      <Loader2 size={size} className="animate-spin text-zinc-500" />
    </div>
  );
}
