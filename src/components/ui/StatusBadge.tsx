import React from 'react';
import { cn } from '@/lib/utils';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'default';

interface StatusBadgeProps {
  status: string;
  type?: StatusType;
  className?: string;
}

const statusTypeMap: Record<string, StatusType> = {
  // Order statuses
  pending: 'warning',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',
  // Payment statuses
  paid: 'success',
  failed: 'error',
  refunded: 'default',
  // Product statuses
  active: 'success',
  draft: 'default',
  archived: 'default',
  // User statuses
  inactive: 'error',
};

const typeStyles: Record<StatusType, string> = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-destructive/10 text-destructive',
  info: 'bg-info/10 text-info',
  default: 'bg-muted text-muted-foreground',
};

export default function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const resolvedType = type || statusTypeMap[status.toLowerCase()] || 'default';

  return (
    <span className={cn("badge-status capitalize", typeStyles[resolvedType], className)}>
      {status}
    </span>
  );
}
