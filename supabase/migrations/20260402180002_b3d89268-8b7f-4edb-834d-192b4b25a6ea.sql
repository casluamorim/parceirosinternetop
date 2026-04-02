
-- Create sales role type
CREATE TYPE public.sales_role AS ENUM ('vendedor', 'financeiro', 'admin');

-- Tables first
CREATE TABLE public.sales_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name text NOT NULL,
  email text NOT NULL,
  role sales_role NOT NULL DEFAULT 'vendedor',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.plan_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_item_id uuid NOT NULL REFERENCES public.plan_items(id) ON DELETE CASCADE UNIQUE,
  comissao numeric NOT NULL DEFAULT 0,
  bonus_extra numeric DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  telefone text,
  email text,
  endereco text,
  vendedor_id uuid REFERENCES public.sales_users(id),
  plano_id uuid REFERENCES public.plan_items(id),
  status text NOT NULL DEFAULT 'ativo',
  data_adesao date NOT NULL DEFAULT CURRENT_DATE,
  mes integer NOT NULL,
  ano integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.vendas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendedor_id uuid NOT NULL REFERENCES public.sales_users(id),
  plano_id uuid NOT NULL REFERENCES public.plan_items(id),
  cliente_id uuid REFERENCES public.clientes(id),
  quantidade integer NOT NULL DEFAULT 1,
  mes integer NOT NULL,
  ano integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.cancelamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES public.clientes(id),
  vendedor_id uuid NOT NULL REFERENCES public.sales_users(id),
  motivo text,
  mes integer NOT NULL,
  ano integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.metas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  min_vendas integer NOT NULL,
  bonus numeric NOT NULL,
  mes integer NOT NULL,
  ano integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.meta_vendedor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendedor_id uuid NOT NULL REFERENCES public.sales_users(id),
  meta integer NOT NULL,
  mes integer NOT NULL,
  ano integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.recorrencia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  valor numeric NOT NULL DEFAULT 0,
  mes integer NOT NULL,
  ano integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.investimento_mensal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  valor numeric NOT NULL DEFAULT 0,
  mes integer NOT NULL,
  ano integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.sales_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Triggers
CREATE TRIGGER update_sales_users_updated_at BEFORE UPDATE ON public.sales_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plan_commissions_updated_at BEFORE UPDATE ON public.plan_commissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Now functions (after tables exist)
CREATE OR REPLACE FUNCTION public.has_sales_role(_user_id uuid, _role sales_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.sales_users
    WHERE user_id = _user_id AND role = _role AND active = true
  )
$$;

CREATE OR REPLACE FUNCTION public.has_sales_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.sales_users
    WHERE user_id = _user_id AND active = true
  )
$$;

CREATE OR REPLACE FUNCTION public.get_sales_user_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.sales_users WHERE user_id = _user_id AND active = true LIMIT 1
$$;

-- Enable RLS
ALTER TABLE public.sales_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancelamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_vendedor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recorrencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investimento_mensal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Site admin manages sales_users" ON public.sales_users FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Sales admin manages sales_users" ON public.sales_users FOR ALL TO authenticated
  USING (has_sales_role(auth.uid(), 'admin'::sales_role))
  WITH CHECK (has_sales_role(auth.uid(), 'admin'::sales_role));
