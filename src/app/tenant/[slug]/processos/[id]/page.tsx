import { redirect } from "next/navigation";
import { db } from "@/db";
import { cases, clients, courts, courtDepartments, tenants, caseClients as caseClientsTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireUser } from "@/lib/session";
import Link from "next/link";
import { ArrowLeft, Scale, Building2, CalendarDays, FileText, Activity, Landmark, Folder, Users } from "lucide-react";

export default async function ProcessoDossierPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const user = await requireUser();

  const tenant = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
  if (!tenant.length) return redirect("/login");
  const tenantId = tenant[0].id;

  if ((user as any).tenantId !== tenantId) return redirect("/login");

  const caseResult = await db.select({
    id: cases.id,
    title: cases.title,
    cnjNumber: cases.cnjNumber,
    controlNumber: cases.controlNumber,
    tr: cases.tr,
    origin: cases.origin,
    processClass: cases.processClass,
    processType: cases.processType,
    forum: cases.forum,
    subject: cases.subject,
    estimatedValue: cases.estimatedValue,
    movementDate: cases.movementDate,
    startDate: cases.startDate,
    distributionDate: cases.distributionDate,
    expectedConclusionDate: cases.expectedConclusionDate,
    status: cases.status,
    createdAt: cases.createdAt,
    clientName: clients.name,
    courtName: courts.name,
    courtAbbreviation: courts.abbreviation,
    courtState: courts.state,
    courtDepartmentName: courtDepartments.name,
  })
  .from(cases)
  .leftJoin(clients, eq(cases.clientId, clients.id))
  .leftJoin(courts, eq(cases.courtId, courts.id))
  .leftJoin(courtDepartments, eq(cases.courtDepartmentId, courtDepartments.id))
  .where(and(eq(cases.id, id), eq(cases.tenantId, tenantId)))
  .limit(1);

  if (!caseResult.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Scale className="w-16 h-16 text-zinc-600" />
        <h2 className="text-xl text-white font-semibold">Processo não encontrado</h2>
        <p className="text-zinc-400">O processo solicitado não existe ou você não tem acesso.</p>
        <Link href={`/processos`} className="text-juridico-gold hover:underline">
          Voltar para a lista
        </Link>
      </div>
    );
  }

  const caso = caseResult[0];

  // Monte o Número CNJ Completo para Exibição
  let fullCnj = caso.cnjNumber || "Sem número CNJ";
  if (caso.cnjNumber && caso.tr && caso.origin) {
    fullCnj = `${caso.cnjNumber}.8.${caso.tr}.${caso.origin}`;
  }

  const coClients = await db.select({
    clientId: caseClientsTable.clientId,
    type: caseClientsTable.type,
    name: clients.name
  })
  .from(caseClientsTable)
  .leftJoin(clients, eq(caseClientsTable.clientId, clients.id))
  .where(eq(caseClientsTable.processId, id));

  const formatCurrency = (value: string | null) => {
    if (!value) return "Não informado";
    const num = parseFloat(value.replace(/\./g, "").replace(",", "."));
    if (isNaN(num)) return value;
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
  };

  const formatDate = (date: string | null | Date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-10">
      
      {/* Navegação Topo */}
      <div className="flex items-center gap-3 text-sm text-zinc-400">
        <Link href={`/processos`} className="hover:text-white flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar para Processos
        </Link>
        <span>/</span>
        <span className="text-juridico-gold truncate max-w-[200px] sm:max-w-xs">{caso.title}</span>
      </div>

      {/* Header do Dossiê */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row shadow-[0_0_20px_rgba(0,0,0,0.5)] justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-juridico-brand via-juridico-gold to-juridico-brandlite opacity-50"></div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{caso.title}</h1>
            <span className={`text-[11px] uppercase tracking-wider px-2 py-0.5 rounded border font-medium ${
              caso.status === "ativo" ? "bg-green-500/10 text-green-400 border-green-500/20" :
              caso.status === "pendente" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
              "bg-zinc-800 text-zinc-400 border-zinc-700"
            }`}>
              {caso.status}
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-zinc-400 text-sm">
            <div className="flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded-md border border-white/5">
              <Scale className="w-4 h-4 text-zinc-500" />
              <span className="font-mono text-zinc-300">{fullCnj}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500">Cliente:</span>
              <span className="text-white font-medium">{caso.clientName || "—"}</span>
            </div>
          </div>
        </div>

        <div className="bg-black/50 p-4 rounded-xl border border-white/5 flex gap-6 shrink-0 w-full md:w-auto">
          <div>
            <p className="text-xs text-zinc-500 mb-1">Valor da Causa</p>
            <p className="text-lg font-bold text-green-400">{formatCurrency(caso.estimatedValue)}</p>
          </div>
          <div className="w-px bg-white/10 shrink-0"></div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Data Geração</p>
            <p className="text-lg font-bold text-zinc-300">{formatDate(caso.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Participantes do Processo (Litisconsortes / Herdeiros) */}
      {coClients.length > 0 && (
        <div className="bg-[#111111] border border-white/10 rounded-xl p-5 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
          <h3 className="text-[11px] font-semibold text-zinc-400 mb-3 uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
            <Users className="w-4 h-4" /> Co-Participantes e Herdeiros
          </h3>
          <div className="flex flex-wrap gap-3">
            {coClients.map((co, i) => (
              <div key={i} className="flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-1.5 rounded-md hover:bg-white/[0.02] transition-colors">
                <span className="text-zinc-200 font-medium text-sm">{co.name || "Cliente Excluído"}</span>
                <span className="text-[10px] uppercase bg-juridico-gold/10 text-juridico-gold border border-juridico-gold/20 px-1.5 py-0.5 rounded tracking-wider font-bold">
                  {co.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid de Informações */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna Esquerda: Meta Dados */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="text-juridico-gold flex items-center gap-2 font-medium border-b border-white/5 pb-3">
              <Building2 className="w-4 h-4" /> Órgão Julgador
            </h3>
            <div className="space-y-4">
              <div>
                <span className="block text-xs text-zinc-500 mb-1">Tribunal</span>
                <span className="text-sm text-zinc-200">
                  {caso.courtName ? `${caso.courtAbbreviation} - ${caso.courtName} (${caso.courtState})` : "—"}
                </span>
              </div>
              <div>
                <span className="block text-xs text-zinc-500 mb-1">Foro</span>
                <span className="text-sm text-zinc-200">{caso.forum || "—"}</span>
              </div>
              <div>
                <span className="block text-xs text-zinc-500 mb-1">Vara / Distribuição</span>
                <span className="text-sm text-zinc-200">{caso.courtDepartmentName || "—"}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="text-[#3b82f6] flex items-center gap-2 font-medium border-b border-white/5 pb-3">
              <FileText className="w-4 h-4" /> Classificação
            </h3>
            <div className="space-y-4">
              <div>
                <span className="block text-xs text-zinc-500 mb-1">Classe Processual</span>
                <span className="text-sm text-zinc-200">{caso.processClass || "—"}</span>
              </div>
              <div>
                <span className="block text-xs text-zinc-500 mb-1">Categoria / Tipo</span>
                <span className="text-sm text-zinc-200">{caso.processType || "—"}</span>
              </div>
              <div>
                <span className="block text-xs text-zinc-500 mb-1">Assunto</span>
                <span className="text-sm text-zinc-200">{caso.subject || "—"}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="text-orange-400 flex items-center gap-2 font-medium border-b border-white/5 pb-3">
              <CalendarDays className="w-4 h-4" /> Datas Importantes
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-xs text-zinc-500">Distribuição:</span>
                <span className="text-sm text-zinc-200 font-mono">{formatDate(caso.distributionDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-zinc-500">Início Mapeado:</span>
                <span className="text-sm text-zinc-200 font-mono">{formatDate(caso.startDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-zinc-500">Última Movimentação:</span>
                <span className="text-sm text-zinc-200 font-mono">{formatDate(caso.movementDate)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/5">
                <span className="text-xs text-zinc-500">Previsão Conclusão:</span>
                <span className="text-sm text-juridico-gold font-mono">{formatDate(caso.expectedConclusionDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Central/Direita: Abas / Módulos de Visualização (Histórico e Documentos) */}
        <div className="lg:col-span-2">
          <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden h-full flex flex-col min-h-[500px]">
            {/* Headers das Abas Fakes para o Layout Inicial */}
            <div className="flex items-center border-b border-white/5 bg-black/20">
              <button className="px-6 py-4 text-sm font-medium border-b-2 border-juridico-gold text-juridico-gold flex items-center gap-2 bg-white/5 transition-colors">
                <Activity className="w-4 h-4" /> Linha do Tempo
              </button>
              <button className="px-6 py-4 text-sm font-medium border-b-2 border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02] flex items-center gap-2 transition-colors">
                <Folder className="w-4 h-4" /> Documentos Anexos
              </button>
              <button className="px-6 py-4 text-sm font-medium border-b-2 border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02] flex items-center gap-2 transition-colors lg:hidden xl:flex">
                <Landmark className="w-4 h-4" /> Honorários & Custas
              </button>
            </div>
            
            {/* Conteúdo Aba - Em Breve (State atual: mockup limpo) */}
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-juridico-brand/10 border border-juridico-brand/20 flex items-center justify-center text-juridico-brandlight">
                <Activity className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-medium text-white">Central de Andamentos</h3>
                <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                  Este módulo listará todas as petições, movimentações processuais e intimações deste caso de forma cronológica.
                </p>
              </div>
              <button className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 rounded-lg text-sm transition-colors opacity-50 cursor-not-allowed">
                Módulo em Desenvolvimento...
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
