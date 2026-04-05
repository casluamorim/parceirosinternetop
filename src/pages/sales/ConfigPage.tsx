import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSalesAuth } from "@/hooks/useSalesAuth";
import { MESES, formatCurrency, FAIXAS_COMISSAO } from "@/lib/sales-utils";
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

  useEffect(() => { loadData(); }, [mes, ano, salesUser]);

  const loadData = async () => {
    if (!salesUser) return;

    const { data: rec } = await sq("recorrencia").select("*").eq("mes", mes).eq("ano", ano).maybeSingle();
    if (rec) { setRecorrenciaValor(String(rec.valor)); setRecorrenciaId(rec.id); }
    else { setRecorrenciaValor(""); setRecorrenciaId(null); }

    const { data: inv } = await sq("investimento_mensal").select("*").eq("mes", mes).eq("ano", ano).maybeSingle();
    if (inv) { setInvestimentoValor(String(inv.valor)); setInvestimentoId(inv.id); }
    else { setInvestimentoValor(""); setInvestimentoId(null); }
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

      {/* Faixas de Comissão */}
      <Card>
        <CardHeader>
          <CardTitle>Faixas de Comissão</CardTitle>
          <CardDescription>Comissão calculada como porcentagem sobre o faturamento total do vendedor no mês</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendas</TableHead>
                <TableHead>Percentual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {FAIXAS_COMISSAO.map((f) => (
                <TableRow key={f.min}>
                  <TableCell>{f.min} a {f.max} vendas</TableCell>
                  <TableCell className="font-semibold">{(f.percentual * 100).toFixed(0)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
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

      {/* Fidelidade Info */}
      <Card>
        <CardHeader>
          <CardTitle>Fidelidade & Multa</CardTitle>
          <CardDescription>Regras aplicadas automaticamente nos cancelamentos</CardDescription>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>• Fidelidade mínima: <strong>12 meses</strong></p>
          <p>• Cancelamento antes de 12 meses = <strong>cancelamento antecipado</strong></p>
          <p>• Multa: <strong>10%</strong> sobre o valor restante do contrato até completar 12 meses</p>
          <p className="text-muted-foreground">Fórmula: (meses restantes × preço do plano) × 10%</p>
        </CardContent>
      </Card>
    </div>
  );
}
