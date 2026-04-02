import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSalesAuth } from "@/hooks/useSalesAuth";
import { MESES, formatCurrency } from "@/lib/sales-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

const sq = (table: string) => (supabase.from as any)(table);

export default function MetasPage() {
  const { salesUser } = useSalesAuth();
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [metas, setMetas] = useState<any[]>([]);
  const [metasInd, setMetasInd] = useState<any[]>([]);
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogIndOpen, setDialogIndOpen] = useState(false);
  const [form, setForm] = useState({ min_vendas: "", bonus: "" });
  const [formInd, setFormInd] = useState({ vendedor_id: "", meta: "" });

  useEffect(() => { loadData(); }, [mes, ano, salesUser]);

  const loadData = async () => {
    if (!salesUser) return;
    const { data: m } = await sq("metas").select("*").eq("mes", mes).eq("ano", ano).order("min_vendas");
    setMetas(m || []);
    const { data: mi } = await sq("meta_vendedor").select("*").eq("mes", mes).eq("ano", ano);
    setMetasInd(mi || []);
    const { data: v } = await sq("sales_users").select("id, name").eq("active", true);
    setVendedores(v || []);
  };

  const addMeta = async () => {
    if (!form.min_vendas || !form.bonus) return;
    const { error } = await sq("metas").insert({ min_vendas: parseInt(form.min_vendas), bonus: parseFloat(form.bonus), mes, ano });
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Meta adicionada!" });
    setDialogOpen(false);
    setForm({ min_vendas: "", bonus: "" });
    loadData();
  };

  const addMetaInd = async () => {
    if (!formInd.vendedor_id || !formInd.meta) return;
    const { error } = await sq("meta_vendedor").insert({ vendedor_id: formInd.vendedor_id, meta: parseInt(formInd.meta), mes, ano });
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Meta individual adicionada!" });
    setDialogIndOpen(false);
    setFormInd({ vendedor_id: "", meta: "" });
    loadData();
  };

  const deleteMeta = async (id: string) => {
    if (!confirm("Excluir?")) return;
    await sq("metas").delete().eq("id", id);
    loadData();
  };

  const deleteMetaInd = async (id: string) => {
    if (!confirm("Excluir?")) return;
    await sq("meta_vendedor").delete().eq("id", id);
    loadData();
  };

  return (
    <div className="space-y-6">
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

      {/* Metas por faixa */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Metas por Faixa</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />Adicionar</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova Meta</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input type="number" placeholder="Mínimo de vendas" value={form.min_vendas} onChange={(e) => setForm({ ...form, min_vendas: e.target.value })} />
                <Input type="number" placeholder="Bônus (R$)" value={form.bonus} onChange={(e) => setForm({ ...form, bonus: e.target.value })} />
                <Button onClick={addMeta} className="w-full">Adicionar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {metas.length === 0 ? <p className="text-muted-foreground text-center py-4">Nenhuma meta configurada.</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Mín. Vendas</TableHead><TableHead>Bônus</TableHead><TableHead className="w-12"></TableHead></TableRow></TableHeader>
              <TableBody>
                {metas.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.min_vendas} vendas</TableCell>
                    <TableCell>{formatCurrency(Number(m.bonus))}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => deleteMeta(m.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Metas individuais */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Metas Individuais (+R$200 bônus)</CardTitle>
          <Dialog open={dialogIndOpen} onOpenChange={setDialogIndOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-1" />Adicionar</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Meta Individual</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Select value={formInd.vendedor_id} onValueChange={(v) => setFormInd({ ...formInd, vendedor_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Vendedor" /></SelectTrigger>
                  <SelectContent>{vendedores.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" placeholder="Meta de vendas" value={formInd.meta} onChange={(e) => setFormInd({ ...formInd, meta: e.target.value })} />
                <Button onClick={addMetaInd} className="w-full">Adicionar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {metasInd.length === 0 ? <p className="text-muted-foreground text-center py-4">Nenhuma meta individual.</p> : (
            <Table>
              <TableHeader><TableRow><TableHead>Vendedor</TableHead><TableHead>Meta</TableHead><TableHead className="w-12"></TableHead></TableRow></TableHeader>
              <TableBody>
                {metasInd.map((m) => {
                  const seller = vendedores.find((v) => v.id === m.vendedor_id);
                  return (
                    <TableRow key={m.id}>
                      <TableCell>{seller?.name || "—"}</TableCell>
                      <TableCell>{m.meta} vendas</TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => deleteMetaInd(m.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
