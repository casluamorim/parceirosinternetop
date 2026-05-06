CREATE TABLE public.lgpd_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text NOT NULL,
  telefone text,
  tipo_solicitacao text NOT NULL,
  mensagem text NOT NULL,
  status text NOT NULL DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lgpd_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit LGPD requests"
  ON public.lgpd_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(nome) BETWEEN 1 AND 150
    AND char_length(email) BETWEEN 3 AND 255
    AND char_length(mensagem) BETWEEN 1 AND 2000
    AND tipo_solicitacao IN ('acesso','correcao','exclusao','outros')
  );

CREATE POLICY "Admins manage LGPD requests"
  ON public.lgpd_requests FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_lgpd_requests_updated_at
  BEFORE UPDATE ON public.lgpd_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();