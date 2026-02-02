import { useState } from "react";
import { motion } from "framer-motion";
import { plans } from "@/lib/config";
import { PlanCard } from "./PlanCard";
import { ContractModal } from "./ContractModal";

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

export function PlansSection() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          {plans.map((plan, index) => (
            <PlanCard 
              key={plan.id} 
              plan={plan} 
              onSubscribe={handleSubscribe}
              index={index}
            />
          ))}
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
