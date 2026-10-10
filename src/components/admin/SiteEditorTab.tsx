import { useEffect, useRef, useState } from "react";
import { Save, Undo2, Monitor, Smartphone, RefreshCw, Upload, MousePointer2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { parseSiteContent, SITE_CONTENT_KEY, type SiteContent } from "@/components/SiteContent";

type Selection = { id: string; label: string; value: string; kind: string };
export function SiteEditorTab({ onManage }: { onManage: (tab: string) => void }) {
  const [saved, setSaved] = useState<SiteContent>({});
  const [draft, setDraft] = useState<SiteContent>({});
  const [selection, setSelection] = useState<Selection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [revision, setRevision] = useState(0);
  const frame = useRef<HTMLIFrameElement>(null);
  const upload = useRef<HTMLInputElement>(null);
  const latest = useRef(draft);
  latest.current = draft;
  const { toast } = useToast();
  const dirty = JSON.stringify(saved) !== JSON.stringify(draft);
  useEffect(() => {
    let alive = true;
    supabase.from("site_settings").select("value").eq("key", SITE_CONTENT_KEY).maybeSingle().then(({ data, error }) => {
      if (!alive) return;
      if (error) toast({ title: "Erro ao carregar editor", description: error.message, variant: "destructive" });
      const content = parseSiteContent(data?.value);
      setSaved(content); setDraft(content); setLoading(false);
    });
    return () => { alive = false; };
  }, [toast]);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      if (event.data?.type === "site-editor-ready") frame.current?.contentWindow?.postMessage({ type: "site-editor-draft", content: latest.current }, window.location.origin);
      if (event.data?.type !== "site-editor-select") return;
      if (typeof event.data.manage === "string") { onManage(event.data.manage); return; }
      if (typeof event.data.id !== "string" || typeof event.data.value !== "string") return;
      setSelection({ id: event.data.id, label: event.data.label || "Texto", value: event.data.value, kind: event.data.kind });
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [onManage]);
  useEffect(() => {
    frame.current?.contentWindow?.postMessage({ type: "site-editor-draft", content: draft }, window.location.origin);
  }, [draft]);
  const change = (value: string) => {
    if (!selection) return;
    setSelection({ ...selection, value });
    setDraft((current) => ({ ...current, [selection.id]: value }));
  };
  const save = async () => {
    if (Object.values(draft).some((value) => value.length > 3000)) return;
    if (Object.entries(draft).some(([key, value]) => key.endsWith(".image") && value && !/^https:\/\//.test(value))) {
      toast({ title: "Imagem inválida", description: "Use uma URL HTTPS ou envie uma imagem.", variant: "destructive" }); return;
    }
    setSaving(true);
    const { error } = await supabase.from("site_settings").upsert({ key: SITE_CONTENT_KEY, value: draft }, { onConflict: "key" });
    setSaving(false);
    if (error) toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    else { setSaved({ ...draft }); toast({ title: "Site atualizado", description: "As alterações foram salvas no site." }); }
  };
  const uploadImage = async (file?: File) => {
    if (!file || !selection) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      toast({ title: "Imagem inválida", description: "Envie PNG, JPG ou WebP de até 5 MB.", variant: "destructive" }); return;
    }
    const selectedId = selection.id;
    setUploading(true);
    const path = `editor/${crypto.randomUUID()}.${file.type.split("/")[1]}`;
    const { error } = await supabase.storage.from("site-assets").upload(path, file);
    setUploading(false);
    if (error) toast({ title: "Erro ao enviar imagem", description: error.message, variant: "destructive" });
    else {
      const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
      setDraft((current) => ({ ...current, [selectedId]: data.publicUrl }));
      setSelection((current) => current?.id === selectedId ? { ...current, value: data.publicUrl } : current);
    }
    if (upload.current) upload.current.value = "";
  };
  if (loading) return <p className="py-8 text-muted-foreground">Carregando editor...</p>;
  return <section className="min-w-0 space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-xl font-bold">Editor do site</h2><p className="text-sm text-muted-foreground">{dirty ? "Alterações não salvas" : "Todas as alterações salvas"}</p></div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="icon" title="Computador" aria-label="Prévia computador" aria-pressed={!mobile} onClick={() => setMobile(false)}><Monitor /></Button>
        <Button variant="outline" size="icon" title="Celular" aria-label="Prévia celular" aria-pressed={mobile} onClick={() => setMobile(true)}><Smartphone /></Button>
        <Button variant="outline" size="icon" title="Recarregar prévia" aria-label="Recarregar prévia" onClick={() => setRevision((n) => n + 1)}><RefreshCw /></Button>
        <Button variant="outline" disabled={!dirty || saving} onClick={() => { setDraft({ ...saved }); setSelection(null); }}><Undo2 /> Descartar</Button>
        <Button disabled={!dirty || saving || uploading} onClick={save}><Save />{saving ? "Salvando..." : "Salvar site"}</Button>
      </div>
    </div>
    <div className="grid min-w-0 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="min-w-0 space-y-5 border-r border-border pr-4">
        {selection ? <>
          <div className="space-y-2"><Label htmlFor="site-editor-value">{selection.label}</Label>
            {selection.kind === "image" ? <><Input id="site-editor-value" value={selection.value} maxLength={500} onChange={(e) => change(e.target.value)} /><input ref={upload} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => void uploadImage(e.target.files?.[0])} /><Button variant="outline" disabled={uploading} onClick={() => upload.current?.click()}><Upload />{uploading ? "Enviando..." : "Enviar imagem"}</Button></> : <Textarea id="site-editor-value" value={selection.value} maxLength={3000} rows={7} onChange={(e) => change(e.target.value)} />}
          </div>
          <Button variant="ghost" onClick={() => { const next = { ...draft }; delete next[selection.id]; setDraft(next); setSelection(null); }}><Undo2 /> Restaurar original</Button>
        </> : <div className="flex items-center gap-2 py-4 text-muted-foreground"><MousePointer2 className="h-5 w-5 shrink-0" /><span className="text-sm">Nenhum conteúdo selecionado</span></div>}
        <div className="space-y-2 border-t border-border pt-4"><h3 className="text-sm font-semibold">Gerenciar conteúdo</h3>{[["plans-combos", "Planos e promoções"], ["coverage", "Bairros de cobertura"], ["companies", "Empresas parceiras"], ["testimonials", "Depoimentos"], ["settings", "Logo, favicon e contato"]].map(([tab, name]) => <Button key={tab} variant="ghost" className="w-full justify-start whitespace-normal text-left" onClick={() => onManage(tab)}>{name}</Button>)}</div>
      </aside>
      <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-muted p-2">
        <iframe key={revision} ref={frame} title="Prévia editável do site" src="/?site-editor=1" className={`mx-auto block h-[720px] max-w-full border-0 bg-background ${mobile ? "w-[375px]" : "w-full"}`} />
      </div>
    </div>
  </section>;
}