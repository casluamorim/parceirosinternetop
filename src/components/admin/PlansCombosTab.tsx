import { useState, useEffect } from "react";
import { Trash2, RefreshCw, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlanItemEditDialog } from "./PlanItemEditDialog";
import { PlanEditDialog } from "./PlanEditDialog";
import { BusinessPlanEditDialog } from "./BusinessPlanEditDialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Category {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  display_order: number;
  is_default: boolean;
}

interface PlanItemData {
  id: string;
  category_id: string;
  name: string;
  speed: number;
  price: number;
  original_price: number | null;
  description: string | null;
  slogan: string | null;
  features: string[];
  badge: string | null;
  popular: boolean;
  display_order: number;
  whatsapp_message: string | null;
  terms_url: string | null;
  active: boolean;
}

interface Plan {
  id: string;
  name: string;
  speed: number;
  price: number;
  original_price: number | null;
  features: string[];
  popular: boolean;
  badge: string | null;
}

interface BusinessPlan {
  id: string;
  name: string;
  speed: number;
  price: number;
  features: string[];
  badge: string | null;
}

export function PlansCombosTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<PlanItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategorySettings, setShowCategorySettings] = useState(false);
  const [editingCatNames, setEditingCatNames] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const [catRes, itemRes] = await Promise.all([
      supabase.from("plan_categories").select("*").order("display_order"),
      supabase.from("plan_items").select("*").order("display_order"),
    ]);
    if (catRes.data) {
      setCategories(catRes.data);
      const names: Record<string, string> = {};
      catRes.data.forEach((c) => { names[c.id] = c.name; });
      setEditingCatNames(names);
    }
    if (itemRes.data) setItems(itemRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const toggleCategoryActive = async (id: string, active: boolean) => {
    const { error } = await supabase.from("plan_categories").update({ active }).eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else fetchData();
  };

  const setDefaultCategory = async (id: string) => {
    // Unset all defaults first, then set the new one
    await supabase.from("plan_categories").update({ is_default: false }).neq("id", "00000000-0000-0000-0000-000000000000");
    const { error } = await supabase.from("plan_categories").update({ is_default: true }).eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Sucesso", description: "Categoria padrão atualizada!" });
      fetchData();
    }
  };

  const renameCat = async (id: string) => {
    const newName = editingCatNames[id];
    if (!newName?.trim()) return;
    const { error } = await supabase.from("plan_categories").update({ name: newName.trim() }).eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Sucesso", description: "Categoria renomeada!" });
      fetchData();
    }
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from("plan_items").delete().eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Sucesso", description: "Item excluído!" });
      fetchData();
    }
  };

  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name || "—";

  return (
    <div className="space-y-6">
      {/* Category Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Planos e Combos</CardTitle>
            <CardDescription>Gerencie categorias, planos e combos exibidos no site</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowCategorySettings(!showCategorySettings)}>
              <Settings2 className="w-4 h-4 mr-2" />Categorias
            </Button>
            <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <PlanItemEditDialog isNew categories={categories} onSave={fetchData} />
          </div>
        </CardHeader>

        {showCategorySettings && (
          <CardContent className="border-t pt-4">
            <h4 className="font-semibold mb-4">Gerenciar Categorias</h4>
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Switch checked={cat.active} onCheckedChange={(v) => toggleCategoryActive(cat.id, v)} />
                  <Input
                    value={editingCatNames[cat.id] || ""}
                    onChange={(e) => setEditingCatNames((p) => ({ ...p, [cat.id]: e.target.value }))}
                    onBlur={() => renameCat(cat.id)}
                    className="max-w-[200px]"
                  />
                  <div className="flex items-center gap-2 ml-auto">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">Aba padrão</Label>
                    <input
                      type="radio"
                      name="defaultCategory"
                      checked={cat.is_default}
                      onChange={() => setDefaultCategory(cat.id)}
                      className="accent-primary"
                    />
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${cat.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                    {cat.active ? "Ativa" : "Inativa"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        )}

        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : (
            <div className="space-y-6">
              {categories.map((cat) => {
                const catItems = items.filter((i) => i.category_id === cat.id);
                if (catItems.length === 0) return null;
                return (
                  <Collapsible key={cat.id} defaultOpen>
                    <CollapsibleTrigger className="flex items-center gap-2 w-full text-left font-semibold text-lg py-2 hover:text-primary transition-colors">
                      <span>{cat.name}</span>
                      <span className="text-xs text-muted-foreground font-normal">({catItems.length} itens)</span>
                      {!cat.active && <span className="text-xs bg-muted px-2 py-0.5 rounded">Inativa</span>}
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="space-y-3 mt-2">
                        {catItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold">{item.name}</h4>
                                {item.badge && (
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{item.badge}</span>
                                )}
                                {item.popular && (
                                  <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">Destaque</span>
                                )}
                                {!item.active && (
                                  <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full">Inativo</span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{item.speed} Mega • {item.description}</p>
                              {item.slogan && <p className="text-xs text-muted-foreground italic mt-1">"{item.slogan}"</p>}
                            </div>
                            <div className="text-right mr-4">
                              <p className="font-bold text-lg">R$ {Number(item.price).toFixed(2)}</p>
                              {item.original_price && (
                                <p className="text-sm text-muted-foreground line-through">R$ {Number(item.original_price).toFixed(2)}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <PlanItemEditDialog item={item} categories={categories} onSave={fetchData} />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir item?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta ação não pode ser desfeita. O item "{item.name}" será removido permanentemente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteItem(item.id)}>Excluir</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
              {items.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">Nenhum item cadastrado</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
