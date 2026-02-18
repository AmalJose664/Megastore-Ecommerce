import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-image.jpg";
import { fetchHero } from "@/lib/api";

export function HeroSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["hero"],
    queryFn: fetchHero,
  });

  // Handle both array and object responses
  const heroData = (data as any)?.success
    ? (Array.isArray((data as any).data)
      ? (data as any).data[0]  // If array, take first item
      : (data as any).data)     // If object, use directly
    : null;

  // Use API data directly without fallbacks
  if (!heroData) {
    return null; // Don't render if no data from API
  }

  const content = {
    badge: heroData.badge,
    title: heroData.title,
    subtitle: heroData.subtitle,
    ctaText: heroData.ctaText,
    ctaLink: heroData.ctaLink,
    secondaryCtaText: heroData.secondaryCtaText,
    secondaryCtaLink: heroData.secondaryCtaLink,
    image: heroData.image,
    stats: heroData.stats || [],
  };

  if (isLoading) {
    return (
      <section className="relative overflow-hidden hero-gradient min-h-[600px] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </section>
    );
  }

  // Helper to split title for gradient effect if needed
  // This assumes the API sends the full title. We'll try to split strictly for the visual effect if it matches the default.
  // Otherwise, we accept the full title string.
  const isDefaultTitle = content.title === "Discover Your Perfect Style";

  return (
    <section className="relative overflow-hidden hero-gradient">
      <div className="container relative z-10 py-16 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
            >
              {content.badge}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
            >
              {isDefaultTitle ? (
                <>
                  Discover Your
                  <span className="mt-2 block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Perfect Style
                  </span>
                </>
              ) : (
                content.title
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-6 text-lg text-muted-foreground lg:text-xl"
            >
              {content.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Button variant="hero" size="xl" asChild>
                <Link to={content.ctaLink}>
                  {content.ctaText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              {content.secondaryCtaText && content.secondaryCtaLink && (
                <Button variant="outline" size="xl" asChild>
                  <Link to={content.secondaryCtaLink}>{content.secondaryCtaText}</Link>
                </Button>
              )}
            </motion.div>

            {/* Stats */}
            {content.stats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="mt-12 grid grid-cols-3 gap-8"
              >
                {content.stats.map((stat: any) => (
                  <div key={stat.label} className="text-center lg:text-left">
                    <div className="font-display text-2xl font-bold lg:text-3xl">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-elevated lg:aspect-square">
              <img
                src={content.image}
                alt="Premium lifestyle products showcased in elegant arrangement"
                className="h-full w-full object-cover"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent" />
            </div>

            {/* Floating Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute -bottom-6 -left-6 hidden rounded-xl bg-card p-4 shadow-elevated lg:block"
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full border-2 border-card bg-secondary"
                    />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold">Join 50k+ customers</p>
                  <p className="text-xs text-muted-foreground">
                    Who love our products
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
