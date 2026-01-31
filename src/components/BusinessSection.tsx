import { Check, MessageCircle, Building2 } from "lucide-react";
import { businessPlans, siteConfig } from "@/lib/config";

export function BusinessSection() {
  const handleWhatsApp = (plan: typeof businessPlans[0]) => {
    const message = encodeURIComponent(
      `Olá! Tenho interesse no plano empresarial ${plan.name} de ${plan.speed} Mega. Gostaria de falar com um consultor.`
    );
    window.open(
      `https://wa.me/${siteConfig.contact.whatsapp}?text=${message}`,
      "_blank"
    );
  };

  return (
    <section id="empresas" className="py-16 lg:py-24 bg-foreground text-white">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-4">
            <Building2 className="w-4 h-4" />
            Planos Empresariais
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
            Internet para sua empresa
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Soluções corporativas com IP fixo, SLA garantido e suporte prioritário. 
            Mantenha sua empresa sempre conectada.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {businessPlans.map((plan, index) => (
            <div
              key={plan.id}
              className="rounded-2xl bg-white/5 border border-white/10 p-6 lg:p-8 backdrop-blur-sm hover:bg-white/10 transition-all animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Plan Name */}
              <div className="mb-6">
                <h3 className="font-display text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-white/60 text-sm">Plano empresarial</p>
              </div>

              {/* Speed */}
              <div className="mb-6">
                <div className="text-5xl font-display font-bold text-primary-lighter">
                  {plan.speed}
                </div>
                <div className="text-lg text-white/60">Mega</div>
              </div>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-white/10">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-white/60">R$</span>
                  <span className="text-3xl font-display font-bold">
                    {Math.floor(plan.price)}
                  </span>
                  <span className="text-lg">
                    ,{(plan.price % 1).toFixed(2).slice(2)}
                  </span>
                  <span className="text-sm text-white/60">/mês</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary-lighter/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary-lighter" />
                    </div>
                    <span className="text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handleWhatsApp(plan)}
                className="w-full py-3 rounded-lg font-semibold bg-white text-foreground hover:bg-white/90 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Falar com consultor
              </button>
            </div>
          ))}
        </div>

        {/* Extra Info */}
        <div className="text-center">
          <p className="text-white/60 text-sm">
            Precisa de algo customizado? Entre em contato para uma proposta sob medida.
          </p>
        </div>
      </div>
    </section>
  );
}
