import { useState, useEffect, useMemo } from "react";
import { Menu, X, MessageCircle, Wifi } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { applyCurrentMonth, MonthFormat } from "@/lib/month-format";

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
  const [promoActive, setPromoActive] = useState(siteConfig.promo.active);
  const [promoBannerText, setPromoBannerText] = useState(siteConfig.promo.bannerText);
  const [promoBannerCta, setPromoBannerCta] = useState(siteConfig.promo.bannerCta);
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [monthTz, setMonthTz] = useState<string>("America/Sao_Paulo");
  const [monthLocale, setMonthLocale] = useState<string>("pt-BR");
  const [monthFormat, setMonthFormat] = useState<MonthFormat>("title");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);

    // Fetch promo from DB
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "hero_promo")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          const val = data.value as Record<string, unknown>;
          if (typeof val.active === "boolean") setPromoActive(val.active);
          if (typeof val.bannerText === "string") setPromoBannerText(val.bannerText);
          if (typeof val.bannerCta === "string") setPromoBannerCta(val.bannerCta);
        }
      });

    // Fetch logo from DB
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "company_logo_url")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value && typeof data.value === "string") {
          setLogoUrl(data.value);
        }
      });

    // Fetch month/timezone preferences
    supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["month_timezone", "month_locale", "month_format"])
      .then(({ data }) => {
        (data || []).forEach((row: any) => {
          if (typeof row.value !== "string") return;
          if (row.key === "month_timezone") setMonthTz(row.value);
          if (row.key === "month_locale") setMonthLocale(row.value);
          if (row.key === "month_format") setMonthFormat(row.value as MonthFormat);
        });
      });

    // Re-render around midnight (and hourly as safety) so the month flips automatically.
    const interval = setInterval(() => setTick((t) => t + 1), 60 * 60 * 1000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
    };
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
      {promoActive && (() => {
        void tick; // re-evaluate when interval ticks
        const text = applyCurrentMonth(promoBannerText, {
          format: monthFormat,
          timezone: monthTz,
          locale: monthLocale,
        });
        return (
          <div className="promo-banner fixed top-0 left-0 right-0 z-50 text-center text-sm font-medium">
            <div className="container flex items-center justify-center gap-4">
              <span>{text}</span>
              <button
                onClick={scrollToPlans}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs font-semibold transition-colors"
              >
                {promoBannerCta}
              </button>
            </div>
          </div>
        );
      })()}

      {/* Main Header */}
      <header
        className={`fixed left-0 right-0 z-40 transition-all duration-300 ${
          promoActive ? "top-10" : "top-0"
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
              {logoUrl ? (
                <img src={logoUrl} alt={siteConfig.company.name} className="h-10 lg:h-12 w-auto object-contain" />
              ) : (
                <>
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
                </>
              )}
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
