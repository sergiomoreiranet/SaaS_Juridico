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
import { Plus, Search, User, MapPin, Phone, Trash2, X } from "lucide-react";
import { createClient, updateClient, toggleClientStatus } from "@/app/actions/clientes";
import { getProfessions, createCustomProfession } from "@/app/actions/professions";
import { Copy, Edit, Ban, CheckCircle2, Eye } from "lucide-react";
import Link from "next/link";

const schema = z.object({
  personType: z.string().optional(),
  name: z.string().min(3, "Nome é obrigatório (mínimo 3 letras)."),
  cpfCnpj: z.string().optional(),
  rgIe: z.string().optional(),
  email: z.string().email("E-mail inválido.").or(z.literal("")).optional(),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  maritalStatus: z.string().optional(),
  profession: z.string().optional(),
  nationality: z.string().optional(),
  oab: z.string().optional(),
  indication: z.string().optional(),
  observations: z.string().optional(),
  
  // Endereco
  cep: z.string().optional(),
  streetType: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),

  // Telefones
  phones: z.array(z.object({
    type: z.string().min(1, "Obrigatório"),
    number: z.string().min(1, "Obrigatório"),
  })).optional(),
});
type FormData = z.infer<typeof schema>;

const inputClass = "bg-juridico-plate/50 border-white/10 text-white focus-visible:ring-juridico-gold uppercase";
const selectClass = "flex h-10 w-full rounded-md border border-white/10 bg-juridico-plate/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-juridico-gold focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 appearance-none";

