import { createContext, useContext, useEffect, useState, type ReactNode, type MouseEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SiteContent = Record<string, string>;
const ContentContext = createContext<SiteContent>({});
export const SITE_CONTENT_KEY = "site_content";
export function parseSiteContent(value: unknown): SiteContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([key, text]) => /^[a-z0-9_.-]{1,100}$/.test(key) && typeof text === "string" && text.length <= 3000)) as SiteContent;
}

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>({});
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    let alive = true;
    supabase.from("site_settings").select("value").eq("key", SITE_CONTENT_KEY).maybeSingle().then(({ data }) => {
      if (alive) setContent(parseSiteContent(data?.value));
    });
    if (window.parent !== window) {
      const enable = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
        if (!alive || !data) return;
        setEditing(true);
        window.parent.postMessage({ type: "site-editor-ready" }, window.location.origin);
      };
      void enable();
    }
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    if (!editing) return;
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      if (event.data?.type === "site-editor-draft") setContent(parseSiteContent(event.data.content));
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [editing]);
  const select = (event: MouseEvent<HTMLDivElement>) => {
    if (!editing || !(event.target instanceof Element)) return;
    const element = event.target.closest<HTMLElement>("[data-site-field], [data-site-manage]");
    if (!element) return;
    event.preventDefault();
    event.stopPropagation();
    document.querySelector(".site-editor-selected")?.classList.remove("site-editor-selected");
    element.classList.add("site-editor-selected");
    window.parent.postMessage({
      type: "site-editor-select", id: element.dataset.siteField,
      label: element.dataset.siteLabel, value: element.dataset.siteValue,
      kind: element.dataset.siteKind || "text", manage: element.dataset.siteManage,
    }, window.location.origin);
  };
  return <ContentContext.Provider value={content}><div className={editing ? "site-editor-enabled" : undefined} onClickCapture={select}>{children}</div></ContentContext.Provider>;
}

export function EditableText({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  const content = useContext(ContentContext);
  return <span data-site-field={id} data-site-label={label} data-site-value={content[id] ?? (typeof children === "string" ? children : "")}>{content[id] ?? children}</span>;
}

export function EditableImage({ id, label, src, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { id: string; label: string }) {
  const content = useContext(ContentContext);
  const override = content[id];
  return <img {...props} src={override || src} data-site-field={id} data-site-label={label} data-site-value={override || src} data-site-kind="image" />;
}