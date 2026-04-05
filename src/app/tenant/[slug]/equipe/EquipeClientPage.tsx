"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Phone, Mail } from "lucide-react";
import { createTeamMember, updateTeamMember, removeTeamMember } from "@/app/actions/equipe";

const contactSchema = z.array(z.object({
  type: z.enum(["phone", "email"]),
  value: z.string().min(2, "Valor obrigatório")
})).optional();

// Schema para criação (requer senha)
const createSchema = z.object({
  name: z.string().min(3, "Nome é obrigatório."),
  email: z.string().email("E-mail inválido."),
  password: z.string().min(6, "A senha provisória deve ter 6+ chars."),
  role: z.enum(["admin", "advogado", "estagiario"]),
  oab: z.string().optional(),
  phone: z.string().optional(),
  additionalContacts: contactSchema
});

const editSchema = z.object({
  name: z.string().min(3, "Nome é obrigatório."),
  email: z.string().email("E-mail inválido."),
  role: z.enum(["admin", "advogado", "estagiario"]),
  oab: z.string().optional(),
  phone: z.string().optional(),
  additionalContacts: contactSchema
});

type CreateData = z.infer<typeof createSchema>;
type EditData = z.infer<typeof editSchema>;

const inputClass = "bg-juridico-plate/50 border-white/10 text-white focus-visible:ring-juridico-gold placeholder:text-zinc-500";
const selectClass = "flex h-10 w-full rounded-md border border-white/10 bg-juridico-plate/50 px-3 py-2 text-sm text-white outline-none focus:border-juridico-gold focus:ring-1 focus:ring-juridico-gold disabled:opacity-50 transition-all";
const btnPrimary = "bg-juridico-brand hover:bg-juridico-brandlight text-white shadow-[0_0_15px_rgba(139,0,0,0.3)] border border-juridico-brandlight/50";
const btnGhost = "text-zinc-400 hover:text-white hover:bg-white/5";

