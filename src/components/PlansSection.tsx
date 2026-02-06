import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { PlanCard } from "./PlanCard";
import { ContractModal } from "./ContractModal";
import { Skeleton } from "@/components/ui/skeleton";

interface Plan {
  id: string;
  name: string;
  speed: number;
  price: number;
  originalPrice: number;
  features: string[];
  recommended: boolean;
  tag: string | null;
  idealFor: string;
}

interface DbPlan {
  id: string;
  name: string;
  speed: number;
  price: number;
  original_price: number | null;
  features: string[] | null;
  popular: boolean | null;
  badge: string | null;
}

// Generate ideal for text based on speed
const getIdealFor = (speed: number): string => {
  if (speed <= 200) return "Ideal para 1-2 pessoas, navegação e redes sociais";
  if (speed <= 400) return "Ideal para famílias com streaming e smart home";
  if (speed <= 600) return "Ideal para gamers, home office e streaming 4K";
  return "Ideal para empresas em casa, streamers e tech lovers";
};

// Transform DB plan to UI plan format
const transformPlan = (dbPlan: DbPlan): Plan => ({
  id: dbPlan.id,
  name: dbPlan.name,
  speed: dbPlan.speed,
  price: dbPlan.price,
  originalPrice: dbPlan.original_price || dbPlan.price,
  features: dbPlan.features || [],
  recommended: dbPlan.popular || false,
  tag: dbPlan.badge,
  idealFor: getIdealFor(dbPlan.speed),
});

export function PlansSection() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .order("speed");

      if (!error && data) {
        setPlans(data.map(transformPlan));
      }
      setLoading(false);
    };

    fetchPlans();
  }, []);

  const handleSubscribe = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  return (
    <section id="planos" className="py-16 lg:py-24 bg-background">
      <div className="container">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <motion.span 
            className="badge-primary mb-4 inline-block"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            Planos Residenciais
          </motion.span>
          <motion.h2 
            className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Escolha o plano ideal para você
          </motion.h2>
          <motion.p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Internet fibra óptica de alta velocidade com instalação grátis, 
            Wi-Fi incluso e sem fidelidade.
          </motion.p>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {loading ? (
            // Skeleton loading state
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="p-6 rounded-2xl border bg-card">
                <Skeleton className="h-6 w-24 mx-auto mb-4" />
                <Skeleton className="h-4 w-32 mx-auto mb-6" />
                <Skeleton className="h-16 w-20 mx-auto mb-2" />
                <Skeleton className="h-4 w-12 mx-auto mb-6" />
                <Skeleton className="h-10 w-32 mx-auto mb-6" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="mt-8 space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ))
          ) : plans.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Nenhum plano disponível no momento.
            </div>
          ) : (
            plans.map((plan, index) => (
              <PlanCard 
                key={plan.id} 
                plan={plan} 
                onSubscribe={handleSubscribe}
                index={index}
              />
            ))
          )}
        </div>

        {/* Additional Info */}
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <p className="text-sm text-muted-foreground">
            Todos os planos incluem: instalação gratuita • Wi-Fi incluso • Sem taxa de adesão • Sem fidelidade
          </p>
        </motion.div>
      </div>

      {/* Contract Modal */}
      <ContractModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plan={selectedPlan}
      />
    </section>
  );
}
