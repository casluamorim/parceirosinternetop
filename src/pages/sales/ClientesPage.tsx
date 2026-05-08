import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSalesAuth } from "@/hooks/useSalesAuth";
import { MESES } from "@/lib/sales-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

const sq = (table: string) => (supabase.from as any)(table);

export default function ClientesPage() {
  const { salesUser, canManage } = useSalesAuth();
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [clientes, setClientes] = useState<any[]>([]);
  const [planos, setPlanos] = useState<any[]>([]);
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ nome: "", telefone: "", email: "", endereco: "", vendedor_id: "", plano_id: "" });

  useEffect(() => { loadData(); }, [mes, ano, salesUser]);

  const loadData = async () => {
    if (!salesUser) return;
    const { data: planItems } = await supabase.from("plan_items").select("id, name, speed").eq("active", true);
    setPlanos(planItems || []);
    if (canManage) {
      const { data: sellers } = await sq("sales_users").select("id, name").eq("active", true);
      setVendedores(sellers || []);
    }
    const { data } = await sq("clientes").select("*").eq("mes", mes).eq("ano", ano).order("created_at", { ascending: false });
    setClientes(data || []);
  };

  const handleSubmit = async () => {
    const vid = canManage ? form.vendedor_id : salesUser!.id;
    if (!form.nome || !vid) { toast({ title: "Preencha nome e vendedor", variant: "destructive" }); return; }
    const { data: inserted, error } = await sq("clientes").insert({ ...form, vendedor_id: vid, mes, ano }).select().maybeSingle();
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    const plano = planos.find((p) => p.id === form.plano_id);
    const vendedor = vendedores.find((v) => v.id === vid) ?? { name: salesUser?.name };
    const { enqueueGesprov } = await import("@/lib/gesprov");
    enqueueGesprov("cliente", {
      origem: "vendedor_painel",
      data_venda: new Date().toISOString(),
      cliente: { nome: form.nome, telefone: form.telefone, email: form.email, endereco: form.endereco },
      plano: plano ? { id: plano.id, nome: plano.name, velocidade: plano.speed } : null,
      vendedor: { id: vid, nome: vendedor?.name },
      fidelidade_meses: 12,
    }, { entityId: inserted?.id, dedupeKey: inserted?.id ? `cliente:${inserted.id}` : undefined });
    toast({ title: "Cliente cadastrado!" });
    setDialogOpen(false);
    setForm({ nome: "", telefone: "", email: "", endereco: "", vendedor_id: "", plano_id: "" });
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-1">Mês</label>
            <Select value={String(mes)} onValueChange={(v) => setMes(Number(v))}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>{MESES.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-1">Ano</label>
            <Select value={String(ano)} onValueChange={(v) => setAno(Number(v))}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>{[2024, 2025, 2026, 2027].map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Novo Cliente</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Cadastrar Cliente</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Nome *" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              <Input placeholder="Telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
              <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="Endereço" value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
              {canManage && (
                <Select value={form.vendedor_id} onValueChange={(v) => setForm({ ...form, vendedor_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Vendedor" /></SelectTrigger>
                  <SelectContent>{vendedores.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                </Select>
              )}
              <Select value={form.plano_id} onValueChange={(v) => setForm({ ...form, plano_id: v })}>
                <SelectTrigger><SelectValue placeholder="Plano" /></SelectTrigger>
                <SelectContent>{planos.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.speed}MB)</SelectItem>)}</SelectContent>
              </Select>
              <Button onClick={handleSubmit} className="w-full">Cadastrar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>Clientes — {MESES[mes - 1]} {ano}</CardTitle></CardHeader>
        <CardContent>
          {clientes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum cliente neste período.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Adesão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nome}</TableCell>
                    <TableCell>{c.telefone || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === "ativo" ? "default" : "destructive"}>{c.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(c.data_adesao).toLocaleDateString("pt-BR")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