const phoneMask = (v: string) => {
  if (!v) return "";
  v = v.replace(/\D/g, "");
  if (v.length > 11) v = v.substring(0, 11);
  if (v.length > 10) return v.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
  if (v.length > 5) return v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
  if (v.length > 2) return v.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
  return v;
};

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
    defaultValues: { role: "advogado", additionalContacts: [] }
  });
  const { fields: createContacts, append: appendCreateContact, remove: removeCreateContact } = useFieldArray({
    control: createForm.control,
    name: "additionalContacts"
  });

  // Form de edição
  const editForm = useForm<EditData>({
    resolver: zodResolver(editSchema),
    defaultValues: { additionalContacts: [] }
  });
  const { fields: editContacts, append: appendEditContact, remove: removeEditContact } = useFieldArray({
    control: editForm.control,
    name: "additionalContacts"
  });

  const openEdit = (member: any) => {
    setSelectedMember(member);
    editForm.reset({
      name: member.name,
      email: member.email,
      role: member.role,
      oab: member.oab || "",
      phone: member.phone || "",
      additionalContacts: Array.isArray(member.additionalContacts) ? member.additionalContacts : []
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
              <TableHead>Contatos</TableHead>
              <TableHead>Acesso</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                  Nenhum membro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((member) => {
                // Define se o usuário logado pode editar ESTE membro específico
                const canEditThisUser =
                  currentUserRole === "admin" || // Admin edita todos
                  (currentUserRole === "advogado" && member.role === "estagiario") || // Advogado só edita estagiários
                  member.id === currentUserId; // Permite o usuário logado editar a si mesmo

                return (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-white">{member.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.role === "admin" ? <Badge variant="warning">Admin</Badge> :
                     member.role === "estagiario" ? <Badge variant="secondary">Estagiário</Badge> :
                     <Badge>Advogado</Badge>}
                  </TableCell>
                  <TableCell className="text-zinc-400">{member.oab || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-sm text-zinc-300">
                        <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <a href={`mailto:${member.email}`} className="hover:text-juridico-gold hover:underline transition-colors truncate max-w-[150px] sm:max-w-xs">{member.email}</a>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-300">
                        <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        {member.phone ? (
                          <a href={`https://wa.me/55${member.phone.replace(/\D/g, '')}`} target="_blank" className="hover:text-green-400 hover:underline transition-colors">{phoneMask(member.phone)}</a>
                        ) : (
                          <span className="text-zinc-600 text-xs italic">Não informado</span>
                        )}
                      </div>
                      {member.additionalContacts && member.additionalContacts.map((contact: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-[13px] text-zinc-400 mt-0.5">
                          {contact.type === "email" ? <Mail className="w-3 h-3 text-zinc-600 shrink-0" /> : <Phone className="w-3 h-3 text-zinc-600 shrink-0" />}
                          {contact.type === "phone" ? (
                            <a href={`https://wa.me/55${contact.value.replace(/\D/g, '')}`} target="_blank" className="hover:text-zinc-300 hover:underline transition-colors">{phoneMask(contact.value)}</a>
                          ) : (
                            <a href={`mailto:${contact.value}`} className="hover:text-zinc-300 hover:underline transition-colors truncate max-w-[150px] sm:max-w-xs">{contact.value}</a>
                          )}
                        </div>
                      ))}
                    </div>
                  </TableCell>
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
              <Input id="c_phone" {...createForm.register("phone")} onChange={(e) => { e.target.value = phoneMask(e.target.value); createForm.register("phone").onChange(e); }} className={inputClass} placeholder="(11) 99999-9999" />
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

          <div className="space-y-1 mt-2">
            <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-2">
              <Label className="text-juridico-gold text-sm font-medium">Contatos Alternativos (Opcional)</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => appendCreateContact({ type: "phone", value: "" })} className="bg-juridico-plate/30 border-white/10 text-xs h-7 text-zinc-300 hover:text-white">
                <Plus className="w-3 h-3 mr-1" /> Adicionar Contato
              </Button>
            </div>
            <div className="space-y-2 mt-2">
              {createContacts.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-center bg-black/20 p-2 rounded border border-white/5 animate-in fade-in">
                  <div className="w-[120px]">
                    <select {...createForm.register(`additionalContacts.${index}.type`)} className={selectClass}>
                      <option value="phone">Telefone</option>
                      <option value="email">E-mail</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <Input {...createForm.register(`additionalContacts.${index}.value`)} className={`${inputClass} border border-white/10`} placeholder="Valor..." onChange={(e) => { if(createForm.watch(`additionalContacts.${index}.type`) === "phone") { e.target.value = phoneMask(e.target.value); } createForm.register(`additionalContacts.${index}.value`).onChange(e); }} />
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeCreateContact(index)} className="h-10 w-10 p-0 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 shrink-0 border border-white/5 rounded-md bg-juridico-plate/30">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
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
              <Input id="e_phone" {...editForm.register("phone")} onChange={(e) => { e.target.value = phoneMask(e.target.value); editForm.register("phone").onChange(e); }} className={inputClass} placeholder="(11) 99999-9999" />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="e_email" className="text-juridico-gold">E-mail de Acesso <span className="text-juridico-brandlight">*</span></Label>
            <Input id="e_email" type="email" {...editForm.register("email")} className={`${inputClass} ${editForm.formState.errors.email ? "border-red-500" : ""}`} />
            {editForm.formState.errors.email && <p className="text-xs text-red-500">{editForm.formState.errors.email.message}</p>}
          </div>

          <div className="space-y-1 mt-2">
            <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-2">
              <Label className="text-juridico-gold text-sm font-medium">Contatos Alternativos (Opcional)</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => appendEditContact({ type: "phone", value: "" })} className="bg-juridico-plate/30 border-white/10 text-xs h-7 text-zinc-300 hover:text-white">
                <Plus className="w-3 h-3 mr-1" /> Adicionar Contato
              </Button>
            </div>
            <div className="space-y-2 mt-2">
              {editContacts.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-center bg-black/20 p-2 rounded border border-white/5 animate-in fade-in">
                  <div className="w-[120px]">
                    <select {...editForm.register(`additionalContacts.${index}.type`)} className={selectClass}>
                      <option value="phone">Telefone</option>
                      <option value="email">E-mail</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <Input {...editForm.register(`additionalContacts.${index}.value`)} className={`${inputClass} border border-white/10`} placeholder="Valor..." onChange={(e) => { if(editForm.watch(`additionalContacts.${index}.type`) === "phone") { e.target.value = phoneMask(e.target.value); } editForm.register(`additionalContacts.${index}.value`).onChange(e); }} />
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeEditContact(index)} className="h-10 w-10 p-0 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 shrink-0 border border-white/5 rounded-md bg-juridico-plate/30">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
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
