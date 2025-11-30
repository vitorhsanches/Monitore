import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Occurrence {
  id: string;
  categoria: string;
  endereco: string;
  descricao: string;
  status: string;
  prioridade: string;
  created_at: string;
  user_id: string | null;
  acessibilidade_afetada: boolean;
  full_name?: string;
}

const AdminTicketsPage = () => {
  const navigate = useNavigate();
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [filteredOccurrences, setFilteredOccurrences] = useState<Occurrence[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAndFetchOccurrences();
    setupRealtimeSubscription();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [occurrences, statusFilter]);

  const checkAdminAndFetchOccurrences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Acesso negado",
          description: "Você precisa estar autenticado.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Check if user is admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (!roleData) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta área.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      // Fetch all occurrences
      const { data: occurrencesData, error: occurrencesError } = await supabase
        .from('occurrences')
        .select('*')
        .order('created_at', { ascending: false });

      if (occurrencesError) throw occurrencesError;

      // Fetch profiles for occurrences that have user_id
      const userIds = occurrencesData
        ?.filter(o => o.user_id)
        .map(o => o.user_id) || [];

      let profilesMap: Record<string, string> = {};
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);
        
        profilesMap = (profilesData || []).reduce((acc, profile) => {
          acc[profile.id] = profile.full_name || '';
          return acc;
        }, {} as Record<string, string>);
      }

      // Combine data
      const enrichedOccurrences = (occurrencesData || []).map(occ => ({
        ...occ,
        full_name: occ.user_id ? profilesMap[occ.user_id] : undefined
      }));

      setOccurrences(enrichedOccurrences);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('admin-occurrences-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'occurrences'
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          
          if (payload.eventType === 'INSERT') {
            setOccurrences(prev => [payload.new as Occurrence, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setOccurrences(prev => 
              prev.map(occ => occ.id === payload.new.id ? payload.new as Occurrence : occ)
            );
          } else if (payload.eventType === 'DELETE') {
            setOccurrences(prev => prev.filter(occ => occ.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const applyFilters = () => {
    let filtered = [...occurrences];

    if (statusFilter !== "all") {
      filtered = filtered.filter(occ => occ.status === statusFilter);
    }

    setFilteredOccurrences(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Recebida":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Em Análise":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Concluída":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
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
        return "outline";
    }
  };

  const handleStatusChange = async (occurrenceId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('occurrences')
        .update({ status: newStatus })
        .eq('id', occurrenceId);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: "O status da ocorrência foi alterado com sucesso.",
      });
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
          <h1 className="text-lg font-bold">Painel Administrativo</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{occurrences.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Em Aberto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {occurrences.filter(o => o.status === "Recebida").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Em Análise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {occurrences.filter(o => o.status === "Em Análise").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Concluídas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {occurrences.filter(o => o.status === "Concluída").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Recebida">Em Aberto</SelectItem>
                  <SelectItem value="Em Análise">Em Análise</SelectItem>
                  <SelectItem value="Concluída">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Occurrences List */}
        <div className="space-y-4">
          {filteredOccurrences.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Nenhuma ocorrência encontrada.</p>
              </CardContent>
            </Card>
          ) : (
            filteredOccurrences.map((occurrence) => (
              <Card
                key={occurrence.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/ocorrencia/${occurrence.id}`)}
              >
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{occurrence.categoria}</Badge>
                          <Badge className={getStatusColor(occurrence.status)}>
                            {occurrence.status}
                          </Badge>
                          <Badge variant={getPriorityColor(occurrence.prioridade)}>
                            {occurrence.prioridade}
                          </Badge>
                        </div>
                        <p className="font-medium mb-1">{occurrence.endereco}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {occurrence.descricao}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-sm text-muted-foreground">
                        <p>
                          Criado por: {occurrence.full_name || "Usuário anônimo"}
                        </p>
                        <p>
                          {new Date(occurrence.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      
                      <div onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={occurrence.status}
                          onValueChange={(value) => {
                            handleStatusChange(occurrence.id, value);
                          }}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Recebida">Recebida</SelectItem>
                            <SelectItem value="Em Análise">Em Análise</SelectItem>
                            <SelectItem value="Concluída">Concluída</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminTicketsPage;
