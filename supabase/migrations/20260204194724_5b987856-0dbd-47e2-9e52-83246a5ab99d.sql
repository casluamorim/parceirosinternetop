-- Create residential plans table
CREATE TABLE public.plans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    speed INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    features TEXT[] DEFAULT '{}',
    popular BOOLEAN DEFAULT false,
    badge TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business plans table
CREATE TABLE public.business_plans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    speed INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    features TEXT[] DEFAULT '{}',
    badge TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create testimonials table
CREATE TABLE public.testimonials (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    text TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create site settings table
CREATE TABLE public.site_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables (content is public)
CREATE POLICY "Plans are viewable by everyone" 
ON public.plans FOR SELECT 
USING (true);

CREATE POLICY "Business plans are viewable by everyone" 
ON public.business_plans FOR SELECT 
USING (true);

CREATE POLICY "Testimonials are viewable by everyone" 
ON public.testimonials FOR SELECT 
USING (true);

CREATE POLICY "Site settings are viewable by everyone" 
ON public.site_settings FOR SELECT 
USING (true);

-- Admin write access (for authenticated users only)
CREATE POLICY "Authenticated users can manage plans" 
ON public.plans FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage business plans" 
ON public.business_plans FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage testimonials" 
ON public.testimonials FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage site settings" 
ON public.site_settings FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_plans_updated_at
BEFORE UPDATE ON public.plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_plans_updated_at
BEFORE UPDATE ON public.business_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data from config
INSERT INTO public.plans (name, speed, price, original_price, features, popular, badge) VALUES
('Básico', 100, 79.90, 99.90, ARRAY['Download até 100 Mega', 'Upload até 50 Mega', 'Wi-Fi Grátis', 'Suporte 24h'], false, NULL),
('Família', 300, 99.90, 129.90, ARRAY['Download até 300 Mega', 'Upload até 150 Mega', 'Wi-Fi Dual Band Grátis', 'Suporte 24h', 'IP Fixo Opcional'], true, 'Mais Popular'),
('Ultra', 500, 129.90, 169.90, ARRAY['Download até 500 Mega', 'Upload até 250 Mega', 'Wi-Fi Mesh Grátis', 'Suporte Prioritário', 'IP Fixo Incluso', 'Instalação Expressa'], false, 'Melhor Velocidade');

INSERT INTO public.business_plans (name, speed, price, features, badge) VALUES
('Empreendedor', 200, 149.90, ARRAY['Download até 200 Mega', 'Upload simétrico', 'IP Fixo Incluso', 'SLA 99%', 'Suporte Empresarial'], NULL),
('Empresarial', 500, 249.90, ARRAY['Download até 500 Mega', 'Upload simétrico', 'IP Fixo Incluso', 'SLA 99.5%', 'Suporte Dedicado', 'Link Backup'], 'Recomendado'),
('Corporativo', 1000, 399.90, ARRAY['Download até 1 Giga', 'Upload simétrico', 'IP Fixo + Range', 'SLA 99.9%', 'Gerente de Conta', 'Link Redundante'], 'Enterprise');

INSERT INTO public.testimonials (name, location, text, rating) VALUES
('Maria Silva', 'Centro, Camboriú', 'Melhor internet que já tive! Velocidade real do plano e suporte excelente.', 5),
('João Santos', 'Barra, Balneário Camboriú', 'Trabalho home office e nunca tive problemas com quedas. Recomendo!', 5),
('Ana Costa', 'Pioneiros, Balneário Camboriú', 'Instalação rápida e atendimento muito profissional. Nota 10!', 5);