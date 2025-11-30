-- Step 1: Drop the old constraint
ALTER TABLE public.occurrences DROP CONSTRAINT IF EXISTS categoria_valid;

-- Step 2: Update existing data to match new categories
UPDATE public.occurrences 
SET categoria = CASE 
  WHEN categoria = 'iluminacao' THEN 'Iluminação'
  WHEN categoria = 'ruas-avenidas' THEN 'Outro'
  WHEN categoria = 'calcada' THEN 'Calçada'
  WHEN categoria = 'poda-arvore' THEN 'Árvore'
  WHEN categoria = 'carro-abandonado' THEN 'Outro'
  ELSE categoria
END;

-- Step 3: Add the new constraint with correct Monitore categories
ALTER TABLE public.occurrences ADD CONSTRAINT categoria_valid 
CHECK (categoria IN ('Calçada', 'Escadaria', 'Rampa', 'Árvore', 'Iluminação', 'Outro'));