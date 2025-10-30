import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, Plus, List, MapPin, Users } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { isGestor } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      label: 'Início',
      icon: Home,
      path: '/',
    },
    {
      label: 'Nova Ocorrência',
      icon: Plus,
      path: '/nova-ocorrencia',
    },
    {
      label: 'Minhas Ocorrências',
      icon: List,
      path: '/minhas-ocorrencias',
    },
    {
      label: 'Mapa',
      icon: MapPin,
      path: '/mapa',
    },
    ...(isGestor ? [{
      label: 'Painel Gestor',
      icon: Users,
      path: '/painel-gestor',
    }] : []),
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-background">
      <div className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "ghost"}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full justify-start gap-3",
                  isActive && "bg-primary text-primary-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}