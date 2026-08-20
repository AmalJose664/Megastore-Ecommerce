import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { Filter, SlidersHorizontal, Grid, List, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { fetchProducts, fetchCategories } from "@/lib/api";
import { CategoryStripe } from "@/components/common/CategoryStripe";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

const priceRanges = [
  { value: "all", label: "All Prices" },
  { value: "0-500", label: "Under ₹500" },
  { value: "500-1000", label: "₹500 - ₹1,000" },
  { value: "1000-2000", label: "₹1,000 - ₹2,000" },
  { value: "2000+", label: "₹2,000+" },
];

const PRODUCTS_PER_PAGE = 9;

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const selectedCategory = searchParams.get("category") || "all";
  const selectedSort = searchParams.get("sort") || "featured";
  const selectedPrice = searchParams.get("price") || "all";
  const searchQuery = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const { data, isLoading } = useQuery({
    queryKey: ["products", selectedCategory, selectedSort, selectedPrice, searchQuery, page],
    queryFn: () => {
      const params: any = {
        page,
        limit: PRODUCTS_PER_PAGE,
      };

      if (selectedCategory !== "all") params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();

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
  const pagination = data?.pagination || {};
  const totalItems = data?.total || pagination?.total || filteredProducts.length;
  const totalPages = pagination?.totalPages || Math.ceil(totalItems / PRODUCTS_PER_PAGE) || 1;

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
    // Reset to page 1 on filter change
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Navbar />
      <CategoryStripe
        activeCategory={selectedCategory}
        onCategorySelect={(slug) => updateFilter("category", slug)}
      />
      <CartDrawer />
      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="border-b border-border bg-secondary/30 py-8 md:py-12">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="font-display text-3xl md:text-4xl font-bold">
                {searchQuery
                  ? `Search Results for "${searchQuery}"`
                  : selectedCategory !== "all"
                  ? (categories as any[]).find(
                      (c) => (c.slug || c.id || c._id) === selectedCategory
                    )?.name || selectedCategory.replace(/-/g, " ")
                  : "All Products"}
              </h1>
              <p className="mt-2 text-muted-foreground text-sm">
                Showing {filteredProducts.length} of {totalItems} products
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container py-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Filters Sidebar */}
            <aside
              className={`w-full shrink-0 lg:w-64 ${
                showFilters ? "block" : "hidden lg:block"
              }`}
            >
              <div className="space-y-6 rounded-xl bg-card p-6 shadow-soft border border-border/50">
                {/* Categories Sidebar */}
                <div>
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Categories</h3>
                  <ul className="space-y-2">
                    <li>
                      <button
                        onClick={() => updateFilter("category", "all")}
                        className={`w-full text-left text-sm transition-colors ${
                          selectedCategory === "all"
                            ? "font-bold text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        All Categories
                      </button>
                    </li>
                    {categories.map((category: any) => (
                      <li key={category.id || category._id || category.slug}>
                        <button
                          onClick={() => updateFilter("category", category.slug || category.id || category._id)}
                          className={`w-full text-left text-sm transition-colors capitalize ${
                            selectedCategory === (category.slug || category.id || category._id)
                              ? "font-bold text-primary"
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
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Price Range</h3>
                  <ul className="space-y-2">
                    {priceRanges.map((range) => (
                      <li key={range.value}>
                        <button
                          onClick={() => updateFilter("price", range.value)}
                          className={`w-full text-left text-sm transition-colors ${
                            selectedPrice === range.value
                              ? "font-bold text-primary"
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

            {/* Products Main View */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <Button
                  variant="outline"
                  className="lg:hidden rounded-xl"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>

                <div className="flex items-center gap-4 ml-auto">
                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={selectedSort}
                      onChange={(e) => updateFilter("sort", e.target.value)}
                      className="appearance-none rounded-xl border border-input bg-card px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                  <div className="hidden items-center gap-1 rounded-xl border border-input p-1 sm:flex bg-card">
                    <Button
                      variant={viewMode === "grid" ? "secondary" : "ghost"}
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "secondary" : "ghost"}
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-border/50 bg-card p-8">
                  <SlidersHorizontal className="mb-4 h-12 w-12 text-muted-foreground/50" />
                  <h3 className="font-display text-xl font-bold">
                    No products found
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We couldn't find any products matching your filters.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6 rounded-xl font-bold text-xs uppercase tracking-wider"
                    onClick={() => setSearchParams(new URLSearchParams())}
                  >
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                <>
                  <div
                    className={`grid gap-6 ${
                      viewMode === "grid"
                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        : "grid-cols-1"
                    }`}
                  >
                    {filteredProducts.map((product: any, index: number) => (
                      <ProductCard
                        key={product._id || product.id}
                        product={product}
                        index={index}
                      />
                    ))}
                  </div>

                  {/* Product Pagination Bar */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-12 pt-6 border-t border-border/50">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(Math.max(1, page - 1))}
                        disabled={page <= 1}
                        className="rounded-xl flex items-center gap-1 font-bold text-xs"
                      >
                        <ChevronLeft className="h-4 w-4" /> Previous
                      </Button>

                      <span className="text-xs font-bold text-muted-foreground">
                        Page {page} of {totalPages}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                        disabled={page >= totalPages}
                        className="rounded-xl flex items-center gap-1 font-bold text-xs"
                      >
                        Next <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
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
