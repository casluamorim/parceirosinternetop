import { Check, MessageCircle, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { siteConfig } from "@/lib/config";

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

interface PlanCardProps {
  plan: Plan;
  onSubscribe: (plan: Plan) => void;
  index?: number;
}

export function PlanCard({ plan, onSubscribe, index = 0 }: PlanCardProps) {
  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Tenho interesse no plano ${plan.name} de ${plan.speed} Mega por R$ ${plan.price.toFixed(2).replace(".", ",")}/mês. Podem me ajudar?`
    );
    window.open(
      `https://wa.me/${siteConfig.contact.whatsapp}?text=${message}`,
      "_blank"
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className={`relative h-full ${
        plan.recommended ? "card-plan-featured" : "card-plan"
      }`}
    >
      {/* Tag */}
      {plan.tag && (
        <motion.div 
          className="absolute -top-3 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 + 0.3, duration: 0.3 }}
        >
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
              plan.recommended
                ? "bg-primary text-white"
                : "bg-accent text-primary"
            }`}
          >
            {plan.recommended && <Zap className="w-3 h-3" />}
            {plan.tag}
          </span>
        </motion.div>
      )}

      {/* Plan Name */}
      <div className="text-center mb-6 pt-2">
        <h3 className="font-display text-xl font-bold text-foreground mb-1">
          {plan.name}
        </h3>
        <p className="text-sm text-muted-foreground">{plan.idealFor}</p>
      </div>

      {/* Speed */}
      <motion.div 
        className="text-center mb-6"
        initial={{ scale: 0.9 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 + 0.2, duration: 0.4, type: "spring" }}
      >
        <div className="speed-display">{plan.speed}</div>
        <div className="text-lg font-semibold text-muted-foreground">Mega</div>
      </motion.div>

      {/* Price */}
      <div className="text-center mb-6">
        {plan.originalPrice > plan.price && (
          <div className="text-sm text-muted-foreground line-through">
            R$ {plan.originalPrice.toFixed(2).replace(".", ",")}
          </div>
        )}
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-sm text-muted-foreground">R$</span>
          <span className="text-4xl font-display font-bold text-foreground">
            {Math.floor(plan.price)}
          </span>
          <span className="text-lg text-foreground">
            ,{(plan.price % 1).toFixed(2).slice(2)}
          </span>
          <span className="text-sm text-muted-foreground">/mês</span>
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, featureIndex) => (
          <motion.li 
            key={featureIndex} 
            className="flex items-center gap-3 text-sm"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ 
              delay: index * 0.1 + 0.3 + featureIndex * 0.05,
              duration: 0.3 
            }}
          >
            <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-success" />
            </div>
            <span className="text-foreground">{feature}</span>
          </motion.li>
        ))}
      </ul>

      {/* Actions */}
      <div className="space-y-3 mt-auto">
        <motion.button
          onClick={() => onSubscribe(plan)}
          className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
            plan.recommended
              ? "btn-primary pulse-glow"
              : "btn-primary"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Contratar
        </motion.button>
        <motion.button
          onClick={handleWhatsApp}
          className="w-full py-3 rounded-lg font-semibold border-2 border-whatsapp text-whatsapp hover:bg-whatsapp hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <MessageCircle className="w-4 h-4" />
          Falar no WhatsApp
        </motion.button>
      </div>
    </motion.div>
  );
}
