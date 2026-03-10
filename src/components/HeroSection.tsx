import { useState, useEffect } from "react";
import { ArrowRight, MapPin, Check, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { siteConfig } from "@/lib/config";
import { supabase } from "@/integrations/supabase/client";
import heroFiberBg from "@/assets/hero-fiber.jpg";

interface FeaturedPlan {
  speed: number;
  price: number;
  originalPrice: number;
}

interface CoverageResult {
  hasCoverage: boolean;
  neighborhood?: string;
  city?: string;
}

interface PromoSettings {
  active: boolean;
  title: string;
  discountText: string;
  bannerText: string;
  bannerCta: string;
  showFeatured: boolean;
  featuredLabel: string;
  featuredPlanId: string | null;
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
  const [featuredPlan, setFeaturedPlan] = useState<FeaturedPlan | null>(null);
  const [promo, setPromo] = useState<PromoSettings>({
    active: siteConfig.promo.active,
    title: siteConfig.promo.title,
    discountText: siteConfig.promo.discountText,
    bannerText: siteConfig.promo.bannerText,
    bannerCta: siteConfig.promo.bannerCta,
    showFeatured: true,
    featuredLabel: "Plano mais vendido",
    featuredPlanId: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch promo settings
      const { data: promoData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "hero_promo")
        .maybeSingle();

      if (promoData?.value) {
        const val = promoData.value as Record<string, unknown>;
        setPromo({
          active: val.active as boolean ?? siteConfig.promo.active,
          title: val.title as string ?? siteConfig.promo.title,
          discountText: val.discountText as string ?? siteConfig.promo.discountText,
          bannerText: val.bannerText as string ?? siteConfig.promo.bannerText,
          bannerCta: val.bannerCta as string ?? siteConfig.promo.bannerCta,
          showFeatured: val.showFeatured !== false,
          featuredLabel: (val.featuredLabel as string) || "Plano mais vendido",
          featuredPlanId: (val.featuredPlanId as string) || null,
        });
      }

      // Fetch featured plan
      const promoVal = promoData?.value as Record<string, unknown> | null;
      const featuredId = promoVal?.featuredPlanId as string | null;

      if (featuredId) {
        // Fetch specific plan by ID
        const { data: specificItem } = await supabase
          .from("plan_items")
          .select("speed, price, original_price")
          .eq("id", featuredId)
          .eq("active", true)
          .maybeSingle();

        if (specificItem) {
          setFeaturedPlan({
            speed: specificItem.speed,
            price: Number(specificItem.price),
            originalPrice: Number(specificItem.original_price || specificItem.price),
          });
          return;
        }
      }

      // Fallback: first popular plan_item
      const { data: newItem } = await supabase
        .from("plan_items")
        .select("speed, price, original_price")
        .eq("popular", true)
        .eq("active", true)
        .order("display_order")
        .limit(1)
        .maybeSingle();

      if (newItem) {
        setFeaturedPlan({
          speed: newItem.speed,
          price: Number(newItem.price),
          originalPrice: Number(newItem.original_price || newItem.price),
        });
      }
    };
    fetchData();
  }, []);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const }
    }
  };

  return (
    <section
      id="inicio"
      className="relative min-h-screen section-gradient pt-32 lg:pt-40 pb-16 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-0 right-0 w-1/2 h-full opacity-20 lg:opacity-30"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 0.3, x: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <img 
            src={heroFiberBg} 
            alt="" 
            className="w-full h-full object-cover object-left"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/50" />
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 -left-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div 
            className="text-center lg:text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Promo Badge */}
            {promo.active && (
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6"
                variants={itemVariants}
              >
                <span className="badge-primary">{promo.title}</span>
                <span className="text-sm font-medium text-foreground">
                  {promo.discountText}
                </span>
              </motion.div>
            )}

            {/* Headline */}
            <motion.h1 
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
              variants={itemVariants}
            >
              Internet fibra óptica{" "}
              <span className="text-primary">de verdade</span>
            </motion.h1>

            <motion.p 
              className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0"
              variants={itemVariants}
            >
              Conexão ultrarrápida para sua casa em Balneário Camboriú e Camboriú. 
              Instalação em até 24h e suporte local de verdade.
            </motion.p>

            {/* Featured Plan Highlight */}
            {featuredPlan && promo.showFeatured && (
            <motion.div 
              className="card-premium p-6 mb-8 inline-block"
              variants={itemVariants}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {promo.featuredLabel}
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
            </motion.div>
            )}

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              variants={itemVariants}
            >
              <motion.button 
                onClick={scrollToPlans} 
                className="btn-primary text-lg px-8 py-4"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Assinar agora
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.a 
                href="#cobertura" 
                className="btn-outline-primary text-lg px-8 py-4"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <MapPin className="w-5 h-5" />
                Ver cobertura
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Right Content - Coverage Check */}
          <motion.div 
            className="lg:pl-8"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div 
              className="card-premium p-8"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="text-center mb-6">
                <motion.div 
                  className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                >
                  <MapPin className="w-8 h-8 text-primary" />
                </motion.div>
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
                <motion.button
                  onClick={checkCoverage}
                  disabled={cep.length < 8 || isLoading}
                  className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Verificar"
                  )}
                </motion.button>
              </div>

              {/* Coverage Result */}
              {coverageResult && !showLeadForm && (
                <motion.div
                  className={`p-4 rounded-xl ${
                    coverageResult.hasCoverage
                      ? "bg-success/10 border border-success/20"
                      : "bg-warning/10 border border-warning/20"
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {coverageResult.hasCoverage ? (
                    <div className="flex items-start gap-3">
                      <motion.div 
                        className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                      >
                        <Check className="w-5 h-5 text-success" />
                      </motion.div>
                      <div>
                        <p className="font-semibold text-foreground mb-1">
                          Boa notícia! Temos cobertura no seu endereço 🎉
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          {coverageResult.neighborhood}, {coverageResult.city}
                        </p>
                        <motion.button 
                          onClick={scrollToPlans} 
                          className="btn-primary text-sm"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Ver planos disponíveis
                        </motion.button>
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
                </motion.div>
              )}

              {/* Lead Capture Form */}
              {showLeadForm && !leadSubmitted && (
                <motion.form 
                  onSubmit={handleLeadSubmit} 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
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
                  <motion.button 
                    type="submit" 
                    className="btn-primary w-full"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    Quero ser avisado
                  </motion.button>
                </motion.form>
              )}

              {/* Lead Success */}
              {leadSubmitted && (
                <motion.div 
                  className="p-6 rounded-xl bg-success/10 border border-success/20 text-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <Check className="w-6 h-6 text-success" />
                  </motion.div>
                  <p className="font-semibold text-foreground mb-1">
                    Cadastro realizado com sucesso!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Entraremos em contato assim que a fibra chegar no seu bairro.
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16 lg:mt-24">
          {[
            { value: siteConfig.stats.customers, label: siteConfig.stats.customersText },
            { value: siteConfig.stats.installationTime, label: siteConfig.stats.installationText },
            { value: siteConfig.stats.satisfaction, label: siteConfig.stats.satisfactionText },
            { value: siteConfig.stats.uptime, label: siteConfig.stats.uptimeText },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/80"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <motion.div 
                className="text-3xl lg:text-4xl font-display font-bold text-primary mb-1"
                initial={{ scale: 0.8 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
              >
                {stat.value}
              </motion.div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
