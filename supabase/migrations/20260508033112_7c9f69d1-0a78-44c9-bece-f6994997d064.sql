
-- CONFIG (singleton)
CREATE TABLE public.gesprov_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_url text,
  auth_type text NOT NULL DEFAULT 'bearer',
  username text,
  extra_headers jsonb NOT NULL DEFAULT '{}'::jsonb,
  enabled boolean NOT NULL DEFAULT false,
  last_sync_at timestamptz,
  last_status text,
  last_error text,
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.gesprov_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage gesprov_config" ON public.gesprov_config
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER trg_gesprov_config_updated BEFORE UPDATE ON public.gesprov_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.gesprov_config (enabled) VALUES (false);

-- QUEUE
CREATE TABLE public.gesprov_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL,
  entity_id uuid,
  dedupe_key text,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 8,
  next_retry_at timestamptz NOT NULL DEFAULT now(),
  last_error text,
  gesprov_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_gesprov_queue_status_retry ON public.gesprov_queue(status, next_retry_at);
CREATE INDEX idx_gesprov_queue_dedupe ON public.gesprov_queue(dedupe_key) WHERE dedupe_key IS NOT NULL;
ALTER TABLE public.gesprov_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read gesprov_queue" ON public.gesprov_queue
  FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admins manage gesprov_queue" ON public.gesprov_queue
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Anyone can enqueue" ON public.gesprov_queue
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    tipo = ANY (ARRAY['cliente','venda','lead_cobertura','lead_contato','lead_whatsapp','referral'])
    AND char_length(tipo) <= 50
    AND jsonb_typeof(payload) = 'object'
  );
CREATE TRIGGER trg_gesprov_queue_updated BEFORE UPDATE ON public.gesprov_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- LOGS
CREATE TABLE public.gesprov_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id uuid REFERENCES public.gesprov_queue(id) ON DELETE SET NULL,
  tipo text NOT NULL,
  entity_id uuid,
  status text NOT NULL,
  http_status integer,
  message text,
  payload jsonb,
  response jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_gesprov_logs_created ON public.gesprov_logs(created_at DESC);
ALTER TABLE public.gesprov_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read gesprov_logs" ON public.gesprov_logs
  FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admins manage gesprov_logs" ON public.gesprov_logs
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));
