import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, Plus, List, MapPin, Settings, Users } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function Navigation() {
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
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center h-14 w-16 text-xs gap-1",
                isActive && "text-primary bg-primary/10"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}