import { useState } from "react";
import * as XLSX from "xlsx";
import { Upload, Download, Plus, Trash2, X, FileSpreadsheet, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  categories: Category[];
  defaultCategoryId?: string;
  onSave: () => void;
  initialTab?: "quick" | "import";
  trigger?: React.ReactNode;
}

interface QuickRow {
  category_id: string;
  name: string;
  speed: number;
  price: number;
  original_price: string;
  description: string;
  features: string;
  badge: string;
  popular: boolean;
  active: boolean;
}

const emptyRow = (catId: string): QuickRow => ({
  category_id: catId,
  name: "",
  speed: 100,
  price: 0,
  original_price: "",
  description: "",
  features: "",
  badge: "",
  popular: false,
  active: true,
});

export function PlanBulkDialog({ categories, defaultCategoryId, onSave, initialTab = "quick", trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"quick" | "import">(initialTab);
  const [rows, setRows] = useState<QuickRow[]>([emptyRow(defaultCategoryId ?? categories[0]?.id ?? "")]);
  const [updateExisting, setUpdateExisting] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const baseCatId = defaultCategoryId ?? categories[0]?.id ?? "";

  const addRow = () => setRows((r) => [...r, emptyRow(baseCatId)]);
  const removeRow = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));
  const updateRow = (i: number, patch: Partial<QuickRow>) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const parseFeatures = (s: string) =>
    s.split(/[,\n;|]/).map((t) => t.trim()).filter(Boolean);

  const saveQuick = async () => {
    const valid = rows.filter((r) => r.name.trim() && r.category_id && r.speed > 0 && r.price > 0);
    if (valid.length === 0) {
      toast({ title: "Nada a salvar", description: "Preencha pelo menos um plano completo.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = valid.map((r) => ({
      category_id: r.category_id,
      name: r.name.trim(),
      speed: Number(r.speed),
      price: Number(r.price),
      original_price: r.original_price ? Number(r.original_price) : null,
      description: r.description.trim() || null,
      features: parseFeatures(r.features),
      badge: r.badge.trim() || null,
      popular: r.popular,
      active: r.active,
      display_order: 0,
    }));
    const { error } = await supabase.from("plan_items").insert(payload);
    setSaving(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: `${valid.length} plano(s) cadastrado(s)!` });
      setRows([emptyRow(baseCatId)]);
      setOpen(false);
      onSave();
    }
  };

  const downloadTemplate = () => {
    const header = ["Nome", "Categoria", "Velocidade", "Preco", "Preco_Promocional", "Descricao", "Recursos", "Badge", "Popular", "Ativo"];
    const example = [
      ["Plano Família", categories[0]?.name ?? "Residencial", 300, 89.9, 79.9, "Wi-Fi 6 + suporte 24h", "Wi-Fi incluso, Deezer Premium, HBO Max", "Mais Vendido", "Sim", "Sim"],
      ["Plano Gamer", categories[0]?.name ?? "Residencial", 600, 129.9, "", "Latência reduzida", "Ping baixo, IP fixo, Suporte premium", "", "Não", "Sim"],
    ];
    const ws = XLSX.utils.aoa_to_sheet([header, ...example]);
    ws["!cols"] = [{ wch: 22 }, { wch: 16 }, { wch: 12 }, { wch: 10 }, { wch: 16 }, { wch: 28 }, { wch: 40 }, { wch: 14 }, { wch: 8 }, { wch: 8 }];
    const ref = [["Categoria", "Slug"], ...categories.map((c) => [c.name, c.slug])];
    const wsRef = XLSX.utils.aoa_to_sheet(ref);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Planos");
    XLSX.utils.book_append_sheet(wb, wsRef, "Categorias");
    XLSX.writeFile(wb, "modelo_importacao_planos.xlsx");
  };

  const handleFile = async (file: File) => {
    setImportErrors([]);
    setImportPreview([]);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(buf), { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
      const errs: string[] = [];
      const parsed = rows.map((raw, idx) => {
        const get = (...keys: string[]) => {
          for (const k of keys) {
            const found = Object.keys(raw).find((rk) => rk.toLowerCase().trim() === k.toLowerCase());
            if (found && raw[found] !== "") return raw[found];
          }
          return "";
        };
        const name = String(get("Nome", "Plano", "Name") || "").trim();
        const catRaw = String(get("Categoria", "Category") || "").trim();
        const cat = categories.find(
          (c) => c.name.toLowerCase() === catRaw.toLowerCase() || c.slug.toLowerCase() === catRaw.toLowerCase(),
        );
        const speed = Number(get("Velocidade", "Speed", "Mega")) || 0;
        const price = Number(String(get("Preco", "Preço", "Price")).toString().replace(",", ".")) || 0;
        const op = String(get("Preco_Promocional", "Preço Promocional", "Promocional") || "").replace(",", ".");
        const original_price = op ? Number(op) : null;
        const description = String(get("Descricao", "Descrição", "Description") || "").trim() || null;
        const featuresRaw = String(get("Recursos", "Features", "Beneficios", "Benefícios") || "");
        const features = parseFeatures(featuresRaw);
        const badge = String(get("Badge", "Etiqueta") || "").trim() || null;
        const popularRaw = String(get("Popular", "Destaque") || "").toLowerCase().trim();
        const popular = ["sim", "yes", "true", "1", "x"].includes(popularRaw);
        const ativoRaw = String(get("Ativo", "Active", "Status") || "sim").toLowerCase().trim();
        const active = !["nao", "não", "no", "false", "0", "inativo"].includes(ativoRaw);

        const rowErrs: string[] = [];
        if (!name) rowErrs.push("nome vazio");
        if (!cat) rowErrs.push(`categoria "${catRaw}" não encontrada`);
        if (!speed) rowErrs.push("velocidade inválida");
        if (!price) rowErrs.push("preço inválido");
        if (rowErrs.length) errs.push(`Linha ${idx + 2}: ${rowErrs.join(", ")}`);

        return {
          valid: rowErrs.length === 0,
          payload: {
            category_id: cat?.id || "",
            name,
            speed,
            price,
            original_price,
            description,
            features,
            badge,
            popular,
            active,
            display_order: 0,
          },
        };
      });
      setImportPreview(parsed);
      setImportErrors(errs);
    } catch (e: any) {
      toast({ title: "Erro ao ler arquivo", description: e.message, variant: "destructive" });
    }
  };

  const confirmImport = async () => {
    const valid = importPreview.filter((p) => p.valid).map((p) => p.payload);
    if (valid.length === 0) {
      toast({ title: "Nada para importar", variant: "destructive" });
      return;
    }
    setImporting(true);
    let created = 0;
    let updated = 0;
    let failed = 0;
    for (const p of valid) {
      if (updateExisting) {
        const { data: existing } = await supabase
          .from("plan_items")
          .select("id")
          .eq("category_id", p.category_id)
          .ilike("name", p.name)
          .maybeSingle();
        if (existing) {
          const { error } = await supabase.from("plan_items").update(p).eq("id", existing.id);
          if (error) failed++;
          else updated++;
          continue;
        }
      }
      const { error } = await supabase.from("plan_items").insert(p);
      if (error) failed++;
      else created++;
    }
    setImporting(false);
    toast({
      title: "Importação concluída",
      description: `${created} criados, ${updated} atualizados${failed ? `, ${failed} falharam` : ""}.`,
    });
    setImportPreview([]);
    setOpen(false);
    onSave();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline">
            <Zap className="w-4 h-4 mr-2" />Cadastro rápido
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastro em Massa de Planos</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "quick" | "import")}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="quick"><Zap className="w-4 h-4 mr-2" />Cadastro rápido</TabsTrigger>
            <TabsTrigger value="import"><Upload className="w-4 h-4 mr-2" />Importar planilha</TabsTrigger>
          </TabsList>

          {/* QUICK */}
          <TabsContent value="quick" className="space-y-3 pt-4">
            <p className="text-sm text-muted-foreground">
              Adicione vários planos de uma vez. Recursos separados por vírgula.
            </p>
            {rows.map((row, i) => (
              <div key={i} className="border rounded-lg p-3 space-y-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Plano {i + 1}</span>
                  {rows.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeRow(i)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                  <div className="md:col-span-3 space-y-1">
                    <Label className="text-xs">Categoria</Label>
                    <Select value={row.category_id} onValueChange={(v) => updateRow(i, { category_id: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-4 space-y-1">
                    <Label className="text-xs">Nome</Label>
                    <Input value={row.name} onChange={(e) => updateRow(i, { name: e.target.value })} placeholder="Plano Família" />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-xs">Mega</Label>
                    <Input type="number" value={row.speed} onChange={(e) => updateRow(i, { speed: Number(e.target.value) })} />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-xs">Preço (R$)</Label>
                    <Input type="number" step="0.01" value={row.price} onChange={(e) => updateRow(i, { price: Number(e.target.value) })} />
                  </div>
                  <div className="md:col-span-1 space-y-1">
                    <Label className="text-xs">Promo</Label>
                    <Input type="number" step="0.01" value={row.original_price} onChange={(e) => updateRow(i, { original_price: e.target.value })} placeholder="—" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                  <div className="md:col-span-7 space-y-1">
                    <Label className="text-xs">Recursos (separados por vírgula)</Label>
                    <Textarea
                      value={row.features}
                      onChange={(e) => updateRow(i, { features: e.target.value })}
                      placeholder="Wi-Fi incluso, Deezer Premium, HBO Max"
                      rows={2}
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1">
                    <Label className="text-xs">Badge</Label>
                    <Input value={row.badge} onChange={(e) => updateRow(i, { badge: e.target.value })} placeholder="Promoção" />
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-2 pt-5">
                    <div className="flex items-center gap-2">
                      <Switch checked={row.popular} onCheckedChange={(v) => updateRow(i, { popular: v })} />
                      <Label className="text-xs">Destaque</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={row.active} onCheckedChange={(v) => updateRow(i, { active: v })} />
                      <Label className="text-xs">Ativo</Label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <Button variant="outline" onClick={addRow}>
                <Plus className="w-4 h-4 mr-2" />Novo plano
              </Button>
              <Button onClick={saveQuick} disabled={saving}>
                {saving ? "Salvando..." : `Salvar ${rows.filter((r) => r.name).length || ""} plano(s)`}
              </Button>
            </div>
          </TabsContent>

          {/* IMPORT */}
          <TabsContent value="import" className="space-y-4 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="w-4 h-4 mr-2" />Baixar modelo
              </Button>
              <Label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <span className="inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />Selecionar arquivo (CSV/XLSX)
                </span>
              </Label>
              <div className="ml-auto flex items-center gap-2">
                <Switch checked={updateExisting} onCheckedChange={setUpdateExisting} />
                <Label className="text-sm">Atualizar planos existentes (mesmo nome + categoria)</Label>
              </div>
            </div>

            {importErrors.length > 0 && (
              <div className="border border-destructive/30 bg-destructive/5 rounded-md p-3 text-sm space-y-1 max-h-40 overflow-y-auto">
                <p className="font-semibold text-destructive">Avisos:</p>
                {importErrors.map((e, i) => (
                  <p key={i} className="text-destructive/80">• {e}</p>
                ))}
              </div>
            )}

            {importPreview.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold">
                  Pré-visualização: {importPreview.filter((p) => p.valid).length} válido(s) de {importPreview.length}
                </p>
                <div className="border rounded-md max-h-72 overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="text-left p-2">Nome</th>
                        <th className="text-left p-2">Mega</th>
                        <th className="text-left p-2">Preço</th>
                        <th className="text-left p-2">Recursos</th>
                        <th className="text-left p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.map((p, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2">{p.payload.name}</td>
                          <td className="p-2">{p.payload.speed}</td>
                          <td className="p-2">R$ {Number(p.payload.price).toFixed(2)}</td>
                          <td className="p-2 text-xs">{p.payload.features.length} item(s)</td>
                          <td className="p-2">
                            {p.valid ? (
                              <span className="text-success text-xs">✓ válido</span>
                            ) : (
                              <span className="text-destructive text-xs">✗ inválido</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => { setImportPreview([]); setImportErrors([]); }}>
                    <X className="w-4 h-4 mr-2" />Cancelar
                  </Button>
                  <Button onClick={confirmImport} disabled={importing}>
                    {importing ? "Importando..." : `Importar ${importPreview.filter((p) => p.valid).length} plano(s)`}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
