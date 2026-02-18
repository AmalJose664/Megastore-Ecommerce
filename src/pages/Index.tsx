import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CategoriesGrid } from "@/components/home/CategoriesGrid";
import { PromoBanner } from "@/components/home/PromoBanner";
import { Testimonials } from "@/components/home/Testimonials";

const Index = () => {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main>
        <HeroSection />
        <FeaturedProducts />
        <CategoriesGrid />
        <PromoBanner />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
};

export default Index;
