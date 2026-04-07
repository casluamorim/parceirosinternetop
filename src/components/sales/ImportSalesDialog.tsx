import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, Download, AlertTriangle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  readSpreadsheet,
  autoDetectColumns,
  validateImportRows,
  downloadTemplate,
  type ImportRow,
} from "@/lib/sales-spreadsheet";

const sq = (table: string) => (supabase.from as any)(table);

interface Plan {
  id: string;
  name: string;
  speed: number;
  price: number;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  plans: Plan[];
  vendedorId: string;
  canManage: boolean;
  vendedores: { id: string; name: string }[];
  onSuccess: () => void;
}

type Step = "upload" | "mapping" | "preview" | "done";

export function ImportSalesDialog({ open, onOpenChange, plans, vendedorId, canManage, vendedores, onSuccess }: Props) {
  const [step, setStep] = useState<Step>("upload");
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({ plano: "", quantidade: "", mes: "", ano: "" });
  const [validatedRows, setValidatedRows] = useState<ImportRow[]>([]);
  const [selectedVendedor, setSelectedVendedor] = useState(vendedorId);
  const [importing, setImporting] = useState(false);

  const now = new Date();
  const defaultMes = now.getMonth() + 1;
  const defaultAno = now.getFullYear();

  const reset = () => {
    setStep("upload");
    setRawRows([]);
    setHeaders([]);
    setMapping({ plano: "", quantidade: "", mes: "", ano: "" });
    setValidatedRows([]);
    setSelectedVendedor(vendedorId);
    setImporting(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext || "")) {
      toast({ title: "Formato inválido", description: "Use .xlsx, .xls ou .csv", variant: "destructive" });
      return;
    }

    try {
      const rows = await readSpreadsheet(file);
      if (rows.length === 0) {
        toast({ title: "Planilha vazia", variant: "destructive" });
        return;
      }

      const hdrs = Object.keys(rows[0]);
      setRawRows(rows);
      setHeaders(hdrs);

      const auto = autoDetectColumns(hdrs);
      setMapping(auto);
      setStep("mapping");
    } catch {
      toast({ title: "Erro ao ler o arquivo", variant: "destructive" });
    }
  }, []);

  const handleValidate = () => {
    if (!mapping.plano || !mapping.quantidade) {
      toast({ title: "Mapeie pelo menos Plano e Quantidade", variant: "destructive" });
      return;
    }
    const validated = validateImportRows(rawRows, mapping, plans, defaultMes, defaultAno);
    setValidatedRows(validated);
    setStep("preview");
  };

  const handleImport = async () => {
    const validRows = validatedRows.filter((r) => r.valid);
    if (validRows.length === 0) {
      toast({ title: "Nenhuma linha válida para importar", variant: "destructive" });
      return;
    }

    setImporting(true);
    const vid = canManage ? selectedVendedor : vendedorId;

    const records = validRows.map((r) => ({
      vendedor_id: vid,
      plano_id: r.plano_id,
      quantidade: r.quantidade,
      mes: r.mes,
      ano: r.ano,
    }));

    const { error } = await sq("vendas").insert(records);
    if (error) {
      toast({ title: "Erro ao importar", description: error.message, variant: "destructive" });
      setImporting(false);
      return;
    }

    toast({ title: `${validRows.length} venda(s) importada(s) com sucesso!` });
    setStep("done");
    setImporting(false);
    onSuccess();
  };

  const validCount = validatedRows.filter((r) => r.valid).length;
  const invalidCount = validatedRows.filter((r) => !r.valid).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Importar Planilha de Vendas
          </DialogTitle>
        </DialogHeader>

        {/* Step: Upload */}
        {step === "upload" && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center space-y-4">
              <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Arraste ou selecione um arquivo .xlsx ou .csv</p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFile}
                className="block mx-auto text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:font-medium file:cursor-pointer cursor-pointer"
              />
            </div>

            {canManage && (
              <div>
                <label className="text-sm font-medium block mb-1">Importar para vendedor:</label>
                <Select value={selectedVendedor} onValueChange={setSelectedVendedor}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {vendedores.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => downloadTemplate(plans)}>
                <Download className="w-4 h-4 mr-2" />
                Baixar modelo padrão
              </Button>
            </div>
          </div>
        )}

        {/* Step: Column Mapping */}
        {step === "mapping" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Mapeie as colunas da sua planilha para os campos do sistema. Detectamos automaticamente quando possível.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {(["plano", "quantidade", "mes", "ano"] as const).map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium block mb-1 capitalize">
                    {field === "mes" ? "Mês" : field === "ano" ? "Ano" : field === "plano" ? "Plano *" : "Quantidade *"}
                  </label>
                  <Select value={mapping[field]} onValueChange={(v) => setMapping({ ...mapping, [field]: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione coluna" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Não mapear —</SelectItem>
                      {headers.map((h) => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Se Mês/Ano não forem mapeados, serão usados {defaultMes}/{defaultAno}.
            </p>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("upload")}>Voltar</Button>
              <Button onClick={handleValidate}>Validar Dados</Button>
            </div>
          </div>
        )}

        {/* Step: Preview */}
        {step === "preview" && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <Badge variant="default">
                <CheckCircle2 className="w-3 h-3 mr-1" /> {validCount} válida(s)
              </Badge>
              {invalidCount > 0 && (
                <Badge variant="destructive">
                  <AlertTriangle className="w-3 h-3 mr-1" /> {invalidCount} com erro
                </Badge>
              )}
            </div>

            <div className="max-h-64 overflow-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead>Mês</TableHead>
                    <TableHead>Ano</TableHead>
                    <TableHead>Erros</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validatedRows.map((row, i) => (
                    <TableRow key={i} className={row.valid ? "" : "bg-destructive/5"}>
                      <TableCell>
                        {row.valid ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{row.plano_name}</TableCell>
                      <TableCell>{row.quantidade}</TableCell>
                      <TableCell>{row.mes}</TableCell>
                      <TableCell>{row.ano}</TableCell>
                      <TableCell className="text-xs text-destructive">{row.errors.join(", ")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("mapping")}>Voltar</Button>
              <Button onClick={handleImport} disabled={validCount === 0 || importing}>
                {importing ? "Importando..." : `Importar ${validCount} venda(s)`}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Done */}
        {step === "done" && (
          <div className="text-center py-6 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
            <p className="font-semibold">Importação concluída!</p>
            <Button onClick={() => handleClose(false)}>Fechar</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
