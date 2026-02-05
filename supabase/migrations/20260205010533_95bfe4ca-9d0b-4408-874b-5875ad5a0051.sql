-- Create table for trusted company logos
CREATE TABLE public.trusted_companies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    logo_url text NOT NULL,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trusted_companies ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Trusted companies are viewable by everyone" 
ON public.trusted_companies 
FOR SELECT 
USING (true);

-- Admin management
CREATE POLICY "Admins can manage trusted companies" 
ON public.trusted_companies 
FOR ALL 
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create storage bucket for company logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('company-logos', 'company-logos', true);

-- Storage policies for company logos
CREATE POLICY "Company logos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'company-logos');

CREATE POLICY "Admins can upload company logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'company-logos' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update company logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'company-logos' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete company logos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'company-logos' AND has_role(auth.uid(), 'admin'));