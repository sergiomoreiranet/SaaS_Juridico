"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, MapPin, Briefcase, FileText, Phone, Scale, CalendarIcon, Hash, Mail, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

type Cliente = any; // Will use 'any' for speed, could import schema type

export default function ClienteDashboard({ client, slug }: { client: Cliente, slug: string }) {
  const [activeTab, setActiveTab] = useState("dados");

  const initials = client.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

  const parsePhones = () => {
    if (!client.phones) return [];
    if (Array.isArray(client.phones)) return client.phones;
    if (typeof client.phones === "string") {
      try { return JSON.parse(client.phones); } catch { return []; }
    }
    return [];
  };
  const phoneList = parsePhones();

  const renderTabContent = () => {
    switch (activeTab) {
      case "dados":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Coluna Principal da Esquerda */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Card - Informações Pessoais */}
              <div className="bg-[#111111] border border-white/5 rounded-xl p-6 shadow-sm">
                <h3 className="text-[#3b82f6] font-semibold flex items-center gap-2 mb-4">
                  <User className="w-5 h-5" /> Informações Pessoais
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <span className="block text-xs text-zinc-500 mb-1">Nome Completo</span>
                    <span className="text-sm text-zinc-200 font-medium">{client.name}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-zinc-500 mb-1 leading-tight">{client.personType === "PJ" ? "CNPJ" : "CPF"}</span>
                    <span className="text-sm text-zinc-200">{client.cpfCnpj || "—"}</span>
                  </div>
                  {client.personType === "PF" && (
                    <>
                      <div>
                        <span className="block text-xs text-zinc-500 mb-1">RG</span>
                        <span className="text-sm text-zinc-200">{client.rgIe || "—"}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-zinc-500 mb-1">Data de Nascimento</span>
                        <span className="text-sm text-zinc-200">{client.birthDate ? new Date(client.birthDate + 'T12:00:00').toLocaleDateString('pt-BR') : "—"}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-zinc-500 mb-1">Estado Civil</span>
                        <span className="text-sm text-zinc-200">{client.maritalStatus || "—"}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-zinc-500 mb-1">Nacionalidade</span>
                        <span className="text-sm text-zinc-200">{client.nationality || "—"}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-zinc-500 mb-1">Profissão</span>
                        <span className="text-sm text-zinc-200">{client.profession || "—"}</span>
                      </div>
                    </>
                  )}
                  {client.personType === "PJ" && (
                    <div>
                      <span className="block text-xs text-zinc-500 mb-1">Inscrição Estadual</span>
                      <span className="text-sm text-zinc-200">{client.rgIe || "—"}</span>
                    </div>
                  )}
                  {client.oab && (
                    <div>
                      <span className="block text-xs text-zinc-500 mb-1">Número OAB</span>
                      <span className="text-sm text-zinc-200">{client.oab}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card - Endereço */}
              <div className="bg-[#111111] border border-white/5 rounded-xl p-6 shadow-sm">
                <h3 className="text-[#3b82f6] font-semibold flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5" /> Endereço Completo
                </h3>
                {client.cep || client.street ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <span className="block text-xs text-zinc-500 mb-1">Logradouro</span>
                      <span className="text-sm text-zinc-200">
                        {client.streetType ? `${client.streetType} ` : ""}{client.street || "—"}, {client.number || "S/N"}
                        {client.complement ? ` - ${client.complement}` : ""}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-zinc-500 mb-1">Bairro</span>
                      <span className="text-sm text-zinc-200">{client.neighborhood || "—"}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-zinc-500 mb-1">Cidade / UF</span>
                      <span className="text-sm text-zinc-200">{client.city || "—"} / {client.state || "—"}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-zinc-500 mb-1">CEP</span>
                      <span className="text-sm text-zinc-200">{client.cep || "—"}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500 italic">Nenhum endereço cadastrado para este cliente.</p>
                )}
              </div>

              {/* Card Observações */}
              <div className="bg-[#111111] border border-white/5 rounded-xl p-6 shadow-sm">
                <h3 className="text-[#eab308] font-semibold flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5" /> Observações e Indicações
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs text-zinc-500 mb-1">Como nos conheceu? (Indicação)</span>
                    <span className="text-sm text-zinc-200">{client.indication || "Nenhuma indicação registrada."}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-zinc-500 mb-1">Anotações Relevantes</span>
                    <p className="text-sm text-zinc-200 bg-black/20 p-3 rounded-md min-h-[60px] whitespace-pre-wrap">{client.observations || "Sem anotações."}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Coluna Lateral da Direita */}
            <div className="space-y-6">
              
              {/* Card - Contatos */}
              <div className="bg-[#111111] border border-white/5 rounded-xl p-6 shadow-sm">
                <h3 className="text-juridico-gold font-semibold flex items-center gap-2 mb-4">
                  <Phone className="w-5 h-5" /> Contatos
                </h3>
                
                <div className="space-y-4">
                  {client.email && (
                    <div className="flex items-start gap-3">
                      <div className="bg-white/5 p-2 rounded text-zinc-400 mt-0.5"><Mail className="w-3.5 h-3.5" /></div>
                      <div>
                        <span className="block text-xs text-zinc-500">E-mail</span>
                        <a href={`mailto:${client.email}`} className="text-sm text-blue-400 hover:underline">{client.email}</a>
                      </div>
                    </div>
                  )}

                  {phoneList.length > 0 ? phoneList.map((p: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="bg-white/5 p-2 rounded text-zinc-400 mt-0.5"><Phone className="w-3.5 h-3.5" /></div>
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider text-zinc-500">{p.type}</span>
                        <a href={`https://wa.me/55${p.number.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="text-sm text-green-400 hover:underline">
                          {p.number}
                        </a>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-zinc-500 italic">Nenhum telefone registrado.</p>
                  )}
                </div>
              </div>

              {/* Card - Resumo Relacional */}
              <div className="bg-[#111111] border border-white/5 rounded-xl p-6 shadow-sm">
                <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
                  <Hash className="w-5 h-5 text-zinc-400" /> Resumo do Sistema
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs text-zinc-500 mb-1">Data de Cadastro</span>
                    <span className="text-sm text-zinc-200">{new Date(client.createdAt).toLocaleDateString('pt-BR')} às {new Date(client.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-zinc-500 mb-1">Status na Plataforma</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${client.isActive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {client.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        );
      case "processos":
        return (
          <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/[0.01] animate-in fade-in zoom-in-95">
            <div className="text-center">
              <Scale className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-white mb-1">Processos do Cliente</h3>
              <p className="text-zinc-500 text-sm max-w-sm mx-auto">Em breve: Acompanhe aqui as movimentações processuais judiciais amarradas a este cliente.</p>
            </div>
          </div>
        );
      case "financeiro":
        return (
          <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/[0.01] animate-in fade-in zoom-in-95">
             <div className="text-center">
              <span className="text-4xl block mb-3">💰</span>
              <h3 className="text-lg font-medium text-white mb-1">Módulo Financeiro</h3>
              <p className="text-zinc-500 text-sm max-w-sm mx-auto">Em breve: Controle de Honorários, faturas e pagamentos atrelados a este cliente.</p>
            </div>
          </div>
        );
      case "documentos":
        return (
          <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/[0.01] animate-in fade-in zoom-in-95">
            <div className="text-center">
              <FileText className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-white mb-1">Cofre de Arquivos</h3>
              <p className="text-zinc-500 text-sm max-w-sm mx-auto">Em breve: Junte procurações, RGs e contratos assinados diretamente aqui.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Botão Voltar */}
      <Link href="/clientes" className="inline-flex items-center text-sm text-zinc-400 hover:text-juridico-gold transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Clientes
      </Link>

      {/* Header Ficha Premium */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-2xl relative overflow-hidden">
        {/* Glow Fundo */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-juridico-brandlight/20 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-zinc-800 flex items-center justify-center text-3xl font-bold text-juridico-gold shadow-inner border border-white/5 shrink-0">
          {initials}
        </div>
        
        <div className="flex-1 text-center sm:text-left space-y-3 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h1 className="text-3xl font-bold text-white tracking-tight">{client.name}</h1>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="bg-white/10 text-zinc-300 text-[10px] px-2 py-0.5 rounded uppercase font-semibold border border-white/10">{client.personType}</span>
              {!client.isActive && <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded uppercase font-semibold border border-red-500/30">Inativo</span>}
            </div>
          </div>
          <p className="text-zinc-400 max-w-2xl text-sm leading-relaxed">
            {client.profession ? `Profissão/Cargo: ${client.profession}` : "Nenhuma profissão registrada."} • Cadastrado em {new Date(client.createdAt).toLocaleDateString('pt-BR')}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2">
            {phoneList[0] && (
               <a href={`https://wa.me/55${phoneList[0].number.replace(/\D/g,'')}`} target="_blank" rel="noreferrer">
                 <Button variant="outline" size="sm" className="bg-[#25D366]/10 border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/20 hover:text-[#25D366]">
                    <Phone className="w-4 h-4 mr-2" /> Falar via WhatsApp
                 </Button>
               </a>
            )}
            {client.email && (
              <a href={`mailto:${client.email}`}>
                <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                  <Mail className="w-4 h-4 mr-2" /> Enviar E-mail
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="flex gap-1 border-b border-white/10 overflow-x-auto custom-scrollbar pb-px">
        <button 
          onClick={() => setActiveTab("dados")} 
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${activeTab === "dados" ? "border-juridico-gold text-white" : "border-transparent text-zinc-500 hover:text-white"}`}
        >
          Dados Cadastrais
        </button>
        <button 
          onClick={() => setActiveTab("processos")} 
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === "processos" ? "border-juridico-gold text-white" : "border-transparent text-zinc-500 hover:text-white"}`}
        >
          <Scale className="w-4 h-4" /> Processos
        </button>
        <button 
          onClick={() => setActiveTab("financeiro")} 
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${activeTab === "financeiro" ? "border-juridico-gold text-white" : "border-transparent text-zinc-500 hover:text-white"}`}
        >
          Financeiro
        </button>
        <button 
          onClick={() => setActiveTab("documentos")} 
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === "documentos" ? "border-juridico-gold text-white" : "border-transparent text-zinc-500 hover:text-white"}`}
        >
          <FileText className="w-4 h-4" /> Cofre / Arquivos
        </button>
      </div>

      {/* Conteúdo Renderizado da Aba */}
      <div className="pt-2">
        {renderTabContent()}
      </div>

    </div>
  );
}
