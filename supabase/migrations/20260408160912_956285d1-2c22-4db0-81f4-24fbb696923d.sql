
CREATE TABLE public.faixas_comissao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  min_vendas INTEGER NOT NULL,
  max_vendas INTEGER NOT NULL,
  percentual NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.faixas_comissao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/financeiro manage faixas_comissao"
ON public.faixas_comissao
FOR ALL
TO authenticated
USING (
  has_sales_role(auth.uid(), 'admin'::sales_role)
  OR has_sales_role(auth.uid(), 'financeiro'::sales_role)
  OR has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  has_sales_role(auth.uid(), 'admin'::sales_role)
  OR has_sales_role(auth.uid(), 'financeiro'::sales_role)
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Sales users view faixas_comissao"
ON public.faixas_comissao
FOR SELECT
TO authenticated
USING (has_sales_access(auth.uid()));

INSERT INTO public.faixas_comissao (min_vendas, max_vendas, percentual) VALUES
  (1, 25, 0.20),
  (26, 36, 0.25),
  (37, 51, 0.30),
  (52, 72, 0.35),
  (73, 90, 0.40);
