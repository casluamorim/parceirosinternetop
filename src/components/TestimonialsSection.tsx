import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { testimonials, siteConfig } from "@/lib/config";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export function TestimonialsSection() {
  return (
    <section className="py-16 lg:py-24 bg-background">
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
            Clientes satisfeitos
          </motion.span>
          <motion.h2 
            className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            O que dizem sobre nós
          </motion.h2>
          <motion.p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Mais de {siteConfig.stats.customers} clientes conectados e satisfeitos 
            em {siteConfig.coverage.cities.join(" e ")}.
          </motion.p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              className="card-premium p-6"
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              {/* Quote Icon */}
              <motion.div 
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Quote className="w-5 h-5 text-primary" />
              </motion.div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        i < testimonial.rating
                          ? "text-warning fill-warning"
                          : "text-muted"
                      }`}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Text */}
              <p className="text-foreground mb-4 text-sm leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <motion.div 
                  className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold"
                  whileHover={{ scale: 1.1 }}
                >
                  {testimonial.name.charAt(0)}
                </motion.div>
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Badges */}
        <motion.div 
          className="mt-12 flex flex-wrap items-center justify-center gap-8 lg:gap-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <Star className="w-6 h-6 text-success fill-success" />
            </div>
            <div>
              <div className="text-2xl font-display font-bold text-foreground">
                {siteConfig.stats.satisfaction}
              </div>
              <div className="text-sm text-muted-foreground">Nota média</div>
            </div>
          </motion.div>

          <div className="h-12 w-px bg-border hidden lg:block" />

          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
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
          </motion.div>

          <div className="h-12 w-px bg-border hidden lg:block" />

          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
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
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
