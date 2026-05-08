import { supabase } from "@/integrations/supabase/client";

export type GesprovTipo =
  | "cliente"
  | "venda"
  | "lead_cobertura"
  | "lead_contato"
  | "lead_whatsapp"
  | "referral";

/**
 * Enfileira um envio para o GESPROV. Nunca lança — falhas são silenciosas
 * para não impactar o fluxo do site. Processado em background pela edge function.
 */
export async function enqueueGesprov(
  tipo: GesprovTipo,
  payload: Record<string, unknown>,
  opts?: { entityId?: string; dedupeKey?: string }
) {
  try {
    await (supabase.from as any)("gesprov_queue").insert({
      tipo,
      entity_id: opts?.entityId ?? null,
      dedupe_key: opts?.dedupeKey ?? null,
      payload,
    });
    // Dispara processamento em background (sem aguardar)
    supabase.functions.invoke("gesprov-sync").catch(() => {});
  } catch {
    // Silencioso por design
  }
}
