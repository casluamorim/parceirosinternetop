import { useState, useEffect } from "react";
import { Pencil, Plus, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
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

interface PlanItemEditDialogProps {
  item?: PlanItemData;
  isNew?: boolean;
  categories: Category[];
  defaultCategoryId?: string;
  onSave: () => void;
}

export function PlanItemEditDialog({ item, isNew = false, categories, defaultCategoryId, onSave }: PlanItemEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [newFeature, setNewFeature] = useState("");

  const [formData, setFormData] = useState({
    category_id: item?.category_id ?? defaultCategoryId ?? "",
    name: item?.name ?? "",
    speed: item?.speed ?? 100,
    price: item?.price ?? 0,
    original_price: item?.original_price ?? null as number | null,
    description: item?.description ?? "",
    slogan: item?.slogan ?? "",
    features: item?.features ?? [] as string[],
    badge: item?.badge ?? "",
    popular: item?.popular ?? false,
    display_order: item?.display_order ?? 0,
    whatsapp_message: item?.whatsapp_message ?? "",
    terms_url: item?.terms_url ?? "",
    active: item?.active ?? true,
  });

  useEffect(() => {
    if (open && item) {
      setFormData({
        category_id: item.category_id,
        name: item.name,
        speed: item.speed,
        price: item.price,
        original_price: item.original_price,
        description: item.description ?? "",
        slogan: item.slogan ?? "",
        features: item.features ?? [],
        badge: item.badge ?? "",
        popular: item.popular,
        display_order: item.display_order,
        whatsapp_message: item.whatsapp_message ?? "",
        terms_url: item.terms_url ?? "",
        active: item.active,
      });
    }
  }, [open, item]);

  const handleSave = async () => {
    if (!formData.name || !formData.speed || !formData.price || !formData.category_id) {
      toast({ title: "Campos obrigatórios", description: "Preencha nome, categoria, velocidade e preço.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        category_id: formData.category_id,
        name: formData.name,
        speed: formData.speed,
        price: formData.price,
        original_price: formData.original_price,
        description: formData.description || null,
        slogan: formData.slogan || null,
        features: formData.features,
        badge: formData.badge || null,
        popular: formData.popular,
        display_order: formData.display_order,
        whatsapp_message: formData.whatsapp_message || null,
        terms_url: formData.terms_url || null,
        active: formData.active,
      };

      if (isNew) {
        const { error } = await supabase.from("plan_items").insert(payload);
        if (error) throw error;
        toast({ title: "Sucesso", description: "Item criado!" });
      } else if (item) {
        const { error } = await supabase.from("plan_items").update(payload).eq("id", item.id);
        if (error) throw error;
        toast({ title: "Sucesso", description: "Item atualizado!" });
      }
      setOpen(false);
      onSave();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({ ...prev, features: [...prev.features, newFeature.trim()] }));
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isNew ? (
          <Button size="sm"><Plus className="w-4 h-4 mr-2" />Novo Item</Button>
        ) : (
          <Button variant="outline" size="sm"><Pencil className="w-4 h-4" /></Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Novo Plano/Combo" : "Editar Plano/Combo"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Category */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={formData.category_id} onValueChange={(v) => setFormData((p) => ({ ...p, category_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} placeholder="Ex: Parceiros Família+" />
          </div>

          {/* Speed & Price */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Velocidade (Mega)</Label>
              <Input type="number" value={formData.speed} onChange={(e) => setFormData((p) => ({ ...p, speed: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Preço (R$)</Label>
              <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData((p) => ({ ...p, price: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label>Preço Original</Label>
              <Input type="number" step="0.01" value={formData.original_price ?? ""} onChange={(e) => setFormData((p) => ({ ...p, original_price: e.target.value ? Number(e.target.value) : null }))} placeholder="Opcional" />
            </div>
          </div>

          {/* Description & Slogan */}
          <div className="space-y-2">
            <Label>Descrição (o que inclui)</Label>
            <Input value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} placeholder="Ex: 600MB + Disney+ ou HBO Max" />
          </div>
          <div className="space-y-2">
            <Label>Slogan</Label>
            <Input value={formData.slogan} onChange={(e) => setFormData((p) => ({ ...p, slogan: e.target.value }))} placeholder="Ex: Diversão e conexão para toda família!" />
          </div>

          {/* Badge, Order, Popular, Active */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Etiqueta (badge)</Label>
              <Input value={formData.badge} onChange={(e) => setFormData((p) => ({ ...p, badge: e.target.value }))} placeholder="Ex: Promoção" />
            </div>
            <div className="space-y-2">
              <Label>Ordem de exibição</Label>
              <Input type="number" value={formData.display_order} onChange={(e) => setFormData((p) => ({ ...p, display_order: Number(e.target.value) }))} />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={formData.popular} onCheckedChange={(v) => setFormData((p) => ({ ...p, popular: v }))} />
              <Label>Destaque</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={formData.active} onCheckedChange={(v) => setFormData((p) => ({ ...p, active: v }))} />
              <Label>Ativo</Label>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <Label>Benefícios</Label>
            <div className="flex gap-2">
              <Input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} placeholder="Adicionar benefício..." onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())} />
              <Button type="button" variant="outline" onClick={addFeature}><Plus className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-1 mt-2">
              {formData.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <span className="flex-1 text-sm">{f}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeFeature(i)}><X className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp message */}
          <div className="space-y-2">
            <Label>Mensagem WhatsApp personalizada</Label>
            <Textarea value={formData.whatsapp_message} onChange={(e) => setFormData((p) => ({ ...p, whatsapp_message: e.target.value }))} placeholder="Deixe vazio para usar a mensagem padrão" rows={3} />
          </div>

          {/* Terms URL */}
          <div className="space-y-2">
            <Label>Link de termos e condições</Label>
            <Input value={formData.terms_url} onChange={(e) => setFormData((p) => ({ ...p, terms_url: e.target.value }))} placeholder="https://..." />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />{isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
