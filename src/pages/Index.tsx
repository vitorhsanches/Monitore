import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Home, 
  Plus, 
  List, 
  Map, 
  Menu, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle,
  MapPin,
  Calendar,
  User as UserIcon,
  LogOut
} from "lucide-react";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSetup } from "@/hooks/useAdminSetup";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState([
    { label: "Total", value: "0", sublabel: "ocorrências", icon: TrendingUp },
    { label: "Minhas", value: "0", sublabel: "registradas por mim", icon: Users },
    { label: "Pendentes", value: "0", sublabel: "em andamento", icon: Clock },
    { label: "Concluídas", value: "0", sublabel: "resolvidas", icon: CheckCircle },
  ]);
  const [recentOccurrences, setRecentOccurrences] = useState<any[]>([]);

  // Setup admin user automatically
  useAdminSetup();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      setUser(session.user);
      
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .single();
      
      setUserName(profileData?.full_name || session.user.email?.split('@')[0] || "Usuário");

      // Check if admin
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .single();

      console.log('Admin check (Index):', { userId: session.user.id, roleData, roleError, isAdmin: !!roleData });
      setIsAdmin(!!roleData);
    }

    fetchStats();
    fetchRecentOccurrences();
  };

  const fetchStats = async () => {
    const { data } = await supabase.from('occurrences').select('status, user_id');
    
    if (data) {
      const total = data.length;
      const pendentes = data.filter(o => o.status !== 'Concluída').length;
      const concluidas = data.filter(o => o.status === 'Concluída').length;
      const minhas = user ? data.filter(o => o.user_id === user.id).length : 0;
      
      setStats([
        { label: "Total", value: total.toString(), sublabel: "ocorrências", icon: TrendingUp },
        { label: "Minhas", value: minhas.toString(), sublabel: "registradas por mim", icon: Users },
        { label: "Pendentes", value: pendentes.toString(), sublabel: "em andamento", icon: Clock },
        { label: "Concluídas", value: concluidas.toString(), sublabel: "resolvidas", icon: CheckCircle },
      ]);
    }
  };

  const fetchRecentOccurrences = async () => {
    const { data } = await supabase
      .from('occurrences')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (data) {
      setRecentOccurrences(data);
    }
  };

  const quickActions = [
    { icon: Plus, label: "Nova Ocorrência", sublabel: "Registre um novo problema urbano", color: "bg-blue-500" },
    { icon: List, label: "Minhas Ocorrências", sublabel: "Acompanhe suas denúncias", color: "bg-purple-500" },
    { icon: Map, label: "Mapa", sublabel: "Visualize ocorrências no mapa", color: "bg-green-500" },
  ];

  const menuItems = [
    { icon: Home, label: "Início", path: "/" },
    { icon: Plus, label: "Nova Ocorrência", path: "/nova-ocorrencia" },
    { icon: List, label: "Minhas Ocorrências", path: "/minhas-ocorrencias" },
    { icon: Map, label: "Mapa", path: "/mapa" },
    { icon: UserIcon, label: "Perfil", path: "/perfil" },
  ];

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
      case "Concluída": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Monitore Logo" className="h-10 w-auto" />
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="py-4 space-y-4">
                <div className="px-4 pb-4 border-b">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">
                    {user ? user.email : "Visitante"}
                  </p>
                  {isAdmin && (
                    <Badge className="mt-2">Gestor</Badge>
                  )}
                </div>
                
                <div className="space-y-1">
                  {menuItems.map((item, index) => (
                    <button
                      key={index}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-left"
                      onClick={() => navigate(item.path)}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                  
                  {isAdmin && (
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-left bg-primary/10"
                      onClick={() => navigate("/painel-gestor")}
                    >
                      <TrendingUp className="w-5 h-5" />
                      <span className="font-medium">Painel do Gestor</span>
                    </button>
                  )}
                </div>

                {!user && (
                  <div className="px-4 pt-4 border-t">
                    <Button 
                      onClick={() => navigate("/auth")}
                      className="w-full"
                    >
                      Entrar / Cadastrar
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-20 space-y-6">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            Olá, {user ? userName : "Visitante"}! 👋
          </h2>
          <p className="text-muted-foreground">Ajude a monitorar e melhorar nossa cidade.</p>
          {!user && (
            <Button 
              variant="outline" 
              onClick={() => navigate("/auth")}
              className="mt-2"
            >
              Faça login para registrar ocorrências
            </Button>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-3">
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                if (index === 0) navigate("/nova-ocorrencia");
                if (index === 1) navigate("/minhas-ocorrencias");
                if (index === 2) navigate("/mapa");
              }}
            >
              <div className="flex items-center gap-4">
                <div className={`${action.color} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{action.label}</h3>
                  <p className="text-sm text-muted-foreground truncate">{action.sublabel}</p>
                </div>
                <Plus className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </div>
            </Card>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                <stat.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Occurrences */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Ocorrências Recentes</h3>
              <p className="text-sm text-muted-foreground">Últimas ocorrências registradas no sistema</p>
            </div>
          </div>

          <div className="space-y-3">
            {recentOccurrences.map((occurrence) => (
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
                        <Badge variant="destructive">♿</Badge>
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
          </div>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate("/todas-ocorrencias")}
          >
            Ver todas as ocorrências
          </Button>
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            {menuItems.slice(0, 4).map((item, index) => (
              <button
                key={index}
                className="flex flex-col items-center gap-1 py-2 px-3 rounded-lg hover:bg-accent transition-colors"
                onClick={() => navigate(item.path)}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Index;
