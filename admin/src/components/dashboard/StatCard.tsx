import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
}

export default function StatCard({ title, value, change, icon: Icon, iconColor = 'text-primary' }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="stat-card animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="text-lg sm:text-xl font-bold mt-0.5 text-foreground">{value}</p>
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 mt-1.5 text-xs font-medium",
              isPositive ? "text-success" : "text-destructive"
            )}>
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>{Math.abs(change)}%</span>
              <span className="text-muted-foreground font-normal text-[11px]">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn("p-2.5 rounded-xl bg-primary/10", iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
