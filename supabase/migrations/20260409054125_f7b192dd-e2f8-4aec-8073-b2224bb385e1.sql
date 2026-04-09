
CREATE TABLE public.despesas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  categoria TEXT NOT NULL DEFAULT 'outros',
  mes INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/financeiro manage despesas"
  ON public.despesas FOR ALL
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
