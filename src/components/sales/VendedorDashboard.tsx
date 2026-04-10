import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFaixasComissao } from "@/hooks/useFaixasComissao";
import { calcularGanho, formatCurrency, SALARIO_BASE, MESES } from "@/lib/sales-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  TrendingUp, TrendingDown, DollarSign, Target, Award, AlertTriangle,
  Percent, ShoppingCart, Lightbulb, Trophy,
} from "lucide-react";

const sq = (table: string) => (supabase.from as any)(table);

interface Props {
  vendedorId: string;
  vendedorName: string;
  mes: number;
  ano: number;
  setMes: (m: number) => void;
  setAno: (a: number) => void;
  showFilters?: boolean;
}

export default function VendedorDashboard({ vendedorId, vendedorName, mes, ano, setMes, setAno, showFilters = true }: Props) {
  const { faixas } = useFaixasComissao();
  const now = new Date();
  const [metrics, setMetrics] = useState<any>(null);
  const [prevMetrics, setPrevMetrics] = useState<any>(null);
  const [annualData, setAnnualData] = useState<any[]>([]);
  const [ranking, setRanking] = useState<{ pos: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, [vendedorId, mes, ano, faixas]);

  const fetchMonth = async (m: number, a: number) => {
    const { data: vendas } = await sq("vendas").select("*").eq("mes", m).eq("ano", a).eq("vendedor_id", vendedorId);
    const { data: planItems } = await supabase.from("plan_items").select("id, price, name").eq("active", true);
    const planos = (planItems || []).map((p: any) => ({ id: p.id, preco: Number(p.price), name: p.name }));
    const { data: metas } = await sq("metas").select("*").eq("mes", m).eq("ano", a);
    const { data: metaInd } = await sq("meta_vendedor").select("*").eq("mes", m).eq("ano", a).eq("vendedor_id", vendedorId);
    const { data: recorrencia } = await sq("recorrencia").select("*").eq("mes", m).eq("ano", a).maybeSingle();
    const { data: cancels } = await sq("cancelamentos").select("id").eq("mes", m).eq("ano", a).eq("vendedor_id", vendedorId);

    const result = calcularGanho(
      (vendas || []).map((v: any) => ({ plano_id: v.plano_id, quantidade: v.quantidade })),
      planos,
      (metas || []).map((mt: any) => ({ min_vendas: mt.min_vendas, bonus: Number(mt.bonus) })),
      metaInd?.[0] ? { meta: metaInd[0].meta } : null,
      recorrencia ? { valor: Number(recorrencia.valor) } : null,
      (cancels || []).length, faixas
    );

    const vendasPorPlano: Record<string, { nome: string; qtd: number; fat: number }> = {};
    (vendas || []).forEach((v: any) => {
      const plano = planos.find((p: any) => p.id === v.plano_id);
      if (!plano) return;
      if (!vendasPorPlano[v.plano_id]) vendasPorPlano[v.plano_id] = { nome: plano.name, qtd: 0, fat: 0 };
      vendasPorPlano[v.plano_id].qtd += v.quantidade;
      vendasPorPlano[v.plano_id].fat += v.quantidade * plano.preco;
    });

    return { ...result, metaIndividual: metaInd?.[0]?.meta || 0, vendasPorPlano };
  };

  const loadAll = async () => {
    setLoading(true);
    const [current, prev] = await Promise.all([
      fetchMonth(mes, ano),
      fetchMonth(mes === 1 ? 12 : mes - 1, mes === 1 ? ano - 1 : ano),
    ]);
    setMetrics(current);
    setPrevMetrics(prev);

    // Ranking position
    const { data: sellers } = await sq("sales_users").select("id").eq("active", true).eq("role", "vendedor");
    if (sellers?.length) {
      const { data: allVendas } = await sq("vendas").select("vendedor_id, quantidade").eq("mes", mes).eq("ano", ano);
      const sellerTotals = sellers.map((s: any) => ({
        id: s.id,
        total: (allVendas || []).filter((v: any) => v.vendedor_id === s.id).reduce((sum: number, v: any) => sum + v.quantidade, 0),
      }));
      sellerTotals.sort((a: any, b: any) => b.total - a.total);
      const pos = sellerTotals.findIndex((s: any) => s.id === vendedorId) + 1;
      setRanking({ pos, total: sellerTotals.length });
    }

    // Annual chart
    const chart: any[] = [];
    for (let m = 1; m <= 12; m++) {
      const { data: v } = await sq("vendas").select("quantidade").eq("mes", m).eq("ano", ano).eq("vendedor_id", vendedorId);
      chart.push({ mes: MESES[m - 1].substring(0, 3), vendas: (v || []).reduce((s: number, x: any) => s + x.quantidade, 0) });
    }
    setAnnualData(chart);
    setLoading(false);
  };

  const pctChange = (c: number, p: number) => p === 0 ? (c > 0 ? 100 : 0) : ((c - p) / p) * 100;

  const Badge = ({ current, previous }: { current: number; previous: number }) => {
    const pct = pctChange(current, previous);
    if (pct === 0 && previous === 0) return null;
    const pos = pct >= 0;
    return (
      <span className={`text-xs flex items-center gap-0.5 ${pos ? "text-emerald-600" : "text-red-600"}`}>
        {pos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {pct >= 0 ? "+" : ""}{pct.toFixed(0)}%
      </span>
    );
  };

  const daysInMonth = new Date(ano, mes, 0).getDate();
  const daysPassed = mes === now.getMonth() + 1 && ano === now.getFullYear() ? Math.max(1, now.getDate()) : daysInMonth;
  const previsao = metrics ? Math.round((metrics.totalVendas / daysPassed) * daysInMonth) : 0;
  const metaProgress = metrics?.metaIndividual ? Math.min(100, (metrics.totalVendas / metrics.metaIndividual) * 100) : 0;

  const planoMaisVendido = metrics?.vendasPorPlano
    ? Object.values(metrics.vendasPorPlano as Record<string, { nome: string; qtd: number; fat: number }>).sort((a, b) => b.qtd - a.qtd)[0]
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap gap-3 items-end justify-between">
        {showFilters && (
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
        )}
        <h2 className="text-lg font-bold">{vendedorName}</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : metrics && (
        <div className="space-y-6">
          {/* Ranking badge */}
          {ranking && (
            <Card className="bg-indigo-50 border-indigo-200">
              <CardContent className="p-4 flex items-center gap-3">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <p className="text-sm font-medium">Posição no Ranking: <strong>{ranking.pos}º</strong> de {ranking.total} vendedores</p>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Vendas" value={metrics.totalVendas} icon={ShoppingCart} color="text-blue-600"
              comparison={prevMetrics && <Badge current={metrics.totalVendas} previous={prevMetrics.totalVendas} />} />
            <StatCard label="Faturamento" value={formatCurrency(metrics.faturamento)} icon={DollarSign} color="text-emerald-600"
              comparison={prevMetrics && <Badge current={metrics.faturamento} previous={prevMetrics.faturamento} />} />
            <StatCard label="Faixa" value={`${((metrics.porcentagem || 0) * 100).toFixed(0)}%`} icon={Percent} color="text-cyan-600" />
            <StatCard label="Comissão" value={formatCurrency(metrics.comissao)} icon={DollarSign} color="text-green-600" />
            <StatCard label="Bônus" value={formatCurrency(metrics.bonus)} icon={Award} color="text-yellow-600" />
            <StatCard label="Recorrência" value={formatCurrency(metrics.recorrencia)} icon={TrendingUp} color="text-purple-600" />
            <StatCard label="Cancelamentos" value={metrics.cancelamentos} icon={AlertTriangle} color="text-destructive" />
            <StatCard label="Score" value={metrics.score} icon={Target} color="text-indigo-600" />
          </div>

          {/* Meta progress */}
          {metrics.metaIndividual > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium flex items-center gap-1"><Target className="w-4 h-4" /> Meta Individual</span>
                  <span>{metrics.totalVendas} / {metrics.metaIndividual} vendas</span>
                </div>
                <Progress value={metaProgress} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">{metaProgress.toFixed(0)}% concluída</p>
              </CardContent>
            </Card>
          )}

          {/* Faixas */}
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-2">Faixas de Comissão</p>
              <div className="flex flex-wrap gap-2 text-xs">
                {faixas.map((f) => (
                  <span key={`${f.min}-${f.max}`} className={`px-2 py-1 rounded ${metrics.totalVendas >= f.min ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {f.min}-{f.max} → {(f.percentual * 100).toFixed(0)}%
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Previsão */}
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Previsão do Mês</p>
                <p className="text-xs text-muted-foreground">
                  Com o ritmo atual ({metrics.totalVendas} vendas em {daysPassed} dias), projeção de <strong>{previsao} vendas</strong> até o fim do mês.
                </p>
              </div>
            </CardContent>
          </Card>

          {planoMaisVendido && (
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Award className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">Plano Mais Vendido</p>
                  <p className="text-xs text-muted-foreground">{planoMaisVendido.nome} — {planoMaisVendido.qtd} vendas ({formatCurrency(planoMaisVendido.fat)})</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ganho Total */}
          <Card className="bg-[#1800ad] text-white">
            <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-white/70 text-sm">💰 Ganho Total do Mês</p>
                <p className="text-3xl font-bold">{formatCurrency(metrics.total)}</p>
              </div>
              <div className="text-right text-sm text-white/60">
                <p>Salário base: {formatCurrency(SALARIO_BASE)}</p>
                <p>+ Comissão ({((metrics.porcentagem || 0) * 100).toFixed(0)}%)</p>
                <p>+ Bônus + Recorrência</p>
              </div>
            </CardContent>
          </Card>

          {/* Chart anual */}
          <Card>
            <CardHeader><CardTitle className="text-base">Vendas por Mês — {ano}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={annualData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="vendas" fill="#1800ad" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, comparison }: {
  label: string; value: string | number; icon: any; color: string; comparison?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${color}`} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
          {comparison}
        </div>
        <div className="text-xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
