import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Filter, Search, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PainelGestor = () => {
  const navigate = useNavigate();
  const [occurrences, setOccurrences] = useState<any[]>([]);
  const [filteredOccurrences, setFilteredOccurrences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todas");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [priorityFilter, setPriorityFilter] = useState("todas");
  const [acessibilityFilter, setAcessibilityFilter] = useState("todas");

  useEffect(() => {
    checkAdminAndFetchOccurrences();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [occurrences, searchTerm, statusFilter, categoryFilter, priorityFilter, acessibilityFilter]);

  const checkAdminAndFetchOccurrences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Acesso negado",
          description: "Você precisa estar logado para acessar esta página.",
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
          description: "Apenas gestores podem acessar esta página.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      // Fetch all occurrences
      const { data, error } = await supabase
        .from('occurrences')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOccurrences(data || []);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as ocorrências.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...occurrences];

    // Search term
    if (searchTerm) {
      filtered = filtered.filter(occ => 
        occ.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        occ.endereco?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        occ.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "todas") {
      filtered = filtered.filter(occ => occ.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== "todas") {
      filtered = filtered.filter(occ => occ.categoria === categoryFilter);
    }

    // Priority filter
    if (priorityFilter !== "todas") {
      filtered = filtered.filter(occ => occ.prioridade === priorityFilter);
    }

    // Acessibility filter
    if (acessibilityFilter === "sim") {
      filtered = filtered.filter(occ => occ.acessibilidade_afetada === true);
    } else if (acessibilityFilter === "nao") {
      filtered = filtered.filter(occ => occ.acessibilidade_afetada === false);
    }

    setFilteredOccurrences(filtered);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta": return "destructive";
      case "Média": return "default";
      case "Baixa": return "secondary";
      default: return "secondary";
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
          <h1 className="text-lg font-bold">Painel do Gestor</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-blue-50 dark:bg-blue-950">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{occurrences.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 dark:bg-yellow-950">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold">
                {occurrences.filter(o => o.status !== "Concluída").length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 dark:bg-green-950">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
              <p className="text-2xl font-bold">
                {occurrences.filter(o => o.status === "Concluída").length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 dark:bg-red-950">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-muted-foreground">Acessibilidade</p>
              <p className="text-2xl font-bold">
                {occurrences.filter(o => o.acessibilidade_afetada).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por descrição, endereço ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todos Status</SelectItem>
                  <SelectItem value="Recebida">Recebida</SelectItem>
                  <SelectItem value="Em análise">Em análise</SelectItem>
                  <SelectItem value="Em manutenção">Em manutenção</SelectItem>
                  <SelectItem value="Concluída">Concluída</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas Categorias</SelectItem>
                  <SelectItem value="Calçada">Calçada</SelectItem>
                  <SelectItem value="Escadaria">Escadaria</SelectItem>
                  <SelectItem value="Rampa">Rampa</SelectItem>
                  <SelectItem value="Árvore">Árvore</SelectItem>
                  <SelectItem value="Iluminação">Iluminação</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas Prioridades</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>

              <Select value={acessibilityFilter} onValueChange={setAcessibilityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Acessibilidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="sim">Acessibilidade afetada</SelectItem>
                  <SelectItem value="nao">Sem impacto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              <span>{filteredOccurrences.length} ocorrências encontradas</span>
            </div>
          </CardContent>
        </Card>

        {/* Occurrences List */}
        <div className="space-y-3">
          {filteredOccurrences.map((occurrence) => (
            <Card 
              key={occurrence.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/ocorrencia/${occurrence.id}`)}
            >
              <CardContent className="p-4 space-y-3">
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
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PainelGestor;
