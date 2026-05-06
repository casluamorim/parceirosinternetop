import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const KEY = "pi_privacy_consent_v2";

interface Consent {
  essential: true;
  performance: boolean;
  marketing: boolean;
}

export function PrivacyConsentBanner() {
  const [show, setShow] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [prefs, setPrefs] = useState<Consent>({
    essential: true,
    performance: true,
    marketing: true,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(KEY)) setShow(true);
  }, []);

  const save = (c: Consent) => {
    localStorage.setItem(KEY, JSON.stringify({ ...c, ts: Date.now() }));
    setShow(false);
    setManageOpen(false);
  };

  const acceptAll = () =>
    save({ essential: true, performance: true, marketing: true });

  if (!show) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 md:p-6">
        <div className="mx-auto max-w-4xl bg-card border border-border rounded-xl shadow-2xl p-4 sm:p-5">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="hidden sm:flex w-10 h-10 rounded-lg bg-primary/10 text-primary items-center justify-center shrink-0">
              <Cookie className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground mb-1 flex items-center gap-2">
                <Cookie className="w-4 h-4 sm:hidden" />
                Utilizamos cookies
              </p>
              <p className="text-sm text-muted-foreground">
                Utilizamos cookies para melhorar sua experiência. Ao continuar, você concorda
                com nossa{" "}
                <Link to="/politica-de-privacidade" className="text-primary underline font-medium">
                  Política de Privacidade
                </Link>
                .
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Button onClick={acceptAll} size="sm" className="font-semibold">
                  Aceitar
                </Button>
                <Button
                  onClick={() => setManageOpen(true)}
                  size="sm"
                  variant="outline"
                  className="font-semibold"
                >
                  Gerenciar
                </Button>
              </div>
            </div>
            <button
              onClick={acceptAll}
              aria-label="Fechar"
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Preferências de cookies</DialogTitle>
            <DialogDescription>
              Escolha quais cookies você deseja permitir. Cookies essenciais não podem ser
              desativados.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <PrefRow
              title="Essenciais"
              description="Necessários para o funcionamento do site."
              checked
              disabled
            />
            <PrefRow
              title="Desempenho"
              description="Ajudam a entender como o site é usado."
              checked={prefs.performance}
              onChange={(v) => setPrefs({ ...prefs, performance: v })}
            />
            <PrefRow
              title="Marketing"
              description="Permitem anúncios personalizados e remarketing."
              checked={prefs.marketing}
              onChange={(v) => setPrefs({ ...prefs, marketing: v })}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() =>
                save({ essential: true, performance: false, marketing: false })
              }
            >
              Rejeitar opcionais
            </Button>
            <Button onClick={() => save(prefs)}>Salvar preferências</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PrefRow({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border border-border rounded-lg p-3">
      <div className="min-w-0">
        <Label className="font-semibold">{title}</Label>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={(v) => onChange?.(v)}
      />
    </div>
  );
}
