import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import { fetchActiveBannerSections } from "@/lib/api";

export enum BannerSize {
  SM = "sm",
  MD = "md",
  LG = "lg",
  SIDE_BY_SIDE = "side-by-side",
}

export interface BannerSlide {
  _id?: string;
  imageUrl: string;
  imageTitle?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  navigateLink?: string;
  priority: number;
  badge?: string;
  isActive: boolean;
}

export interface BannerSection {
  _id: string;
  title: string;
  subtitle?: string;
  size: BannerSize | "sm" | "md" | "lg" | "side-by-side";
  displayOrder: number;
  autoScrollInterval: number;
  isActive: boolean;
  slides: BannerSlide[];
}

export function BannerSections() {
  const [sections, setSections] = useState<BannerSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBannerSections() {
      try {
        const response = await fetchActiveBannerSections();
        if (response && response.success && Array.isArray(response.data)) {
          setSections(response.data);
        }
      } catch (err) {
        console.error("Failed to load banner sections:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadBannerSections();
  }, []);

  if (isLoading || sections.length === 0) {
    return null;
  }

  return (
    <section className="py-12 space-y-12">
      <div className="container">
        {sections.map((section) => (
          <SingleBannerSection key={section._id} section={section} />
        ))}
      </div>
    </section>
  );
}

function SingleBannerSection({ section }: { section: BannerSection }) {
  // Sort slides by priority and filter active ones
  const slides = (section.slides || [])
    .filter((s) => s.isActive !== false && s.imageUrl)
    .sort((a, b) => (a.priority || 0) - (b.priority || 0));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const autoScrollInterval = section.autoScrollInterval || 4000;

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, autoScrollInterval);

    return () => clearInterval(timer);
  }, [slides.length, autoScrollInterval, isPaused]);

  if (slides.length === 0) return null;

  const isSideBySide = section.size === BannerSize.SIDE_BY_SIDE || section.size === "side-by-side";

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  // Determine height based on section size (sm, md, lg) for overlay banners
  const heightClasses = {
    sm: "h-56 sm:h-64 md:h-72",
    md: "h-72 sm:h-96 md:h-[440px]",
    lg: "h-96 sm:h-[480px] md:h-[560px]",
  }[section.size as "sm" | "md" | "lg"] || "h-72 sm:h-96 md:h-[440px]";

  return (
    <div className="space-y-4 mb-10">
      {/* Outside Section Header (Title & Subtitle outside the image) */}
      {(section.title || section.subtitle) && (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary shrink-0" /> {section.title}
            </h2>
            {section.subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{section.subtitle}</p>
            )}
          </div>
        </div>
      )}

      {/* Side-By-Side Presentation Layout */}
      {isSideBySide ? (
        <div
          className="relative rounded-3xl overflow-hidden bg-card/80 border border-border/50 shadow-xl p-6 sm:p-10 group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Side: Presentation Text */}
            <div className="space-y-4 pr-2">
              {slides[currentIndex].badge && (
                <div>
                  <span className="inline-block bg-primary/10 text-primary border border-primary/20 text-xs sm:text-sm font-bold px-3.5 py-1 rounded-full">
                    {slides[currentIndex].badge}
                  </span>
                </div>
              )}

              <h3 className="font-display text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                {slides[currentIndex].imageTitle || slides[currentIndex].title || section.title}
              </h3>

              {slides[currentIndex].subtitle && (
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {slides[currentIndex].subtitle}
                </p>
              )}

              {slides[currentIndex].buttonText && slides[currentIndex].navigateLink && (
                <div className="pt-2">
                  <Link
                    to={slides[currentIndex].navigateLink!}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md text-sm sm:text-base"
                  >
                    {slides[currentIndex].buttonText} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* Right Side: Presentation Image (Smaller & Fitted) */}
            <div className="relative aspect-video sm:aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-border/40 bg-secondary/20">
              {slides.map((slide, index) => (
                <img
                  key={slide._id || index}
                  src={slide.imageUrl}
                  alt={slide.imageTitle || slide.title || section.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                    index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          {slides.length > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/40">
              <div className="flex items-center gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? "w-6 bg-primary" : "w-2 bg-muted-foreground/40"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  aria-label="Previous slide"
                  className="w-9 h-9 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  aria-label="Next slide"
                  className="w-9 h-9 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Full Image Overlay Layout (sm, md, lg) */
        <div
          className={`relative rounded-3xl overflow-hidden shadow-2xl group border border-border/40 ${heightClasses}`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Slide Background Images */}
          {slides.map((slide, index) => (
            <div
              key={slide._id || index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <img
                src={slide.imageUrl}
                alt={slide.imageTitle || slide.title || section.title}
                className="w-full h-full object-cover"
              />
              {/* Gradient Overlay for high text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

              {/* Inside-Image Text & Bottom-Left Inset Button */}
              <div className="absolute bottom-0 left-0 p-8 sm:p-12 md:p-14 max-w-2xl text-white space-y-3 sm:space-y-4">
                {slide.badge && (
                  <div>
                    <span className="inline-block bg-primary text-primary-foreground text-xs sm:text-sm font-bold px-3.5 py-1 rounded-full shadow-lg">
                      {slide.badge}
                    </span>
                  </div>
                )}

                {(slide.imageTitle || slide.title) && (
                  <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight drop-shadow-md leading-tight">
                    {slide.imageTitle || slide.title}
                  </h3>
                )}

                {slide.subtitle && (
                  <p className="text-sm sm:text-lg text-gray-200 line-clamp-2 font-medium drop-shadow-sm">
                    {slide.subtitle}
                  </p>
                )}

                {slide.buttonText && slide.navigateLink && (
                  <div className="pt-3 sm:pt-4">
                    <Link
                      to={slide.navigateLink}
                      className="inline-flex items-center gap-2 bg-white text-black hover:bg-primary hover:text-white font-bold px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl text-sm sm:text-base"
                    >
                      {slide.buttonText} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Navigation Arrows (visible if >1 slide) */}
          {slides.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                aria-label="Previous slide"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={handleNext}
                aria-label="Next slide"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Indicator Dots */}
              <div className="absolute bottom-4 right-6 sm:right-10 z-20 flex items-center gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? "w-8 bg-white"
                        : "w-2.5 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