CREATE POLICY "User views own sales profile" ON public.sales_users FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admin/financeiro manage commissions" ON public.plan_commissions FOR ALL TO authenticated
  USING (has_sales_role(auth.uid(), 'admin'::sales_role) OR has_sales_role(auth.uid(), 'financeiro'::sales_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_sales_role(auth.uid(), 'admin'::sales_role) OR has_sales_role(auth.uid(), 'financeiro'::sales_role) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Sales users view commissions" ON public.plan_commissions FOR SELECT TO authenticated
  USING (has_sales_access(auth.uid()));

CREATE POLICY "Admin/financeiro manage vendas" ON public.vendas FOR ALL TO authenticated
  USING (has_sales_role(auth.uid(), 'admin'::sales_role) OR has_sales_role(auth.uid(), 'financeiro'::sales_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_sales_role(auth.uid(), 'admin'::sales_role) OR has_sales_role(auth.uid(), 'financeiro'::sales_role) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Vendedor views own vendas" ON public.vendas FOR SELECT TO authenticated
  USING (vendedor_id = get_sales_user_id(auth.uid()));
CREATE POLICY "Vendedor inserts own vendas" ON public.vendas FOR INSERT TO authenticated
  WITH CHECK (vendedor_id = get_sales_user_id(auth.uid()));

CREATE POLICY "Admin/financeiro manage clientes" ON public.clientes FOR ALL TO authenticated
  USING (has_sales_role(auth.uid(), 'admin'::sales_role) OR has_sales_role(auth.uid(), 'financeiro'::sales_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_sales_role(auth.uid(), 'admin'::sales_role) OR has_sales_role(auth.uid(), 'financeiro'::sales_role) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Vendedor views own clientes" ON public.clientes FOR SELECT TO authenticated
  USING (vendedor_id = get_sales_user_id(auth.uid()));
CREATE POLICY "Vendedor inserts own clientes" ON public.clientes FOR INSERT TO authenticated
  WITH CHECK (vendedor_id = get_sales_user_id(auth.uid()));

CREATE POLICY "Admin/financeiro manage cancelamentos" ON public.cancelamentos FOR ALL TO authenticated
  USING (has_sales_role(auth.uid(), 'admin'::sales_role) OR has_sales_role(auth.uid(), 'financeiro'::sales_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_sales_role(auth.uid(), 'admin'::sales_role) OR has_sales_role(auth.uid(), 'financeiro'::sales_role) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Vendedor views own cancelamentos" ON public.cancelamentos FOR SELECT TO authenticated
  USING (vendedor_id = get_sales_user_id(auth.uid()));

CREATE POLICY "Admin/financeiro manage metas" ON public.metas FOR ALL TO authenticated
  USING (has_sales_role(auth.uid(), 'admin'::sales_role) OR has_sales_role(auth.uid(), 'financeiro'::sales_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_sales_role(auth.uid(), 'admin'::sales_role) OR has_sales_role(auth.uid(), 'financeiro'::sales_role) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Sales users view metas" ON public.metas FOR SELECT TO authenticated
  USING (has_sales_access(auth.uid()));

CREATE POLICY "Admin/financeiro manage meta_vendedor" ON public.meta_vendedor FOR ALL TO authenticated
  USING (has_sales_role(auth.uid(), 'admin'::sales_role) OR has_sales_role(auth.uid(), 'financeiro'::sales_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_sales_role(auth.uid(), 'admin'::sales_role) OR has_sales_role(auth.uid(), 'financeiro'::sales_role) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Vendedor views own meta_vendedor" ON public.meta_vendedor FOR SELECT TO authenticated
  USING (vendedor_id = get_sales_user_id(auth.uid()));

CREATE POLICY "Admin/financeiro manage recorrencia" ON public.recorrencia FOR ALL TO authenticated
  USING (has_sales_role(auth.uid(), 'admin'::sales_role) OR has_sales_role(auth.uid(), 'financeiro'::sales_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_sales_role(auth.uid(), 'admin'::sales_role) OR has_sales_role(auth.uid(), 'financeiro'::sales_role) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Sales users view recorrencia" ON public.recorrencia FOR SELECT TO authenticated
  USING (has_sales_access(auth.uid()));

CREATE POLICY "Admin/financeiro manage investimento" ON public.investimento_mensal FOR ALL TO authenticated
  USING (has_sales_role(auth.uid(), 'admin'::sales_role) OR has_sales_role(auth.uid(), 'financeiro'::sales_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_sales_role(auth.uid(), 'admin'::sales_role) OR has_sales_role(auth.uid(), 'financeiro'::sales_role) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Sales users view investimento" ON public.investimento_mensal FOR SELECT TO authenticated
  USING (has_sales_access(auth.uid()));

CREATE POLICY "Admin manages logs" ON public.sales_logs FOR ALL TO authenticated
  USING (has_sales_role(auth.uid(), 'admin'::sales_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_sales_role(auth.uid(), 'admin'::sales_role) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users view own logs" ON public.sales_logs FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Users insert own logs" ON public.sales_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
