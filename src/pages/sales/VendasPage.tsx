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
import { Plus, Trash2, Upload, Download } from "lucide-react";
import { ImportSalesDialog } from "@/components/sales/ImportSalesDialog";
import { ExportSalesDialog } from "@/components/sales/ExportSalesDialog";

const sq = (table: string) => (supabase.from as any)(table);

export default function VendasPage() {
  const { salesUser, canManage } = useSalesAuth();
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [vendas, setVendas] = useState<any[]>([]);
  const [planos, setPlanos] = useState<any[]>([]);
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ vendedor_id: "", plano_id: "", quantidade: "1" });
  const [loading, setLoading] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [mes, ano, salesUser]);

  const loadData = async () => {
    if (!salesUser) return;
    setLoading(true);

    const { data: planItems } = await supabase.from("plan_items").select("id, name, speed").eq("active", true);
    setPlanos(planItems || []);

    if (canManage) {
      const { data: sellers } = await sq("sales_users").select("id, name").eq("active", true);
      setVendedores(sellers || []);
    }

    let query = sq("vendas").select("*").eq("mes", mes).eq("ano", ano).order("created_at", { ascending: false });
    const { data } = await query;

    // Enrich with names
    const enriched = await Promise.all(
      (data || []).map(async (v: any) => {
        const seller = canManage
          ? (await sq("sales_users").select("name").eq("id", v.vendedor_id).maybeSingle()).data
          : { name: salesUser.name };
        const plan = planItems?.find((p) => p.id === v.plano_id);
        return { ...v, vendedor_name: seller?.name || "—", plano_name: plan ? `${plan.name} (${plan.speed}MB)` : "—" };
      })
    );

    setVendas(enriched);
    setLoading(false);
  };

  const handleSubmit = async () => {
    const vendedorIdFinal = canManage ? form.vendedor_id : salesUser!.id;
    if (!vendedorIdFinal || !form.plano_id || !form.quantidade) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    const qty = parseInt(form.quantidade);
    if (qty <= 0) {
      toast({ title: "Quantidade deve ser positiva", variant: "destructive" });
      return;
    }

    // Validate: not future month
    const currentDate = new Date();
    if (ano > currentDate.getFullYear() || (ano === currentDate.getFullYear() && mes > currentDate.getMonth() + 1)) {
      toast({ title: "Não é permitido registrar vendas em mês futuro", variant: "destructive" });
      return;
    }

    const { error } = await sq("vendas").insert({
      vendedor_id: vendedorIdFinal,
      plano_id: form.plano_id,
      quantidade: qty,
      mes,
      ano,
    });

    if (error) {
      toast({ title: "Erro ao registrar venda", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Venda registrada com sucesso!" });
    setDialogOpen(false);
    setForm({ vendedor_id: "", plano_id: "", quantidade: "1" });
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta venda?")) return;
    await sq("vendas").delete().eq("id", id);
    toast({ title: "Venda excluída" });
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
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />Importar
          </Button>
          <Button variant="outline" onClick={() => setExportOpen(true)}>
            <Download className="w-4 h-4 mr-2" />Exportar
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />Nova Venda</Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar Venda</DialogTitle></DialogHeader>
            <div className="space-y-4">
              {canManage && (
                <div>
                  <label className="text-sm font-medium block mb-1">Vendedor</label>
                  <Select value={form.vendedor_id} onValueChange={(v) => setForm({ ...form, vendedor_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{vendedores.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <label className="text-sm font-medium block mb-1">Plano</label>
                <Select value={form.plano_id} onValueChange={(v) => setForm({ ...form, plano_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{planos.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.speed}MB)</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Quantidade</label>
                <Input type="number" min="1" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: e.target.value })} />
              </div>
              <Button onClick={handleSubmit} className="w-full">Registrar</Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <ImportSalesDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        plans={planos}
        vendedorId={salesUser?.id || ""}
        canManage={canManage}
        vendedores={vendedores}
        onSuccess={loadData}
      />
      <ExportSalesDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        canManage={canManage}
        vendedorId={salesUser?.id || ""}
        vendedores={vendedores}
      />

      <Card>
        <CardHeader><CardTitle>Vendas — {MESES[mes - 1]} {ano}</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
          ) : vendas.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma venda registrada neste período.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {canManage && <TableHead>Vendedor</TableHead>}
                  <TableHead>Plano</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Data</TableHead>
                  {canManage && <TableHead className="w-12"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendas.map((v) => (
                  <TableRow key={v.id}>
                    {canManage && <TableCell>{v.vendedor_name}</TableCell>}
                    <TableCell>{v.plano_name}</TableCell>
                    <TableCell>{v.quantidade}</TableCell>
                    <TableCell>{new Date(v.created_at).toLocaleDateString("pt-BR")}</TableCell>
                    {canManage && (
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)}>
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
