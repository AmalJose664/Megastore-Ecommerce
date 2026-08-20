import React, { useState, useEffect, useRef } from 'react';
import { Eye, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Product } from '@/data/products';
import { getRecentlyViewed } from '@/utils/recentlyViewed';
import { ProductCard } from '@/components/product/ProductCard';

interface RecentlyViewedProductsProps {
  currentProductId?: string;
  title?: string;
}

export default function RecentlyViewedProducts({
  currentProductId,
  title = 'Recently Viewed Products',
}: RecentlyViewedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = getRecentlyViewed();
    if (currentProductId) {
      setProducts(list.filter((p) => (p.id || (p as any)._id) !== currentProductId));
    } else {
      setProducts(list);
    }
  }, [currentProductId]);

  if (!products || products.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-10 bg-muted/20 border-t border-border/60 my-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground tracking-tight flex items-center gap-2">
                {title}
              </h2>
              <p className="text-xs text-muted-foreground">Pick up right where you left off</p>
            </div>
          </div>

          {/* Navigation Controls */}
          {products.length > 3 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                className="p-2 rounded-full border border-border bg-background text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm active:scale-95"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-2 rounded-full border border-border bg-background text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm active:scale-95"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Horizontal Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scroll-smooth pb-4 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => {
            const prodId = product.id || (product as any)._id;
            return (
              <div key={prodId} className="w-[240px] sm:w-[280px] flex-shrink-0">
                <ProductCard product={product} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
