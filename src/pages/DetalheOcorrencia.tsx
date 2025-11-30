import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const DetalheOcorrencia = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [occurrence, setOccurrence] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Admin actions
  const [newStatus, setNewStatus] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [adminComment, setAdminComment] = useState("");

  useEffect(() => {
    fetchOccurrence();
  }, [id]);

  const fetchOccurrence = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Check if user is admin
      if (user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();

        setIsAdmin(!!roleData);
      }

      // Fetch occurrence
      const { data, error } = await supabase
        .from('occurrences')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setOccurrence(data);
      setNewStatus(data.status);
      setNewPriority(data.prioridade);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a ocorrência.",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!isAdmin) return;
    
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('occurrences')
        .update({
          status: newStatus,
          prioridade: newPriority,
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: "O status da ocorrência foi atualizado com sucesso.",
      });

      fetchOccurrence();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleAddComment = async () => {
    if (!isAdmin || !adminComment.trim()) return;

    setUpdating(true);
    try {
      const { error } = await supabase.rpc('add_occurrence_comment', {
        _occurrence_id: id,
        _comentario: adminComment,
      });

      if (error) throw error;

      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi registrado no histórico.",
      });

      setAdminComment("");
      fetchOccurrence();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o comentário.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
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

  if (!occurrence) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Ocorrência não encontrada</p>
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
            onClick={() => navigate(-1)}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">Detalhes da Ocorrência</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Status and Category */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">{occurrence.categoria}</h3>
              <Badge variant={getPriorityColor(occurrence.prioridade)}>
                {occurrence.prioridade}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className={getStatusColor(occurrence.status)}>
                {occurrence.status}
              </Badge>
              {occurrence.acessibilidade_afetada && (
                <Badge variant="destructive">♿ Acessibilidade Afetada</Badge>
              )}
              {!occurrence.publica && (
                <Badge variant="secondary">🔒 Privada</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Photos */}
        {occurrence.fotos && occurrence.fotos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Fotos</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {occurrence.fotos.map((foto: string, index: number) => (
                <img
                  key={index}
                  src={foto}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-40 object-cover rounded-lg"
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{occurrence.descricao}</p>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Localização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <Label>Endereço</Label>
              <p className="text-muted-foreground">{occurrence.endereco}</p>
            </div>
            {occurrence.ponto_referencia && (
              <div>
                <Label>Ponto de Referência</Label>
                <p className="text-muted-foreground">{occurrence.ponto_referencia}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline / History */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Initial creation */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <div className="w-0.5 h-full bg-border"></div>
              </div>
              <div className="flex-1 pb-4">
                <p className="font-semibold text-sm">Ocorrência Criada</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(occurrence.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>

            {/* History entries */}
            {occurrence.historico && occurrence.historico.length > 0 && occurrence.historico.map((entry: any, index: number) => (
              <div key={index} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  {index < occurrence.historico.length - 1 && (
                    <div className="w-0.5 h-full bg-border"></div>
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-semibold text-sm">
                    {entry.tipo === 'comentario' ? 'Comentário Administrativo' : `Status: ${entry.status}`}
                  </p>
                  {entry.comentario && (
                    <p className="text-sm text-muted-foreground mt-1">{entry.comentario}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(entry.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Admin Actions */}
        {isAdmin && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="text-primary">Ações Administrativas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Alterar Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Recebida">Recebida</SelectItem>
                    <SelectItem value="Em análise">Em análise</SelectItem>
                    <SelectItem value="Em manutenção">Em manutenção</SelectItem>
                    <SelectItem value="Concluída">Concluída</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Alterar Prioridade</Label>
                <Select value={newPriority} onValueChange={setNewPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleUpdateStatus}
                disabled={updating || (newStatus === occurrence.status && newPriority === occurrence.prioridade)}
                className="w-full"
              >
                {updating ? "Atualizando..." : "Atualizar Status e Prioridade"}
              </Button>

              <div className="border-t pt-4">
                <Label>Adicionar Comentário Administrativo</Label>
                <Textarea
                  placeholder="Ex: Acionado setor de obras para avaliação..."
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
                <Button 
                  onClick={handleAddComment}
                  disabled={updating || !adminComment.trim()}
                  variant="outline"
                  className="w-full mt-2"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Adicionar Comentário
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Registration Info */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Registrada em {new Date(occurrence.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>ID: {occurrence.id.slice(0, 8)}</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DetalheOcorrencia;
