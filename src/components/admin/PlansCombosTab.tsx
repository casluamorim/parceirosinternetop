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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
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

interface PromoSettings {
  active: boolean;
  title: string;
  discountText: string;
  bannerText: string;
  bannerCta: string;
  showFeatured: boolean;
  featuredLabel: string;
  featuredPlanId: string | null;
}

const defaultPromo: PromoSettings = {
  active: true,
  title: "MEGA PROMOÇÃO",
  discountText: "com 50% de desconto",
  bannerText: "🔥 Promoção de Verão!",
  bannerCta: "Contratar agora",
  showFeatured: true,
  featuredLabel: "Plano mais vendido",
  featuredPlanId: null,
};

export function PlansCombosTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<PlanItemData[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [businessPlans, setBusinessPlans] = useState<BusinessPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategorySettings, setShowCategorySettings] = useState(false);
  const [editingCatNames, setEditingCatNames] = useState<Record<string, string>>({});
  const [promo, setPromo] = useState<PromoSettings>(defaultPromo);
  const [savingPromo, setSavingPromo] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const [catRes, itemRes, plansRes, bpRes, promoRes] = await Promise.all([
      supabase.from("plan_categories").select("*").order("display_order"),
      supabase.from("plan_items").select("*").order("display_order"),
      supabase.from("plans").select("*").order("speed"),
      supabase.from("business_plans").select("*").order("speed"),
      supabase.from("site_settings").select("value").eq("key", "hero_promo").maybeSingle(),
    ]);
    if (catRes.data) {
      setCategories(catRes.data);
      const names: Record<string, string> = {};
      catRes.data.forEach((c) => { names[c.id] = c.name; });
      setEditingCatNames(names);
    }
    if (itemRes.data) setItems(itemRes.data);
    if (plansRes.data) setPlans(plansRes.data || []);
    if (bpRes.data) setBusinessPlans(bpRes.data || []);
    if (promoRes.data?.value) setPromo({ ...defaultPromo, ...(promoRes.data.value as Record<string, unknown>) } as PromoSettings);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const savePromo = async () => {
    setSavingPromo(true);
    const { error } = await supabase
      .from("site_settings")
      .update({ value: JSON.parse(JSON.stringify(promo)) })
      .eq("key", "hero_promo");
    setSavingPromo(false);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else toast({ title: "Sucesso", description: "Promoção atualizada!" });
  };

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

  const deletePlan = async (id: string) => {
    const { error } = await supabase.from("plans").delete().eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Sucesso", description: "Plano excluído!" }); fetchData(); }
  };

  const deleteBusinessPlan = async (id: string) => {
    const { error } = await supabase.from("business_plans").delete().eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Sucesso", description: "Plano empresarial excluído!" }); fetchData(); }
  };

  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name || "—";

  return (
    <div className="space-y-6">
      {/* Hero Promo Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Promoção do Hero</CardTitle>
          <CardDescription>Configure a promoção que aparece na primeira seção do site</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch checked={promo.active} onCheckedChange={(v) => setPromo((p) => ({ ...p, active: v }))} />
            <Label>Promoção ativa</Label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Título da tag (ex: MEGA PROMOÇÃO)</Label>
              <Input value={promo.title} onChange={(e) => setPromo((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Texto do desconto (ex: com 50% de desconto)</Label>
              <Input value={promo.discountText} onChange={(e) => setPromo((p) => ({ ...p, discountText: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Texto do banner topo</Label>
              <Input value={promo.bannerText} onChange={(e) => setPromo((p) => ({ ...p, bannerText: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Texto do botão do banner</Label>
              <Input value={promo.bannerCta} onChange={(e) => setPromo((p) => ({ ...p, bannerCta: e.target.value }))} />
            </div>
          </div>
          <div className="border-t pt-4 mt-4">
            <h4 className="font-semibold mb-3">Destaque do Plano no Hero</h4>
            <div className="flex items-center gap-3 mb-4">
              <Switch checked={promo.showFeatured} onCheckedChange={(v) => setPromo((p) => ({ ...p, showFeatured: v }))} />
              <Label>Mostrar plano em destaque</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plano exibido no Hero</Label>
                <Select
                  value={promo.featuredPlanId || "auto"}
                  onValueChange={(v) => setPromo((p) => ({ ...p, featuredPlanId: v === "auto" ? null : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automático (primeiro popular)</SelectItem>
                    {items.map((item) => {
                      const catName = getCategoryName(item.category_id);
                      return (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} — {item.speed} Mega — R$ {Number(item.price).toFixed(2)} ({catName})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Texto do destaque (ex: Plano mais vendido)</Label>
                <Input value={promo.featuredLabel} onChange={(e) => setPromo((p) => ({ ...p, featuredLabel: e.target.value }))} />
              </div>
            </div>
          </div>
          <Button onClick={savePromo} disabled={savingPromo} className="mt-4">
            {savingPromo ? "Salvando..." : "Salvar promoção"}
          </Button>
        </CardContent>
      </Card>
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

      {/* Legacy Residential Plans */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Planos Residenciais (Legado)</CardTitle>
            <CardDescription>Planos residenciais do sistema anterior</CardDescription>
          </div>
          <PlanEditDialog isNew onSave={fetchData} />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : plans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhum plano cadastrado</div>
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold">{plan.name}</h4>
                      {plan.badge && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{plan.badge}</span>}
                      {plan.popular && <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">Popular</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.speed} Mega • {plan.features.length} recursos</p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-bold text-lg">R$ {Number(plan.price).toFixed(2)}</p>
                    {plan.original_price && <p className="text-sm text-muted-foreground line-through">R$ {Number(plan.original_price).toFixed(2)}</p>}
                  </div>
                  <div className="flex gap-2">
                    <PlanEditDialog plan={plan} onSave={fetchData} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir plano?</AlertDialogTitle>
                          <AlertDialogDescription>O plano "{plan.name}" será removido permanentemente.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deletePlan(plan.id)}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legacy Business Plans */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Planos Empresariais (Legado)</CardTitle>
            <CardDescription>Planos empresariais do sistema anterior</CardDescription>
          </div>
          <BusinessPlanEditDialog isNew onSave={fetchData} />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : businessPlans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhum plano cadastrado</div>
          ) : (
            <div className="space-y-3">
              {businessPlans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold">{plan.name}</h4>
                      {plan.badge && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{plan.badge}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.speed} Mega • {plan.features.length} recursos</p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-bold text-lg">R$ {Number(plan.price).toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    <BusinessPlanEditDialog plan={plan} onSave={fetchData} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir plano?</AlertDialogTitle>
                          <AlertDialogDescription>O plano "{plan.name}" será removido permanentemente.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteBusinessPlan(plan.id)}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
