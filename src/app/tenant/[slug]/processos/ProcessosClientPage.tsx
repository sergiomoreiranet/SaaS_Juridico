"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Search, Scale, FileText, Trash2, Edit, X, Ban, CheckCircle2, Building2, CalendarDays, ExternalLink } from "lucide-react";
import Link from "next/link";
import { createCase, updateCase, toggleCaseStatus } from "@/app/actions/processos";

const schema = z.object({
  title: z.string().min(3, "Título é obrigatório (mínimo 3 letras)."),
  clientId: z.string().min(1, "Selecione um cliente."),
  cnjNumber: z.string().optional(),
  controlNumber: z.string().optional(),
  tr: z.string().optional(),
  origin: z.string().optional(),
  processClass: z.string().optional(),
  processType: z.string().optional(),
  courtId: z.string().optional(),
  forum: z.string().optional(),
  courtDepartmentId: z.string().optional(),
  subject: z.string().optional(),
  estimatedValue: z.string().optional(),
  movementDate: z.string().optional(),
  startDate: z.string().optional(),
  distributionDate: z.string().optional(),
  expectedConclusionDate: z.string().optional(),
  status: z.enum(["ativo", "pendente", "fechado"]).optional(),
  coClients: z.array(z.object({
    clientId: z.string().min(1, "Selecione o participante"),
    type: z.string().min(1, "Selecione o tipo"),
  })).optional(),
});
type FormData = z.infer<typeof schema>;

const inputClass = "bg-juridico-plate/50 border-white/10 text-white focus-visible:ring-juridico-gold";
const selectClass = "flex h-10 w-full rounded-md border border-white/10 bg-juridico-plate/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-juridico-gold appearance-none";

type Court = { id: string; name: string; abbreviation: string | null; state: string | null; type: string | null; code: string | null };

