import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { FaixaComissao } from "@/lib/sales-utils";
import { FAIXAS_COMISSAO_DEFAULT } from "@/lib/sales-utils";

export function useFaixasComissao() {
  const [faixas, setFaixas] = useState<FaixaComissao[]>(FAIXAS_COMISSAO_DEFAULT);
  const [loading, setLoading] = useState(true);

  const loadFaixas = async () => {
    const { data } = await supabase
      .from("faixas_comissao")
      .select("min_vendas, max_vendas, percentual")
      .order("min_vendas", { ascending: true });

    if (data && data.length > 0) {
      setFaixas(data.map((d) => ({ min: d.min_vendas, max: d.max_vendas, percentual: Number(d.percentual) })));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFaixas();
  }, []);

  return { faixas, loading, reload: loadFaixas };
}
