import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchCategories } from "@/lib/api";

export function CategoriesGrid() {
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const categories = data?.success ? data.data : [];

  if (isLoading) {
    return (
      <section className="bg-secondary/30 py-16 lg:py-24">
        <div className="container">
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-secondary/30 py-16 lg:py-24">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-display text-3xl font-bold lg:text-4xl">
            Shop by Category
          </h2>
          <p className="mt-2 text-muted-foreground">
            Explore our carefully curated collections
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 4).map((category: any, index: number) => (
            <motion.div
              key={category.id || category._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/products?category=${category.id || category._id}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-xl"
              >
                {/* Image */}
                <img
                  src={category.image || "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80"}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-display text-xl font-semibold text-background">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-sm text-background/80">
                    Explore Collection
                  </p>
                </div>

                {/* Arrow */}
                <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-background/10 text-background backdrop-blur-sm transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
