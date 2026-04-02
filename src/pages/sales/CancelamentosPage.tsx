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
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

const sq = (table: string) => (supabase.from as any)(table);

export default function CancelamentosPage() {
  const { salesUser, canManage } = useSalesAuth();
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [cancelamentos, setCancelamentos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ cliente_id: "", vendedor_id: "", motivo: "" });

  useEffect(() => { loadData(); }, [mes, ano, salesUser]);

  const loadData = async () => {
    if (!salesUser) return;
    const { data } = await sq("cancelamentos").select("*").eq("mes", mes).eq("ano", ano).order("created_at", { ascending: false });
    setCancelamentos(data || []);

    const { data: clients } = await sq("clientes").select("id, nome").eq("status", "ativo");
    setClientes(clients || []);

    if (canManage) {
      const { data: sellers } = await sq("sales_users").select("id, name").eq("active", true);
      setVendedores(sellers || []);
    }
  };

  const handleSubmit = async () => {
    const vid = canManage ? form.vendedor_id : salesUser!.id;
    if (!vid) { toast({ title: "Selecione o vendedor", variant: "destructive" }); return; }
    const { error } = await sq("cancelamentos").insert({ cliente_id: form.cliente_id || null, vendedor_id: vid, motivo: form.motivo, mes, ano });
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Cancelamento registrado!" });
    setDialogOpen(false);
    setForm({ cliente_id: "", vendedor_id: "", motivo: "" });
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este cancelamento?")) return;
    await sq("cancelamentos").delete().eq("id", id);
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
        {canManage && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Registrar Cancelamento</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Registrar Cancelamento</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Select value={form.vendedor_id} onValueChange={(v) => setForm({ ...form, vendedor_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Vendedor *" /></SelectTrigger>
                  <SelectContent>{vendedores.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={form.cliente_id} onValueChange={(v) => setForm({ ...form, cliente_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Cliente (opcional)" /></SelectTrigger>
                  <SelectContent>{clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
                </Select>
                <Input placeholder="Motivo" value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} />
                <Button onClick={handleSubmit} className="w-full">Registrar</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle>Cancelamentos — {MESES[mes - 1]} {ano}</CardTitle></CardHeader>
        <CardContent>
          {cancelamentos.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum cancelamento neste período.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Data</TableHead>
                  {canManage && <TableHead className="w-12"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {cancelamentos.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.motivo || "Sem motivo informado"}</TableCell>
                    <TableCell>{new Date(c.created_at).toLocaleDateString("pt-BR")}</TableCell>
                    {canManage && (
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    )}
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
