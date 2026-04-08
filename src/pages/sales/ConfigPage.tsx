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
import { Save, Plus, Trash2 } from "lucide-react";

const sq = (table: string) => (supabase.from as any)(table);

interface FaixaRow {
  id?: string;
  min_vendas: number;
  max_vendas: number;
  percentual: number;
}

export default function ConfigPage() {
  const { salesUser, canManage } = useSalesAuth();
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());

  const [recorrenciaValor, setRecorrenciaValor] = useState("");
  const [recorrenciaId, setRecorrenciaId] = useState<string | null>(null);
  const [investimentoValor, setInvestimentoValor] = useState("");
  const [investimentoId, setInvestimentoId] = useState<string | null>(null);

  const [faixas, setFaixas] = useState<FaixaRow[]>([]);
  const [faixasLoading, setFaixasLoading] = useState(true);
  const [savingFaixas, setSavingFaixas] = useState(false);

  useEffect(() => { loadData(); }, [mes, ano, salesUser]);
  useEffect(() => { loadFaixas(); }, [salesUser]);

  const loadData = async () => {
    if (!salesUser) return;
    const { data: rec } = await sq("recorrencia").select("*").eq("mes", mes).eq("ano", ano).maybeSingle();
    if (rec) { setRecorrenciaValor(String(rec.valor)); setRecorrenciaId(rec.id); }
    else { setRecorrenciaValor(""); setRecorrenciaId(null); }

    const { data: inv } = await sq("investimento_mensal").select("*").eq("mes", mes).eq("ano", ano).maybeSingle();
    if (inv) { setInvestimentoValor(String(inv.valor)); setInvestimentoId(inv.id); }
    else { setInvestimentoValor(""); setInvestimentoId(null); }
  };

  const loadFaixas = async () => {
    if (!salesUser) return;
    const { data } = await supabase
      .from("faixas_comissao")
      .select("id, min_vendas, max_vendas, percentual")
      .order("min_vendas", { ascending: true });
    if (data) {
      setFaixas(data.map((d) => ({ id: d.id, min_vendas: d.min_vendas, max_vendas: d.max_vendas, percentual: Number(d.percentual) })));
    }
    setFaixasLoading(false);
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

  const updateFaixa = (index: number, field: keyof FaixaRow, value: string) => {
    const updated = [...faixas];
    updated[index] = { ...updated[index], [field]: parseFloat(value) || 0 };
    setFaixas(updated);
  };

  const addFaixa = () => {
    const last = faixas[faixas.length - 1];
    const newMin = last ? last.max_vendas + 1 : 1;
    setFaixas([...faixas, { min_vendas: newMin, max_vendas: newMin + 10, percentual: 0.20 }]);
  };

  const removeFaixa = (index: number) => {
    setFaixas(faixas.filter((_, i) => i !== index));
  };

  const saveFaixas = async () => {
    // Validate
    for (let i = 0; i < faixas.length; i++) {
      const f = faixas[i];
      if (f.min_vendas <= 0 || f.max_vendas <= 0 || f.percentual <= 0) {
        toast({ title: "Todos os valores devem ser positivos", variant: "destructive" }); return;
      }
      if (f.min_vendas > f.max_vendas) {
        toast({ title: `Faixa ${i + 1}: mínimo não pode ser maior que máximo`, variant: "destructive" }); return;
      }
      if (f.percentual > 1) {
        toast({ title: `Faixa ${i + 1}: percentual deve ser entre 0 e 1 (ex: 0.20 = 20%)`, variant: "destructive" }); return;
      }
    }

    setSavingFaixas(true);

    // Delete all existing and re-insert
    await supabase.from("faixas_comissao").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    const records = faixas.map((f) => ({
      min_vendas: f.min_vendas,
      max_vendas: f.max_vendas,
      percentual: f.percentual,
    }));

    const { error } = await supabase.from("faixas_comissao").insert(records);
    if (error) {
      toast({ title: "Erro ao salvar faixas", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Faixas de comissão atualizadas!" });
    }

    setSavingFaixas(false);
    loadFaixas();
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

      {/* Faixas de Comissão - Editável */}
      <Card>
        <CardHeader>
          <CardTitle>Faixas de Comissão</CardTitle>
          <CardDescription>Comissão calculada como porcentagem sobre o faturamento total do vendedor no mês</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {faixasLoading ? (
            <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
          ) : canManage ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mín. Vendas</TableHead>
                    <TableHead>Máx. Vendas</TableHead>
                    <TableHead>Percentual</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faixas.map((f, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          className="w-24"
                          value={f.min_vendas}
                          onChange={(e) => updateFaixa(i, "min_vendas", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          className="w-24"
                          value={f.max_vendas}
                          onChange={(e) => updateFaixa(i, "max_vendas", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            className="w-24"
                            value={f.percentual}
                            onChange={(e) => updateFaixa(i, "percentual", e.target.value)}
                          />
                          <span className="text-sm text-muted-foreground">({(f.percentual * 100).toFixed(0)}%)</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeFaixa(i)} disabled={faixas.length <= 1}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-between">
                <Button variant="outline" size="sm" onClick={addFaixa}>
                  <Plus className="w-4 h-4 mr-1" /> Adicionar faixa
                </Button>
                <Button onClick={saveFaixas} disabled={savingFaixas}>
                  <Save className="w-4 h-4 mr-1" /> {savingFaixas ? "Salvando..." : "Salvar faixas"}
                </Button>
              </div>
            </>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendas</TableHead>
                  <TableHead>Percentual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faixas.map((f, i) => (
                  <TableRow key={i}>
                    <TableCell>{f.min_vendas} a {f.max_vendas} vendas</TableCell>
                    <TableCell className="font-semibold">{(f.percentual * 100).toFixed(0)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
