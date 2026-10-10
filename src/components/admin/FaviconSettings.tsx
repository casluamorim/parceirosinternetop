import { useEffect, useRef, useState } from "react";
import { Upload, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export const FAVICON_KEY = "company_favicon";
export function FaviconSettings() {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const input = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  useEffect(() => {
    supabase.from("site_settings").select("value").eq("key", FAVICON_KEY).maybeSingle().then(({ data, error }) => {
      if (error) toast({ title: "Erro ao carregar favicon", variant: "destructive" });
      const value = data?.value;
      if (value && typeof value === "object" && !Array.isArray(value) && typeof value["48"] === "string") setUrl(value["48"]);
      setLoading(false);
    });
  }, [toast]);
  const upload = async (file?: File) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp", "image/x-icon", "image/vnd.microsoft.icon"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      toast({ title: "Arquivo inválido", description: "Envie PNG, JPG, WebP ou ICO de até 5 MB.", variant: "destructive" }); return;
    }
    setBusy(true);
    const uploaded: string[] = [];
    const objectUrl = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = objectUrl;
      await image.decode();
      if (image.naturalWidth < 48 || image.naturalHeight < 48) throw new Error("Envie uma imagem com pelo menos 48 × 48 pixels.");
      const prefix = `favicon/${crypto.randomUUID()}`;
      const icons: Record<string, string> = {};
      for (const size of [16, 32, 48, 180, 192, 512]) {
        const canvas = document.createElement("canvas");
        canvas.width = size; canvas.height = size;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Não foi possível preparar o favicon.");
        const ratio = Math.min(size / image.naturalWidth, size / image.naturalHeight);
        const width = image.naturalWidth * ratio, height = image.naturalHeight * ratio;
        context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
        const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Imagem inválida")), "image/png"));
        const path = `${prefix}-${size}.png`;
        const { error } = await supabase.storage.from("site-assets").upload(path, blob, { contentType: "image/png", cacheControl: "31536000" });
        if (error) throw error;
        uploaded.push(path);
        icons[String(size)] = supabase.storage.from("site-assets").getPublicUrl(path).data.publicUrl;
      }
      const { error } = await supabase.from("site_settings").upsert({ key: FAVICON_KEY, value: icons }, { onConflict: "key" });
      if (error) throw error;
      setUrl(icons["48"]);
      window.dispatchEvent(new Event("site-favicon-updated"));
      toast({ title: "Favicon atualizado", description: "Os tamanhos para navegadores e celulares foram gerados." });
    } catch (error) {
      if (uploaded.length) await supabase.storage.from("site-assets").remove(uploaded);
      toast({ title: "Erro ao enviar favicon", description: error instanceof Error ? error.message : "Tente novamente.", variant: "destructive" });
    } finally {
      URL.revokeObjectURL(objectUrl); setBusy(false);
      if (input.current) input.current.value = "";
    }
  };
  const remove = async () => {
    setBusy(true);
    const { error } = await supabase.from("site_settings").upsert({ key: FAVICON_KEY, value: {} }, { onConflict: "key" });
    setBusy(false);
    if (error) toast({ title: "Erro ao remover favicon", description: error.message, variant: "destructive" });
    else { setUrl(""); window.dispatchEvent(new Event("site-favicon-updated")); toast({ title: "Favicon original restaurado" }); }
  };
  return <Card><CardHeader><CardTitle>Favicon do site</CardTitle></CardHeader><CardContent className="space-y-4">
    <div className="flex flex-wrap items-center gap-4"><div className="flex h-20 w-20 items-center justify-center rounded-lg border border-border bg-muted"><img src={url || "/favicon-48x48.png"} alt="Favicon atual" className="h-12 w-12 object-contain" /></div>
      <div className="flex flex-col gap-2"><input ref={input} aria-label="Arquivo do favicon" type="file" accept=".png,.jpg,.jpeg,.webp,.ico" className="hidden" onChange={(e) => void upload(e.target.files?.[0])} /><Button variant="outline" disabled={busy || loading} onClick={() => input.current?.click()}><Upload />{busy ? "Processando..." : "Enviar favicon"}</Button>{url && <Button variant="ghost" disabled={busy} onClick={remove}><Trash2 />Remover favicon</Button>}</div>
    </div>
    <p className="text-sm text-muted-foreground">PNG, JPG, WebP ou ICO · até 5 MB · mínimo 48 × 48 pixels.</p>
    <p className="text-xs text-muted-foreground">O Google pode levar alguns dias ou semanas para atualizar o ícone nos resultados.</p>
  </CardContent></Card>;
}