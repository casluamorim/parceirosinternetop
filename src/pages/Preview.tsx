import { useState } from "react";

const BREAKPOINTS = [
  { label: "Mobile S — 320px", width: 320, height: 640 },
  { label: "Mobile M — 375px", width: 375, height: 700 },
  { label: "Tablet — 768px", width: 768, height: 900 },
  { label: "Desktop — 1024px", width: 1024, height: 900 },
];

export default function Preview() {
  const [path, setPath] = useState("/#planos");

  return (
    <div className="min-h-screen bg-muted p-4 lg:p-8">
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold">Pré-visualização responsiva</h1>
            <p className="text-sm text-muted-foreground">
              Valide os cards e preços nos quebra-pontos 320 / 375 / 768 / 1024.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Rota:</label>
            <input
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className="border rounded-md px-3 py-1.5 text-sm bg-background"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {BREAKPOINTS.map((bp) => (
            <div key={bp.width} className="bg-card border rounded-xl p-3 flex flex-col">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="font-semibold text-sm">{bp.label}</span>
                <span className="text-xs text-muted-foreground">
                  {bp.width}×{bp.height}
                </span>
              </div>
              <div className="overflow-hidden rounded-lg border bg-background">
                <iframe
                  src={path}
                  title={bp.label}
                  style={{
                    width: bp.width,
                    height: bp.height,
                    border: 0,
                    transform: bp.width > 400 ? "scale(0.6)" : "scale(0.85)",
                    transformOrigin: "top left",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
