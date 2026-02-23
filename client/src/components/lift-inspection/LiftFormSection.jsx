import React from 'react';
import { cn } from '@/lib/utils';

export const LiftFormSection = ({
  title,
  icon: Icon,
  children,
  className,
}) => {
  return (
    <div className={cn('glass-card rounded-2xl p-6 space-y-4', className)}>
      <div className="flex items-center gap-3 border-b border-border/50 pb-4">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
};
