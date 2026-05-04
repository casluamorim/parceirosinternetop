import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Item {
  id: string;
  name: string;
  speed: number;
  price: number;
  features: string[];
  badge: string | null;
  popular: boolean;
}

export function PlansComparisonGrid() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    supabase
      .from("plan_items")
      .select("id,name,speed,price,features,badge,popular")
      .eq("active", true)
      .order("price")
      .then(({ data }) => data && setItems(data as Item[]));
  }, []);

  if (!items.length) return null;

  const allFeatures = Array.from(new Set(items.flatMap((i) => i.features))).slice(0, 8);

  return (
    <section className="py-12 lg:py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-8">
          <span className="badge-primary mb-3 inline-block">Comparativo</span>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
            Compare nossos planos
          </h2>
          <p className="text-muted-foreground">Veja qual plano combina mais com você</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`relative bg-card border rounded-2xl p-5 flex flex-col ${
                item.popular ? "border-primary shadow-lg" : ""
              }`}
            >
              {item.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold bg-primary text-white whitespace-nowrap">
                  {item.badge}
                </span>
              )}
              <h3 className="font-display text-lg font-bold text-center mb-2">{item.name}</h3>
              <div className="text-center mb-3">
                <div className="text-3xl font-display font-bold text-primary">{item.speed}</div>
                <div className="text-xs text-muted-foreground">Mega</div>
              </div>
              <div className="text-center mb-4 whitespace-nowrap">
                <span className="text-xs text-muted-foreground">R$ </span>
                <span className="text-2xl sm:text-3xl font-bold">
                  {Math.floor(item.price)}
                </span>
                <span className="text-base">,{(Number(item.price) % 1).toFixed(2).slice(2)}</span>
                <span className="text-xs text-muted-foreground">/mês</span>
              </div>
              <ul className="space-y-2 text-sm flex-1">
                {allFeatures.map((f) => {
                  const has = item.features.includes(f);
                  return (
                    <li key={f} className={`flex items-start gap-2 ${has ? "" : "opacity-30"}`}>
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${has ? "text-success" : "text-muted-foreground"}`} />
                      <span className="break-words">{f}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
