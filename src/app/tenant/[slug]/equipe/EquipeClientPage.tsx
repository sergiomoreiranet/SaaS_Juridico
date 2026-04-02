"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { createTeamMember, updateTeamMember, removeTeamMember } from "@/app/actions/equipe";

// Schema para criação (requer senha)
const createSchema = z.object({
  name: z.string().min(3, "Nome é obrigatório."),
  email: z.string().email("E-mail inválido."),
  password: z.string().min(6, "A senha provisória deve ter 6+ chars."),
  role: z.enum(["admin", "advogado", "estagiario"]),
  oab: z.string().optional(),
  phone: z.string().optional(),
});

// Schema para edição (sem senha)
const editSchema = z.object({
  name: z.string().min(3, "Nome é obrigatório."),
  role: z.enum(["admin", "advogado", "estagiario"]),
  oab: z.string().optional(),
  phone: z.string().optional(),
});

type CreateData = z.infer<typeof createSchema>;
type EditData = z.infer<typeof editSchema>;

const inputClass = "bg-juridico-plate/50 border-white/10 text-white focus-visible:ring-juridico-gold placeholder:text-zinc-500";
const selectClass = "flex h-10 w-full rounded-md border border-white/10 bg-juridico-plate/50 px-3 py-2 text-sm text-white outline-none focus:border-juridico-gold focus:ring-1 focus:ring-juridico-gold disabled:opacity-50 transition-all";
const btnPrimary = "bg-juridico-brand hover:bg-juridico-brandlight text-white shadow-[0_0_15px_rgba(139,0,0,0.3)] border border-juridico-brandlight/50";
const btnGhost = "text-zinc-400 hover:text-white hover:bg-white/5";