export default function ClientesClientPage({ initialData, slug }: { initialData: any[], slug: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ativo"| "inativo" | "todos">("ativo");
  const [isSaving, setIsSaving] = useState(false);
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [professionsList, setProfessionsList] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    const fetchProfs = async () => {
      const res = await getProfessions();
      if (res?.data) {
        setProfessionsList(res.data);
      }
    };
    fetchProfs();
  }, []);

  const { register, handleSubmit, formState: { errors }, control, reset, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      personType: "PF",
      phones: [{ type: "Celular", number: "" }],
    }
  });

  const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({
    control,
    name: "phones"
  });

  const personType = watch("personType");
  const cepValue = watch("cep");

  // ViaCEP integration
  useEffect(() => {
    const fetchCep = async () => {
      const cleanCep = cepValue?.replace(/\D/g, "");
      if (cleanCep && cleanCep.length === 8) {
        try {
          const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
          const data = await res.json();
          if (!data.erro) {
            let stType = "";
            let stName = data.logradouro;
            const logParts = data.logradouro.split(" ");
            const commonTypes = ["Rua", "Avenida", "Alameda", "Travessa", "Praça", "Rodovia", "Vila", "Loteamento", "Condomínio"];
            if (commonTypes.includes(logParts[0])) {
              stType = logParts[0];
              stName = logParts.slice(1).join(" ");
            }

            setValue("streetType", stType);
            setValue("street", stName);
            setValue("neighborhood", data.bairro);
            setValue("city", data.localidade);
            setValue("state", data.uf);
            toast.success("Endereço carregado via CEP.");
          } else {
            toast.error("CEP não encontrado.");
          }
        } catch (error) {
          toast.error("Erro ao buscar CEP.");
        }
      }
    };
    fetchCep();
  }, [cepValue, setValue]);

  const onSubmit = async (data: FormData) => {
    setIsSaving(true);
    let mainPhone = "";
    if (data.phones && data.phones.length > 0) {
      mainPhone = data.phones[0].number;
    }

    const payload: any = { ...data, phone: mainPhone, phones: data.phones };
    
    // Converte todos os campos de texto para MAIUSCULO, exceto email, senhas ou arrays
    Object.keys(payload).forEach(key => {
      if (typeof payload[key] === "string" && key !== "email" && key !== "personType") {
        payload[key] = payload[key].toUpperCase();
      }
    });
    // Força e-mail minúsculo
    if (payload.email) payload.email = payload.email.toLowerCase();

    // Cria a profissão se ela não existir
    if (payload.profession && payload.profession.trim().length > 1) {
      const isKnown = professionsList.some(p => p.name.toUpperCase() === payload.profession.toUpperCase());
      if (!isKnown) {
        await createCustomProfession(payload.profession);
        // Add locally so if they open form again without reloading, it's there
        setProfessionsList(prev => [...prev, { id: 'temp', name: payload.profession.toUpperCase() }]);
      }
    }

    let res;
    if (editingClient) {
      res = await updateClient(editingClient.id, payload);
    } else {
      res = await createClient(payload);
    }
    
    setIsSaving(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(editingClient ? "Cliente atualizado com sucesso!" : "Cliente cadastrado com sucesso!");
      reset();
      setIsModalOpen(false);
      setEditingClient(null);
    }
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    reset({
      personType: client.personType || "PF",
      name: client.name || "",
      cpfCnpj: client.cpfCnpj || "",
      rgIe: client.rgIe || "",
      birthDate: client.birthDate || "",
      gender: client.gender || "",
      maritalStatus: client.maritalStatus || "",
      profession: client.profession || "",
      nationality: client.nationality || "",
      oab: client.oab || "",
      indication: client.indication || "",
      observations: client.observations || "",
      email: client.email || "",
      phones: Array.isArray(client.phones) && client.phones.length > 0 ? client.phones : [{ type: "Celular", number: client.phone || "" }],
      cep: client.cep || "",
      streetType: client.streetType || "",
      street: client.street || "",
      number: client.number || "",
      complement: client.complement || "",
      neighborhood: client.neighborhood || "",
      city: client.city || "",
      state: client.state || "",
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (client: any) => {
    const action = client.isActive ? "desativar" : "reativar";
    if (confirm(`Tem certeza que deseja ${action} o cliente ${client.name}?`)) {
      const res = await toggleClientStatus(client.id, !client.isActive);
      if (res.error) toast.error(res.error);
      else toast.success(`Cliente ${action}do com sucesso!`);
    }
  };

  const filtered = initialData.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()) || c.cpfCnpj?.includes(search);
    const matchesStatus = statusFilter === "todos" ? true : statusFilter === "ativo" ? c.isActive : !c.isActive;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="text-sm text-zinc-400">Gerencie sua carteira de clientes, PF e PJ.</p>
        </div>
        <Button onClick={() => { setEditingClient(null); reset(); setIsModalOpen(true); }} className="w-full sm:w-auto gap-2 bg-juridico-brand hover:bg-juridico-brandlight text-white shadow-[0_0_15px_rgba(139,0,0,0.3)] border border-juridico-brandlight/50">
          <Plus className="w-4 h-4" /> Novo Cliente
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 w-full max-w-sm relative">
          <Search className="w-4 h-4 absolute left-3 text-zinc-400" />
          <Input 
            placeholder="Buscar por nome ou CPF..." 
            className="pl-9 bg-juridico-plate/50 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-juridico-gold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto self-start sm:self-auto bg-juridico-plate/50 p-1 rounded-md border border-white/5">
          <button onClick={() => setStatusFilter("ativo")} className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${statusFilter === "ativo" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"}`}>Ativos</button>
          <button onClick={() => setStatusFilter("inativo")} className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${statusFilter === "inativo" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"}`}>Inativos</button>
          <button onClick={() => setStatusFilter("todos")} className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${statusFilter === "todos" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"}`}>Todos</button>
        </div>
      </div>

      <div className="overflow-hidden bg-[#111111] rounded-xl border border-white/5">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-zinc-500">Nome</TableHead>
              <TableHead className="text-zinc-500">CPF/CNPJ</TableHead>
              <TableHead className="text-zinc-500">Contato</TableHead>
              <TableHead className="text-zinc-500">Cadastro</TableHead>
              <TableHead className="text-zinc-500 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableCell colSpan={5} className="h-32 text-center text-zinc-500">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((client) => (
                <TableRow key={client.id} className={`border-white/5 hover:bg-white/[0.02] ${!client.isActive && 'opacity-50 grayscale'}`}>
                  <TableCell className="font-medium text-white">
                    <div className="flex items-center gap-2">
                      <Link href={`/clientes/${client.id}`} className="hover:text-juridico-gold hover:underline transition-colors">
                        {client.name}
                      </Link>
                      {!client.isActive && <span className="bg-red-500/20 text-red-400 text-[10px] px-1.5 py-0.5 rounded border border-red-500/30 uppercase">Inativo</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-400">{client.cpfCnpj || "—"}</TableCell>
                  <TableCell className="text-zinc-400">
                    <div className="flex flex-col">
                      {client.email && <span className="text-sm">{client.email}</span>}
                      <div className="flex flex-col gap-0.5 mt-1">
                        {Array.isArray(client.phones) && client.phones.length > 0 ? (
                          client.phones.map((p: any, idx: number) => (
                            <span key={idx} className="text-xs text-zinc-400 flex items-center gap-1.5">
                              <span className="text-[9px] uppercase tracking-wider text-zinc-500 bg-white/5 border border-white/10 px-1 py-0.5 rounded leading-none">{p.type}</span> 
                              {p.number}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-zinc-500">{client.phone || ""}</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-500 text-sm">
                    {new Date(client.createdAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/clientes/${client.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-400 hover:text-white" title="Visualizar Perfil">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-400 hover:text-white" onClick={() => handleEdit(client)} title="Editar Cadastro">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 ${client.isActive ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' : 'text-green-400 hover:text-green-300 hover:bg-green-500/10'}`} onClick={() => handleToggleStatus(client)} title={client.isActive ? "Desativar Cliente" : "Reativar Cliente"}>
                      {client.isActive ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => !isSaving && setIsModalOpen(false)} title={editingClient ? "Editar Cliente" : "Cadastro de Cliente"} className="max-w-2xl p-0 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2 pb-4 h-full">
          
          <div className="bg-orange-500/10 border border-orange-500/30 text-orange-400 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
            <span className="text-lg leading-none">⚠️</span>
            <p>Para começar a cadastrar, preencha no mínimo: <strong>Nome + CEP + Telefone</strong> (dados obrigatórios).</p>
          </div>

          <div className="space-y-3">
            <h3 className="text-juridico-brandlight border-b border-white/10 pb-2 flex items-center gap-2 font-medium">
              <User className="w-5 h-5" /> Tipo de Pessoa
            </h3>
            <div className="flex gap-6 items-center pt-1">
              <label className="flex items-center gap-2 text-sm text-white cursor-pointer group">
                <input type="radio" value="PF" {...register("personType")} className="accent-juridico-brand w-4 h-4 cursor-pointer" />
                <span className="group-hover:text-juridico-brandlight transition-colors">Pessoa Física</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-white cursor-pointer group">
                <input type="radio" value="PJ" {...register("personType")} className="accent-juridico-brand w-4 h-4 cursor-pointer" />
                <span className="group-hover:text-juridico-brandlight transition-colors">Pessoa Jurídica</span>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[#3b82f6] border-b border-white/10 pb-2 flex items-center gap-2 font-medium">
              <User className="w-5 h-5" /> Dados Principais
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-zinc-400">{personType === 'PF' ? 'Nome Completo' : 'Razão Social'} <span className="text-juridico-brandlight">*</span></Label>
                <Input id="name" {...register("name")} className={`${inputClass} ${errors.name ? "border-red-500" : ""}`} />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="cpfCnpj" className="text-zinc-400">{personType === 'PF' ? 'CPF' : 'CNPJ'}</Label>
                <Input 
                  id="cpfCnpj" 
                  {...register("cpfCnpj")} 
                  onChange={(e) => {
                    let v = e.target.value.replace(/\D/g, "");
                    if (personType === 'PF') {
                      v = v.replace(/(\d{3})(\d)/, "$1.$2");
                      v = v.replace(/(\d{3})(\d)/, "$1.$2");
                      v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                      v = v.slice(0, 14);
                    } else {
                      v = v.replace(/^(\d{2})(\d)/, "$1.$2");
                      v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
                      v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
                      v = v.replace(/(\d{4})(\d)/, "$1-$2");
                      v = v.slice(0, 18);
                    }
                    e.target.value = v;
                    register("cpfCnpj").onChange(e);
                  }}
                  className={inputClass} 
                  placeholder={personType === 'PF' ? "000.000.000-00" : "00.000.000/0000-00"}
                  maxLength={personType === 'PF' ? 14 : 18}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="rgIe" className="text-zinc-400">{personType === 'PF' ? 'RG' : 'IE'}</Label>
                <Input id="rgIe" {...register("rgIe")} className={inputClass} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email" className="text-zinc-400">Email</Label>
                <Input id="email" type="email" {...register("email")} className={`${inputClass.replace('uppercase', 'normal-case')} ${errors.email ? "border-red-500" : ""}`} />
              </div>

              {personType === 'PF' && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="birthDate" className="text-zinc-400">Data de Nascimento</Label>
                    <Input id="birthDate" type="date" {...register("birthDate")} className={`${inputClass} [&::-webkit-calendar-picker-indicator]:invert`} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="gender" className="text-zinc-400">Sexo</Label>
                    <div className="relative">
                      <select id="gender" {...register("gender")} className={selectClass}>
                        <option value="">Selecione</option>
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                        <option value="OUTRO">Outro</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400"><X className="h-4 w-4 rotate-45" /></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="maritalStatus" className="text-zinc-400">Estado Civil</Label>
                    <div className="relative">
                      <select id="maritalStatus" {...register("maritalStatus")} className={selectClass}>
                        <option value="">Selecione</option>
                        <option value="SOLTEIRO">Solteiro(a)</option>
                        <option value="CASADO">Casado(a)</option>
                        <option value="DIVORCIADO">Divorciado(a)</option>
                        <option value="VIUVO">Viúvo(a)</option>
                        <option value="UNIAO ESTAVEL">União Estável</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="profession" className="text-zinc-400">Profissão</Label>
                    <Input id="profession" list="professionsList" {...register("profession")} className={inputClass} placeholder="Selecione ou digite..." />
                    <datalist id="professionsList">
                      {professionsList.map(p => (
                        <option key={p.id} value={p.name} />
                      ))}
                    </datalist>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <Label htmlFor="nationality" className="text-zinc-400">Nacionalidade</Label>
                <Input id="nationality" {...register("nationality")} className={inputClass} defaultValue="Brasileira" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="oab" className="text-zinc-400">OAB (Se Advogado)</Label>
                <Input id="oab" {...register("oab")} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-2">
              <div className="space-y-1">
                <Label htmlFor="indication" className="text-zinc-400">Indicação de Cliente (Como nos conheceu?)</Label>
                <Input id="indication" {...register("indication")} className={inputClass} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="observations" className="text-zinc-400">Observações</Label>
                <textarea 
                  id="observations" 
                  {...register("observations")} 
                  className={`flex w-full rounded-md border border-white/10 bg-juridico-plate/50 px-3 py-2 text-sm text-white min-h-[80px] focus:outline-none focus:ring-2 focus:ring-juridico-gold focus:ring-offset-2 focus:ring-offset-background resize-y`} 
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-[#3b82f6] border-b border-white/10 pb-2 flex items-center gap-2 font-medium">
              <MapPin className="w-5 h-5" /> Endereço
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-3 space-y-1">
                <Label htmlFor="cep" className="text-zinc-400">CEP</Label>
                <Input 
                  id="cep" 
                  {...register("cep")} 
                  onChange={(e) => {
                    let v = e.target.value.replace(/\D/g, "");
                    v = v.replace(/^(\d{5})(\d)/, "$1-$2");
                    e.target.value = v;
                    register("cep").onChange(e);
                  }}
                  placeholder="00000-000" 
                  className={inputClass} 
                  maxLength={9} 
                />
              </div>
              <div className="sm:col-span-3 space-y-1">
                <Label htmlFor="streetType" className="text-zinc-400">Logradouro Tipo</Label>
                <div className="relative">
                  <select id="streetType" {...register("streetType")} className={selectClass}>
                    <option value="">Selecione</option>
                    <option value="RUA">Rua</option>
                    <option value="AVENIDA">Avenida</option>
                    <option value="ALAMEDA">Alameda</option>
                    <option value="TRAVESSA">Travessa</option>
                    <option value="PRAÇA">Praça</option>
                    <option value="RODOVIA">Rodovia</option>
                    <option value="ESTRADA">Estrada</option>
                    <option value="VILA">Vila</option>
                  </select>
                </div>
              </div>
              <div className="sm:col-span-4 space-y-1">
                <Label htmlFor="street" className="text-zinc-400">Logradouro / Endereço</Label>
                <Input id="street" {...register("street")} className={inputClass} />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label htmlFor="number" className="text-zinc-400">Número</Label>
                <Input id="number" {...register("number")} className={inputClass} />
              </div>

              <div className="sm:col-span-4 space-y-1">
                <Label htmlFor="complement" className="text-zinc-400">Complemento</Label>
                <Input id="complement" {...register("complement")} className={inputClass} />
              </div>
              <div className="sm:col-span-4 space-y-1">
                <Label htmlFor="neighborhood" className="text-zinc-400">Bairro</Label>
                <Input id="neighborhood" {...register("neighborhood")} className={inputClass} />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label htmlFor="state" className="text-zinc-400">Estado</Label>
                <Input id="state" {...register("state")} className={inputClass} maxLength={2} placeholder="UF" />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label htmlFor="city" className="text-zinc-400">Cidade</Label>
                <Input id="city" {...register("city")} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Telefones */}
          <div className="space-y-4 pb-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-[#3b82f6] flex items-center gap-2 font-medium">
                <Phone className="w-5 h-5" /> Telefones
              </h3>
              <Button type="button" onClick={() => appendPhone({ type: "", number: "" })} size="sm" variant="outline" className="h-8 gap-1 border-white/10 bg-transparent text-juridico-brandlight hover:bg-juridico-brand/10 hover:text-juridico-brandlight">
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </Button>
            </div>
            
            <div className="space-y-3">
              {phoneFields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
                  <div className="w-1/3 space-y-1">
                    <Label className="text-zinc-400 text-xs">Tipo</Label>
                    <select {...register(`phones.${index}.type`)} className={selectClass}>
                      <option value="">Selecione</option>
                      <option value="Celular">Celular</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Fixo">Fixo Residencial</option>
                      <option value="Comercial">Comercial</option>
                      <option value="Emergencia">Recado / Emergência</option>
                    </select>
                    {errors.phones?.[index]?.type && <p className="text-[10px] text-red-500">{errors.phones[index]?.type?.message}</p>}
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-zinc-400 text-xs">Telefone</Label>
                    <div className="flex gap-2">
                      <Input 
                        {...register(`phones.${index}.number`)} 
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, "").slice(0, 11);
                          let formatted = v;
                          if (v.length > 10) {
                            formatted = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
                          } else if (v.length > 6) {
                            formatted = `(${v.slice(0,2)}) ${v.slice(2,6)}-${v.slice(6)}`;
                          } else if (v.length > 2) {
                            formatted = `(${v.slice(0,2)}) ${v.slice(2)}`;
                          } else if (v.length > 0) {
                            formatted = `(${v.slice(0)}`;
                          }
                          e.target.value = formatted;
                          register(`phones.${index}.number`).onChange(e);
                        }}
                        placeholder="(11) 90000-0000" 
                        maxLength={15}
                        className={inputClass} 
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="h-10 w-10 px-0 shrink-0 border border-white/10 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => removePhone(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {errors.phones?.[index]?.number && <p className="text-[10px] text-red-500">{errors.phones[index]?.number?.message}</p>}
                  </div>
                </div>
              ))}
              {phoneFields.length === 0 && (
                <p className="text-sm text-zinc-500 italic py-2">Nenhum telefone adicionado. É obrigatório adicionar ao menos um.</p>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 bg-[#0a0a0a]/95 backdrop-blur border-t border-white/10 py-4 mt-6 -mx-6 px-6 flex justify-between gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-10">
            <Button type="button" variant="ghost" className="bg-[#1a1a1a] text-zinc-300 hover:text-white hover:bg-[#222]" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              <X className="w-4 h-4 mr-2" /> Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving} disabled={isSaving} className="bg-juridico-brand hover:bg-juridico-brandlight text-white shadow-[0_0_15px_rgba(139,0,0,0.3)] border border-juridico-brandlight/50">
              {editingClient ? "Salvar Atualizações" : "Cadastrar Cliente"}
            </Button>
          </div>
        </form>
        </div>
      </Modal>
    </div>
  );
}
