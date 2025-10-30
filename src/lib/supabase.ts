import { supabase } from "@/integrations/supabase/client";

export { supabase };

export type Profile = {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  papel: 'cidadao' | 'gestor';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

export type Occurrence = {
  id: string;
  user_id: string;
  categoria: 'Calçada' | 'Escadaria' | 'Rampa' | 'Árvore' | 'Iluminação' | 'Outro';
  descricao: string;
  fotos?: string[];
  latitude?: number;
  longitude?: number;
  endereco?: string;
  acessibilidade_afetada: boolean;
  publica: boolean;
  prioridade: 'baixa' | 'media' | 'alta';
  status: 'Recebida' | 'Em análise' | 'Em manutenção' | 'Concluída';
  created_at: string;
  updated_at: string;
};

export type OccurrenceHistory = {
  id: string;
  occurrence_id: string;
  user_id: string;
  status_anterior?: string;
  status_novo: string;
  comentario?: string;
  created_at: string;
};