import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSalesAuth } from "@/hooks/useSalesAuth";
import { useFaixasComissao } from "@/hooks/useFaixasComissao";
import { calcularGanho, calcularCAC, formatCurrency, MESES } from "@/lib/sales-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import {
  TrendingUp, TrendingDown, DollarSign, Target, Award, AlertTriangle,
  Users, ShoppingCart, BarChart3, Plus, FileDown, Receipt,
} from "lucide-react";
import { Link } from "react-router-dom";
import VendedorDashboard from "@/components/sales/VendedorDashboard";

const sq = (table: string) => (supabase.from as any)(table);

export default function SalesDashboard() {
  const { salesUser, canManage } = useSalesAuth();
  const { faixas } = useFaixasComissao();
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());

  // Vendedor → show their own dashboard
  if (!canManage && salesUser) {
    return (
      <VendedorDashboard
        vendedorId={salesUser.id}
        vendedorName={salesUser.name}
        mes={mes}
        ano={ano}
        setMes={setMes}
        setAno={setAno}
      />
    );
  }

  return (
    <EmpresaDashboard mes={mes} ano={ano} setMes={setMes} setAno={setAno} />
  );
}

// ==================== EMPRESA DASHBOARD ====================
function EmpresaDashboard({ mes, ano, setMes, setAno }: {
  mes: number; ano: number; setMes: (m: number) => void; setAno: (a: number) => void;
}) {
  const { faixas } = useFaixasComissao();
  const now = new Date();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [prevMetrics, setPrevMetrics] = useState<any>(null);
  const [monthlyChart, setMonthlyChart] = useState<any[]>([]);

  useEffect(() => { loadAll(); }, [mes, ano, faixas]);

  const loadAll = async () => {
    setLoading(true);
    const [current, prev] = await Promise.all([
      fetchEmpresaMonth(mes, ano, faixas),
      fetchEmpresaMonth(mes === 1 ? 12 : mes - 1, mes === 1 ? ano - 1 : ano, faixas),
    ]);
    setMetrics(current);
    setPrevMetrics(prev);

    // Chart data for the year
    const chartData: any[] = [];
    for (let m = 1; m <= 12; m++) {
      const d = await fetchEmpresaMonth(m, ano, faixas);
      chartData.push({
        mes: MESES[m - 1].substring(0, 3),
        receita: d.receitaTotal,
        lucro: d.lucroLiquido,
      });
    }
    setMonthlyChart(chartData);
    setLoading(false);
  };

  const pctChange = (c: number, p: number) => {
    if (p === 0) return c > 0 ? 100 : 0;
    return ((c - p) / p) * 100;
  };

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

  // Alertas
  const alertas: string[] = [];
  if (metrics) {
    if (metrics.cac > 200) alertas.push("⚠️ CAC acima de R$ 200");
    if (metrics.lucroLiquido < 0) alertas.push("⚠️ Lucro negativo este mês");
    if (metrics.cancelamentos > 3) alertas.push("⚠️ Cancelamentos elevados");
    if (metrics.totalVendas < 5) alertas.push("⚠️ Volume de vendas baixo");
  }

  // Plano mais vendido / lucrativo
  const planoMaisVendido = metrics?.vendasPorPlano
    ? Object.values(metrics.vendasPorPlano as Record<string, { nome: string; qtd: number; fat: number }>).sort((a, b) => b.qtd - a.qtd)[0]
    : null;
  const planoMaisLucrativo = metrics?.vendasPorPlano
    ? Object.values(metrics.vendasPorPlano as Record<string, { nome: string; qtd: number; fat: number }>).sort((a, b) => b.fat - a.fat)[0]
    : null;

  return (
    <div className="space-y-6">
      {/* Top bar: filters + quick actions */}
      <div className="flex flex-wrap gap-3 items-end justify-between">
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
        <div className="flex gap-2">
          <Link to="/sales/vendas"><Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> Nova Venda</Button></Link>
          <Link to="/sales/despesas"><Button size="sm" variant="outline" className="gap-1"><Receipt className="w-4 h-4" /> Nova Despesa</Button></Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : metrics && (
        <div className="space-y-6">
          {/* Alertas */}
          {alertas.length > 0 && (
            <div className="space-y-2">
              {alertas.map((a, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {a}
                </div>
              ))}
            </div>
          )}

          {/* LUCRO LÍQUIDO - DESTAQUE PRINCIPAL */}
          <Card className={`${metrics.lucroLiquido >= 0 ? "bg-emerald-600" : "bg-red-600"} text-white`}>
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-white/70 text-sm font-medium">💵 Lucro Líquido do Mês</p>
                  <p className="text-4xl font-bold mt-1">{formatCurrency(metrics.lucroLiquido)}</p>
                  {prevMetrics && <Badge current={metrics.lucroLiquido} previous={prevMetrics.lucroLiquido} />}
                </div>
                <div className="text-right text-sm text-white/80 space-y-0.5">
                  <p>Receita: {formatCurrency(metrics.receitaTotal)}</p>
                  <p>− Comissões: {formatCurrency(metrics.comissaoTotal)}</p>
                  <p>− Marketing: {formatCurrency(metrics.investimento)}</p>
                  <p>− Despesas: {formatCurrency(metrics.despesasTotal)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CARDS MÉDIOS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Receita Total" value={formatCurrency(metrics.receitaTotal)} icon={DollarSign} color="text-emerald-600"
              comparison={prevMetrics && <Badge current={metrics.receitaTotal} previous={prevMetrics.receitaTotal} />} />
            <StatCard label="Comissões Pagas" value={formatCurrency(metrics.comissaoTotal)} icon={DollarSign} color="text-orange-600" />
            <StatCard label="Investimento Mkt" value={formatCurrency(metrics.investimento)} icon={DollarSign} color="text-blue-600" />
            <StatCard label="CAC" value={metrics.totalVendas > 0 ? formatCurrency(metrics.cac) : "Sem dados"} icon={Target} color="text-pink-600" />
          </div>

          {/* DRE SIMPLES */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-5 h-5" /> DRE Simplificado</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b"><span>Receita Total</span><span className="font-semibold text-emerald-700">{formatCurrency(metrics.receitaTotal)}</span></div>
              <div className="flex justify-between py-1 border-b text-muted-foreground"><span>− Comissões</span><span>{formatCurrency(metrics.comissaoTotal)}</span></div>
              <div className="flex justify-between py-1 border-b text-muted-foreground"><span>− Marketing</span><span>{formatCurrency(metrics.investimento)}</span></div>
              <div className="flex justify-between py-1 border-b text-muted-foreground"><span>− Despesas Gerais</span><span>{formatCurrency(metrics.despesasTotal)}</span></div>
              <div className={`flex justify-between py-2 font-bold text-base ${metrics.lucroLiquido >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                <span>= Lucro Líquido</span><span>{formatCurrency(metrics.lucroLiquido)}</span>
              </div>
            </CardContent>
          </Card>

          {/* INDICADORES ADICIONAIS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total de Vendas" value={metrics.totalVendas} icon={ShoppingCart} color="text-blue-600"
              comparison={prevMetrics && <Badge current={metrics.totalVendas} previous={prevMetrics.totalVendas} />} />
            <StatCard label="Cancelamentos" value={metrics.cancelamentos} icon={AlertTriangle} color="text-destructive" />
            <StatCard label="Clientes Ativos" value={metrics.clientesAtivos} icon={Users} color="text-teal-600" />
            <StatCard label="Despesas Gerais" value={formatCurrency(metrics.despesasTotal)} icon={Receipt} color="text-red-600" />
          </div>

          {/* Planos destaque */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {planoMaisVendido && (
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Award className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">Plano Mais Vendido</p>
                    <p className="text-xs text-muted-foreground">{planoMaisVendido.nome} — {planoMaisVendido.qtd} vendas</p>
                  </div>
                </CardContent>
              </Card>
            )}
            {planoMaisLucrativo && (
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium">Plano Mais Lucrativo</p>
                    <p className="text-xs text-muted-foreground">{planoMaisLucrativo.nome} — {formatCurrency(planoMaisLucrativo.fat)}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* GRÁFICOS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Receita por Mês — {ano}</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Bar dataKey="receita" fill="#059669" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Lucro por Mês — {ano}</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Line type="monotone" dataKey="lucro" stroke="#1800ad" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// Fetch empresa data for a given month
async function fetchEmpresaMonth(m: number, a: number, faixas: any[]) {
  const { data: vendas } = await sq("vendas").select("*").eq("mes", m).eq("ano", a);
  const { data: planItems } = await supabase.from("plan_items").select("id, price, name").eq("active", true);
  const planos = (planItems || []).map((p: any) => ({ id: p.id, preco: Number(p.price), name: p.name }));
  const { data: metas } = await sq("metas").select("*").eq("mes", m).eq("ano", a);
  const { data: recorrencia } = await sq("recorrencia").select("*").eq("mes", m).eq("ano", a).maybeSingle();
  const { data: cancels } = await sq("cancelamentos").select("id").eq("mes", m).eq("ano", a);
  const { data: investimento } = await sq("investimento_mensal").select("valor").eq("mes", m).eq("ano", a).maybeSingle();
  const { data: despesas } = await sq("despesas").select("valor").eq("mes", m).eq("ano", a);
  const { data: clientesAtivos } = await sq("clientes").select("id").eq("status", "ativo");

  const result = calcularGanho(
    (vendas || []).map((v: any) => ({ plano_id: v.plano_id, quantidade: v.quantidade })),
    planos,
    (metas || []).map((mt: any) => ({ min_vendas: mt.min_vendas, bonus: Number(mt.bonus) })),
    null, recorrencia ? { valor: Number(recorrencia.valor) } : null,
    (cancels || []).length, faixas
  );

  const investimentoVal = investimento ? Number(investimento.valor) : 0;
  const despesasTotal = (despesas || []).reduce((s: number, d: any) => s + Number(d.valor), 0);

  // Comissão total: compute per seller
  const { data: sellers } = await sq("sales_users").select("id").eq("active", true).eq("role", "vendedor");
  let comissaoTotal = 0;
  for (const seller of (sellers || [])) {
    const { data: sv } = await sq("vendas").select("*").eq("mes", m).eq("ano", a).eq("vendedor_id", seller.id);
    const { data: sc } = await sq("cancelamentos").select("id").eq("mes", m).eq("ano", a).eq("vendedor_id", seller.id);
    const { data: smi } = await sq("meta_vendedor").select("*").eq("mes", m).eq("ano", a).eq("vendedor_id", seller.id);
    const sr = calcularGanho(
      (sv || []).map((v: any) => ({ plano_id: v.plano_id, quantidade: v.quantidade })),
      planos,
      (metas || []).map((mt: any) => ({ min_vendas: mt.min_vendas, bonus: Number(mt.bonus) })),
      smi?.[0] ? { meta: smi[0].meta } : null,
      recorrencia ? { valor: Number(recorrencia.valor) } : null,
      (sc || []).length, faixas
    );
    comissaoTotal += sr.comissao + sr.bonus + sr.recorrencia;
  }

  // Vendas por plano
  const vendasPorPlano: Record<string, { nome: string; qtd: number; fat: number }> = {};
  (vendas || []).forEach((v: any) => {
    const plano = planos.find((p: any) => p.id === v.plano_id);
    if (!plano) return;
    if (!vendasPorPlano[v.plano_id]) vendasPorPlano[v.plano_id] = { nome: plano.name, qtd: 0, fat: 0 };
    vendasPorPlano[v.plano_id].qtd += v.quantidade;
    vendasPorPlano[v.plano_id].fat += v.quantidade * plano.preco;
  });

  const receitaTotal = result.faturamento;
  const cac = calcularCAC(investimentoVal, result.totalVendas);
  const lucroLiquido = receitaTotal - comissaoTotal - investimentoVal - despesasTotal;

  return {
    receitaTotal,
    comissaoTotal,
    investimento: investimentoVal,
    despesasTotal,
    lucroLiquido,
    cac,
    totalVendas: result.totalVendas,
    cancelamentos: result.cancelamentos,
    clientesAtivos: (clientesAtivos || []).length,
    vendasPorPlano,
  };
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
