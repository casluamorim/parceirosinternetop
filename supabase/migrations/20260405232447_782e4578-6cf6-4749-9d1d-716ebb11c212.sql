
ALTER TABLE public.cancelamentos 
  ADD COLUMN IF NOT EXISTS data_cancelamento date DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS meses_ativo integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cancelamento_antecipado boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS valor_multa numeric DEFAULT 0;
