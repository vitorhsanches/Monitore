-- Add new fields to occurrences table for Monitore app
ALTER TABLE public.occurrences 
ADD COLUMN IF NOT EXISTS acessibilidade_afetada boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS publica boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS historico jsonb DEFAULT '[]'::jsonb;

-- Update categories to match Monitore requirements
COMMENT ON COLUMN public.occurrences.categoria IS 'Valid values: Calçada, Escadaria, Rampa, Árvore, Iluminação, Outro';

-- Add new status options for better workflow
COMMENT ON COLUMN public.occurrences.status IS 'Valid values: Recebida, Em análise, Em manutenção, Concluída';

-- Create function to update occurrence history automatically when status changes
CREATE OR REPLACE FUNCTION public.add_to_occurrence_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only add to history if status changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.historico = COALESCE(NEW.historico, '[]'::jsonb) || 
                    jsonb_build_object(
                      'status', NEW.status,
                      'timestamp', now(),
                      'autor_id', auth.uid(),
                      'comentario', ''
                    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update history
DROP TRIGGER IF EXISTS occurrence_status_history ON public.occurrences;
CREATE TRIGGER occurrence_status_history
  BEFORE UPDATE ON public.occurrences
  FOR EACH ROW
  EXECUTE FUNCTION public.add_to_occurrence_history();

-- Create function to add admin comment to occurrence
CREATE OR REPLACE FUNCTION public.add_occurrence_comment(
  _occurrence_id uuid,
  _comentario text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can add comments
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can add comments';
  END IF;

  UPDATE public.occurrences
  SET historico = COALESCE(historico, '[]'::jsonb) || 
                  jsonb_build_object(
                    'tipo', 'comentario',
                    'timestamp', now(),
                    'autor_id', auth.uid(),
                    'comentario', _comentario
                  )
  WHERE id = _occurrence_id;
END;
$$;

-- Seed initial admin user role (carla@exemplo.com will be created via auth)
-- When user signs up with carla@exemplo.com, manually assign admin role or use this after signup