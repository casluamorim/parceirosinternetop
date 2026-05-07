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
  const [activeIndex, setActiveIndex] = useState(0);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const hasDragged = useRef(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    const cards = el.querySelectorAll<HTMLElement>("[data-plan-card]");
    if (cards.length > 0) {
      const center = el.scrollLeft + el.clientWidth / 2;
      let closest = 0;
      let minDist = Infinity;
      cards.forEach((c, i) => {
        const cardCenter = c.offsetLeft + c.offsetWidth / 2;
        const dist = Math.abs(cardCenter - center);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      setActiveIndex(closest);
    }
  }, []);

  const scrollToIndex = useCallback((index: number, smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>("[data-plan-card]");
    const card = cards[index];
    if (!card) return;
    const isMobile = window.matchMedia("(max-width: 639px)").matches;
    const target = isMobile
      ? card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2
      : card.offsetLeft;
    el.scrollTo({ left: Math.max(0, target), behavior: smooth ? "smooth" : "auto" });
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
    setActiveIndex(0);
    // Small delay to let DOM update before checking scroll
    const t = setTimeout(() => {
      scrollToIndex(0, false);
      checkScroll();
    }, 100);
    return () => clearTimeout(t);
  }, [activeCategory, filteredItems.length, checkScroll, scrollToIndex]);

  // Recenter active card on resize / orientation change
  useEffect(() => {
    const onResize = () => scrollToIndex(activeIndex, false);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [activeIndex, scrollToIndex]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
      window.addEventListener("orientationchange", checkScroll);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
        window.removeEventListener("orientationchange", checkScroll);
      };
    }
  }, [checkScroll]);

  const lastX = useRef(0);
  const lastT = useRef(0);
  const velocity = useRef(0);
  const momentumRAF = useRef<number | null>(null);

  const stopMomentum = () => {
    if (momentumRAF.current !== null) {
      cancelAnimationFrame(momentumRAF.current);
      momentumRAF.current = null;
    }
  };

  const startMomentum = () => {
    const el = scrollRef.current;
    if (!el) return;
    const step = () => {
      if (Math.abs(velocity.current) < 0.5) {
        momentumRAF.current = null;
        return;
      }
      el.scrollLeft -= velocity.current;
      velocity.current *= 0.94;
      momentumRAF.current = requestAnimationFrame(step);
    };
    momentumRAF.current = requestAnimationFrame(step);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    stopMomentum();
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.pageX - el.offsetLeft;
    scrollLeftStart.current = el.scrollLeft;
    lastX.current = e.pageX;
    lastT.current = performance.now();
    velocity.current = 0;
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const el = scrollRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    if (Math.abs(walk) > 5) hasDragged.current = true;
    el.scrollLeft = scrollLeftStart.current - walk;

    const now = performance.now();
    const dt = now - lastT.current;
    if (dt > 0) {
      velocity.current = (e.pageX - lastX.current) / dt * 16;
    }
    lastX.current = e.pageX;
    lastT.current = now;
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const el = scrollRef.current;
    if (el) {
      el.style.cursor = "grab";
      el.style.userSelect = "";
    }
    if (Math.abs(velocity.current) > 1) startMomentum();
  };

  // Wheel: convert vertical scroll to horizontal inside carousel
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);



  const scroll = (dir: "left" | "right") => {
    const next = dir === "left" ? Math.max(0, activeIndex - 1) : activeIndex + 1;
    scrollToIndex(next);
  };

  // Touch swipe handlers
  const touchStartX = useRef(0);
  const touchScrollStart = useRef(0);
  const touchLastX = useRef(0);
  const touchLastT = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    stopMomentum();
    const t = e.touches[0];
    touchStartX.current = t.pageX;
    touchScrollStart.current = el.scrollLeft;
    touchLastX.current = t.pageX;
    touchLastT.current = performance.now();
    velocity.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    const t = e.touches[0];
    const now = performance.now();
    const dt = now - touchLastT.current;
    if (dt > 0) velocity.current = ((t.pageX - touchLastX.current) / dt) * 16;
    touchLastX.current = t.pageX;
    touchLastT.current = now;
  };

  const handleTouchEnd = () => {
    if (Math.abs(velocity.current) > 1) startMomentum();
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
            Internet fibra óptica de alta velocidade com instalação grátis e Wi-Fi incluso.
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
                className="flex gap-4 sm:gap-5 lg:gap-6 overflow-x-auto pt-6 pb-4 px-1 scrollbar-hide snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none touch-pan-x"
                style={{ scrollPaddingLeft: "0.25rem", scrollPaddingRight: "0.25rem", scrollBehavior: "auto", overscrollBehaviorX: "contain", WebkitOverflowScrolling: "touch" }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="min-w-[280px] w-[280px] lg:min-w-[300px] lg:w-[300px] flex-shrink-0 p-6 rounded-2xl border bg-card snap-start">
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
                    <div key={item.id} data-plan-card className="min-w-[260px] w-[85vw] max-w-[300px] sm:w-[280px] sm:min-w-[280px] lg:w-[300px] lg:min-w-[300px] flex-shrink-0 snap-center sm:snap-start">
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

          {/* Dots indicator */}
          {!loading && filteredItems.length > 1 && (
            <div className="flex justify-center gap-2 mt-6" role="tablist" aria-label="Indicador de planos">
              {filteredItems.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === activeIndex}
                  aria-label={`Ir para plano ${i + 1}`}
                  onClick={() => scrollToIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? "w-6 bg-primary"
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>
          )}
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
            Todos os planos incluem: instalação gratuita • Wi-Fi incluso • Sem taxa de adesão • Fidelidade de 12 meses
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
