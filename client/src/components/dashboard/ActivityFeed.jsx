import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

export const ActivityFeed = ({ activities }) => {
  const getUser = () => undefined;

  const getActionColor = (action) => {
    if (action.includes('Approved') || action.includes('Completed')) return 'text-success';
    if (action.includes('Rejected') || action.includes('Suspended')) return 'text-destructive';
    if (action.includes('Assigned') || action.includes('Created')) return 'text-info';
    return 'text-foreground';
  };

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in">
      <h3 className="font-display font-semibold text-lg mb-4">Recent Activity</h3>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const user = getUser(activity.userId);
            return (
              <div
                key={activity.id}
                className="flex gap-3 pb-4 border-b border-border/50 last:border-0 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Avatar className="w-9 h-9">
                  <AvatarImage src={user?.avatar} alt={activity.userName} />
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                    {activity.userName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{activity.userName}</span>
                    <span className="text-muted-foreground"> {activity.action.toLowerCase()} </span>
                    <span className={getActionColor(activity.action)}>{activity.target}</span>
                  </p>
                  {activity.details && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">{activity.details}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
