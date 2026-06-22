
-- 1. Restringe INSERT na fila gesprov_queue para evitar flood anônimo
DROP POLICY IF EXISTS "Anyone can enqueue" ON public.gesprov_queue;
CREATE POLICY "Authenticated can enqueue" ON public.gesprov_queue
  FOR INSERT TO authenticated
  WITH CHECK (tipo IN ('lead_contato','lead_indique_amigo','lead_disponibilidade','lead_contrato'));

-- 2. Restringe SELECT nos buckets públicos para evitar listagem (downloads via URL pública continuam ok)
DROP POLICY IF EXISTS "Public read company-logos" ON storage.objects;
CREATE POLICY "Admins list company-logos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'company-logos' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public read site-assets" ON storage.objects;
CREATE POLICY "Admins list site-assets" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'));

-- 3. Revoga EXECUTE público das funções SECURITY DEFINER
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_sales_role(uuid, sales_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_sales_access(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_sales_user_id(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_sales_role(uuid, sales_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_sales_access(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_sales_user_id(uuid) TO authenticated, service_role;