export default function ProcessosClientPage({
  initialCases,
  clientsList,
  courtsList,
  slug,
}: {
  initialCases: any[];
  clientsList: any[];
  courtsList: Court[];
  slug: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ativos" | "fechados" | "todos">("ativos");
  const [isSaving, setIsSaving] = useState(false);
  const [editingCase, setEditingCase] = useState<any | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue, control } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: "ativo", coClients: [] },
  });

  const { fields: coClientsFields, append: appendCoClient, remove: removeCoClient } = useFieldArray({
    control,
    name: "coClients"
  });

  const selectedCourtId = watch("courtId");

  // Auto-preenche o campo TR com o código do tribunal selecionado
  useEffect(() => {
    if (!selectedCourtId) return;
    const court = courtsList.find((c) => c.id === selectedCourtId);
    if (court?.code) {
      setValue("tr", court.code);
    }
  }, [selectedCourtId]);

  const onSubmit = async (data: FormData) => {
    setIsSaving(true);
    let res;
    if (editingCase) {
      res = await updateCase(editingCase.id, data);
    } else {
      res = await createCase(data);
    }
    setIsSaving(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(editingCase ? "Processo atualizado!" : "Processo registrado!");
      reset();
      setIsModalOpen(false);
      setEditingCase(null);
    }
  };

  const handleEdit = (caso: any) => {
    setEditingCase(caso);
    reset({
      title: caso.title || "",
      clientId: caso.clientId || "",
      cnjNumber: caso.cnjNumber || "",
      controlNumber: caso.controlNumber || "",
      tr: caso.tr || "",
      origin: caso.origin || "",
      processClass: caso.processClass || "",
      processType: caso.processType || "",
      courtId: caso.courtId || "",
      forum: caso.forum || "",
      courtDepartmentId: caso.courtDepartmentName || "",
      subject: caso.subject || "",
      estimatedValue: caso.estimatedValue || "",
      movementDate: caso.movementDate || "",
      startDate: caso.startDate || "",
      distributionDate: caso.distributionDate || "",
      expectedConclusionDate: caso.expectedConclusionDate || "",
      status: caso.status || "ativo",
      coClients: caso.coClients || [],
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (caso: any) => {
    const action = caso.status === "ativo" ? "arquivar" : "reativar";
    if (confirm(`Deseja ${action} o processo ${caso.title}?`)) {
      const res = await toggleCaseStatus(caso.id, caso.status);
      if (res.error) toast.error(res.error);
      else toast.success(`Processo ${action} com sucesso!`);
    }
  };

  const filtered = initialCases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.cnjNumber?.includes(search) ||
      c.clientName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "todos" ? true : statusFilter === "ativos" ? c.status !== "fechado" : c.status === "fechado";
    return matchesSearch && matchesStatus;
  });

  const cardsAtivos = initialCases.filter((c) => c.status !== "fechado").length;
  const cardsFechados = initialCases.filter((c) => c.status === "fechado").length;

  // Agrupar tribunais por tipo para o optgroup
  const tipoLabels: Record<string, string> = {
    superior: "⚖️ Tribunais Superiores",
    federal: "🏛️ Tribunais Federais (TRF)",
    estadual: "📋 Tribunais Estaduais (TJ)",
    trabalho: "👷 Justiça do Trabalho (TRT)",
    eleitoral: "🗳️ Justiça Eleitoral (TRE)",
    militar: "🎖️ Justiça Militar",
  };
  const groupedCourts = courtsList.reduce((acc, c) => {
    const tipo = c.type || "outros";
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(c);
    return acc;
  }, {} as Record<string, Court[]>);
  const tipoOrder = ["superior", "federal", "estadual", "trabalho", "eleitoral", "militar"];

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Processos</h1>
          <p className="text-sm text-zinc-400">Gerencie todos os pleitos, contenciosos e demandas do escritório.</p>
        </div>
        <Button
          onClick={() => { setEditingCase(null); reset(); setIsModalOpen(true); }}
          className="w-full sm:w-auto gap-2 bg-juridico-brand hover:bg-juridico-brandlight text-white shadow-[0_0_15px_rgba(139,0,0,0.3)] border border-juridico-brandlight/50"
        >
          <Plus className="w-4 h-4" /> Novo Processo
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="flex gap-4">
        <div className="flex-1 rounded-xl bg-juridico-plate/30 border border-white/5 p-4 flex flex-col justify-center">
          <span className="text-sm text-zinc-400">Processos Em Andamento</span>
          <span className="text-3xl font-bold text-white">{cardsAtivos}</span>
        </div>
        <div className="flex-1 rounded-xl bg-juridico-plate/30 border border-white/5 p-4 flex flex-col justify-center">
          <span className="text-sm text-zinc-400">Processos Fechados</span>
          <span className="text-3xl font-bold text-juridico-gold">{cardsFechados}</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mt-4">
        <div className="flex items-center gap-2 w-full max-w-sm relative">
          <Search className="w-4 h-4 absolute left-3 text-zinc-400" />
          <Input
            placeholder="Buscar por título, CNJ ou cliente..."
            className="pl-9 bg-juridico-plate/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-juridico-gold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto self-start sm:self-auto bg-juridico-plate/50 p-1 rounded-md border border-white/5">
          <button onClick={() => setStatusFilter("ativos")} className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${statusFilter === "ativos" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"}`}>Ativos/Pendentes</button>
          <button onClick={() => setStatusFilter("fechados")} className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${statusFilter === "fechados" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"}`}>Arquivados</button>
          <button onClick={() => setStatusFilter("todos")} className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${statusFilter === "todos" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"}`}>Todos</button>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-hidden bg-[#111111] rounded-xl border border-white/5">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-zinc-500">Título / CNJ</TableHead>
              <TableHead className="text-zinc-500">Cliente</TableHead>
              <TableHead className="text-zinc-500">Tribunal</TableHead>
              <TableHead className="text-zinc-500">Status</TableHead>
              <TableHead className="text-zinc-500">Abertura</TableHead>
              <TableHead className="text-zinc-500 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                  Nenhum processo cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((caso) => (
                <TableRow key={caso.id} className={`border-white/5 hover:bg-white/[0.02] ${caso.status === "fechado" && "opacity-50 grayscale"}`}>
                  <TableCell className="font-medium text-white">
                    <div className="flex flex-col">
                      <span className="font-semibold text-[15px]">{caso.title}</span>
                      <span className="text-xs text-zinc-500">{caso.cnjNumber || "Sem número CNJ"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-300">{caso.clientName || "—"}</TableCell>
                  <TableCell>
                    {caso.courtName ? (
                      <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-mono">
                        {caso.courtName}
                      </span>
                    ) : (
                      <span className="text-zinc-600 text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`text-[11px] uppercase tracking-wider px-2 py-0.5 rounded border ${
                      caso.status === "ativo" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                      caso.status === "pendente" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                      "bg-zinc-800 text-zinc-400 border-zinc-700"
                    }`}>
                      {caso.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-zinc-500 text-sm">
                    {new Date(caso.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/processos/${caso.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-400 hover:text-juridico-gold" title="Visualizar Dossiê">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-400 hover:text-white" onClick={() => handleEdit(caso)} title="Editar Processo">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      className={`h-8 w-8 p-0 ${caso.status !== "fechado" ? "text-zinc-500 hover:text-red-400 hover:bg-red-500/10" : "text-zinc-500 hover:text-green-400 hover:bg-green-500/10"}`}
                      onClick={() => handleToggleStatus(caso)}
                      title={caso.status !== "fechado" ? "Arquivar Processo" : "Reativar Processo"}
                    >
                      {caso.status !== "fechado" ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Cadastro/Edição */}
      <Modal isOpen={isModalOpen} onClose={() => !isSaving && setIsModalOpen(false)} title={editingCase ? "Editar Processo" : "Abertura de Processo"} className="max-w-2xl p-0 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2 pb-4 h-full">
            <div className="space-y-5">

              {/* Seção 1: Informações Principais */}
              <div className="bg-[#111111] p-4 rounded-xl border border-white/5 space-y-4">
                <h3 className="text-[#3b82f6] border-b border-white/10 pb-2 flex items-center gap-2 font-medium">
                  <Scale className="w-5 h-5" /> Informações Principais
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="title" className="text-zinc-400">Título Interno <span className="text-juridico-brandlight">*</span></Label>
                    <Input id="title" {...register("title")} onChange={(e) => { e.target.value = e.target.value.toUpperCase(); register("title").onChange(e); }} className={inputClass} placeholder="Ex: AÇÃO INDENIZATÓRIA - MARIA" />
                    {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="clientId" className="text-zinc-400">Cliente Associado <span className="text-juridico-brandlight">*</span></Label>
                    <select id="clientId" {...register("clientId")} className={selectClass}>
                      <option value="">Selecione na sua base...</option>
                      {clientsList.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {errors.clientId && <p className="text-xs text-red-500">{errors.clientId.message}</p>}
                  </div>
                </div>

                {/* Bloco de Participantes Adicionais / Herdeiros */}
                <div className="space-y-3 pt-4 border-t border-white/5 mt-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-zinc-400 font-medium">Participantes Adicionais / Herdeiros</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendCoClient({ clientId: "", type: "Herdeiro" })} className="bg-juridico-plate/30 border-white/10 text-xs h-7 text-zinc-300 hover:text-white">
                      <Plus className="w-3 h-3 mr-1" /> Adicionar Participante
                    </Button>
                  </div>
                  {coClientsFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-center bg-black/20 p-2 rounded border border-white/5 animate-in fade-in">
                      <div className="flex-1">
                        <select {...register(`coClients.${index}.clientId`)} className={selectClass}>
                          <option value="">Selecione na sua base...</option>
                          {clientsList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        {errors.coClients?.[index]?.clientId && <p className="text-xs text-red-500">{errors.coClients[index].clientId.message}</p>}
                      </div>
                      <div className="w-1/3">
                        <select {...register(`coClients.${index}.type`)} className={selectClass}>
                          <option value="Herdeiro">Herdeiro</option>
                          <option value="Litisconsorte">Litisconsorte</option>
                          <option value="Representante Legal">Representante</option>
                          <option value="Cônjuge">Cônjuge</option>
                          <option value="Sócio">Sócio</option>
                          <option value="Terceiro Interessado">Terceiro</option>
                        </select>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeCoClient(index)} className="h-10 w-10 p-0 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 shrink-0 border border-white/5 rounded-md bg-juridico-plate/30">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="cnjNumber" className="text-zinc-400">Número CNJ</Label>
                    <Input 
                      id="cnjNumber" 
                      {...register("cnjNumber")} 
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, "");
                        if (v.length > 13) v = v.substring(0, 13);
                        v = v
                          .replace(/^(\d{7})(\d)/, "$1-$2")
                          .replace(/^(\d{7}-\d{2})(\d)/, "$1.$2");
                        e.target.value = v;
                        register("cnjNumber").onChange(e);
                      }}
                      className={inputClass} 
                      placeholder="0000000-00.0000" 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="controlNumber" className="text-zinc-400">Número de Controle</Label>
                    <Input id="controlNumber" {...register("controlNumber")} className={inputClass} placeholder="Ex: 2015/003519" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="status" className="text-zinc-400">Status Atual</Label>
                    <select id="status" {...register("status")} className={selectClass}>
                      <option value="ativo">Ativo</option>
                      <option value="pendente">Pendente</option>
                      <option value="fechado">Fechado / Arquivado</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Seção 2: Órgão Julgador */}
              <div className="bg-[#111111] p-4 rounded-xl border border-white/5 space-y-4">
                <h3 className="text-juridico-gold border-b border-white/10 pb-2 flex items-center gap-2 font-medium">
                  <Building2 className="w-5 h-5" /> Órgão Julgador e Classificação
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="courtId" className="text-zinc-400">Tribunal</Label>
                    <select id="courtId" {...register("courtId")} className={selectClass}>
                      <option value="">— Selecione o Tribunal —</option>
                      {tipoOrder.map((tipo) =>
                        groupedCourts[tipo] ? (
                          <optgroup key={tipo} label={tipoLabels[tipo] || tipo}>
                            {groupedCourts[tipo].map((court) => (
                              <option key={court.id} value={court.id}>
                                {court.abbreviation} — {court.name} ({court.state})
                              </option>
                            ))}
                          </optgroup>
                        ) : null
                      )}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="processClass" className="text-zinc-400">Classe</Label>
                    <Input id="processClass" {...register("processClass")} onChange={(e) => { e.target.value = e.target.value.toUpperCase(); register("processClass").onChange(e); }} className={inputClass} placeholder="Ex: CUMPRIMENTO DE SENTENÇA" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="processType" className="text-zinc-400">Tipo / Categoria</Label>
                    <Input id="processType" {...register("processType")} onChange={(e) => { e.target.value = e.target.value.toUpperCase(); register("processType").onChange(e); }} className={inputClass} placeholder="Ex: BANCO DO BRASIL" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="origin" className="text-zinc-400">Origem</Label>
                    <Input id="origin" {...register("origin")} onChange={(e) => { e.target.value = e.target.value.toUpperCase(); register("origin").onChange(e); }} className={inputClass} placeholder="Ex: 0695" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="tr" className="text-zinc-400">TR (Código do Tribunal)</Label>
                    <Input id="tr" {...register("tr")} onChange={(e) => { e.target.value = e.target.value.toUpperCase(); register("tr").onChange(e); }} className={inputClass} placeholder="Ex: 8.26" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="forum" className="text-zinc-400">Foro</Label>
                    <Input id="forum" {...register("forum")} onChange={(e) => { e.target.value = e.target.value.toUpperCase(); register("forum").onChange(e); }} className={inputClass} placeholder="Ex: FORO CENTRAL CÍVEL" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="courtDepartmentId" className="text-zinc-400">Vara</Label>
                    <Input id="courtDepartmentId" {...register("courtDepartmentId")} onChange={(e) => { e.target.value = e.target.value.toUpperCase(); register("courtDepartmentId").onChange(e); }} className={inputClass} placeholder="Ex: 3ª VARA CÍVEL" />
                  </div>
                </div>
              </div>

              {/* Seção 3: Assunto e Valores */}
              <div className="bg-[#111111] p-4 rounded-xl border border-white/5 space-y-4">
                <h3 className="text-green-500 border-b border-white/10 pb-2 flex items-center gap-2 font-medium">
                  <FileText className="w-5 h-5" /> Assunto e Valores Estratégicos
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="subject" className="text-zinc-400">Assunto Principal</Label>
                    <Input id="subject" {...register("subject")} onChange={(e) => { e.target.value = e.target.value.toUpperCase(); register("subject").onChange(e); }} className={inputClass} placeholder="Ex: VALOR DA EXECUÇÃO / CÁLCULO" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="estimatedValue" className="text-zinc-400">Valor Estimado (R$)</Label>
                    <Input 
                      id="estimatedValue" 
                      {...register("estimatedValue")} 
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, "");
                        if (v.length === 0) { e.target.value = ""; } else {
                          v = (parseInt(v, 10) / 100).toFixed(2).replace(".", ",");
                          v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
                          e.target.value = v;
                        }
                        register("estimatedValue").onChange(e);
                      }}
                      className={inputClass} 
                      placeholder="Ex: 49.470,81" 
                    />
                  </div>
                </div>
              </div>

              {/* Seção 4: Datas */}
              <div className="bg-[#111111] p-4 rounded-xl border border-white/5 space-y-4">
                <h3 className="text-orange-400 border-b border-white/10 pb-2 flex items-center gap-2 font-medium">
                  <CalendarDays className="w-5 h-5" /> Controle de Prazos e Datas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="distributionDate" className="text-zinc-400">Distribuição</Label>
                    <Input type="date" id="distributionDate" {...register("distributionDate")} className={inputClass} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="startDate" className="text-zinc-400">Início</Label>
                    <Input type="date" id="startDate" {...register("startDate")} className={inputClass} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="movementDate" className="text-zinc-400">Movimentação</Label>
                    <Input type="date" id="movementDate" {...register("movementDate")} className={inputClass} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="expectedConclusionDate" className="text-zinc-400">Prev. Conclusão</Label>
                    <Input type="date" id="expectedConclusionDate" {...register("expectedConclusionDate")} className={inputClass} />
                  </div>
                </div>
              </div>

            </div>

            <div className="sticky bottom-0 bg-[#0a0a0a]/95 backdrop-blur border-t border-white/10 py-4 mt-6 -mx-6 px-6 flex justify-between gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-10">
              <Button type="button" variant="ghost" className="bg-[#1a1a1a] text-zinc-300 hover:text-white hover:bg-[#222]" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
                <X className="w-4 h-4 mr-2" /> Cancelar
              </Button>
              <Button type="submit" isLoading={isSaving} disabled={isSaving} className="bg-juridico-brand hover:bg-juridico-brandlight text-white shadow-[0_0_15px_rgba(139,0,0,0.3)] border border-juridico-brandlight/50">
                {editingCase ? "Salvar Atualizações" : "Registrar Novo Processo"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
