import React from 'react';
import { cn } from '@/lib/utils';
import {
  Building2,
  Users,
  ClipboardCheck,
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  ClipboardList,
  PlayCircle,
  Award,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

const iconMap = {
  Building2,
  Users,
  ClipboardCheck,
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  ClipboardList,
  PlayCircle,
  Award,
};

const colorMap = {
  primary: 'from-primary/20 to-primary/5 border-primary/20',
  success: 'from-success/20 to-success/5 border-success/20',
  warning: 'from-warning/20 to-warning/5 border-warning/20',
  danger: 'from-destructive/20 to-destructive/5 border-destructive/20',
  info: 'from-info/20 to-info/5 border-info/20',
};

const iconColorMap = {
  primary: 'bg-primary text-primary-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  danger: 'bg-destructive text-destructive-foreground',
  info: 'bg-info text-info-foreground',
};

export const MetricCard = ({
  label,
  value,
  change,
  changeType,
  icon,
  color,
  delay = 0,
}) => {
  const Icon = iconMap[icon] || ClipboardCheck;

  return (
    <div
      className={cn(
        'bg-gradient-to-br border animate-slide-up glass-card',
        'p-3 lg:p-6 rounded-2xl lg:rounded-[2.5rem]',
        'transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
        colorMap[color]
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-[10px] lg:text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-xl lg:text-4xl font-display font-bold text-foreground">{value}</p>
          {change !== undefined && (
            <div className={cn(
              'flex items-center gap-1 text-[10px] lg:text-sm font-medium',
              changeType === 'increase' ? 'text-success' : 'text-destructive'
            )}>
              {changeType === 'increase' ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              <span>{Math.abs(change)}%</span>
              <span className="text-muted-foreground font-normal text-[10px] lg:text-sm">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn('p-2 lg:p-4 rounded-xl lg:rounded-3xl shadow-md', iconColorMap[color])}>
          <Icon className="w-4 h-4 lg:w-7 lg:h-7" />
        </div>
      </div>
    </div>
  );
};
