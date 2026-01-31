import { useState } from "react";
import { MessageCircle, X, ChevronRight, Wifi, MapPin, Wrench, FileText, User } from "lucide-react";
import { siteConfig } from "@/lib/config";

type ChatOption = {
  id: string;
  icon: React.ElementType;
  label: string;
  action: () => void;
};

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);

  const handleWhatsApp = (topic?: string) => {
    const message = encodeURIComponent(
      topic
        ? `Olá! Preciso de ajuda com: ${topic}`
        : `Olá! Gostaria de falar com o atendimento da ${siteConfig.company.name}.`
    );
    window.open(
      `https://wa.me/${siteConfig.contact.whatsapp}?text=${message}`,
      "_blank"
    );
    setIsOpen(false);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsOpen(false);
  };

  const chatOptions: ChatOption[] = [
    {
      id: "plans",
      icon: Wifi,
      label: "Ver planos",
      action: () => scrollToSection("planos"),
    },
    {
      id: "coverage",
      icon: MapPin,
      label: "Consultar cobertura",
      action: () => scrollToSection("cobertura"),
    },
    {
      id: "support",
      icon: Wrench,
      label: "Suporte técnico",
      action: () => handleWhatsApp("Suporte técnico"),
    },
    {
      id: "billing",
      icon: FileText,
      label: "Segunda via de boleto",
      action: () => handleWhatsApp("Segunda via de boleto"),
    },
    {
      id: "talk",
      icon: User,
      label: "Falar com atendente",
      action: () => handleWhatsApp(),
    },
  ];

  return (
    <>
      {/* Chat Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? "bg-foreground text-white rotate-0"
            : "bg-primary text-white hover:scale-110"
        }`}
        aria-label={isOpen ? "Fechar chat" : "Abrir chat"}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-xl overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-primary p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold">{siteConfig.company.name}</h4>
                <p className="text-xs text-white/80">Como podemos ajudar?</p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="p-4 space-y-2">
            {chatOptions.map((option) => (
              <button
                key={option.id}
                onClick={option.action}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-muted hover:bg-accent transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <option.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {option.label}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <button
              onClick={() => handleWhatsApp()}
              className="btn-whatsapp w-full text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Abrir WhatsApp
            </button>
          </div>
        </div>
      )}
    </>
  );
}
