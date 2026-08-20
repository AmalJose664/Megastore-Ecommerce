import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, Layers, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchCategories } from "@/lib/api";

const SAMPLE_CATEGORIES = [
  { _id: "electronics", name: "Electronics", slug: "electronics" },
  { _id: "fashion", name: "Fashion & Apparel", slug: "fashion" },
  { _id: "home-kitchen", name: "Home & Kitchen", slug: "home-kitchen" },
  { _id: "beauty", name: "Beauty & Care", slug: "beauty" },
  { _id: "sports", name: "Sports & Fitness", slug: "sports" },
  { _id: "books", name: "Books & Media", slug: "books" },
  { _id: "toys", name: "Toys & Games", slug: "toys" },
  { _id: "footwear", name: "Footwear", slug: "footwear" },
  { _id: "accessories", name: "Accessories", slug: "accessories" },
];

interface CategoryStripeProps {
  onCategorySelect?: (categorySlug: string) => void;
  activeCategory?: string;
}

export const CategoryStripe: React.FC<CategoryStripeProps> = ({
  onCategorySelect,
  activeCategory: propActiveCategory,
}) => {
  const [categories, setCategories] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const activeCategory = propActiveCategory || searchParams.get("category") || "all";

  useEffect(() => {
    async function loadAndMergeCategories() {
      try {
        const res = await fetchCategories();
        let dbCategories = [];
        if (res.success && Array.isArray(res.data)) {
          dbCategories = res.data.filter((c: any) => c.isActive !== false);
        }

        // Combine DB categories + Sample categories
        const combined = [...dbCategories, ...SAMPLE_CATEGORIES];

        // Filter and deduplicate categories by slug & normalized name
        const seenSlugs = new Set<string>();
        const seenNames = new Set<string>();
        const uniqueCategories: any[] = [];

        for (const cat of combined) {
          const normSlug = (cat.slug || cat._id || cat.name).toString().toLowerCase().trim();
          const normName = cat.name.toString().toLowerCase().trim();

          if (!seenSlugs.has(normSlug) && !seenNames.has(normName)) {
            seenSlugs.add(normSlug);
            seenNames.add(normName);
            uniqueCategories.push({
              id: cat._id || cat.id || normSlug,
              name: cat.name,
              slug: normSlug,
            });
          }
        }

        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Failed to load categories for stripe:", err);
        setCategories(SAMPLE_CATEGORIES);
      }
    }

    loadAndMergeCategories();
  }, []);

  const handleCategoryClick = (slug: string) => {
    if (onCategorySelect) {
      onCategorySelect(slug);
    } else {
      if (slug === "all") {
        navigate("/products");
      } else {
        navigate(`/products?category=${encodeURIComponent(slug)}`);
      }
    }
  };

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full bg-secondary/40 border-y border-border/50 py-2.5 shadow-inner relative group">
      <div className="container mx-auto px-4 flex items-center gap-2">
        {/* Category Label */}
        <div className="shrink-0 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground pr-3 border-r border-border/60">
          <Layers className="h-4 w-4 text-primary" />
          <span className="hidden sm:inline">Categories</span>
        </div>

        {/* Scroll Left Button */}
        <button
          onClick={() => handleScroll("left")}
          className="shrink-0 p-1.5 rounded-full bg-card border border-border/70 hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-all shadow-sm z-10"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Scrollable Categories List (No scrollbar) */}
        <div
          ref={scrollRef}
          className="flex-1 flex items-center gap-2.5 overflow-x-auto scroll-smooth py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* All Products Pill */}
          <button
            onClick={() => handleCategoryClick("all")}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 border ${
              activeCategory === "all"
                ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-105"
                : "bg-card hover:bg-secondary text-muted-foreground hover:text-foreground border-border/60"
            }`}
          >
            <Sparkles className="h-3 w-3" />
            All Products
          </button>

          {/* Category Pills */}
          {categories.map((cat) => {
            const isActive =
              activeCategory === cat.slug ||
              activeCategory === cat.id ||
              activeCategory.toLowerCase() === cat.name.toLowerCase();

            return (
              <button
                key={cat.id || cat.slug}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-105 font-bold"
                    : "bg-card hover:bg-secondary text-muted-foreground hover:text-foreground border-border/60"
                }`}
              >
                <Tag className="h-3 w-3 opacity-70" />
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Scroll Right Button */}
        <button
          onClick={() => handleScroll("right")}
          className="shrink-0 p-1.5 rounded-full bg-card border border-border/70 hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-all shadow-sm z-10"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
