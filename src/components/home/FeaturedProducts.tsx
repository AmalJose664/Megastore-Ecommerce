import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import { fetchFeaturedProducts } from "@/lib/api";

export function FeaturedProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: fetchFeaturedProducts,
  });

  const featuredProducts = data?.success ? data.data : [];

  if (isLoading) {
    return (
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-between gap-4 sm:flex-row"
        >
          <div>
            <h2 className="font-display text-3xl font-bold lg:text-4xl">
              Featured Products
            </h2>
            <p className="mt-2 text-muted-foreground">
              Handpicked favorites from our collection
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/products">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Products Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.slice(0, 4).map((product: any, index: number) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
