import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative"
    >
      <Link to={`/products/${product.id}`}>
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-secondary">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {product.isNew && (
              <span className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                New
              </span>
            )}
            {product.originalPrice && (
              <span className="rounded-full bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground">
                Sale
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="secondary"
              size="icon"
              className="h-9 w-9 rounded-full shadow-soft"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          {/* Add to Cart Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 right-4"
          >
            <Button
              variant="elegant"
              size="lg"
              className="w-full opacity-0 transition-opacity group-hover:opacity-100"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="h-4 w-4" />
              Add to Cart
            </Button>
          </motion.div>
        </div>

        {/* Product Info */}
        <div className="mt-4 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {typeof product.category === "object" ? (product.category as any).name : product.category}
          </p>
          <h3 className="font-medium leading-tight transition-colors group-hover:text-primary">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
