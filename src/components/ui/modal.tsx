"use client";

import * as React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, description, children, className = "max-w-lg" }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      {/* Dialog Frame */}
      <div className={`relative z-50 w-full origin-center max-h-[90vh] overflow-y-auto scale-100 rounded-xl border border-white/10 bg-juridico-plate/90 backdrop-blur-2xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.8),0_0_15px_rgba(212,175,55,0.05)] transition-all duration-200 animate-in fade-in zoom-in-95 custom-scrollbar flex flex-col ${className}`}>
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 className="text-lg font-semibold leading-tight tracking-tight text-white">{title}</h2>
          {description && <p className="text-sm text-zinc-400">{description}</p>}
        </div>
        
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md opacity-70 transition-opacity hover:opacity-100 focus:outline-none bg-white/5 hover:bg-white/10 p-1.5"
        >
          <X className="h-4 w-4 text-zinc-400" />
          <span className="sr-only">Fechar</span>
        </button>
        
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
