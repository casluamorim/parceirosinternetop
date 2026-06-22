
DROP POLICY IF EXISTS "Authenticated can enqueue" ON public.gesprov_queue;
CREATE POLICY "Anyone can enqueue leads" ON public.gesprov_queue
  FOR INSERT TO anon, authenticated
  WITH CHECK (tipo IN ('lead_contato','lead_indique_amigo','lead_disponibilidade','lead_contrato'));
