CREATE TABLE public.coverage_areas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city text NOT NULL,
  neighborhood text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.coverage_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coverage areas are viewable by everyone"
  ON public.coverage_areas FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage coverage areas"
  ON public.coverage_areas FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_coverage_areas_city_ativo ON public.coverage_areas(city, ativo);