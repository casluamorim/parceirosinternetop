import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function SiteFavicon() {
  useEffect(() => {
    let alive = true;
    let manifestUrl = "";
    const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]'));
    const originals = links.map((link) => ({ link, href: link.href, type: link.type }));
    const load = async () => {
      const { data, error } = await supabase.from("site_settings").select("value").eq("key", "company_favicon").maybeSingle();
      if (!alive || error) return;
      const icons = data?.value;
      originals.forEach(({ link, href, type }) => { link.href = href; link.type = type; });
      if (manifestUrl) { URL.revokeObjectURL(manifestUrl); manifestUrl = ""; }
      if (!icons || typeof icons !== "object" || Array.isArray(icons)) return;
      const iconUrl = (size: string) => {
        const value = icons[size];
        return typeof value === "string" && value.startsWith("https://") ? value : "";
      };
      links.forEach((link) => {
        if (link.rel === "manifest") return;
        const size = link.rel === "apple-touch-icon" ? "180" : link.sizes.value.split("x")[0] || "48";
        const url = iconUrl(size);
        if (url) { link.href = url; link.type = "image/png"; }
      });
      const manifestLink = links.find((link) => link.rel === "manifest");
      if (manifestLink && iconUrl("192") && iconUrl("512")) {
        const response = await fetch("/site.webmanifest");
        if (!response.ok || !alive) return;
        const manifest = await response.json();
        if (!alive) return;
        manifest.icons = [192, 512].map((size) => ({ src: iconUrl(String(size)), sizes: `${size}x${size}`, type: "image/png" }));
        manifest.start_url = window.location.origin + "/";
        manifestUrl = URL.createObjectURL(new Blob([JSON.stringify(manifest)], { type: "application/manifest+json" }));
        manifestLink.href = manifestUrl;
      }
    };
    const refresh = () => { void load().catch(() => undefined); };
    refresh();
    window.addEventListener("site-favicon-updated", refresh);
    return () => { alive = false; window.removeEventListener("site-favicon-updated", refresh); if (manifestUrl) URL.revokeObjectURL(manifestUrl); };
  }, []);
  return null;
}