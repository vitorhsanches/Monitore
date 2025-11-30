-- Create occurrences table
CREATE TABLE public.occurrences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  categoria TEXT NOT NULL,
  endereco TEXT NOT NULL,
  ponto_referencia TEXT,
  descricao TEXT NOT NULL,
  fotos TEXT[],
  status TEXT NOT NULL DEFAULT 'Recebida',
  prioridade TEXT NOT NULL DEFAULT 'Média',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.occurrences ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can view occurrences" 
ON public.occurrences 
FOR SELECT 
USING (true);

-- Create policy for public insert access
CREATE POLICY "Anyone can create occurrences" 
ON public.occurrences 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_occurrences_updated_at
BEFORE UPDATE ON public.occurrences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance on queries
CREATE INDEX idx_occurrences_created_at ON public.occurrences(created_at DESC);
CREATE INDEX idx_occurrences_status ON public.occurrences(status);
CREATE INDEX idx_occurrences_categoria ON public.occurrences(categoria);