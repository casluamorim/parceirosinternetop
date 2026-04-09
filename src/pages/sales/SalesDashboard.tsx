import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSalesAuth } from "@/hooks/useSalesAuth";
import { useFaixasComissao } from "@/hooks/useFaixasComissao";
import { calcularGanho, calcularCAC, formatCurrency, SALARIO_BASE, MESES } from "@/lib/sales-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  TrendingUp, TrendingDown, DollarSign, Target, Award, AlertTriangle,
  Percent, Users, ShoppingCart, BarChart3, Lightbulb,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const sq = (table: string) => (supabase.from as any)(table);

export default function SalesDashboard() {
  const { salesUser, canManage } = useSalesAuth();
  const { faixas } = useFaixasComissao();
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [vendedorId, setVendedorId] = useState<string>("all");
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [empresaMetrics, setEmpresaMetrics] = useState<any>(null);
  const [prevMetrics, setPrevMetrics] = useState<any>(null);
  const [annualData, setAnnualData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (canManage) {
      sq("sales_users").select("id, name, role").eq("active", true).then(({ data }: any) => {
        setVendedores(data || []);
      });
    }
  }, [canManage]);

  useEffect(() => {
    if (!salesUser) return;
    loadMetrics();
  }, [salesUser, mes, ano, vendedorId, faixas]);

  useEffect(() => {
    if (!salesUser) return;
    loadAnnualData();
  }, [salesUser, ano, vendedorId]);

  const fetchMonthData = async (m: number, a: number, targetVendedorId: string | null) => {
    let vendasQuery = sq("vendas").select("*").eq("mes", m).eq("ano", a);
    if (targetVendedorId) vendasQuery = vendasQuery.eq("vendedor_id", targetVendedorId);
    const { data: vendas } = await vendasQuery;

    const { data: planItems } = await supabase.from("plan_items").select("id, price, name").eq("active", true);
    const planos = (planItems || []).map((p: any) => ({ id: p.id, preco: Number(p.price), name: p.name }));

    const { data: metas } = await sq("metas").select("*").eq("mes", m).eq("ano", a);

    let metaIndQuery = sq("meta_vendedor").select("*").eq("mes", m).eq("ano", a);
    if (targetVendedorId) metaIndQuery = metaIndQuery.eq("vendedor_id", targetVendedorId);
    const { data: metaInd } = await metaIndQuery;

    const { data: recorrencia } = await sq("recorrencia").select("*").eq("mes", m).eq("ano", a).maybeSingle();

    let cancelQuery = sq("cancelamentos").select("id").eq("mes", m).eq("ano", a);
    if (targetVendedorId) cancelQuery = cancelQuery.eq("vendedor_id", targetVendedorId);
    const { data: cancels } = await cancelQuery;

    const { data: investimento } = await sq("investimento_mensal").select("valor").eq("mes", m).eq("ano", a).maybeSingle();

    const result = calcularGanho(
      (vendas || []).map((v: any) => ({ plano_id: v.plano_id, quantidade: v.quantidade })),
      planos,
      (metas || []).map((mt: any) => ({ min_vendas: mt.min_vendas, bonus: Number(mt.bonus) })),
      metaInd?.[0] ? { meta: metaInd[0].meta } : null,
      recorrencia ? { valor: Number(recorrencia.valor) } : null,
      (cancels || []).length,
      faixas
    );

    const investimentoVal = investimento ? Number(investimento.valor) : 0;
    const cac = calcularCAC(investimentoVal, result.totalVendas);

    // Vendas por plano
    const vendasPorPlano: Record<string, { nome: string; qtd: number; fat: number }> = {};
    (vendas || []).forEach((v: any) => {
      const plano = planos.find((p: any) => p.id === v.plano_id);
      if (!plano) return;
      if (!vendasPorPlano[v.plano_id]) vendasPorPlano[v.plano_id] = { nome: plano.name, qtd: 0, fat: 0 };
      vendasPorPlano[v.plano_id].qtd += v.quantidade;
      vendasPorPlano[v.plano_id].fat += v.quantidade * plano.preco;
    });

    return {
      ...result,
      investimento: investimentoVal,
      cac,
      metaIndividual: metaInd?.[0]?.meta || 0,
      vendasPorPlano,
    };
  };

  const loadMetrics = async () => {
    setLoading(true);
    const targetVendedorId = canManage && vendedorId !== "all" ? vendedorId : (!canManage ? salesUser!.id : null);

    const result = await fetchMonthData(mes, ano, targetVendedorId);
    setMetrics(result);

    // Previous month for comparison
    const prevMes = mes === 1 ? 12 : mes - 1;
    const prevAno = mes === 1 ? ano - 1 : ano;
    const prev = await fetchMonthData(prevMes, prevAno, targetVendedorId);
    setPrevMetrics(prev);

    // Empresa metrics (all sellers combined) — only for managers
    if (canManage) {
      const empresa = await fetchMonthData(mes, ano, null);
      // Fetch despesas
      const { data: despesas } = await sq("despesas").select("valor").eq("mes", mes).eq("ano", ano);
      const despesasTotal = (despesas || []).reduce((s: number, d: any) => s + Number(d.valor), 0);

      // Total commissions for all sellers
      const vends = vendedores.filter(v => v.role === "vendedor");
      let comissaoTotal = 0;
      for (const vend of vends) {
        const vendResult = await fetchMonthData(mes, ano, vend.id);
        comissaoTotal += vendResult.comissao + vendResult.bonus + vendResult.recorrencia;
      }

      // Clientes ativos
      const { data: clientesAtivos } = await sq("clientes").select("id").eq("status", "ativo");

      const receitaTotal = empresa.faturamento;
      const lucroLiquido = receitaTotal - comissaoTotal - empresa.investimento - despesasTotal;

      // Previous empresa
      const prevEmpresa = await fetchMonthData(prevMes, prevAno, null);

      setEmpresaMetrics({
        receitaTotal,
        comissaoTotal,
        investimento: empresa.investimento,
        despesasTotal,
        lucroLiquido,
        cac: empresa.cac,
        totalVendas: empresa.totalVendas,
        cancelamentos: empresa.cancelamentos,
        clientesAtivos: (clientesAtivos || []).length,
        vendasPorPlano: empresa.vendasPorPlano,
        prevReceita: prevEmpresa.faturamento,
        prevVendas: prevEmpresa.totalVendas,
      });
    }

    setLoading(false);
  };

  const loadAnnualData = async () => {
    const targetVendedorId = canManage && vendedorId !== "all" ? vendedorId : (!canManage ? salesUser!.id : null);
    const data: any[] = [];
    for (let m = 1; m <= 12; m++) {
      let vq = sq("vendas").select("quantidade").eq("mes", m).eq("ano", ano);
      if (targetVendedorId) vq = vq.eq("vendedor_id", targetVendedorId);
      const { data: vendas } = await vq;
      const total = (vendas || []).reduce((sum: number, v: any) => sum + v.quantidade, 0);
      data.push({ mes: MESES[m - 1].substring(0, 3), vendas: total });
    }
    setAnnualData(data);
  };

  const pctChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const ComparisonBadge = ({ current, previous, isCurrency }: { current: number; previous: number; isCurrency?: boolean }) => {
    const pct = pctChange(current, previous);
    if (pct === 0 && previous === 0) return null;
    const isPositive = pct >= 0;
    return (
      <span className={`text-xs flex items-center gap-0.5 ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {pct >= 0 ? "+" : ""}{pct.toFixed(0)}%
      </span>
    );
  };

  // Previsão do mês
  const daysInMonth = new Date(ano, mes, 0).getDate();
  const daysPassed = mes === now.getMonth() + 1 && ano === now.getFullYear()
    ? Math.max(1, now.getDate())
    : daysInMonth;
  const previsao = metrics ? Math.round((metrics.totalVendas / daysPassed) * daysInMonth) : 0;

  // Alertas
  const alertas: string[] = [];
  if (metrics) {
    if (metrics.cancelamentos > 3) alertas.push("⚠️ Cancelamentos elevados este mês");
    if (metrics.totalVendas < 5 && daysPassed > 10) alertas.push("⚠️ Volume de vendas baixo");
  }
  if (empresaMetrics) {
    if (empresaMetrics.cac > 200) alertas.push("⚠️ CAC acima de R$ 200");
  }

  // Plano mais vendido
  const planoMaisVendido = metrics?.vendasPorPlano
    ? Object.values(metrics.vendasPorPlano as Record<string, { nome: string; qtd: number; fat: number }>).sort((a, b) => b.qtd - a.qtd)[0]
    : null;

  const metaProgress = metrics?.metaIndividual
    ? Math.min(100, (metrics.totalVendas / metrics.metaIndividual) * 100)
    : 0;

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
        {canManage && (
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-1">Vendedor</label>
            <Select value={vendedorId} onValueChange={setVendedorId}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {vendedores.filter((v) => v.role === "vendedor").map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : (
        <Tabs defaultValue="mensal">
          <TabsList>
            <TabsTrigger value="mensal">Mensal</TabsTrigger>
            <TabsTrigger value="anual">Anual</TabsTrigger>
          </TabsList>

          <TabsContent value="mensal" className="space-y-8">
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

            {/* ======= BLOCO 1: VISÃO DO VENDEDOR ======= */}
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                {canManage && vendedorId === "all" ? "Performance Geral de Vendas" : "Meu Desempenho"}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Vendas" value={metrics?.totalVendas || 0} icon={ShoppingCart} color="text-blue-600"
                  comparison={prevMetrics ? <ComparisonBadge current={metrics?.totalVendas || 0} previous={prevMetrics.totalVendas} /> : null} />
                <StatCard label="Faturamento" value={formatCurrency(metrics?.faturamento || 0)} icon={DollarSign} color="text-emerald-600"
                  comparison={prevMetrics ? <ComparisonBadge current={metrics?.faturamento || 0} previous={prevMetrics.faturamento} isCurrency /> : null} />
                <StatCard label="Faixa" value={`${((metrics?.porcentagem || 0) * 100).toFixed(0)}%`} icon={Percent} color="text-cyan-600" />
                <StatCard label="Comissão" value={formatCurrency(metrics?.comissao || 0)} icon={DollarSign} color="text-green-600" />
                <StatCard label="Bônus" value={formatCurrency(metrics?.bonus || 0)} icon={Award} color="text-yellow-600" />
                <StatCard label="Recorrência" value={formatCurrency(metrics?.recorrencia || 0)} icon={TrendingUp} color="text-purple-600" />
                <StatCard label="Cancelamentos" value={metrics?.cancelamentos || 0} icon={AlertTriangle} color="text-destructive" />
                <StatCard label="Score" value={metrics?.score || 0} icon={Target} color="text-indigo-600" />
              </div>

              {/* Meta progress */}
              {metrics?.metaIndividual > 0 && (
                <Card className="mt-4">
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
              <Card className="mt-4">
                <CardContent className="p-4">
                  <p className="text-sm font-medium mb-2">Faixas de Comissão</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {faixas.map((f) => (
                      <span key={`${f.min}-${f.max}`} className={`px-2 py-1 rounded ${metrics?.totalVendas >= f.min ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {f.min}-{f.max} → {(f.percentual * 100).toFixed(0)}%
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Previsão */}
              <Card className="mt-4">
                <CardContent className="p-4 flex items-center gap-3">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">Previsão do Mês</p>
                    <p className="text-xs text-muted-foreground">
                      Com o ritmo atual ({metrics?.totalVendas} vendas em {daysPassed} dias), projeção de <strong>{previsao} vendas</strong> até o fim do mês.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Plano mais vendido */}
              {planoMaisVendido && (
                <Card className="mt-4">
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
              <Card className="mt-4 bg-[#1800ad] text-white">
                <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-white/70 text-sm">Ganho Total do Mês</p>
                    <p className="text-3xl font-bold">{formatCurrency(metrics?.total || 0)}</p>
                  </div>
                  <div className="text-right text-sm text-white/60">
                    <p>Salário base: {formatCurrency(SALARIO_BASE)}</p>
                    <p>+ Comissão ({((metrics?.porcentagem || 0) * 100).toFixed(0)}%)</p>
                    <p>+ Bônus + Recorrência</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ======= BLOCO 2: VISÃO DA EMPRESA (FINANCEIRO/ADMIN) ======= */}
            {canManage && empresaMetrics && (
              <div>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Visão da Empresa
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Receita Total" value={formatCurrency(empresaMetrics.receitaTotal)} icon={DollarSign} color="text-emerald-600"
                    comparison={<ComparisonBadge current={empresaMetrics.receitaTotal} previous={empresaMetrics.prevReceita} isCurrency />} />
                  <StatCard label="Comissões Pagas" value={formatCurrency(empresaMetrics.comissaoTotal)} icon={DollarSign} color="text-orange-600" />
                  <StatCard label="Investimento Mkt" value={formatCurrency(empresaMetrics.investimento)} icon={DollarSign} color="text-blue-600" />
                  <StatCard label="Despesas Gerais" value={formatCurrency(empresaMetrics.despesasTotal)} icon={DollarSign} color="text-red-600" />
                  <StatCard label="CAC" value={empresaMetrics.totalVendas > 0 ? formatCurrency(empresaMetrics.cac) : "Sem dados"} icon={Target} color="text-pink-600" />
                  <StatCard label="Clientes Ativos" value={empresaMetrics.clientesAtivos} icon={Users} color="text-teal-600" />
                  <StatCard label="Vendas (Empresa)" value={empresaMetrics.totalVendas} icon={ShoppingCart} color="text-blue-600"
                    comparison={<ComparisonBadge current={empresaMetrics.totalVendas} previous={empresaMetrics.prevVendas} />} />
                  <StatCard label="Cancelamentos" value={empresaMetrics.cancelamentos} icon={AlertTriangle} color="text-destructive" />
                </div>

                {/* Lucro Líquido */}
                <Card className={`mt-4 ${empresaMetrics.lucroLiquido >= 0 ? "bg-emerald-600" : "bg-red-600"} text-white`}>
                  <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-white/70 text-sm">Lucro Líquido do Mês</p>
                      <p className="text-3xl font-bold">{formatCurrency(empresaMetrics.lucroLiquido)}</p>
                    </div>
                    <div className="text-right text-sm text-white/60">
                      <p>Receita: {formatCurrency(empresaMetrics.receitaTotal)}</p>
                      <p>- Comissões: {formatCurrency(empresaMetrics.comissaoTotal)}</p>
                      <p>- Marketing: {formatCurrency(empresaMetrics.investimento)}</p>
                      <p>- Despesas: {formatCurrency(empresaMetrics.despesasTotal)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="anual" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Mês — {ano}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
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
          </TabsContent>
        </Tabs>
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
