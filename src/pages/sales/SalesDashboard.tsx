import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSalesAuth } from "@/hooks/useSalesAuth";
import { useFaixasComissao } from "@/hooks/useFaixasComissao";
import { calcularGanho, calcularCAC, formatCurrency, SALARIO_BASE, MESES, getPercentualComissao } from "@/lib/sales-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign, Target, Award, AlertTriangle, Percent } from "lucide-react";
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
  }, [salesUser, mes, ano, vendedorId]);

  const loadMetrics = async () => {
    setLoading(true);
    const targetVendedorId = canManage && vendedorId !== "all" ? vendedorId : (!canManage ? salesUser!.id : null);

    let vendasQuery = sq("vendas").select("*").eq("mes", mes).eq("ano", ano);
    if (targetVendedorId) vendasQuery = vendasQuery.eq("vendedor_id", targetVendedorId);
    const { data: vendas } = await vendasQuery;

    const { data: planItems } = await supabase.from("plan_items").select("id, price").eq("active", true);
    const planos = (planItems || []).map((p: any) => ({ id: p.id, preco: Number(p.price) }));

    const { data: metas } = await sq("metas").select("*").eq("mes", mes).eq("ano", ano);

    let metaIndQuery = sq("meta_vendedor").select("*").eq("mes", mes).eq("ano", ano);
    if (targetVendedorId) metaIndQuery = metaIndQuery.eq("vendedor_id", targetVendedorId);
    const { data: metaInd } = await metaIndQuery;

    const { data: recorrencia } = await sq("recorrencia").select("*").eq("mes", mes).eq("ano", ano).maybeSingle();

    let cancelQuery = sq("cancelamentos").select("id").eq("mes", mes).eq("ano", ano);
    if (targetVendedorId) cancelQuery = cancelQuery.eq("vendedor_id", targetVendedorId);
    const { data: cancels } = await cancelQuery;

    // Fetch investimento for CAC calculation
    const { data: investimento } = await sq("investimento_mensal").select("valor").eq("mes", mes).eq("ano", ano).maybeSingle();

    const result = calcularGanho(
      (vendas || []).map((v: any) => ({ plano_id: v.plano_id, quantidade: v.quantidade })),
      planos,
      (metas || []).map((m: any) => ({ min_vendas: m.min_vendas, bonus: Number(m.bonus) })),
      metaInd?.[0] ? { meta: metaInd[0].meta } : null,
      recorrencia ? { valor: Number(recorrencia.valor) } : null,
      (cancels || []).length,
      faixas
    );

    const investimentoVal = investimento ? Number(investimento.valor) : 0;
    const cac = calcularCAC(investimentoVal, result.totalVendas);

    setMetrics({ ...result, investimento: investimentoVal, cac });
    setLoading(false);
  };

  useEffect(() => {
    if (!salesUser) return;
    loadAnnualData();
  }, [salesUser, ano, vendedorId]);

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

  const stats = [
    { label: "Total Vendas", value: metrics?.totalVendas || 0, icon: ShoppingCartIcon, color: "text-blue-600" },
    { label: "Faturamento", value: formatCurrency(metrics?.faturamento || 0), icon: DollarSign, color: "text-emerald-600" },
    { label: "Faixa", value: `${((metrics?.porcentagem || 0) * 100).toFixed(0)}%`, icon: Percent, color: "text-cyan-600" },
    { label: "Comissão", value: formatCurrency(metrics?.comissao || 0), icon: DollarSign, color: "text-green-600" },
    { label: "Bônus", value: formatCurrency(metrics?.bonus || 0), icon: Award, color: "text-yellow-600" },
    { label: "Recorrência", value: formatCurrency(metrics?.recorrencia || 0), icon: TrendingUp, color: "text-purple-600" },
    { label: "Cancelamentos", value: metrics?.cancelamentos || 0, icon: AlertTriangle, color: "text-red-600" },
    { label: "Score", value: metrics?.score || 0, icon: Target, color: "text-indigo-600" },
    { label: "Investimento Mkt", value: formatCurrency(metrics?.investimento || 0), icon: DollarSign, color: "text-orange-600" },
    { label: "CAC", value: metrics?.totalVendas > 0 ? formatCurrency(metrics?.cac || 0) : "Sem dados", icon: Target, color: "text-pink-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-sm font-medium text-muted-foreground block mb-1">Mês</label>
          <Select value={String(mes)} onValueChange={(v) => setMes(Number(v))}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {MESES.map((m, i) => (
                <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground block mb-1">Ano</label>
          <Select value={String(ano)} onValueChange={(v) => setAno(Number(v))}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026, 2027].map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
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

      <Tabs defaultValue="mensal">
        <TabsList>
          <TabsTrigger value="mensal">Mensal</TabsTrigger>
          <TabsTrigger value="anual">Anual</TabsTrigger>
        </TabsList>

        <TabsContent value="mensal" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                  <div className="text-xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Commission Tiers Info */}
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-2">Faixas de Comissão</p>
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { range: "1-25", pct: "20%" },
                  { range: "26-36", pct: "25%" },
                  { range: "37-51", pct: "30%" },
                  { range: "52-72", pct: "35%" },
                  { range: "73-90", pct: "40%" },
                ].map((f) => (
                  <span key={f.range} className={`px-2 py-1 rounded ${metrics?.totalVendas >= parseInt(f.range) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {f.range} vendas → {f.pct}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Total Card */}
          <Card className="bg-[#1800ad] text-white">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Ganho Total do Mês</p>
                <p className="text-3xl font-bold">{formatCurrency(metrics?.total || 0)}</p>
              </div>
              <div className="text-right text-sm text-white/60">
                <p>Salário base: {formatCurrency(SALARIO_BASE)}</p>
                <p>+ Comissão ({((metrics?.porcentagem || 0) * 100).toFixed(0)}% de {formatCurrency(metrics?.faturamento || 0)})</p>
                <p>+ Bônus + Recorrência</p>
              </div>
            </CardContent>
          </Card>
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
    </div>
  );
}

function ShoppingCartIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
    </svg>
  );
}
