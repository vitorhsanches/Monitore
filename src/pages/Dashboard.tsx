import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MapPin, List, TrendingUp, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase, Occurrence } from '@/lib/supabase';
import { StatusBadge } from '@/components/ui/status-badge';
import { PriorityBadge } from '@/components/ui/priority-badge';

export default function Dashboard() {
  const { user, profile, isGestor } = useAuth();
  const navigate = useNavigate();
  const [recentOccurrences, setRecentOccurrences] = useState<Occurrence[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    minhas: 0,
    pendentes: 0,
    concluidas: 0
  });

  useEffect(() => {
    if (user) {
      loadRecentOccurrences();
      loadStats();
    }
  }, [user, isGestor]);

  const loadRecentOccurrences = async () => {
    let query = supabase
      .from('occurrences')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    // If not gestor, only show public and own occurrences
    if (!isGestor) {
      query = query.or(`publica.eq.true,user_id.eq.${user?.id}`);
    }

    const { data } = await query;
    if (data) {
      setRecentOccurrences(data as Occurrence[]);
    }
  };

  const loadStats = async () => {
    // Total occurrences
    let totalQuery = supabase
      .from('occurrences')
      .select('count', { count: 'exact' });

    if (!isGestor) {
      totalQuery = totalQuery.or(`publica.eq.true,user_id.eq.${user?.id}`);
    }

    const { count: total } = await totalQuery;

    // My occurrences
    const { count: minhas } = await supabase
      .from('occurrences')
      .select('count', { count: 'exact' })
      .eq('user_id', user?.id);

    // Pending occurrences
    let pendentesQuery = supabase
      .from('occurrences')
      .select('count', { count: 'exact' })
      .neq('status', 'Concluída');

    if (!isGestor) {
      pendentesQuery = pendentesQuery.or(`publica.eq.true,user_id.eq.${user?.id}`);
    }

    const { count: pendentes } = await pendentesQuery;

    // Completed occurrences
    let concluidasQuery = supabase
      .from('occurrences')
      .select('count', { count: 'exact' })
      .eq('status', 'Concluída');

    if (!isGestor) {
      concluidasQuery = concluidasQuery.or(`publica.eq.true,user_id.eq.${user?.id}`);
    }

    const { count: concluidas } = await concluidasQuery;

    setStats({
      total: total || 0,
      minhas: minhas || 0,
      pendentes: pendentes || 0,
      concluidas: concluidas || 0
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">
            Olá, {profile?.nome}! 👋
          </h1>
          <p className="text-muted-foreground">
            {isGestor ? 
              'Gerencie as ocorrências da cidade de forma eficiente.' :
              'Ajude a monitorar e melhorar nossa cidade.'
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/nova-ocorrencia')}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium">Nova Ocorrência</CardTitle>
              <Plus className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Registre um novo problema urbano
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/minhas-ocorrencias')}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium">Minhas Ocorrências</CardTitle>
              <List className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Acompanhe suas denúncias
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate('/mapa')}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium">Mapa</CardTitle>
              <MapPin className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Visualize ocorrências no mapa
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                ocorrências
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Minhas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.minhas}</div>
              <p className="text-xs text-muted-foreground">
                registradas por mim
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendentes}</div>
              <p className="text-xs text-muted-foreground">
                em andamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.concluidas}</div>
              <p className="text-xs text-muted-foreground">
                resolvidas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Occurrences */}
        <Card>
          <CardHeader>
            <CardTitle>Ocorrências Recentes</CardTitle>
            <CardDescription>
              Últimas ocorrências registradas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentOccurrences.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma ocorrência encontrada</p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/nova-ocorrencia')}
                  className="mt-4"
                >
                  Registrar primeira ocorrência
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOccurrences.map((occurrence) => (
                  <div key={occurrence.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{occurrence.categoria}</span>
                        <StatusBadge status={occurrence.status} />
                        <PriorityBadge priority={occurrence.prioridade} />
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {occurrence.descricao}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {occurrence.endereco} • {formatDate(occurrence.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(isGestor ? '/painel-gestor' : '/minhas-ocorrencias')}
                    className="w-full"
                  >
                    Ver todas as ocorrências
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}