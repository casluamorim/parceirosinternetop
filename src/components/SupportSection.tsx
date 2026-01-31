import { Gauge, FileText, Wrench, MessageCircle, HelpCircle } from "lucide-react";
import { siteConfig, faqs } from "@/lib/config";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
        <div className="text-center mb-12 lg:mb-16">
          <span className="badge-primary mb-4">Central de Ajuda</span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Como podemos ajudar?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Suporte rápido e eficiente para você. Escolha uma opção abaixo ou 
            consulte as perguntas frequentes.
          </p>
        </div>

        {/* Support Options Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-16">
          {supportOptions.map((option, index) => (
            <button
              key={index}
              onClick={option.action}
              className="card-premium p-6 text-left group animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-14 h-14 rounded-xl ${option.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <option.icon className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{option.title}</h3>
              <p className="text-sm text-muted-foreground">{option.description}</p>
            </button>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground">
              Perguntas frequentes
            </h3>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
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
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
