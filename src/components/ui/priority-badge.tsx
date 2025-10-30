import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: 'baixa' | 'media' | 'alta';
  className?: string;
}

const priorityConfig = {
  'baixa': {
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  },
  'media': {
    variant: 'default' as const,
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  },
  'alta': {
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  
  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {priority === 'baixa' ? 'Baixa' : priority === 'media' ? 'Média' : 'Alta'}
    </Badge>
  );
}