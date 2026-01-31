import { Star, Quote } from "lucide-react";
import { testimonials, siteConfig } from "@/lib/config";

export function TestimonialsSection() {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <span className="badge-primary mb-4">Clientes satisfeitos</span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
            O que dizem sobre nós
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Mais de {siteConfig.stats.customers} clientes conectados e satisfeitos 
            em {siteConfig.coverage.cities.join(" e ")}.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="card-premium p-6 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Quote Icon */}
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Quote className="w-5 h-5 text-primary" />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < testimonial.rating
                        ? "text-warning fill-warning"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-foreground mb-4 text-sm leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 lg:gap-16">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <Star className="w-6 h-6 text-success fill-success" />
            </div>
            <div>
              <div className="text-2xl font-display font-bold text-foreground">
                {siteConfig.stats.satisfaction}
              </div>
              <div className="text-sm text-muted-foreground">Nota média</div>
            </div>
          </div>

          <div className="h-12 w-px bg-border hidden lg:block" />

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-display font-bold text-foreground">
                {siteConfig.stats.customers}
              </div>
              <div className="text-sm text-muted-foreground">Clientes ativos</div>
            </div>
          </div>

          <div className="h-12 w-px bg-border hidden lg:block" />

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-display font-bold text-foreground">
                {siteConfig.stats.uptime}
              </div>
              <div className="text-sm text-muted-foreground">Disponibilidade</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