export default function EquipeClientPage({
  initialData,
  currentUserRole,
  currentUserId,
}: {
  initialData: any[];
  currentUserRole: string;
  currentUserId: string;
}) {
  // Define as opções de papel disponíveis por role do usuário logado
  const roleOptions = currentUserRole === "admin"
    ? [
        { value: "advogado", label: "Advogado" },
        { value: "estagiario", label: "Estagiário" },
        { value: "admin", label: "Administrador Geral" },
      ]
    : currentUserRole === "advogado"
    ? [
        { value: "advogado", label: "Advogado" },
        { value: "estagiario", label: "Estagiário" },
      ]
    : []; // Estagiários não vêem opções

  // Pode editar? Só Admin e Advogado
  const canEdit = currentUserRole === "admin" || currentUserRole === "advogado";
  // Pode remover? Só Admin
  const canDelete = currentUserRole === "admin";
  // Pode adicionar novo membro? Só Admin
  const canAdd = currentUserRole === "admin";
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Form de criação
  const createForm = useForm<CreateData>({
    resolver: zodResolver(createSchema),
    defaultValues: { role: "advogado" }
  });

  // Form de edição
  const editForm = useForm<EditData>({
    resolver: zodResolver(editSchema),
  });

  // Abre modal de edição preenchendo os campos
  const openEdit = (member: any) => {
    setSelectedMember(member);
    editForm.reset({
      name: member.name,
      role: member.role,
      oab: member.oab || "",
      phone: member.phone || "",
    });
    setIsEditOpen(true);
  };

  // Abre confirmação de exclusão
  const openDelete = (member: any) => {
    setSelectedMember(member);
    setIsDeleteOpen(true);
  };

  const onSubmitCreate = async (data: CreateData) => {
    setIsSaving(true);
    const res = await createTeamMember(data);
    setIsSaving(false);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Membro adicionado com sucesso!");
      createForm.reset();
      setIsCreateOpen(false);
    }
  };

  const onSubmitEdit = async (data: EditData) => {
    if (!selectedMember) return;
    setIsSaving(true);
    const res = await updateTeamMember({ id: selectedMember.id, ...data });
    setIsSaving(false);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Membro atualizado com sucesso!");
      setIsEditOpen(false);
    }
  };

  const onConfirmDelete = async () => {
    if (!selectedMember) return;
    setIsSaving(true);
    const res = await removeTeamMember(selectedMember.id);
    setIsSaving(false);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Membro removido.");
      setIsDeleteOpen(false);
    }
  };

  const filtered = initialData.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Equipe</h1>
          <p className="text-sm text-zinc-400">Gerencie os acessos de seus advogados e estagiários.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className={`w-full sm:w-auto gap-2 ${btnPrimary} ${!canAdd ? "hidden" : ""}`}>
          <Plus className="w-4 h-4" /> Adicionar Membro
        </Button>
      </div>

      {/* Busca */}
      <div className="flex items-center gap-2 max-w-sm relative">
        <Search className="w-4 h-4 absolute left-3 text-zinc-400" />
        <Input
          placeholder="Buscar por nome ou e-mail..."
          className={`pl-9 ${inputClass}`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabela */}
      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Membro</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>OAB</TableHead>
              <TableHead>Acesso</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                  Nenhum membro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((member) => {
                // Define se o usuário logado pode editar ESTE membro específico
                const canEditThisUser =
                  currentUserRole === "admin" || // Admin edita todos
                  (currentUserRole === "advogado" && member.role === "estagiario"); // Advogado só edita estagiários

                return (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-white">{member.name}</span>
                      <span className="text-sm text-zinc-400">{member.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.role === "admin" ? <Badge variant="warning">Admin</Badge> :
                     member.role === "estagiario" ? <Badge variant="secondary">Estagiário</Badge> :
                     <Badge>Advogado</Badge>}
                  </TableCell>
                  <TableCell className="text-zinc-400">{member.oab || "—"}</TableCell>
                  <TableCell className="text-zinc-500">
                    {new Date(member.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* Botão editar: só aparece se tem permissão PARA ESTE usuário */}
                      {canEditThisUser && (
                        <button
                          onClick={() => openEdit(member)}
                          className="p-1.5 rounded-md text-zinc-400 hover:text-juridico-gold hover:bg-white/5 transition-colors"
                          title="Editar membro"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {/* Botão remover: apenas admin, e não pode remover a si mesmo */}
                      {canDelete && member.id !== currentUserId && (
                        <button
                          onClick={() => openDelete(member)}
                          className="p-1.5 rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Remover membro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {/* Sem permissão: exibe traço neutro */}
                      {!canEditThisUser && !canDelete && (
                        <span className="text-xs text-zinc-600 italic pr-2">—</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── MODAL: CRIAR ── */}
      <Modal isOpen={isCreateOpen} onClose={() => !isSaving && setIsCreateOpen(false)} title="Adicionar Membro" description="Crie um acesso provisório para alguém da sua equipe.">
        <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="c_name" className="text-juridico-gold">Nome Completo <span className="text-juridico-brandlight">*</span></Label>
              <Input id="c_name" {...createForm.register("name")} className={`${inputClass} ${createForm.formState.errors.name ? "border-red-500" : ""}`} />
              {createForm.formState.errors.name && <p className="text-xs text-red-500">{createForm.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="c_role" className="text-juridico-gold">Nível de Permissão <span className="text-juridico-brandlight">*</span></Label>
              <select id="c_role" {...createForm.register("role")} className={selectClass}>
                <option value="advogado" className="bg-juridico-dark">Advogado</option>
                <option value="estagiario" className="bg-juridico-dark">Estagiário</option>
                <option value="admin" className="bg-juridico-dark">Administrador Geral</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="c_oab" className="text-juridico-gold">Nº da OAB (Opcional)</Label>
              <Input id="c_oab" {...createForm.register("oab")} className={inputClass} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="c_phone" className="text-juridico-gold">Celular</Label>
              <Input id="c_phone" {...createForm.register("phone")} className={inputClass} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="c_email" className="text-juridico-gold">E-mail de Acesso <span className="text-juridico-brandlight">*</span></Label>
            <Input id="c_email" type="email" {...createForm.register("email")} className={`${inputClass} ${createForm.formState.errors.email ? "border-red-500" : ""}`} />
            {createForm.formState.errors.email && <p className="text-xs text-red-500">{createForm.formState.errors.email.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="c_password" className="text-juridico-gold">Senha Provisória <span className="text-juridico-brandlight">*</span></Label>
            <Input id="c_password" type="text" {...createForm.register("password")} className={`${inputClass} ${createForm.formState.errors.password ? "border-red-500" : ""}`} />
            {createForm.formState.errors.password && <p className="text-xs text-red-500">{createForm.formState.errors.password.message}</p>}
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-white/10 mt-6">
            <Button type="button" variant="ghost" className={btnGhost} onClick={() => setIsCreateOpen(false)} disabled={isSaving}>Cancelar</Button>
            <Button type="submit" isLoading={isSaving} disabled={isSaving} className={btnPrimary}>Gerar Acesso</Button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: EDITAR ── */}
      <Modal isOpen={isEditOpen} onClose={() => !isSaving && setIsEditOpen(false)} title="Editar Membro" description={`Atualize os dados de ${selectedMember?.name || "membro"}.`}>
        <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="e_name" className="text-juridico-gold">Nome Completo <span className="text-juridico-brandlight">*</span></Label>
              <Input id="e_name" {...editForm.register("name")} className={`${inputClass} ${editForm.formState.errors.name ? "border-red-500" : ""}`} />
              {editForm.formState.errors.name && <p className="text-xs text-red-500">{editForm.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="e_role" className="text-juridico-gold">Nível de Permissão <span className="text-juridico-brandlight">*</span></Label>
              <select id="e_role" {...editForm.register("role")} className={selectClass}>
                {roleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-juridico-dark">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="e_oab" className="text-juridico-gold">Nº da OAB</Label>
              <Input id="e_oab" {...editForm.register("oab")} className={inputClass} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="e_phone" className="text-juridico-gold">Celular</Label>
              <Input id="e_phone" {...editForm.register("phone")} className={inputClass} />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-white/10 mt-6">
            <Button type="button" variant="ghost" className={btnGhost} onClick={() => setIsEditOpen(false)} disabled={isSaving}>Cancelar</Button>
            <Button type="submit" isLoading={isSaving} disabled={isSaving} className={btnPrimary}>Salvar Alterações</Button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: CONFIRMAR REMOÇÃO ── */}
      <Modal isOpen={isDeleteOpen} onClose={() => !isSaving && setIsDeleteOpen(false)} title="Confirmar Remoção" description="Esta ação é irreversível. O membro perderá acesso imediatamente.">
        <div className="py-4 space-y-4">
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
            <p className="text-sm text-red-300">
              Você está prestes a remover <span className="font-bold text-red-200">{selectedMember?.name}</span> ({selectedMember?.email}) do sistema.
            </p>
          </div>
          <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
            <Button type="button" variant="ghost" className={btnGhost} onClick={() => setIsDeleteOpen(false)} disabled={isSaving}>Cancelar</Button>
            <Button
              type="button"
              isLoading={isSaving}
              disabled={isSaving}
              className="bg-red-700 hover:bg-red-600 text-white border border-red-500/50"
              onClick={onConfirmDelete}
            >
              Sim, Remover Membro
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
