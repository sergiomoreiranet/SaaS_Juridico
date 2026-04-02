"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createActionType, createCourt } from "@/app/actions/configuracoes";

export default function ConfigClientPage({ actionTypes, courts, userRole }: { actionTypes: any[]; courts: any[]; userRole: string; }) {
  const [loadingAction, setLoadingAction] = useState(false);
  const [loadingCourt, setLoadingCourt] = useState(false);

  const [newActionType, setNewActionType] = useState("");
  
  const [courtData, setCourtData] = useState({ name: "", acronym: "", uf: "" });

  const handleCreateActionType = async () => {
    if (!newActionType) return;
    setLoadingAction(true);
    const res = await createActionType(newActionType);
    setLoadingAction(false);
    if (res?.error) toast.error(res.error);
    else {
      toast.success("Tipo de ação cadastrado.");
      setNewActionType("");
    }
  };

  const handleCreateCourt = async () => {
    if (!courtData.name) return;
    setLoadingCourt(true);
    const res = await createCourt(courtData.name, courtData.acronym, courtData.uf);
    setLoadingCourt(false);
    if (res?.error) toast.error(res.error);
    else {
      toast.success("Tribunal criado.");
      setCourtData({ name: "", acronym: "", uf: "" });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-sm text-zinc-400">Parâmetros do seu escritório e do sistema.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tipos de Ação */}
        <div className="bg-juridico-plate/40 backdrop-blur-md rounded-xl border border-white/5 p-6 shadow-[0_0_15px_rgba(212,175,55,0.02)] space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Tipos de Ação</h2>
            <p className="text-xs text-zinc-400">Defina tipos de causas que seu escritório atende.</p>
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label htmlFor="action_name" className="text-juridico-gold">Nome</Label>
              <Input id="action_name" value={newActionType} onChange={(e) => setNewActionType(e.target.value)} placeholder="Ex: Trabalhista, Cível..." className="bg-juridico-plate/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-juridico-gold" />
            </div>
            <Button onClick={handleCreateActionType} isLoading={loadingAction} disabled={!newActionType || loadingAction} className="bg-juridico-brand hover:bg-juridico-brandlight text-white shadow-[0_0_15px_rgba(139,0,0,0.3)] border border-juridico-brandlight/50">Adicionar</Button>
          </div>
          <div className="pt-4 flex min-h-[4rem] flex-wrap gap-2">
            {actionTypes.map((t) => (
              <span key={t.id} className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-white border border-white/10 hover:border-juridico-gold/50 hover:shadow-[0_0_10px_rgba(212,175,55,0.1)] transition-all cursor-default">
                {t.name}
              </span>
            ))}
            {actionTypes.length === 0 && <span className="text-sm text-zinc-500">Nenhum tipo cadastrado.</span>}
          </div>
        </div>

        {/* Tribunais */}
        <div className="bg-juridico-plate/40 backdrop-blur-md rounded-xl border border-white/5 p-6 shadow-[0_0_15px_rgba(212,175,55,0.02)] space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Tribunais Base</h2>
            <p className="text-xs text-zinc-400">Os tribunais onde você costuma atuar.</p>
          </div>
          
          {userRole === "admin" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 items-end">
              <div className="space-y-1 lg:col-span-1">
                <Label className="text-juridico-gold">Tribunal</Label>
                <Input value={courtData.name} onChange={(e) => setCourtData({...courtData, name: e.target.value})} placeholder="Ex: Tribunal de Justiça..." className="bg-juridico-plate/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-juridico-gold" />
              </div>
              <div className="space-y-1">
                <Label className="text-juridico-gold">Sigla</Label>
                <Input value={courtData.acronym} onChange={(e) => setCourtData({...courtData, acronym: e.target.value})} placeholder="Ex: TJSP" className="bg-juridico-plate/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-juridico-gold" />
              </div>
              <div className="space-y-1">
                <Label className="text-juridico-gold">UF</Label>
                <Input value={courtData.uf} onChange={(e) => setCourtData({...courtData, uf: e.target.value})} placeholder="Ex: SP" className="bg-juridico-plate/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-juridico-gold" />
              </div>
            </div>
          )}
          {userRole === "admin" && (
             <Button onClick={handleCreateCourt} className="w-full mt-2 bg-juridico-brand hover:bg-juridico-brandlight text-white shadow-[0_0_15px_rgba(139,0,0,0.3)] border border-juridico-brandlight/50" isLoading={loadingCourt} disabled={loadingCourt || !courtData.name}>Registrar Tribunal</Button>
          )}

          <div className="pt-4 h-40 overflow-y-auto w-full border border-white/5 bg-white/5 rounded-md p-2">
            {courts.map((court) => (
               <div key={court.id} className="text-sm text-zinc-300 py-1 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors flex items-center gap-2 px-2 rounded-sm cursor-default">
                 <span className="font-semibold w-12 text-juridico-gold">{court.acronym}</span>
                 <span>- {court.name} ({court.uf})</span>
               </div>
            ))}
            {courts.length === 0 && <span className="text-sm text-zinc-500 px-2">Nenhum tribunal registrado.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
