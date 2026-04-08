import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Download, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MESES, getPercentualComissao } from "@/lib/sales-utils";
import { useFaixasComissao } from "@/hooks/useFaixasComissao";
import { exportSalesXlsx, type ExportRow } from "@/lib/sales-spreadsheet";

const sq = (table: string) => (supabase.from as any)(table);

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  canManage: boolean;
  vendedorId: string;
  vendedores: { id: string; name: string }[];
}

export function ExportSalesDialog({ open, onOpenChange, canManage, vendedorId, vendedores }: Props) {
  const now = new Date();
  const [mes, setMes] = useState(String(now.getMonth() + 1));
  const [ano, setAno] = useState(String(now.getFullYear()));
  const [filterVendedor, setFilterVendedor] = useState("all");
  const [exporting, setExporting] = useState(false);
  const { faixas } = useFaixasComissao();

  const handleExport = async () => {
    setExporting(true);

    try {
      // Fetch plans with prices
      const { data: plans } = await supabase.from("plan_items").select("id, name, speed, price");
      const planMap = new Map((plans || []).map((p) => [p.id, p]));

      // Build vendas query
      let query = sq("vendas").select("*").eq("mes", Number(mes)).eq("ano", Number(ano));
      if (!canManage) {
        query = query.eq("vendedor_id", vendedorId);
      } else if (filterVendedor !== "all") {
        query = query.eq("vendedor_id", filterVendedor);
      }

      const { data: vendas } = await query;
      if (!vendas || vendas.length === 0) {
        toast({ title: "Nenhuma venda encontrada no período", variant: "destructive" });
        setExporting(false);
        return;
      }

      // Get seller names
      const sellerIds = [...new Set((vendas as any[]).map((v: any) => v.vendedor_id))];
      const { data: sellers } = await sq("sales_users").select("id, name").in("id", sellerIds);
      const sellerMap = new Map((sellers || []).map((s: any) => [s.id, s.name]));

      // Calculate total vendas per seller for commission tier
      const sellerTotals = new Map<string, { totalVendas: number; faturamento: number }>();
      for (const v of vendas as any[]) {
        const plan = planMap.get(v.plano_id);
        const price = plan?.price || 0;
        const current = sellerTotals.get(v.vendedor_id) || { totalVendas: 0, faturamento: 0 };
        current.totalVendas += v.quantidade;
        current.faturamento += v.quantidade * price;
        sellerTotals.set(v.vendedor_id, current);
      }

      const rows: ExportRow[] = (vendas as any[]).map((v: any): ExportRow => {
        const plan = planMap.get(v.plano_id);
        const price = plan?.price || 0;
        const stats = sellerTotals.get(v.vendedor_id)!;
        const pct = getPercentualComissao(stats.totalVendas, faixas);

        return {
          vendedor: (sellerMap.get(v.vendedor_id) as string) || "—",
          plano: plan ? `${plan.name} (${plan.speed}MB)` : "—",
          velocidade: plan?.speed || 0,
          quantidade: v.quantidade,
          valor_plano: price,
          faturamento: v.quantidade * price,
          comissao_percentual: `${(pct * 100).toFixed(0)}%`,
          mes: v.mes,
          ano: v.ano,
        };
      });

      const mesName = MESES[Number(mes) - 1];
      const vendedorName = filterVendedor === "all" ? "todos" : sellerMap.get(filterVendedor) || "vendedor";
      const filename = `vendas_${vendedorName}_${mesName}_${ano}.xlsx`.replace(/\s+/g, "_");

      exportSalesXlsx(rows, filename);
      toast({ title: "Planilha exportada com sucesso!" });
    } catch (err) {
      toast({ title: "Erro ao exportar", variant: "destructive" });
    }

    setExporting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Exportar Vendas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Mês</label>
            <Select value={mes} onValueChange={setMes}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MESES.map((m, i) => (
                  <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Ano</label>
            <Select value={ano} onValueChange={setAno}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026, 2027].map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {canManage && (
            <div>
              <label className="text-sm font-medium block mb-1">Vendedor</label>
              <Select value={filterVendedor} onValueChange={setFilterVendedor}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os vendedores</SelectItem>
                  {vendedores.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button onClick={handleExport} disabled={exporting} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            {exporting ? "Exportando..." : "Exportar .xlsx"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
