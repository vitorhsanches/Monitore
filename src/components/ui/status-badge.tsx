import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: 'Recebida' | 'Em análise' | 'Em manutenção' | 'Concluída';
  className?: string;
}

const statusConfig = {
  'Recebida': {
    variant: 'secondary' as const,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  },
  'Em análise': {
    variant: 'default' as const,
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  },
  'Em manutenção': {
    variant: 'default' as const,
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
  },
  'Concluída': {
    variant: 'default' as const,
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {status}
    </Badge>
  );
}