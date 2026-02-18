import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Check,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { fetchProductById, fetchProducts } from "@/lib/api";

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const { data: productData, isLoading: isProductLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id || ""),
    enabled: !!id,
  });

  const product = productData?.data;

  const { data: relatedProductsData } = useQuery({
    queryKey: ["related-products", product?.category],
    queryFn: () => {
      const categoryId = typeof product.category === 'object' ? product.category.id || product.category._id : product.category;
      return fetchProducts({ category: categoryId, limit: 5 });
    },
    enabled: !!product?.category,
  });

  const relatedProducts = (relatedProductsData?.data || []).filter(
    (p: any) => p.id !== id
  ).slice(0, 4);

  if (isProductLoading) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="container flex min-h-[60vh] flex-col items-center justify-center py-16">
          <h1 className="font-display text-2xl font-bold">Product not found</h1>
          <p className="mt-2 text-muted-foreground">
            The product you're looking for doesn't exist.
          </p>
          <Button variant="hero" className="mt-6" asChild>
            <Link to="/products">Browse Products</Link>
          </Button>
        </main>
        <Footer />
      </>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const features = [
    { icon: Truck, title: "Free Shipping", description: "On orders over $100" },
    { icon: Shield, title: "2 Year Warranty", description: "Full coverage" },
    { icon: RotateCcw, title: "Easy Returns", description: "30-day return policy" },
  ];

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="min-h-screen bg-background">
        <div className="container py-8">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <span>/</span>
            <Link to="/products" className="hover:text-foreground">
              Products
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* Main Image */}
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </AnimatePresence>

                {/* Navigation Arrows */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setSelectedImage((prev) =>
                          prev === 0 ? product.images.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 shadow-soft backdrop-blur-sm transition-all hover:bg-background"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() =>
                        setSelectedImage((prev) =>
                          prev === product.images.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 shadow-soft backdrop-blur-sm transition-all hover:bg-background"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="mt-4 flex gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square w-20 overflow-hidden rounded-lg transition-all ${selectedImage === index
                        ? "ring-2 ring-primary ring-offset-2"
                        : "opacity-60 hover:opacity-100"
                        }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* Badges */}
              <div className="flex items-center gap-2">
                {product.isNew && (
                  <span className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background">
                    New Arrival
                  </span>
                )}
                {product.originalPrice && (
                  <span className="rounded-full bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground">
                    {Math.round(
                      ((product.originalPrice - product.price) /
                        product.originalPrice) *
                      100
                    )}
                    % OFF
                  </span>
                )}
              </div>

              <h1 className="mt-4 font-display text-3xl font-bold lg:text-4xl">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(product.rating)
                        ? "fill-primary text-primary"
                        : "fill-muted text-muted"
                        }`}
                    />
                  ))}
                </div>
                <span className="font-medium">{product.rating}</span>
                <span className="text-muted-foreground">
                  ({product.reviewCount} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-display text-3xl font-bold">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="mt-6 text-muted-foreground">{product.description}</p>

              {/* Quantity & Add to Cart */}
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                {/* Quantity Selector */}
                <div className="flex items-center rounded-lg border border-input">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-12 w-12 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-12 w-12 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <Button
                  variant="hero"
                  size="xl"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={addedToCart}
                >
                  {addedToCart ? (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      Added to Cart
                    </>
                  ) : (
                    "Add to Cart"
                  )}
                </Button>

                {/* Wishlist */}
                <Button variant="outline" size="xl" className="px-4">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>

              {/* Features */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className="rounded-lg bg-secondary/50 p-4 text-center"
                  >
                    <feature.icon className="mx-auto h-6 w-6 text-primary" />
                    <p className="mt-2 text-sm font-medium">{feature.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Tags */}
              {product.tags && (
                <div className="mt-8">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Tags
                  </h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-secondary px-3 py-1 text-sm text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-20">
              <h2 className="font-display text-2xl font-bold">
                You Might Also Like
              </h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProductDetail;
