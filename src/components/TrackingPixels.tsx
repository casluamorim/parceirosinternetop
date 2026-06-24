import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Loads marketing pixels (Meta, Google Analytics/GTM, TikTok) from
 * site_settings and injects the corresponding scripts at runtime.
 * Safe no-op when an ID is missing.
 */
export function TrackingPixels() {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", [
          "tracking_meta_pixel_id",
          "tracking_ga_id",
          "tracking_gtm_id",
          "tracking_tiktok_pixel_id",
        ]);
      if (cancelled || !data) return;

      const map: Record<string, string> = {};
      for (const row of data) {
        const v = typeof row.value === "string" ? row.value : "";
        if (v) map[row.key] = v.trim();
      }

      if (map.tracking_meta_pixel_id) injectMetaPixel(map.tracking_meta_pixel_id);
      if (map.tracking_ga_id) injectGA4(map.tracking_ga_id);
      if (map.tracking_gtm_id) injectGTM(map.tracking_gtm_id);
      if (map.tracking_tiktok_pixel_id) injectTikTok(map.tracking_tiktok_pixel_id);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}

function once(id: string): boolean {
  if (document.getElementById(id)) return false;
  return true;
}

function injectMetaPixel(pixelId: string) {
  if (!once(`meta-pixel-${pixelId}`)) return;
  const s = document.createElement("script");
  s.id = `meta-pixel-${pixelId}`;
  s.innerHTML = `
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init','${pixelId}');fbq('track','PageView');
  `;
  document.head.appendChild(s);
}

function injectGA4(measurementId: string) {
  if (!once(`ga4-${measurementId}`)) return;
  const s1 = document.createElement("script");
  s1.async = true;
  s1.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(s1);

  const s2 = document.createElement("script");
  s2.id = `ga4-${measurementId}`;
  s2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  `;
  document.head.appendChild(s2);
}

function injectGTM(gtmId: string) {
  if (!once(`gtm-${gtmId}`)) return;
  const s = document.createElement("script");
  s.id = `gtm-${gtmId}`;
  s.innerHTML = `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${gtmId}');
  `;
  document.head.appendChild(s);
}

function injectTikTok(pixelId: string) {
  if (!once(`tiktok-${pixelId}`)) return;
  const s = document.createElement("script");
  s.id = `tiktok-${pixelId}`;
  s.innerHTML = `
    !function (w, d, t) {
      w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
      ttq.load('${pixelId}');
      ttq.page();
    }(window, document, 'ttq');
  `;
  document.head.appendChild(s);
}
