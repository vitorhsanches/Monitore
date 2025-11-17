import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const MinhasOcorrencias = () => {
  const navigate = useNavigate();
  const [minhasOcorrencias, setMinhasOcorrencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOccurrences();
  }, []);

  const fetchMyOccurrences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from('occurrences')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMinhasOcorrencias(data || []);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas ocorrências.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Recebida": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Em análise": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Em manutenção": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "Concluída": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta": return "destructive";
      case "Média": return "default";
      case "Baixa": return "secondary";
      default: return "secondary";
    }
  };

  const totalOcorrencias = minhasOcorrencias.length;
  const emAndamento = minhasOcorrencias.filter(o => o.status !== "Concluída").length;
  const concluidas = minhasOcorrencias.filter(o => o.status === "Concluída").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">Minhas Ocorrências</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{totalOcorrencias}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Em andamento</p>
            <p className="text-2xl font-bold">{emAndamento}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Concluídas</p>
            <p className="text-2xl font-bold">{concluidas}</p>
          </Card>
        </div>

        <div className="space-y-3">
          {minhasOcorrencias.map((occurrence: any) => (
            <Card 
              key={occurrence.id} 
              className="p-4 space-y-3 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/ocorrencia/${occurrence.id}`)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground mb-1">{occurrence.categoria}</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getStatusColor(occurrence.status)}>
                      {occurrence.status}
                    </Badge>
                    <Badge variant={getPriorityColor(occurrence.prioridade)}>
                      {occurrence.prioridade}
                    </Badge>
                    {occurrence.acessibilidade_afetada && (
                      <Badge variant="destructive">♿ Acessibilidade</Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2">
                {occurrence.descricao}
              </p>
              
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{occurrence.endereco}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(occurrence.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </Card>
          ))}

          {minhasOcorrencias.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                Você ainda não registrou nenhuma ocorrência.
              </p>
              <Button onClick={() => navigate("/nova-ocorrencia")}>
                Registrar primeira ocorrência
              </Button>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default MinhasOcorrencias;
