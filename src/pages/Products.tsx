import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { Filter, SlidersHorizontal, Grid, List, ChevronDown } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { fetchProducts, fetchCategories } from "@/lib/api";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

const priceRanges = [
  { value: "all", label: "All Prices" },
  { value: "0-50", label: "Under $50" },
  { value: "50-100", label: "$50 - $100" },
  { value: "100-200", label: "$100 - $200" },
  { value: "200+", label: "$200+" },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const selectedCategory = searchParams.get("category") || "all";
  const selectedSort = searchParams.get("sort") || "featured";
  const selectedPrice = searchParams.get("price") || "all";

  const { data, isLoading } = useQuery({
    queryKey: ["products", selectedCategory, selectedSort, selectedPrice],
    queryFn: () => {
      const params: any = {};
      if (selectedCategory !== "all") params.category = selectedCategory;

      // Map frontend sort to backend sort/order
      if (selectedSort === "price-asc") {
        params.sort = "price";
        params.order = "asc";
      } else if (selectedSort === "price-desc") {
        params.sort = "price";
        params.order = "desc";
      } else if (selectedSort === "newest") {
        params.sort = "createdAt";
        params.order = "desc";
      } else if (selectedSort === "rating") {
        params.sort = "rating";
        params.order = "desc";
      }

      if (selectedPrice !== "all") {
        const [min, max] = selectedPrice.split("-").map(String);
        if (min) params.minPrice = min.replace("+", "");
        if (max) params.maxPrice = max;
      }

      return fetchProducts(params);
    },
  });

  const filteredProducts = data?.data || [];

  const { data: categoryData } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const categories = categoryData?.success ? categoryData.data : [];

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === "all" || value === "featured") {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="border-b border-border bg-secondary/30 py-12">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="font-display text-4xl font-bold">
                {selectedCategory !== "all"
                  ? (categories as any[]).find((c) => (c.id || c._id) === selectedCategory)?.name ||
                  "All Products"
                  : "All Products"}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {filteredProducts.length} products
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container py-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Filters Sidebar */}
            <aside
              className={`w-full shrink-0 lg:w-64 ${showFilters ? "block" : "hidden lg:block"
                }`}
            >
              <div className="space-y-6 rounded-xl bg-card p-6 shadow-soft">
                {/* Categories */}
                <div>
                  <h3 className="font-semibold">Categories</h3>
                  <ul className="mt-3 space-y-2">
                    <li>
                      <button
                        onClick={() => updateFilter("category", "all")}
                        className={`w-full text-left text-sm transition-colors ${selectedCategory === "all"
                          ? "font-medium text-primary"
                          : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        All Categories
                      </button>
                    </li>
                    {categories.map((category: any) => (
                      <li key={category.id || category._id}>
                        <button
                          onClick={() => updateFilter("category", category.id || category._id)}
                          className={`w-full text-left text-sm transition-colors ${selectedCategory === (category.id || category._id)
                            ? "font-medium text-primary"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                          {category.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-semibold">Price Range</h3>
                  <ul className="mt-3 space-y-2">
                    {priceRanges.map((range) => (
                      <li key={range.value}>
                        <button
                          onClick={() => updateFilter("price", range.value)}
                          className={`w-full text-left text-sm transition-colors ${selectedPrice === range.value
                            ? "font-medium text-primary"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                          {range.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>

            {/* Products */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <Button
                  variant="outline"
                  className="lg:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>

                <div className="flex items-center gap-4">
                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={selectedSort}
                      onChange={(e) => updateFilter("sort", e.target.value)}
                      className="appearance-none rounded-lg border border-input bg-background px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>

                  {/* View Mode */}
                  <div className="hidden items-center gap-1 rounded-lg border border-input p-1 sm:flex">
                    <Button
                      variant={viewMode === "grid" ? "secondary" : "ghost"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "secondary" : "ghost"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {isLoading ? (
                <div className="flex justify-center py-16">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <SlidersHorizontal className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="font-display text-xl font-semibold">
                    No products found
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Try adjusting your filters
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setSearchParams(new URLSearchParams())}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div
                  className={`grid gap-6 ${viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                    }`}
                >
                  {filteredProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Products;
