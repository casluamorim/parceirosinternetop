import { Wifi, Phone, Mail, MapPin, Clock, Instagram, Facebook, MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/config";

export function Footer() {
  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Gostaria de falar com o atendimento da ${siteConfig.company.name}.`
    );
    window.open(
      `https://wa.me/${siteConfig.contact.whatsapp}?text=${message}`,
      "_blank"
    );
  };

  return (
    <footer className="bg-foreground text-white">
      {/* Main Footer */}
      <div className="container py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <a href="#inicio" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                <Wifi className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg leading-tight">
                  {siteConfig.company.shortName}
                </span>
                <span className="text-[10px] text-white/60 uppercase tracking-wider">
                  Internet
                </span>
              </div>
            </a>
            <p className="text-white/70 text-sm mb-6">
              {siteConfig.company.description}
            </p>
            <div className="flex items-center gap-3">
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Links Rápidos</h4>
            <nav className="flex flex-col gap-2">
              <a href="#planos" className="text-white/70 hover:text-white transition-colors text-sm">
                Planos Residenciais
              </a>
              <a href="#empresas" className="text-white/70 hover:text-white transition-colors text-sm">
                Planos Empresariais
              </a>
              <a href="#cobertura" className="text-white/70 hover:text-white transition-colors text-sm">
                Área de Cobertura
              </a>
              <a href="#suporte" className="text-white/70 hover:text-white transition-colors text-sm">
                Central de Ajuda
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">
                Trabalhe Conosco
              </a>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Contato</h4>
            <div className="flex flex-col gap-3">
              <a
                href={`tel:${siteConfig.contact.phone.replace(/\D/g, "")}`}
                className="flex items-center gap-3 text-white/70 hover:text-white transition-colors text-sm"
              >
                <Phone className="w-4 h-4 text-primary-lighter" />
                {siteConfig.contact.phone}
              </a>
              <button
                onClick={handleWhatsApp}
                className="flex items-center gap-3 text-white/70 hover:text-white transition-colors text-sm text-left"
              >
                <MessageCircle className="w-4 h-4 text-whatsapp" />
                {siteConfig.contact.whatsappDisplay}
              </button>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="flex items-center gap-3 text-white/70 hover:text-white transition-colors text-sm"
              >
                <Mail className="w-4 h-4 text-primary-lighter" />
                {siteConfig.contact.email}
              </a>
              <div className="flex items-start gap-3 text-white/70 text-sm">
                <MapPin className="w-4 h-4 text-primary-lighter mt-0.5" />
                <span>{siteConfig.address.full}</span>
              </div>
            </div>

            {/* Google Maps */}
            <div className="mt-4 rounded-xl overflow-hidden border border-white/10">
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(siteConfig.address.full)}`}
                width="100%"
                height="150"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização Parceiros Internet"
                className="grayscale hover:grayscale-0 transition-all duration-300"
              />
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Horários</h4>
            <div className="flex flex-col gap-2 text-white/70 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-lighter" />
                <span>{siteConfig.hours.weekdays}</span>
              </div>
              <div className="mt-2 pl-6 text-success font-medium">
                {siteConfig.hours.support}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
            <p>
              © {new Date().getFullYear()} {siteConfig.company.name}. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">
                Política de Privacidade
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Termos de Uso
              </a>
              <a href="/admin" className="hover:text-white transition-colors opacity-50 hover:opacity-100">
                Área Restrita
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
