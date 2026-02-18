import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/types';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface LowStockAlertProps {
  products: Product[];
}

export default function LowStockAlert({ products }: LowStockAlertProps) {
  const navigate = useNavigate();
  const lowStockProducts = products.filter(p => p.stock <= 10);

  if (lowStockProducts.length === 0) {
    return null;
  }

  return (
    <div className="card-elevated animate-slide-up">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <h2 className="text-lg font-semibold">Low Stock Alerts</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Products running low on inventory</p>
      </div>
      <div className="p-4 space-y-4">
        {lowStockProducts.map((product) => (
          <div 
            key={product.id} 
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <img 
              src={product.images[0]} 
              alt={product.name} 
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{product.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Progress 
                  value={product.stock * 10} 
                  className="h-1.5 flex-1"
                />
                <span className={`text-xs font-medium ${product.stock === 0 ? 'text-destructive' : 'text-warning'}`}>
                  {product.stock} left
                </span>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/products/${product.id}/edit`)}
            >
              Restock
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
