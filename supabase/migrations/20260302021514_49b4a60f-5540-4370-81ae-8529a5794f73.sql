
-- Categories table
CREATE TABLE public.plan_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.plan_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plan categories are viewable by everyone"
  ON public.plan_categories FOR SELECT USING (true);

CREATE POLICY "Admins can manage plan categories"
  ON public.plan_categories FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_plan_categories_updated_at
  BEFORE UPDATE ON public.plan_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Plan items table
CREATE TABLE public.plan_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.plan_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  speed integer NOT NULL,
  price numeric NOT NULL,
  original_price numeric,
  description text,
  slogan text,
  features text[] DEFAULT '{}'::text[],
  badge text,
  popular boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  whatsapp_message text,
  terms_url text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.plan_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plan items are viewable by everyone"
  ON public.plan_items FOR SELECT USING (true);

CREATE POLICY "Admins can manage plan items"
  ON public.plan_items FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_plan_items_updated_at
  BEFORE UPDATE ON public.plan_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.plan_categories (name, slug, display_order, is_default) VALUES
  ('Combos', 'combos', 1, true),
  ('Wi Fi', 'wifi', 2, false),
  ('Internet móvel', 'internet-movel', 3, false),
  ('TV', 'tv', 4, false);
