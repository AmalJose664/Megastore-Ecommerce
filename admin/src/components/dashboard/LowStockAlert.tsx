import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/types';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export interface LowStockAlertProps {
  products: Product[];
}

export default function LowStockAlert({ products }: LowStockAlertProps) {
  const navigate = useNavigate();

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="card-elevated animate-slide-up">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <h2 className="text-sm font-semibold text-foreground">Low Stock Alerts</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">Products running low on inventory</p>
      </div>
      <div className="p-3 space-y-3">
        {products.map((product) => (
          <div
            key={product._id || product.id}
            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <img
              src={product.images?.[0] || 'https://via.placeholder.com/150'}
              alt={product.name}
              className="w-10 h-10 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-xs truncate">{product.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Progress
                  value={Math.min((product.stock / 10) * 100, 100)}
                  className="h-1.5 flex-1"
                />
                <span className={`text-[11px] font-medium ${product.stock === 0 ? 'text-destructive' : 'text-warning'}`}>
                  {product.stock} left
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 px-2.5"
              onClick={() => navigate(`/products/${product._id || product.id}/edit`)}
            >
              Restock
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
