
-- user_roles: política explícita para admin gerenciar
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- gesprov_queue: limita tamanho do payload para mitigar flood
DROP POLICY IF EXISTS "Anyone can enqueue leads" ON public.gesprov_queue;
CREATE POLICY "Public can enqueue limited leads" ON public.gesprov_queue
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    tipo IN ('lead_contato','lead_indique_amigo','lead_disponibilidade','lead_contrato')
    AND pg_column_size(payload) < 8192
  );
