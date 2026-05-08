import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GESPROV_TOKEN = Deno.env.get("GESPROV_API_TOKEN") ?? "";
const GESPROV_PASSWORD = Deno.env.get("GESPROV_PASSWORD") ?? "";

const admin = createClient(SUPABASE_URL, SERVICE_KEY);

function backoffSeconds(attempts: number) {
  // 30s, 1m, 5m, 15m, 1h, 3h, 6h, 12h
  const ladder = [30, 60, 300, 900, 3600, 10800, 21600, 43200];
  return ladder[Math.min(attempts, ladder.length - 1)];
}

async function sendOne(item: any, config: any) {
  if (!config?.enabled || !config?.api_url) {
    throw new Error("Integração GESPROV desativada ou sem URL configurada");
  }
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((config.extra_headers as Record<string, string>) ?? {}),
  };
  if (config.auth_type === "bearer" && GESPROV_TOKEN) {
    headers["Authorization"] = `Bearer ${GESPROV_TOKEN}`;
  } else if (config.auth_type === "apikey" && GESPROV_TOKEN) {
    headers["X-API-Key"] = GESPROV_TOKEN;
  } else if (config.auth_type === "basic" && config.username && GESPROV_PASSWORD) {
    headers["Authorization"] = `Basic ${btoa(`${config.username}:${GESPROV_PASSWORD}`)}`;
  }

  const url = `${config.api_url.replace(/\/$/, "")}/${item.tipo}`;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(item.payload),
  });
  const text = await res.text();
  let body: any = text;
  try { body = JSON.parse(text); } catch { /* keep text */ }
  return { ok: res.ok, status: res.status, body };
}

async function processQueue(limit = 20) {
  const { data: config } = await admin.from("gesprov_config").select("*").limit(1).maybeSingle();

  const { data: items } = await admin
    .from("gesprov_queue")
    .select("*")
    .in("status", ["pending"])
    .lte("next_retry_at", new Date().toISOString())
    .order("created_at", { ascending: true })
    .limit(limit);

  if (!items || items.length === 0) return { processed: 0 };

  let okCount = 0;
  let failCount = 0;

  for (const item of items) {
    await admin.from("gesprov_queue").update({ status: "processing" }).eq("id", item.id);
    try {
      const result = await sendOne(item, config);
      if (result.ok) {
        okCount++;
        await admin.from("gesprov_queue").update({
          status: "sent",
          last_error: null,
          gesprov_id: result.body?.id ?? null,
          attempts: item.attempts + 1,
        }).eq("id", item.id);
        await admin.from("gesprov_logs").insert({
          queue_id: item.id, tipo: item.tipo, entity_id: item.entity_id,
          status: "success", http_status: result.status,
          payload: item.payload, response: result.body,
        });
      } else {
        throw new Error(`HTTP ${result.status}: ${typeof result.body === "string" ? result.body : JSON.stringify(result.body)}`);
      }
    } catch (err: any) {
      failCount++;
      const attempts = item.attempts + 1;
      const failed = attempts >= item.max_attempts;
      const next = new Date(Date.now() + backoffSeconds(attempts) * 1000).toISOString();
      await admin.from("gesprov_queue").update({
        status: failed ? "failed" : "pending",
        attempts,
        next_retry_at: next,
        last_error: String(err?.message ?? err),
      }).eq("id", item.id);
      await admin.from("gesprov_logs").insert({
        queue_id: item.id, tipo: item.tipo, entity_id: item.entity_id,
        status: failed ? "failed" : "retry",
        message: String(err?.message ?? err),
        payload: item.payload,
      });
    }
  }

  await admin.from("gesprov_config").update({
    last_sync_at: new Date().toISOString(),
    last_status: failCount === 0 ? "ok" : okCount === 0 ? "error" : "partial",
    last_error: failCount > 0 ? `${failCount} falha(s) nesta execução` : null,
  }).eq("singleton", true);

  return { processed: items.length, ok: okCount, failed: failCount };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") ?? "process";

    if (action === "test") {
      const { data: config } = await admin.from("gesprov_config").select("*").limit(1).maybeSingle();
      if (!config?.api_url) {
        return new Response(JSON.stringify({ ok: false, error: "URL não configurada" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      try {
        const headers: Record<string, string> = { ...((config.extra_headers as any) ?? {}) };
        if (config.auth_type === "bearer" && GESPROV_TOKEN) headers["Authorization"] = `Bearer ${GESPROV_TOKEN}`;
        const res = await fetch(config.api_url, { method: "GET", headers });
        return new Response(JSON.stringify({ ok: res.ok, status: res.status }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (e: any) {
        return new Response(JSON.stringify({ ok: false, error: String(e?.message ?? e) }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    const result = await processQueue();
    return new Response(JSON.stringify({ success: true, ...result }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: String(err?.message ?? err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
