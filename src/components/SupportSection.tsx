import { Gauge, FileText, Wrench, MessageCircle, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { siteConfig, faqs } from "@/lib/config";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export function SupportSection() {
  const handleWhatsApp = (topic?: string) => {
    const message = encodeURIComponent(
      topic
        ? `Olá! Preciso de ajuda com: ${topic}`
        : `Olá! Preciso de suporte da ${siteConfig.company.name}.`
    );
    window.open(
      `https://wa.me/${siteConfig.contact.whatsapp}?text=${message}`,
      "_blank"
    );
  };

  const supportOptions = [
    {
      icon: Gauge,
      title: "Testar velocidade",
      description: "Verifique a velocidade da sua conexão",
      action: () => window.open("https://fast.com", "_blank"),
      color: "bg-primary/10 text-primary",
    },
    {
      icon: FileText,
      title: "Segunda via de boleto",
      description: "Solicite uma nova via do seu boleto",
      action: () => handleWhatsApp("Segunda via de boleto"),
      color: "bg-success/10 text-success",
    },
    {
      icon: Wrench,
      title: "Abrir chamado técnico",
      description: "Reporte problemas técnicos",
      action: () => handleWhatsApp("Chamado técnico"),
      color: "bg-warning/10 text-warning",
    },
    {
      icon: MessageCircle,
      title: "Falar no WhatsApp",
      description: "Atendimento rápido e humanizado",
      action: () => handleWhatsApp(),
      color: "bg-whatsapp/10 text-whatsapp",
    },
  ];

  return (
    <section id="suporte" className="py-16 lg:py-24 bg-background">
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
            Central de Ajuda
          </motion.span>
          <motion.h2 
            className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Como podemos ajudar?
          </motion.h2>
          <motion.p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Suporte rápido e eficiente para você. Escolha uma opção abaixo ou 
            consulte as perguntas frequentes.
          </motion.p>
        </motion.div>

        {/* Support Options Grid */}
        <motion.div 
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {supportOptions.map((option, index) => (
            <motion.button
              key={index}
              onClick={option.action}
              className="card-premium p-6 text-left group"
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div 
                className={`w-14 h-14 rounded-xl ${option.color} flex items-center justify-center mb-4`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <option.icon className="w-7 h-7" />
              </motion.div>
              <h3 className="font-semibold text-foreground mb-1">{option.title}</h3>
              <p className="text-sm text-muted-foreground">{option.description}</p>
            </motion.button>
          ))}
        </motion.div>

        {/* FAQ Section */}
        <motion.div 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="flex items-center gap-3 mb-8"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.div 
              className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <HelpCircle className="w-5 h-5 text-primary" />
            </motion.div>
            <h3 className="font-display text-2xl font-bold text-foreground">
              Perguntas frequentes
            </h3>
          </motion.div>

          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <AccordionItem
                  value={`faq-${index}`}
                  className="card-premium border-0 px-6"
                >
                  <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
