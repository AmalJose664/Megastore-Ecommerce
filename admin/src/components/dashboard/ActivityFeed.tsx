import React from 'react';
import { ActivityLog } from '@/types';
import { ShoppingCart, Package, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
  activities: ActivityLog[];
}

const typeIcons = {
  order: ShoppingCart,
  product: Package,
  user: User,
  system: Settings,
};

const typeColors = {
  order: 'bg-info/10 text-info',
  product: 'bg-primary/10 text-primary',
  user: 'bg-success/10 text-success',
  system: 'bg-muted text-muted-foreground',
};

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="card-elevated animate-slide-up">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Activity Feed</h2>
        <p className="text-xs text-muted-foreground">Recent system activities</p>
      </div>
      <div className="p-3 space-y-1">
        {activities.map((activity, index) => {
          const Icon = typeIcons[activity.type] || Settings;

          return (
            <div
              key={activity._id || index}
              className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-muted/30 transition-colors"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={cn("p-1.5 rounded-lg", typeColors[activity.type] || typeColors.system)}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs">{activity.action}</p>
                <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {new Date(activity.timestamp).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
