import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSalesAuth } from "@/hooks/useSalesAuth";
import { MESES, formatCurrency } from "@/lib/sales-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, DollarSign } from "lucide-react";

const sq = (table: string) => (supabase.from as any)(table);

const CATEGORIAS = [
  "marketing", "salário", "aluguel", "ferramentas", "internet",
  "energia", "impostos", "equipamentos", "transporte", "outros",
];

interface Despesa {
  id: string;
  nome: string;
  valor: number;
  categoria: string;
  mes: number;
  ano: number;
}

export default function DespesasPage() {
  const { canManage } = useSalesAuth();
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Despesa | null>(null);

  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("outros");

  useEffect(() => { load(); }, [mes, ano]);

  const load = async () => {
    setLoading(true);
    const { data } = await sq("despesas").select("*").eq("mes", mes).eq("ano", ano).order("created_at", { ascending: false });
    setDespesas(data || []);
    setLoading(false);
  };

  const openNew = () => {
    setEditing(null);
    setNome("");
    setValor("");
    setCategoria("outros");
    setDialogOpen(true);
  };

  const openEdit = (d: Despesa) => {
    setEditing(d);
    setNome(d.nome);
    setValor(String(d.valor));
    setCategoria(d.categoria);
    setDialogOpen(true);
  };

  const save = async () => {
    const v = parseFloat(valor);
    if (!nome.trim()) { toast({ title: "Nome obrigatório", variant: "destructive" }); return; }
    if (isNaN(v) || v < 0) { toast({ title: "Valor inválido", variant: "destructive" }); return; }

    if (editing) {
      await sq("despesas").update({ nome: nome.trim(), valor: v, categoria }).eq("id", editing.id);
      toast({ title: "Despesa atualizada!" });
    } else {
      await sq("despesas").insert({ nome: nome.trim(), valor: v, categoria, mes, ano });
      toast({ title: "Despesa cadastrada!" });
    }
    setDialogOpen(false);
    load();
  };

  const remove = async (id: string) => {
    await sq("despesas").delete().eq("id", id);
    toast({ title: "Despesa excluída!" });
    load();
  };

  const total = despesas.reduce((s, d) => s + Number(d.valor), 0);
  const byCategoria = despesas.reduce<Record<string, number>>((acc, d) => {
    acc[d.categoria] = (acc[d.categoria] || 0) + Number(d.valor);
    return acc;
  }, {});

  if (!canManage) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Acesso restrito ao financeiro e admin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="w-4 h-4 mr-1" /> Nova Despesa</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Despesa" : "Nova Despesa"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Nome</label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Google Ads Abril" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Valor (R$)</label>
                <Input type="number" min="0" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Categoria</label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={save} className="w-full">{editing ? "Salvar Alterações" : "Cadastrar"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-red-600" />
              <span className="text-xs text-muted-foreground">Total Despesas</span>
            </div>
            <div className="text-xl font-bold">{formatCurrency(total)}</div>
          </CardContent>
        </Card>
        {Object.entries(byCategoria).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([cat, val]) => (
          <Card key={cat}>
            <CardContent className="p-4">
              <span className="text-xs text-muted-foreground capitalize block mb-1">{cat}</span>
              <div className="text-lg font-semibold">{formatCurrency(val)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Despesas — {MESES[mes - 1]} {ano}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
          ) : despesas.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhuma despesa cadastrada neste período.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {despesas.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.nome}</TableCell>
                    <TableCell className="capitalize">{d.categoria}</TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(d.valor))}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(d)}><Pencil className="w-4 h-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir despesa?</AlertDialogTitle>
                              <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => remove(d.id)}>Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
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
