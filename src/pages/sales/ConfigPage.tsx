import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSalesAuth } from "@/hooks/useSalesAuth";
import { MESES, formatCurrency } from "@/lib/sales-utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const sq = (table: string) => (supabase.from as any)(table);

export default function ConfigPage() {
  const { salesUser } = useSalesAuth();
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());

  // Recorrencia
  const [recorrenciaValor, setRecorrenciaValor] = useState("");
  const [recorrenciaId, setRecorrenciaId] = useState<string | null>(null);

  // Investimento
  const [investimentoValor, setInvestimentoValor] = useState("");
  const [investimentoId, setInvestimentoId] = useState<string | null>(null);

  // Commissions
  const [planItems, setPlanItems] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<Record<string, { comissao: string; bonus_extra: string; id?: string }>>({});

  useEffect(() => { loadData(); }, [mes, ano, salesUser]);

  const loadData = async () => {
    if (!salesUser) return;

    // Recorrencia
    const { data: rec } = await sq("recorrencia").select("*").eq("mes", mes).eq("ano", ano).maybeSingle();
    if (rec) { setRecorrenciaValor(String(rec.valor)); setRecorrenciaId(rec.id); }
    else { setRecorrenciaValor(""); setRecorrenciaId(null); }

    // Investimento
    const { data: inv } = await sq("investimento_mensal").select("*").eq("mes", mes).eq("ano", ano).maybeSingle();
    if (inv) { setInvestimentoValor(String(inv.valor)); setInvestimentoId(inv.id); }
    else { setInvestimentoValor(""); setInvestimentoId(null); }

    // Plans + commissions
    const { data: plans } = await supabase.from("plan_items").select("id, name, speed, price").eq("active", true).order("speed");
    setPlanItems(plans || []);

    const { data: comms } = await sq("plan_commissions").select("*");
    const commMap: Record<string, any> = {};
    (comms || []).forEach((c: any) => {
      commMap[c.plan_item_id] = { comissao: String(c.comissao), bonus_extra: String(c.bonus_extra || 0), id: c.id };
    });
    setCommissions(commMap);
  };

  const saveRecorrencia = async () => {
    const val = parseFloat(recorrenciaValor);
    if (isNaN(val) || val < 0) { toast({ title: "Valor inválido", variant: "destructive" }); return; }

    if (recorrenciaId) {
      await sq("recorrencia").update({ valor: val }).eq("id", recorrenciaId);
    } else {
      await sq("recorrencia").insert({ valor: val, mes, ano });
    }
    toast({ title: "Recorrência salva!" });
    loadData();
  };

  const saveInvestimento = async () => {
    const val = parseFloat(investimentoValor);
    if (isNaN(val) || val < 0) { toast({ title: "Valor inválido", variant: "destructive" }); return; }

    if (investimentoId) {
      await sq("investimento_mensal").update({ valor: val }).eq("id", investimentoId);
    } else {
      await sq("investimento_mensal").insert({ valor: val, mes, ano });
    }
    toast({ title: "Investimento salvo!" });
    loadData();
  };

  const saveCommission = async (planId: string) => {
    const c = commissions[planId];
    if (!c) return;
    const comissao = parseFloat(c.comissao);
    const bonus = parseFloat(c.bonus_extra) || 0;

    if (isNaN(comissao) || comissao < 0) { toast({ title: "Comissão inválida", variant: "destructive" }); return; }

    if (c.id) {
      await sq("plan_commissions").update({ comissao, bonus_extra: bonus }).eq("id", c.id);
    } else {
      await sq("plan_commissions").insert({ plan_item_id: planId, comissao, bonus_extra: bonus });
    }
    toast({ title: "Comissão salva!" });
    loadData();
  };

  const updateCommField = (planId: string, field: string, value: string) => {
    setCommissions((prev) => ({
      ...prev,
      [planId]: { ...prev[planId] || { comissao: "0", bonus_extra: "0" }, [field]: value },
    }));
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

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recorrência */}
        <Card>
          <CardHeader>
            <CardTitle>Recorrência</CardTitle>
            <CardDescription>Valor pago por cliente ativo</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Input type="number" placeholder="R$ 0,00" value={recorrenciaValor} onChange={(e) => setRecorrenciaValor(e.target.value)} />
            <Button onClick={saveRecorrencia}><Save className="w-4 h-4 mr-1" />Salvar</Button>
          </CardContent>
        </Card>

        {/* Investimento */}
        <Card>
          <CardHeader>
            <CardTitle>Investimento Mensal</CardTitle>
            <CardDescription>Para cálculo do CAC</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Input type="number" placeholder="R$ 0,00" value={investimentoValor} onChange={(e) => setInvestimentoValor(e.target.value)} />
            <Button onClick={saveInvestimento}><Save className="w-4 h-4 mr-1" />Salvar</Button>
          </CardContent>
        </Card>
      </div>

      {/* Comissões por plano */}
      <Card>
        <CardHeader>
          <CardTitle>Comissões por Plano</CardTitle>
          <CardDescription>Defina a comissão e bônus extra para cada plano</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plano</TableHead>
                <TableHead>Velocidade</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Comissão (R$)</TableHead>
                <TableHead>Bônus Extra (R$)</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {planItems.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.speed}MB</TableCell>
                  <TableCell>{formatCurrency(Number(p.price))}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      className="w-24"
                      value={commissions[p.id]?.comissao || ""}
                      onChange={(e) => updateCommField(p.id, "comissao", e.target.value)}
                      placeholder="0"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      className="w-24"
                      value={commissions[p.id]?.bonus_extra || ""}
                      onChange={(e) => updateCommField(p.id, "bonus_extra", e.target.value)}
                      placeholder="0"
                    />
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => saveCommission(p.id)}>
                      <Save className="w-3 h-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
