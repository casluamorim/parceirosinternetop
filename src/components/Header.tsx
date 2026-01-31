import { useState, useEffect } from "react";
import { Menu, X, MessageCircle, Wifi } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "#inicio", label: "Início" },
  { href: "#planos", label: "Planos" },
  { href: "#cobertura", label: "Cobertura" },
  { href: "#empresas", label: "Empresas" },
  { href: "#suporte", label: "Suporte" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Gostaria de saber mais sobre os planos da ${siteConfig.company.name}.`
    );
    window.open(
      `https://wa.me/${siteConfig.contact.whatsapp}?text=${message}`,
      "_blank"
    );
  };

  const scrollToPlans = () => {
    document.getElementById("planos")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Promo Banner */}
      {siteConfig.promo.active && (
        <div className="promo-banner fixed top-0 left-0 right-0 z-50 text-center text-sm font-medium">
          <div className="container flex items-center justify-center gap-4">
            <span>{siteConfig.promo.bannerText}</span>
            <button
              onClick={scrollToPlans}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs font-semibold transition-colors"
            >
              {siteConfig.promo.bannerCta}
            </button>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header
        className={`fixed left-0 right-0 z-40 transition-all duration-300 ${
          siteConfig.promo.active ? "top-10" : "top-0"
        } ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="container">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <a href="#inicio" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                <Wifi className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg leading-tight text-foreground">
                  {siteConfig.company.shortName}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Internet
                </span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleWhatsApp}
                className="text-foreground hover:text-primary gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
              <Button
                onClick={scrollToPlans}
                className="btn-primary text-sm px-5 py-2"
              >
                Assinar agora
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-foreground"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-border animate-fade-in">
            <div className="container py-4">
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 text-foreground hover:bg-accent rounded-lg transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
                <button
                  onClick={handleWhatsApp}
                  className="btn-whatsapp w-full"
                >
                  <MessageCircle className="w-5 h-5" />
                  Falar no WhatsApp
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    scrollToPlans();
                  }}
                  className="btn-primary w-full"
                >
                  Assinar agora
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
