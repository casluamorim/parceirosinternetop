import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TocItem {
  id: string;
  label: string;
}

interface LegalLayoutProps {
  title: string;
  intro?: React.ReactNode;
  toc: TocItem[];
  children: React.ReactNode;
}

export function LegalLayout({ title, intro, toc, children }: LegalLayoutProps) {
  const [activeId, setActiveId] = useState<string>(toc[0]?.id ?? "");
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );
    toc.forEach((t) => {
      const el = document.getElementById(t.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [toc]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <Header />
      <main className="container py-8 lg:py-16 max-w-6xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar ao site
        </Link>

        <div className="mb-8 lg:mb-12">
          <h1 className="font-display text-3xl lg:text-5xl font-bold tracking-tight mb-3">{title}</h1>
          <p className="text-sm text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString("pt-BR")}
          </p>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-8 lg:gap-12">
          {/* Sidebar TOC */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-card border border-border rounded-xl p-4 lg:p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Índice
              </p>
              <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
                {toc.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className={cn(
                      "text-left text-sm px-3 py-2 rounded-md transition-colors whitespace-nowrap lg:whitespace-normal",
                      activeId === item.id
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <article className="min-w-0">
            {intro && <div className="text-base leading-relaxed mb-8 text-muted-foreground">{intro}</div>}
            <div className="space-y-6">{children}</div>
          </article>
        </div>
      </main>
      <Footer />

      {showTop && (
        <Button
          size="icon"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-24 right-4 md:right-6 z-40 rounded-full shadow-lg"
          aria-label="Voltar ao topo"
        >
          <ArrowUp className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

interface LegalSectionProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function LegalSection({ id, title, icon, children }: LegalSectionProps) {
  return (
    <section id={id} className="scroll-mt-24 bg-card border border-border rounded-xl p-5 lg:p-7">
      <div className="flex items-center gap-3 mb-4">
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <h2 className="font-display text-xl lg:text-2xl font-bold text-foreground">{title}</h2>
      </div>
      <div className="text-base leading-relaxed text-muted-foreground space-y-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  );
}
