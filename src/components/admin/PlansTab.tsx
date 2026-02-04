import { useState, useEffect } from "react";
import { Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlanEditDialog } from "./PlanEditDialog";
import { BusinessPlanEditDialog } from "./BusinessPlanEditDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

export function PlansTab() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [businessPlans, setBusinessPlans] = useState<BusinessPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPlans = async () => {
    setLoading(true);
    
    const [plansRes, businessPlansRes] = await Promise.all([
      supabase.from("plans").select("*").order("speed"),
      supabase.from("business_plans").select("*").order("speed"),
    ]);

    if (plansRes.error) {
      toast({ title: "Erro", description: plansRes.error.message, variant: "destructive" });
    } else {
      setPlans(plansRes.data || []);
    }

    if (businessPlansRes.error) {
      toast({ title: "Erro", description: businessPlansRes.error.message, variant: "destructive" });
    } else {
      setBusinessPlans(businessPlansRes.data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const deletePlan = async (id: string) => {
    const { error } = await supabase.from("plans").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Plano excluído!" });
      fetchPlans();
    }
  };

  const deleteBusinessPlan = async (id: string) => {
    const { error } = await supabase.from("business_plans").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Plano empresarial excluído!" });
      fetchPlans();
    }
  };

  return (
    <div className="space-y-6">
      {/* Residential Plans */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Planos Residenciais</CardTitle>
            <CardDescription>Gerencie os planos disponíveis para clientes residenciais</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchPlans} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <PlanEditDialog isNew onSave={fetchPlans} />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : plans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhum plano cadastrado</div>
          ) : (
            <div className="space-y-4">
              {plans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{plan.name}</h4>
                      {plan.badge && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {plan.badge}
                        </span>
                      )}
                      {plan.popular && (
                        <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.speed} Mega</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {plan.features.length} recursos
                    </p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-bold text-lg">R$ {Number(plan.price).toFixed(2)}</p>
                    {plan.original_price && (
                      <p className="text-sm text-muted-foreground line-through">
                        R$ {Number(plan.original_price).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <PlanEditDialog plan={plan} onSave={fetchPlans} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir plano?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O plano "{plan.name}" será removido permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deletePlan(plan.id)}>
                            Excluir
                          </AlertDialogAction>
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

      {/* Business Plans */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Planos Empresariais</CardTitle>
            <CardDescription>Gerencie os planos disponíveis para empresas</CardDescription>
          </div>
          <div className="flex gap-2">
            <BusinessPlanEditDialog isNew onSave={fetchPlans} />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : businessPlans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhum plano cadastrado</div>
          ) : (
            <div className="space-y-4">
              {businessPlans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{plan.name}</h4>
                      {plan.badge && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.speed} Mega</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {plan.features.length} recursos
                    </p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-bold text-lg">R$ {Number(plan.price).toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    <BusinessPlanEditDialog plan={plan} onSave={fetchPlans} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir plano?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O plano "{plan.name}" será removido permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteBusinessPlan(plan.id)}>
                            Excluir
                          </AlertDialogAction>
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
