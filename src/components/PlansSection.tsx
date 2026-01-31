import { useState } from "react";
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
        <div className="text-center mb-12 lg:mb-16">
          <span className="badge-primary mb-4">Planos Residenciais</span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Escolha o plano ideal para você
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Internet fibra óptica de alta velocidade com instalação grátis, 
            Wi-Fi incluso e sem fidelidade.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <PlanCard plan={plan} onSubscribe={handleSubscribe} />
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Todos os planos incluem: instalação gratuita • Wi-Fi incluso • Sem taxa de adesão • Sem fidelidade
          </p>
        </div>
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
