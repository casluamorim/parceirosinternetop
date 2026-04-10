import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSalesAuth } from "@/hooks/useSalesAuth";
import { useFaixasComissao } from "@/hooks/useFaixasComissao";
import { calcularGanho, formatCurrency, MESES } from "@/lib/sales-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Users, ChevronLeft, Eye } from "lucide-react";
import VendedorDashboard from "@/components/sales/VendedorDashboard";

const sq = (table: string) => (supabase.from as any)(table);

interface SellerRow {
  id: string;
  name: string;
  totalVendas: number;
  faturamento: number;
  comissao: number;
  score: number;
}

export default function VendedoresPage() {
  const { salesUser } = useSalesAuth();
  const { faixas } = useFaixasComissao();
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [sellers, setSellers] = useState<SellerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => { loadSellers(); }, [mes, ano, faixas]);

  const loadSellers = async () => {
    setLoading(true);
    const { data: users } = await sq("sales_users").select("id, name").eq("active", true).eq("role", "vendedor");
    if (!users?.length) { setSellers([]); setLoading(false); return; }

    const { data: allVendas } = await sq("vendas").select("*").eq("mes", mes).eq("ano", ano);
    const { data: allCancels } = await sq("cancelamentos").select("vendedor_id").eq("mes", mes).eq("ano", ano);
    const { data: planItems } = await supabase.from("plan_items").select("id, price").eq("active", true);
    const planos = (planItems || []).map((p: any) => ({ id: p.id, preco: Number(p.price) }));

    const rows: SellerRow[] = users.map((s: any) => {
      const sv = (allVendas || []).filter((v: any) => v.vendedor_id === s.id);
      const sc = (allCancels || []).filter((c: any) => c.vendedor_id === s.id).length;
      const r = calcularGanho(
        sv.map((v: any) => ({ plano_id: v.plano_id, quantidade: v.quantidade })),
        planos, [], null, null, sc, faixas
      );
      return { id: s.id, name: s.name, totalVendas: r.totalVendas, faturamento: r.faturamento, comissao: r.comissao, score: r.score };
    });

    rows.sort((a, b) => b.totalVendas - a.totalVendas);
    setSellers(rows);
    setLoading(false);
  };

  if (selected) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setSelected(null)} className="gap-1">
          <ChevronLeft className="w-4 h-4" /> Voltar para lista
        </Button>
        <VendedorDashboard vendedorId={selected.id} vendedorName={selected.name} mes={mes} ano={ano} setMes={setMes} setAno={setAno} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Vendedores — {MESES[mes - 1]} {ano}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
          ) : sellers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum vendedor encontrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Vendas</TableHead>
                  <TableHead>Faturamento</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellers.map((s, i) => (
                  <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelected({ id: s.id, name: s.name })}>
                    <TableCell className="text-lg">{["🥇", "🥈", "🥉"][i] || i + 1}</TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.totalVendas}</TableCell>
                    <TableCell>{formatCurrency(s.faturamento)}</TableCell>
                    <TableCell>{formatCurrency(s.comissao)}</TableCell>
                    <TableCell className={s.score >= 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{s.score}</TableCell>
                    <TableCell><Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button></TableCell>
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
