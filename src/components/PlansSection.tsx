import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PlanItemCard } from "./PlanItemCard";
import { ContractModal } from "./ContractModal";
import { Skeleton } from "@/components/ui/skeleton";

interface PlanCategory {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  display_order: number;
  is_default: boolean;
}

export interface PlanItem {
  id: string;
  category_id: string;
  name: string;
  speed: number;
  price: number;
  original_price: number | null;
  description: string | null;
  slogan: string | null;
  features: string[];
  badge: string | null;
  popular: boolean;
  display_order: number;
  whatsapp_message: string | null;
  terms_url: string | null;
  active: boolean;
}

export function PlansSection() {
  const [categories, setCategories] = useState<PlanCategory[]>([]);
  const [items, setItems] = useState<PlanItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const [catRes, itemRes] = await Promise.all([
        supabase
          .from("plan_categories")
          .select("*")
          .eq("active", true)
          .order("display_order"),
        supabase
          .from("plan_items")
          .select("*")
          .eq("active", true)
          .order("display_order"),
      ]);

      if (catRes.data) {
        setCategories(catRes.data);
        const defaultCat = catRes.data.find((c) => c.is_default) || catRes.data[0];
        if (defaultCat) setActiveCategory(defaultCat.id);
      }
      if (itemRes.data) {
        setItems(itemRes.data);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredItems = items.filter((i) => i.category_id === activeCategory);
  const activeCategoryData = categories.find((c) => c.id === activeCategory);

  useEffect(() => {
    // Reset scroll position when category changes
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
    // Small delay to let DOM update before checking scroll
    const t = setTimeout(checkScroll, 100);
    return () => clearTimeout(t);
  }, [activeCategory, filteredItems.length, checkScroll]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [checkScroll]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 340;
    el.scrollBy({ left: dir === "left" ? -cardWidth : cardWidth, behavior: "smooth" });
  };

  const handleSubscribe = (plan: PlanItem) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  return (
    <section id="planos" className="py-16 lg:py-24 bg-background">
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
            Nossos Planos
          </motion.span>
          <motion.h2
            className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Escolha o plano ideal para você
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Internet fibra óptica de alta velocidade com instalação grátis, Wi-Fi incluso e sem fidelidade.
          </motion.p>
        </motion.div>

        {/* Category Tabs */}
        {!loading && categories.length > 0 && (
          <motion.div
            className="flex justify-center mb-10"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="inline-flex gap-1 p-1.5 bg-muted rounded-xl overflow-x-auto max-w-full scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`relative px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                    activeCategory === cat.id
                      ? "text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {activeCategory === cat.id && (
                    <motion.div
                      layoutId="activeCategoryTab"
                      className="absolute inset-0 bg-primary rounded-lg"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{cat.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Plans Horizontal Carousel */}
        <div className="relative">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
              aria-label="Rolar para esquerda"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
              aria-label="Rolar para direita"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Left fade */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          )}
          {/* Right fade */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto scroll-smooth pb-4 scrollbar-hide snap-x snap-mandatory"
                style={{ scrollPaddingLeft: "1rem", scrollPaddingRight: "1rem" }}
              >
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="min-w-[300px] max-w-[340px] flex-shrink-0 p-6 rounded-2xl border bg-card snap-start">
                      <Skeleton className="h-6 w-24 mx-auto mb-4" />
                      <Skeleton className="h-4 w-32 mx-auto mb-6" />
                      <Skeleton className="h-16 w-20 mx-auto mb-2" />
                      <Skeleton className="h-4 w-12 mx-auto mb-6" />
                      <Skeleton className="h-10 w-32 mx-auto mb-6" />
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                      <div className="mt-8 space-y-3">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    </div>
                  ))
                ) : filteredItems.length === 0 ? (
                  <div className="w-full text-center py-12 text-muted-foreground">
                    Nenhum plano disponível nesta categoria.
                  </div>
                ) : (
                  filteredItems.map((item, index) => (
                    <div key={item.id} className="min-w-[300px] max-w-[340px] flex-shrink-0 snap-start">
                      <PlanItemCard
                        item={item}
                        categoryName={activeCategoryData?.name || ""}
                        onSubscribe={handleSubscribe}
                        index={index}
                      />
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Additional Info */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <p className="text-sm text-muted-foreground">
            Todos os planos incluem: instalação gratuita • Wi-Fi incluso • Sem taxa de adesão • Sem fidelidade
          </p>
        </motion.div>
      </div>

      {/* Contract Modal */}
      <ContractModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planItem={selectedPlan}
      />
    </section>
  );
}
