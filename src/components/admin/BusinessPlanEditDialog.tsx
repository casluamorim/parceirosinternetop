import { useState } from "react";
import { Pencil, Plus, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BusinessPlan {
  id: string;
  name: string;
  speed: number;
  price: number;
  features: string[];
  badge: string | null;
}

interface BusinessPlanEditDialogProps {
  plan?: BusinessPlan;
  isNew?: boolean;
  onSave: () => void;
}

export function BusinessPlanEditDialog({ plan, isNew = false, onSave }: BusinessPlanEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<Omit<BusinessPlan, "id">>({
    name: plan?.name ?? "",
    speed: plan?.speed ?? 200,
    price: plan?.price ?? 0,
    features: plan?.features ?? [],
    badge: plan?.badge ?? null,
  });

  const [newFeature, setNewFeature] = useState("");

  const handleSave = async () => {
    if (!formData.name || !formData.speed || !formData.price) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, velocidade e preço.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isNew) {
        const { error } = await supabase.from("business_plans").insert({
          name: formData.name,
          speed: formData.speed,
          price: formData.price,
          features: formData.features,
          badge: formData.badge || null,
        });

        if (error) throw error;
        toast({ title: "Sucesso", description: "Plano empresarial criado!" });
      } else if (plan) {
        const { error } = await supabase
          .from("business_plans")
          .update({
            name: formData.name,
            speed: formData.speed,
            price: formData.price,
            features: formData.features,
            badge: formData.badge || null,
          })
          .eq("id", plan.id);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Plano empresarial atualizado!" });
      }

      setOpen(false);
      onSave();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isNew ? (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Plano Empresarial
          </Button>
        ) : (
          <Button variant="outline" size="sm">
            <Pencil className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Novo Plano Empresarial" : "Editar Plano Empresarial"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome do Plano</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Empresarial"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Velocidade (Mega)</Label>
              <Input
                type="number"
                value={formData.speed}
                onChange={(e) => setFormData((prev) => ({ ...prev, speed: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Preço (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Badge</Label>
            <Input
              value={formData.badge ?? ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value || null }))}
              placeholder="Ex: Recomendado"
            />
          </div>

          <div className="space-y-2">
            <Label>Recursos</Label>
            <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Adicionar recurso..."
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
              />
              <Button type="button" variant="outline" onClick={addFeature}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2 mt-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <span className="flex-1 text-sm">{feature}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFeature(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
