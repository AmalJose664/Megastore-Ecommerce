import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutGrid, ArrowRight, Search, Sparkles, Loader2, PackageCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { fetchCategories } from "@/lib/api";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  isActive: boolean;
  displayOrder: number;
}

export const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setCategories(res.data.filter((c: Category) => c.isActive !== false));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch categories:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground antialiased pb-20">
        {/* Hero Section */}
        <section className="relative py-20 px-4 hero-gradient overflow-hidden border-b border-border/40">
          <div className="container max-w-5xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6"
            >
              <Sparkles className="h-3.5 w-3.5" /> Curated Collections
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-display font-bold tracking-tight text-foreground"
            >
              Explore By Category
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Find exactly what you are looking for. Browse our carefully crafted product categories.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-10 max-w-md mx-auto relative"
            >
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-card/80 backdrop-blur-xl border border-border/60 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-lg shadow-black/5 font-medium placeholder:text-muted-foreground/50"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="container max-w-7xl mx-auto px-4 py-16">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm font-medium">Loading collections...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-20 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                <LayoutGrid className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground">No Categories Found</h3>
              <p className="text-sm text-muted-foreground mt-2">
                We couldn't find any category matching "{searchTerm}".
              </p>
              <Button
                variant="outline"
                onClick={() => setSearchTerm("")}
                className="mt-6 rounded-xl font-semibold"
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCategories.map((category, index) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="group relative rounded-3xl bg-card border border-border/50 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-primary/30 transition-all duration-300"
                >
                  {/* Category Image / Header Banner */}
                  <div className="relative h-56 w-full overflow-hidden bg-secondary/50">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary to-background">
                        <LayoutGrid className="h-16 w-16 text-primary/30 group-hover:text-primary/50 transition-colors" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-90" />
                  </div>

                  {/* Category Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between -mt-8 relative z-10">
                    <div>
                      <h3 className="font-display text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {category.description || "Discover premium hand-picked products in this collection."}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1">
                        <PackageCheck className="h-3.5 w-3.5" /> Full Collection
                      </span>
                      <Button
                        onClick={() => navigate(`/products?category=${category._id}`)}
                        variant="ghost"
                        className="rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 font-bold text-xs uppercase tracking-widest flex items-center gap-2"
                      >
                        Shop Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Categories;
