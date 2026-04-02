"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function UIKitPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-8 space-y-12">
          
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 mb-6 border-b pb-2">1. Botões & Ações</h2>
            <div className="flex flex-wrap gap-4 items-center">
              <Button>Padrão (Primary)</Button>
              <Button variant="secondary">Secundário</Button>
              <Button variant="outline">Ação Esboço</Button>
              <Button variant="ghost">Fantasma</Button>
              <Button variant="destructive">Excluir Caso</Button>
              <Button isLoading>Salvando...</Button>
              <Button onClick={() => toast.success("Toast disparado com sucesso!", { description: "Uma notificação de teste lindíssima." })}>Testar Toast</Button>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-zinc-900 mb-6 border-b pb-2">2. Formulários (Inputs)</h2>
            <div className="grid max-w-sm gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email do Cliente</Label>
                <Input type="email" id="email" placeholder="cliente@jus.com.br" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input type="password" id="password" />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-zinc-900 mb-6 border-b pb-2">3. Badges de Status</h2>
            <div className="flex items-center gap-4">
              <Badge>Em andamento</Badge>
              <Badge variant="success">Ganho (Procedente)</Badge>
              <Badge variant="destructive">Urgente</Badge>
              <Badge variant="warning">Aguardando Cliente</Badge>
              <Badge variant="secondary">Arquivado</Badge>
              <Badge variant="outline">Consulta</Badge>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-zinc-900 mb-6 border-b pb-2">4. Modais Flutuantes</h2>
            <Button onClick={() => setIsModalOpen(true)}>Abrir Modal de Edição</Button>
            
            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Adicionar Novo Processo"
              description="Preencha os dados primários do novo processo para inserir na tabela."
            >
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="numero">Número CNJ</Label>
                  <Input id="numero" placeholder="0000000-00.0000.0.00.0000" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button onClick={() => { toast.success("Processo criado e enviado ao banco de dados!"); setIsModalOpen(false); }}>Salvar Processo</Button>
              </div>
            </Modal>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-zinc-900 mb-6 border-b pb-2">5. Tabelas Legais</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Movimentação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium text-zinc-900">João da Silva</TableCell>
                  <TableCell><Badge variant="success">Ganho</Badge></TableCell>
                  <TableCell className="text-zinc-600">Alvará expedido (Ontem)</TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="sm">Ver Caso</Button></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-zinc-900">Empresa Alpha LTDA</TableCell>
                  <TableCell><Badge variant="warning">Aguard. Juiz</Badge></TableCell>
                  <TableCell className="text-zinc-600">Conclusos para despacho (Hoje)</TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="sm">Ver Caso</Button></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-zinc-900">Maria Beatriz</TableCell>
                  <TableCell><Badge variant="destructive">Prazos (3)</Badge></TableCell>
                  <TableCell className="text-zinc-600">Apresentar Contestação (Restam 2 dias)</TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="sm">Ver Caso</Button></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

        </main>
      </div>
    </div>
  );
}
