"use client";

import { useState } from "react";
import { Activity, Folder, Landmark, CalendarDays, CheckCircle2, Clock, Plus, Trash2, User } from "lucide-react";
import { addBusinessDays } from "@/lib/business-days";
import { createDeadline, toggleDeadlineStatus, deleteDeadline, createTask, toggleTaskStatus, deleteTask } from "@/app/actions/deadlines-tasks";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Deadline = {
  id: string;
  description: string;
  dueDate: Date;
  isUrgent: boolean;
  isCompleted: boolean;
};

type Task = {
  id: string;
  description: string;
  dueDate: Date | null;
  isCompleted: boolean;
  assigneeName: string | null;
  assigneeId: string | null;
};

type TeamMember = {
  id: string;
  name: string;
  role: string;
};

export default function CaseTabsClientView({
  caseId,
  deadlines,
  tasks,
  teamMembers,
}: {
  caseId: string;
  deadlines: Deadline[];
  tasks: Task[];
  teamMembers: TeamMember[];
}) {
  const [activeTab, setActiveTab] = useState<"prazos" | "tarefas" | "documentos" | "honorarios">("prazos");

  // Prazos Modal
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [deadlineDesc, setDeadlineDesc] = useState("");
  const [deadlineType, setDeadlineType] = useState<"FIXO" | "DIAS">("FIXO");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineDays, setDeadlineDays] = useState("");
  const [deadlineUrgent, setDeadlineUrgent] = useState(false);
  const [isSavingDeadline, setIsSavingDeadline] = useState(false);

  // Tarefas Modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskDesc, setTaskDesc] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [isSavingTask, setIsSavingTask] = useState(false);

  const handleCreateDeadline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deadlineDesc) return toast.error("Descrição é obrigatória");
    
    let dueDate: Date;
    if (deadlineType === "FIXO") {
      if (!deadlineDate) return toast.error("Data é obrigatória");
      // Ajuste para evitar fuso horário cortando 1 dia
      dueDate = new Date(deadlineDate + "T12:00:00");
    } else {
      if (!deadlineDays) return toast.error("Número de dias úteis é obrigatório");
      dueDate = addBusinessDays(new Date(), parseInt(deadlineDays, 10));
    }

    setIsSavingDeadline(true);
    const res = await createDeadline({
      caseId,
      description: deadlineDesc,
      dueDate,
      isUrgent: deadlineUrgent,
    });
    setIsSavingDeadline(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Prazo registrado!");
      setIsDeadlineModalOpen(false);
      setDeadlineDesc("");
      setDeadlineDate("");
      setDeadlineDays("");
      setDeadlineUrgent(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskDesc) return toast.error("Descrição é obrigatória");

    setIsSavingTask(true);
    const res = await createTask({
      caseId,
      description: taskDesc,
      assigneeId: taskAssignee || undefined,
      dueDate: taskDate ? new Date(taskDate + "T12:00:00") : undefined,
    });
    setIsSavingTask(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Tarefa criada!");
      setIsTaskModalOpen(false);
      setTaskDesc("");
      setTaskAssignee("");
      setTaskDate("");
    }
  };

  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden h-full flex flex-col min-h-[500px]">
      {/* Abas */}
      <div className="flex items-center border-b border-white/5 bg-black/20 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("prazos")}
          className={`px-6 py-4 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "prazos"
              ? "border-juridico-gold text-juridico-gold bg-white/5"
              : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
          }`}
        >
          <CalendarDays className="w-4 h-4" /> Controle de Prazos
        </button>
        <button
          onClick={() => setActiveTab("tarefas")}
          className={`px-6 py-4 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "tarefas"
              ? "border-blue-500 text-blue-400 bg-white/5"
              : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
          }`}
        >
          <Activity className="w-4 h-4" /> Tarefas da Equipe
        </button>
        <button
          onClick={() => setActiveTab("documentos")}
          className={`px-6 py-4 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === "documentos"
              ? "border-juridico-gold text-juridico-gold bg-white/5"
              : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
          }`}
        >
          <Folder className="w-4 h-4" /> Documentos Anexos
        </button>
        <button
          onClick={() => setActiveTab("honorarios")}
          className={`px-6 py-4 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap lg:hidden xl:flex ${
             activeTab === "honorarios"
               ? "border-green-500 text-green-400 bg-white/5"
               : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
          }`}
        >
          <Landmark className="w-4 h-4" /> Honorários & Custas
        </button>
      </div>

      {/* Conteúdo Aba - Prazos */}
      {activeTab === "prazos" && (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/10">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">Prazos e Audiências</h3>
            <Button onClick={() => setIsDeadlineModalOpen(true)} size="sm" className="bg-juridico-gold hover:bg-yellow-600 text-black font-semibold h-8 text-xs gap-1">
              <Plus className="w-3.5 h-3.5" /> Novo Prazo
            </Button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {deadlines.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 text-sm">
                Nenhum prazo cadastrado para este processo.
              </div>
            ) : (
              deadlines.map(deadline => (
                <div key={deadline.id} className={`p-3 rounded-lg border ${deadline.isCompleted ? 'bg-black/40 border-white/5 opacity-60' : 'bg-[#1a1a1a] border-white/10'} flex items-center gap-4 transition-all`}>
                  <button
                    onClick={() => toggleDeadlineStatus(deadline.id, deadline.isCompleted)}
                    className={`h-6 w-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      deadline.isCompleted 
                        ? 'bg-green-500/20 border-green-500/50 text-green-500' 
                        : 'border-white/20 text-transparent hover:border-juridico-gold'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${deadline.isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-200'}`}>
                      {deadline.description}
                      {deadline.isUrgent && !deadline.isCompleted && <span className="ml-2 bg-red-500/20 text-red-400 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Urgente</span>}
                    </p>
                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      Vencimento: {new Date(deadline.dueDate).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <button onClick={() => { if(confirm("Excluir este prazo?")) deleteDeadline(deadline.id); }} className="text-zinc-600 hover:text-red-400 p-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Conteúdo Aba - Tarefas */}
      {activeTab === "tarefas" && (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/10">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">Tarefas Internas / Diligências</h3>
            <Button onClick={() => setIsTaskModalOpen(true)} size="sm" className="bg-blue-600 hover:bg-blue-500 text-white font-medium h-8 text-xs gap-1">
              <Plus className="w-3.5 h-3.5" /> Nova Tarefa
            </Button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 text-sm">
                Nenhuma tarefa pendente neste processo.
              </div>
            ) : (
              tasks.map(task => (
                <div key={task.id} className={`p-3 rounded-lg border ${task.isCompleted ? 'bg-black/40 border-white/5 opacity-60' : 'bg-[#1a1a1a] border-white/10'} flex items-start sm:items-center flex-col sm:flex-row gap-4 transition-all`}>
                  <button
                    onClick={() => toggleTaskStatus(task.id, task.isCompleted)}
                    className={`h-6 w-6 mt-1 sm:mt-0 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      task.isCompleted 
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-500' 
                        : 'bg-black/50 border-white/20 text-transparent hover:border-blue-400'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <div className="flex-1 min-w-0 w-full">
                    <p className={`text-sm font-medium truncate ${task.isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-200'}`}>
                      {task.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-zinc-500">
                      {task.assigneeName ? (
                        <span className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded text-zinc-300">
                          <User className="w-3 h-3" /> {task.assigneeName}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-zinc-600">Sem responsável</span>
                      )}
                      
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" /> Até {new Date(task.dueDate).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => { if(confirm("Excluir esta tarefa?")) deleteTask(task.id); }} className="text-zinc-600 hover:text-red-400 p-2 ml-auto sm:ml-0 mt-[-30px] sm:mt-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Conteúdo Placeholders para Documentos e Honorários */}
      {(activeTab === "documentos" || activeTab === "honorarios") && (
        <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-juridico-brand/10 border border-juridico-brand/20 flex items-center justify-center text-juridico-brandlight">
            {activeTab === "documentos" ? <Folder className="w-8 h-8" /> : <Landmark className="w-8 h-8" />}
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-medium text-white">Módulo em Desenvolvimento</h3>
            <p className="text-sm text-zinc-500 max-w-sm mx-auto">
              Em breve o controle completo de {activeTab} estará disponível nesta área.
            </p>
          </div>
        </div>
      )}

      {/* Modais */}
      <Modal isOpen={isDeadlineModalOpen} onClose={() => !isSavingDeadline && setIsDeadlineModalOpen(false)} title="Adicionar Prazo ou Audiência" className="max-w-md p-6">
        <form onSubmit={handleCreateDeadline} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label className="text-zinc-400">Descrição do Prazo *</Label>
            <Input value={deadlineDesc} onChange={(e) => setDeadlineDesc(e.target.value)} required placeholder="Ex: Contestação, Audiência Conciliação" className="bg-juridico-plate/50 border-white/10 text-white" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-zinc-400">Forma de Cálculo</Label>
            <div className="flex gap-2">
              <Button type="button" variant={deadlineType === "FIXO" ? "secondary" : "outline"} onClick={() => setDeadlineType("FIXO")} className={`flex-1 ${deadlineType === "FIXO" ? "bg-white/10 text-white" : "text-zinc-400"} h-9 border-white/10`}>Data Fixa</Button>
              <Button type="button" variant={deadlineType === "DIAS" ? "secondary" : "outline"} onClick={() => setDeadlineType("DIAS")} className={`flex-1 ${deadlineType === "DIAS" ? "bg-white/10 text-white" : "text-zinc-400"} h-9 border-white/10`}>Dias Úteis</Button>
            </div>
          </div>
          {deadlineType === "FIXO" ? (
            <div className="space-y-1.5">
              <Label className="text-zinc-400">Data de Vencimento *</Label>
              <Input type="date" value={deadlineDate} onChange={(e) => setDeadlineDate(e.target.value)} required className="bg-juridico-plate/50 border-white/10 text-white" />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-zinc-400">Quantos dias úteis a partir de hoje? *</Label>
              <Input type="number" min="0" value={deadlineDays} onChange={(e) => setDeadlineDays(e.target.value)} required placeholder="Ex: 5, 10, 15" className="bg-juridico-plate/50 border-white/10 text-white" />
              <p className="text-[10px] text-zinc-500">(Fins de semana e feriados nacionais fixos não serão contados)</p>
            </div>
          )}
          <label className="flex items-center gap-2 mt-4 pb-2">
            <input type="checkbox" checked={deadlineUrgent} onChange={(e) => setDeadlineUrgent(e.target.checked)} className="bg-transparent border-white/20 rounded text-juridico-gold focus:ring-0" />
            <span className="text-sm text-zinc-300">Marcar como urgente (Aparecerá no Dashboard)</span>
          </label>
          <Button isLoading={isSavingDeadline} className="w-full bg-juridico-gold hover:bg-yellow-600 text-black font-semibold">Salvar Prazo</Button>
        </form>
      </Modal>

      <Modal isOpen={isTaskModalOpen} onClose={() => !isSavingTask && setIsTaskModalOpen(false)} title="Nova Tarefa/Diligência" className="max-w-md p-6">
        <form onSubmit={handleCreateTask} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label className="text-zinc-400">Descrição da Tarefa *</Label>
            <Input value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} required placeholder="Ex: Buscar documento na Junta Comercial..." className="bg-juridico-plate/50 border-white/10 text-white" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-zinc-400">Responsável na Equipe (Opcional)</Label>
            <select value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)} className="flex h-10 w-full rounded-md border border-white/10 bg-juridico-plate/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-juridico-gold appearance-none">
              <option value="">Sem responsável / Fica para o Escritório</option>
              {teamMembers.map(member => (
                <option key={member.id} value={member.id}>{member.name} ({member.role})</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
             <Label className="text-zinc-400">Prazo / Due Date (Opcional)</Label>
             <Input type="date" value={taskDate} onChange={(e) => setTaskDate(e.target.value)} className="bg-juridico-plate/50 border-white/10 text-white" />
          </div>
          <Button isLoading={isSavingTask} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium mt-2">Criar Tarefa</Button>
        </form>
      </Modal>

    </div>
  );
}
