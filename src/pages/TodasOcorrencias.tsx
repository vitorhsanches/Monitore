import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

const TodasOcorrencias = () => {
  const navigate = useNavigate();
  const [todasOcorrencias, setTodasOcorrencias] = useState<any[]>([]);

  useEffect(() => {
    fetchOccurrences();
  }, []);

  const fetchOccurrences = async () => {
    const { data } = await supabase
      .from('occurrences')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) {
      setTodasOcorrencias(data);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Recebida":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Em análise":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Concluída":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta":
        return "destructive";
      case "Média":
        return "default";
      case "Baixa":
        return "secondary";
      default:
        return "secondary";
    }
  };

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
          <h1 className="text-lg font-bold">Todas as Ocorrências</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Exibindo as últimas 10 ocorrências registradas no sistema
          </p>
        </div>

        <div className="space-y-4">
          {todasOcorrencias.map((occurrence) => (
            <Card key={occurrence.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-lg">{occurrence.categoria}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge className={getStatusColor(occurrence.status)}>
                        {occurrence.status}
                      </Badge>
                      <Badge variant={getPriorityColor(occurrence.prioridade)}>
                        Prioridade: {occurrence.prioridade}
                      </Badge>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {occurrence.descricao}
                </p>

                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{occurrence.endereco}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Registrada em {new Date(occurrence.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {todasOcorrencias.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              Nenhuma ocorrência registrada no sistema ainda.
            </p>
            <Button
              onClick={() => navigate("/nova-ocorrencia")}
              className="mt-4"
            >
              Registrar primeira ocorrência
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
};

export default TodasOcorrencias;
