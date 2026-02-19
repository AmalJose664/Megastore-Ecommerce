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
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold">Activity Feed</h2>
        <p className="text-sm text-muted-foreground">Recent system activities</p>
      </div>
      <div className="p-4 space-y-1">
        {activities.map((activity, index) => {
          const Icon = typeIcons[activity.type] || Settings;

          return (
            <div
              key={activity._id || index}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={cn("p-2 rounded-lg", typeColors[activity.type] || typeColors.system)}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{activity.action}</p>
                <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
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
