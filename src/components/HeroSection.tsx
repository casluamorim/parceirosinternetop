import { useState } from "react";
import { ArrowRight, MapPin, Check, AlertCircle, Loader2 } from "lucide-react";
import { siteConfig, plans } from "@/lib/config";
import heroFiberBg from "@/assets/hero-fiber.jpg";

interface CoverageResult {
  hasCoverage: boolean;
  neighborhood?: string;
  city?: string;
}

export function HeroSection() {
  const [cep, setCep] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [coverageResult, setCoverageResult] = useState<CoverageResult | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);

  // Lead form state
  const [leadName, setLeadName] = useState("");
  const [leadWhatsapp, setLeadWhatsapp] = useState("");
  const [leadNeighborhood, setLeadNeighborhood] = useState("");
  const [leadCity, setLeadCity] = useState(siteConfig.coverage.cities[0]);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const checkCoverage = async () => {
    if (cep.length < 8) return;
    
    setIsLoading(true);
    setCoverageResult(null);
    
    // Simulate API call - in production, integrate with GESPROV or ViaCEP
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Mock coverage check based on CEP prefix
    const cepClean = cep.replace(/\D/g, "");
    const hasCoverage = cepClean.startsWith("883") || cepClean.startsWith("882");
    
    if (hasCoverage) {
      setCoverageResult({
        hasCoverage: true,
        neighborhood: "Centro",
        city: cepClean.startsWith("8833") ? "Balneário Camboriú" : "Camboriú",
      });
    } else {
      setCoverageResult({ hasCoverage: false });
      setShowLeadForm(true);
    }
    
    setIsLoading(false);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would send to your backend/GESPROV
    console.log("Lead captured:", {
      name: leadName,
      whatsapp: leadWhatsapp,
      neighborhood: leadNeighborhood,
      city: leadCity,
    });
    
    setLeadSubmitted(true);
  };

  const scrollToPlans = () => {
    document.getElementById("planos")?.scrollIntoView({ behavior: "smooth" });
  };

  const featuredPlan = plans.find((p) => p.recommended) || plans[1];

  return (
    <section
      id="inicio"
      className="relative min-h-screen section-gradient pt-32 lg:pt-40 pb-16 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 lg:opacity-30">
          <img 
            src={heroFiberBg} 
            alt="" 
            className="w-full h-full object-cover object-left"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/50" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Promo Badge */}
            {siteConfig.promo.active && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 animate-fade-in">
                <span className="badge-primary">{siteConfig.promo.title}</span>
                <span className="text-sm font-medium text-foreground">
                  {siteConfig.promo.discountText}
                </span>
              </div>
            )}

            {/* Headline */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in">
              Internet fibra óptica{" "}
              <span className="text-primary">de verdade</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0 animate-fade-in">
              Conexão ultrarrápida para sua casa em Balneário Camboriú e Camboriú. 
              Instalação em até 24h e suporte local de verdade.
            </p>

            {/* Featured Plan Highlight */}
            <div className="card-premium p-6 mb-8 inline-block animate-fade-in">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Plano mais vendido
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="speed-display text-5xl">{featuredPlan.speed}</span>
                    <span className="text-xl font-semibold text-muted-foreground">Mega</span>
                  </div>
                </div>
                <div className="h-16 w-px bg-border" />
                <div>
                  <div className="text-sm text-muted-foreground line-through">
                    R$ {featuredPlan.originalPrice.toFixed(2).replace(".", ",")}
                  </div>
                  <div className="text-3xl font-display font-bold text-foreground">
                    R$ {featuredPlan.price.toFixed(2).replace(".", ",")}
                    <span className="text-sm font-normal text-muted-foreground">/mês</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in">
              <button onClick={scrollToPlans} className="btn-primary text-lg px-8 py-4">
                Assinar agora
                <ArrowRight className="w-5 h-5" />
              </button>
              <a href="#cobertura" className="btn-outline-primary text-lg px-8 py-4">
                <MapPin className="w-5 h-5" />
                Ver cobertura
              </a>
            </div>
          </div>

          {/* Right Content - Coverage Check */}
          <div className="lg:pl-8">
            <div className="card-premium p-8 animate-fade-in">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Consulte a cobertura
                </h2>
                <p className="text-muted-foreground">
                  Digite seu CEP para verificar disponibilidade
                </p>
              </div>

              {/* CEP Input */}
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={cep}
                  onChange={(e) => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  placeholder="00000-000"
                  className="input-premium flex-1 text-center text-xl tracking-widest"
                  maxLength={9}
                />
                <button
                  onClick={checkCoverage}
                  disabled={cep.length < 8 || isLoading}
                  className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Verificar"
                  )}
                </button>
              </div>

              {/* Coverage Result */}
              {coverageResult && !showLeadForm && (
                <div
                  className={`p-4 rounded-xl ${
                    coverageResult.hasCoverage
                      ? "bg-success/10 border border-success/20"
                      : "bg-warning/10 border border-warning/20"
                  } animate-fade-in`}
                >
                  {coverageResult.hasCoverage ? (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground mb-1">
                          Ótima notícia! Temos cobertura no seu endereço!
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          {coverageResult.neighborhood}, {coverageResult.city}
                        </p>
                        <button onClick={scrollToPlans} className="btn-primary text-sm">
                          Ver planos disponíveis
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-warning" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground mb-1">
                          Ainda não chegamos aí...
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Mas estamos expandindo! Deixe seus dados que avisamos quando chegar.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Lead Capture Form */}
              {showLeadForm && !leadSubmitted && (
                <form onSubmit={handleLeadSubmit} className="space-y-4 animate-fade-in">
                  <div className="p-4 rounded-xl bg-accent/50 mb-4">
                    <p className="text-sm text-muted-foreground">
                      📍 Preencha seus dados e avisaremos quando a fibra chegar no seu endereço!
                    </p>
                  </div>
                  <input
                    type="text"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="Seu nome"
                    className="input-premium"
                    required
                  />
                  <input
                    type="tel"
                    value={leadWhatsapp}
                    onChange={(e) => setLeadWhatsapp(e.target.value)}
                    placeholder="WhatsApp (com DDD)"
                    className="input-premium"
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={leadNeighborhood}
                      onChange={(e) => setLeadNeighborhood(e.target.value)}
                      placeholder="Bairro"
                      className="input-premium"
                      required
                    />
                    <select
                      value={leadCity}
                      onChange={(e) => setLeadCity(e.target.value)}
                      className="input-premium"
                      required
                    >
                      {siteConfig.coverage.cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="btn-primary w-full">
                    Quero ser avisado
                  </button>
                </form>
              )}

              {/* Lead Success */}
              {leadSubmitted && (
                <div className="p-6 rounded-xl bg-success/10 border border-success/20 text-center animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-6 h-6 text-success" />
                  </div>
                  <p className="font-semibold text-foreground mb-1">
                    Cadastro realizado com sucesso!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Entraremos em contato assim que a fibra chegar no seu bairro.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16 lg:mt-24">
          {[
            { value: siteConfig.stats.customers, label: siteConfig.stats.customersText },
            { value: siteConfig.stats.installationTime, label: siteConfig.stats.installationText },
            { value: siteConfig.stats.satisfaction, label: siteConfig.stats.satisfactionText },
            { value: siteConfig.stats.uptime, label: siteConfig.stats.uptimeText },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/80 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-3xl lg:text-4xl font-display font-bold text-primary mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
