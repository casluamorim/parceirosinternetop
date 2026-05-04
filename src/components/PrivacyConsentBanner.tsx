import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

const KEY = "pi_privacy_consent_v1";

export function PrivacyConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(KEY)) setShow(true);
  }, []);

  const accept = () => {
    localStorage.setItem(KEY, "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50">
      <div className="bg-card border border-border rounded-xl shadow-2xl p-4 flex items-start gap-3">
        <p className="text-sm text-foreground flex-1">
          Ao continuar navegando, você concorda com nossa{" "}
          <Link to="/politica-de-privacidade" className="text-primary underline font-medium">
            Política de Privacidade
          </Link>
          .
        </p>
        <button
          onClick={accept}
          className="bg-primary text-primary-foreground text-sm font-semibold px-3 py-1.5 rounded-md hover:opacity-90 whitespace-nowrap"
        >
          Concordo
        </button>
        <button onClick={accept} aria-label="Fechar" className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
