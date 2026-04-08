import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSalesAuth } from "@/hooks/useSalesAuth";
import { useFaixasComissao } from "@/hooks/useFaixasComissao";
import { MESES, formatCurrency, calcularGanho } from "@/lib/sales-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy } from "lucide-react";

const sq = (table: string) => (supabase.from as any)(table);

interface RankEntry {
  name: string;
  totalVendas: number;
  faturamento: number;
  porcentagem: number;
  comissao: number;
  cancelamentos: number;
  score: number;
}

export default function RankingPage() {
  const { salesUser } = useSalesAuth();
  const { faixas } = useFaixasComissao();
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [ranking, setRanking] = useState<RankEntry[]>([]);

  useEffect(() => { loadRanking(); }, [mes, ano, salesUser]);

  const loadRanking = async () => {
    if (!salesUser) return;

    const { data: sellers } = await sq("sales_users").select("id, name").eq("active", true).eq("role", "vendedor");
    if (!sellers?.length) { setRanking([]); return; }

    const { data: allVendas } = await sq("vendas").select("*").eq("mes", mes).eq("ano", ano);
    const { data: allCancels } = await sq("cancelamentos").select("vendedor_id").eq("mes", mes).eq("ano", ano);
    const { data: planItems } = await supabase.from("plan_items").select("id, price").eq("active", true);
    const planos = (planItems || []).map((p: any) => ({ id: p.id, preco: Number(p.price) }));

    const entries: RankEntry[] = sellers.map((s: any) => {
      const sVendas = (allVendas || []).filter((v: any) => v.vendedor_id === s.id);
      const sCancels = (allCancels || []).filter((c: any) => c.vendedor_id === s.id).length;
      const result = calcularGanho(
        sVendas.map((v: any) => ({ plano_id: v.plano_id, quantidade: v.quantidade })),
        planos, [], null, null, sCancels
      );
      return { name: s.name, totalVendas: result.totalVendas, faturamento: result.faturamento, porcentagem: result.porcentagem, comissao: result.comissao, cancelamentos: sCancels, score: result.score };
    });

    entries.sort((a, b) => b.totalVendas - a.totalVendas);
    setRanking(entries);
  };

  const medals = ["🥇", "🥈", "🥉"];

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" /> Ranking — {MESES[mes - 1]} {ano}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ranking.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum vendedor encontrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Vendas</TableHead>
                  <TableHead>Faturamento</TableHead>
                  <TableHead>Faixa</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead>Cancelamentos</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranking.map((r, i) => (
                  <TableRow key={r.name}>
                    <TableCell className="text-lg">{medals[i] || i + 1}</TableCell>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.totalVendas}</TableCell>
                    <TableCell>{formatCurrency(r.faturamento)}</TableCell>
                    <TableCell>{(r.porcentagem * 100).toFixed(0)}%</TableCell>
                    <TableCell>{formatCurrency(r.comissao)}</TableCell>
                    <TableCell>{r.cancelamentos}</TableCell>
                    <TableCell className={r.score >= 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{r.score}</TableCell>
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
