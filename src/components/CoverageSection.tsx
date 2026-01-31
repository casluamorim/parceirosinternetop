import { useState } from "react";
import { MapPin, Check, Search } from "lucide-react";
import { siteConfig } from "@/lib/config";

export function CoverageSection() {
  const [selectedCity, setSelectedCity] = useState<string>(siteConfig.coverage.cities[0]);
  const [searchTerm, setSearchTerm] = useState("");

  const neighborhoods = siteConfig.coverage.neighborhoods[selectedCity as keyof typeof siteConfig.coverage.neighborhoods] || [];
  
  const filteredNeighborhoods = neighborhoods.filter((n) =>
    n.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="cobertura" className="py-16 lg:py-24 bg-accent">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <span className="badge-primary mb-4">Área de Cobertura</span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Onde estamos presentes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fibra óptica de alta velocidade em Balneário Camboriú e Camboriú. 
            Confira se seu bairro já está coberto.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Map placeholder / Visual */}
          <div className="card-premium p-8 flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <MapPin className="w-12 h-12 text-primary" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-2 text-center">
              {siteConfig.coverage.cities.join(" e ")}
            </h3>
            <p className="text-muted-foreground text-center mb-6">
              {neighborhoods.length}+ bairros atendidos com fibra óptica
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {siteConfig.coverage.cities.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCity === city
                      ? "bg-primary text-white"
                      : "bg-white text-foreground hover:bg-primary/10"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Neighborhoods List */}
          <div className="card-premium p-6">
            <div className="mb-6">
              <h4 className="font-display text-xl font-bold text-foreground mb-4">
                Bairros em {selectedCity}
              </h4>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar bairro..."
                  className="input-premium pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-auto pr-2">
              {filteredNeighborhoods.map((neighborhood) => (
                <div
                  key={neighborhood}
                  className="flex items-center gap-2 p-3 rounded-lg bg-success/5 border border-success/20"
                >
                  <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-success" />
                  </div>
                  <span className="text-sm text-foreground">{neighborhood}</span>
                </div>
              ))}
            </div>

            {filteredNeighborhoods.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhum bairro encontrado com "{searchTerm}"
              </p>
            )}

            <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Não encontrou seu bairro?</strong> A disponibilidade 
                pode variar por endereço. Faça o teste de cobertura pelo CEP no topo da página!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
