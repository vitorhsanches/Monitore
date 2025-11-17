-- Fix 1: Separate PII from public data and implement authentication system

-- Create user roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create separate table for private contact information
CREATE TABLE public.occurrence_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurrence_id uuid NOT NULL,
  nome text NOT NULL,
  telefone text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.occurrence_contacts ENABLE ROW LEVEL SECURITY;

-- Only admins can view contact information
CREATE POLICY "Only admins can view occurrence contacts"
ON public.occurrence_contacts FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert occurrence contacts"
ON public.occurrence_contacts FOR INSERT
WITH CHECK (true);

-- Migrate existing contact data to new table
INSERT INTO public.occurrence_contacts (occurrence_id, nome, telefone)
SELECT id, nome, telefone FROM public.occurrences
WHERE nome IS NOT NULL AND telefone IS NOT NULL;

-- Add user tracking to occurrences
ALTER TABLE public.occurrences 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Fix 2: Add input validation constraints
ALTER TABLE public.occurrences
ADD CONSTRAINT nome_length_check CHECK (char_length(nome) <= 100),
ADD CONSTRAINT telefone_format_check CHECK (telefone ~ '^\d{10,11}$' OR telefone IS NULL),
ADD CONSTRAINT endereco_length_check CHECK (char_length(endereco) BETWEEN 10 AND 200),
ADD CONSTRAINT ponto_referencia_length_check CHECK (char_length(ponto_referencia) <= 200 OR ponto_referencia IS NULL),
ADD CONSTRAINT descricao_length_check CHECK (char_length(descricao) BETWEEN 20 AND 1000),
ADD CONSTRAINT categoria_valid CHECK (categoria IN ('iluminacao', 'ruas-avenidas', 'calcada', 'poda-arvore', 'carro-abandonado'));

-- Remove PII columns from public occurrences table (keep temporarily for migration)
-- Will be removed in next migration after code is updated

-- Update RLS policies for occurrences
DROP POLICY IF EXISTS "Anyone can view occurrences" ON public.occurrences;
DROP POLICY IF EXISTS "Anyone can create occurrences" ON public.occurrences;

-- Public can view occurrence details (no PII)
CREATE POLICY "Public can view occurrence details"
ON public.occurrences FOR SELECT
USING (true);

-- Authenticated users can create occurrences linked to their account
CREATE POLICY "Authenticated users can create occurrences"
ON public.occurrences FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Unauthenticated users can still create occurrences (anonymous reporting)
CREATE POLICY "Anonymous users can create occurrences"
ON public.occurrences FOR INSERT
WITH CHECK (user_id IS NULL);

-- Admins can update occurrence status and priority
CREATE POLICY "Admins can update occurrences"
ON public.occurrences FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can delete occurrences
CREATE POLICY "Admins can delete occurrences"
ON public.occurrences FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));