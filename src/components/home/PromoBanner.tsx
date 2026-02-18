import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fetchPromo } from "@/lib/api";

export function PromoBanner() {
  const { data, isLoading } = useQuery({
    queryKey: ["promo"],
    queryFn: fetchPromo,
  });

  // Handle both array and object responses
  const promoData = (data as any)?.success
    ? (Array.isArray((data as any).data)
      ? (data as any).data[0]  // If array, take first item
      : (data as any).data)     // If object, use directly
    : null;

  // Use API data directly without fallbacks
  if (!promoData) {
    return null; // Don't render if no data from API
  }

  const content = {
    tag: promoData.tag,
    title: promoData.title,
    description: promoData.description,
    ctaText: "Shop Now",
    ctaLink: promoData.link,
    codeLabel: "Use code",
    code: promoData.code,
    terms: promoData.terms
  };

  if (isLoading) {
    return (
      <section className="py-16 lg:py-24">
        <div className="container flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl gradient-primary p-8 lg:p-12"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-background blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-background blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-8 text-center lg:flex-row lg:text-left">
            {/* Content */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-background/20 px-4 py-1.5 text-sm font-medium text-primary-foreground">
                <Sparkles className="h-4 w-4" />
                {content.tag}
              </div>

              <h2 className="mt-4 font-display text-3xl font-bold text-primary-foreground lg:text-4xl">
                {content.title}
              </h2>

              <p className="mt-3 max-w-lg text-primary-foreground/80">
                {content.description}
              </p>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-background text-foreground hover:bg-background/90"
                  asChild
                >
                  <Link to={content.ctaLink}>
                    {content.ctaText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Promo Code */}
            <div className="rounded-xl bg-background/10 p-6 backdrop-blur-sm">
              <p className="text-sm text-primary-foreground/80">{content.codeLabel}</p>
              <p className="mt-1 font-display text-2xl font-bold text-primary-foreground">
                {content.code}
              </p>
              <p className="mt-2 text-xs text-primary-foreground/60">
                {content.terms}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
