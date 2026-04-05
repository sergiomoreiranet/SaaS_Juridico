"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Escritorio {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

function getPortSuffix() {
  // Preserva a porta em desenvolvimento (ex: :3000)
  if (typeof window === "undefined") return "";
  const port = window.location.port;
  return port && port !== "80" && port !== "443" ? `:${port}` : "";
}

function buildLoginUrl(slug: string) {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname; // ex: localhost
  const port = getPortSuffix();
  // ex: http://suelipinheiro.localhost:3000/login
  return `${protocol}//${slug}.${hostname}${port}/login`;
}

export default function EscritorioSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Escritorio[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [notFound, setNotFound] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Busca com debounce de 300ms
  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      setNotFound(false);
      return;
    }
    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/escritorios/search?q=${encodeURIComponent(q)}`);
        const data: Escritorio[] = await res.json();
        setResults(data);
        setNotFound(data.length === 0);
        setIsOpen(true);
        setActiveIndex(-1);
      } catch {
        setResults([]);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuery(v);
    search(v);
  }

  function handleSelect(escritorio: Escritorio) {
    window.location.href = buildLoginUrl(escritorio.slug);
  }

  // Navegação por teclado
  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const planLabel: Record<string, string> = {
    basico: "Básico",
    pro: "Pro",
    elite: "Elite",
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md mx-auto">
      {/* Input de busca */}
      <div
        className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border transition-all"
        style={{
          background: "rgba(255,255,255,0.05)",
          borderColor: isOpen ? "rgba(139,0,0,0.6)" : "rgba(255,255,255,0.12)",
          boxShadow: isOpen ? "0 0 20px rgba(139,0,0,0.15)" : "none",
        }}
      >
        {/* Ícone */}
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "1.1rem", flexShrink: 0 }}>🔍</span>

        <input
          ref={inputRef}
          id="office-search"
          type="text"
          autoComplete="off"
          placeholder="Digite o nome do seu escritório..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/30"
          aria-label="Buscar escritório"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          role="combobox"
        />

        {/* Spinner ou limpar */}
        {isLoading && (
          <svg className="animate-spin h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24"
            style={{ color: "rgba(212,175,55,0.6)" }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {!isLoading && query.length > 0 && (
          <button
            onClick={() => { setQuery(""); setResults([]); setIsOpen(false); inputRef.current?.focus(); }}
            className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0 text-sm"
            aria-label="Limpar busca"
          >✕</button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-xl border overflow-hidden z-50"
          style={{
            background: "rgba(14,14,14,0.98)",
            borderColor: "rgba(255,255,255,0.1)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            backdropFilter: "blur(12px)",
          }}
          role="listbox"
        >
          {/* Lista de resultados */}
          {results.length > 0 && (
            <ul className="py-1">
              {results.map((escritorio, i) => (
                <li key={escritorio.id} role="option" aria-selected={i === activeIndex}>
                  <button
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => handleSelect(escritorio)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors"
                    style={{
                      background: i === activeIndex ? "rgba(139,0,0,0.2)" : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar inicial */}
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: "rgba(139,0,0,0.25)", color: "#d4af37" }}
                      >
                        {escritorio.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{escritorio.name}</p>
                        <p className="text-xs text-white/35 truncate">{escritorio.slug}.juriadm.com.br</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: "rgba(212,175,55,0.1)", color: "#d4af37" }}
                      >
                        {planLabel[escritorio.plan] ?? escritorio.plan}
                      </span>
                      <span className="text-white/30 text-xs">→</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Não encontrado */}
          {notFound && (
            <div className="px-4 py-5 text-center">
              <p className="text-sm text-white/50 mb-1">Nenhum escritório encontrado para</p>
              <p className="text-sm font-medium text-white/70">&ldquo;{query}&rdquo;</p>
              <p className="text-xs text-white/30 mt-3">
                Seu escritório ainda não está cadastrado?{" "}
                <a href="/cadastro" className="underline hover:text-white/60 transition-colors" style={{ color: "#d4af37" }}>
                  Solicite acesso
                </a>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hint abaixo do input */}
      {!isOpen && query.length === 0 && (
        <p className="text-center text-xs mt-2" style={{ color: "rgba(255,255,255,0.25)" }}>
          Busque pelo nome do seu escritório para acessar o sistema
        </p>
      )}
    </div>
  );
}
