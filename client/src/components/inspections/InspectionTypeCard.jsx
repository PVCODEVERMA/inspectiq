import React from 'react';
import { cn } from '@/lib/utils';

export const InspectionTypeCard = ({
  title,
  description,
  icon: Icon,
  onClick,
  isActive = false,
  gradient = 'from-primary/10 to-primary/5',
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative w-full p-6 rounded-2xl border-2 transition-all duration-300',
        'hover:shadow-lg hover:scale-[1.02] hover:border-primary/50',
        'bg-gradient-to-br',
        gradient,
        isActive
          ? 'border-primary shadow-lg shadow-primary/20'
          : 'border-border/50'
      )}
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div
          className={cn(
            'w-14 h-14 rounded-xl flex items-center justify-center',
            'bg-primary/10 group-hover:bg-primary/20 transition-colors',
            isActive && 'bg-primary text-primary-foreground'
          )}
        >
          <Icon className={cn('w-7 h-7', isActive ? 'text-primary-foreground' : 'text-primary')} />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
};
