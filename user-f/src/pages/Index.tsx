import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CategoriesGrid } from "@/components/home/CategoriesGrid";
import { PromoBanner } from "@/components/home/PromoBanner";
import { Testimonials } from "@/components/home/Testimonials";
import { BannerSections } from "@/components/home/BannerSections";
import { CategoryStripe } from "@/components/common/CategoryStripe";
import RecentlyViewedProducts from "@/components/common/RecentlyViewedProducts";

const Index = () => {
  return (
    <>
      <Navbar />
      <CategoryStripe />
      <CartDrawer />
      <main>
        <HeroSection />
        <BannerSections />
        <FeaturedProducts />
        <CategoriesGrid />
        <PromoBanner />
        <Testimonials />
        <RecentlyViewedProducts />
      </main>
      <Footer />
    </>
  );
};

export default Index;
