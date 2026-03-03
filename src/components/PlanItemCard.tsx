import { Check, MessageCircle, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { siteConfig } from "@/lib/config";
import type { PlanItem } from "./PlansSection";

interface PlanItemCardProps {
  item: PlanItem;
  categoryName: string;
  onSubscribe: (item: PlanItem) => void;
  index?: number;
}

export function PlanItemCard({ item, categoryName, onSubscribe, index = 0 }: PlanItemCardProps) {
  const handleWhatsApp = () => {
    const defaultMsg = `Quero contratar\n\n📋 Plano: ${item.name}\n📂 Categoria: ${categoryName}\n⚡ Velocidade: ${item.speed} Mega\n💰 Preço: R$ ${Number(item.price).toFixed(2).replace(".", ",")}/mês\n\nPor favor, confirmem endereço e melhor horário para instalação!`;
    const message = encodeURIComponent(item.whatsapp_message || defaultMsg);
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
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
      className={`relative h-full flex flex-col ${item.popular ? "card-plan-featured" : "card-plan"}`}
    >
      {/* Badge */}
      {item.badge && (
        <motion.div
          className="absolute -top-3 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 + 0.3, duration: 0.3 }}
        >
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
              item.popular ? "bg-primary text-white" : "bg-accent text-primary"
            }`}
          >
            {item.popular && <Zap className="w-3 h-3" />}
            {item.badge}
          </span>
        </motion.div>
      )}

      {/* Plan Name & Description */}
      <div className="text-center mb-4 pt-2">
        <h3 className="font-display text-xl font-bold text-foreground mb-1">{item.name}</h3>
        {item.description && (
          <p className="text-sm text-muted-foreground">{item.description}</p>
        )}
      </div>

      {/* Speed */}
      <motion.div
        className="text-center mb-4"
        initial={{ scale: 0.9 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 + 0.2, duration: 0.4, type: "spring" }}
      >
        <div className="speed-display">{item.speed}</div>
        <div className="text-lg font-semibold text-muted-foreground">Mega</div>
      </motion.div>

      {/* Price */}
      <div className="text-center mb-4">
        {item.original_price && item.original_price > item.price && (
          <div className="text-sm text-muted-foreground line-through">
            R$ {Number(item.original_price).toFixed(2).replace(".", ",")}
          </div>
        )}
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-sm text-muted-foreground">R$</span>
          <span className="text-4xl font-display font-bold text-foreground">
            {Math.floor(item.price)}
          </span>
          <span className="text-lg text-foreground">
            ,{(Number(item.price) % 1).toFixed(2).slice(2)}
          </span>
          <span className="text-sm text-muted-foreground">/mês</span>
        </div>
      </div>

      {/* Slogan */}
      {item.slogan && (
        <p className="text-center text-sm font-medium text-primary mb-4 italic">
          "{item.slogan}"
        </p>
      )}

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {item.features.map((feature, featureIndex) => (
          <motion.li
            key={featureIndex}
            className="flex items-center gap-3 text-sm"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 + 0.3 + featureIndex * 0.05, duration: 0.3 }}
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
          onClick={() => onSubscribe(item)}
          className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
            item.popular ? "btn-primary pulse-glow" : "btn-primary"
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

      {/* Terms link */}
      {item.terms_url && (
        <a
          href={item.terms_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-primary text-center mt-2 underline"
        >
          Termos e condições
        </a>
      )}
    </motion.div>
  );
}
