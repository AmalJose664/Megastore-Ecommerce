import { useState, useEffect } from "react";
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
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { fetchProductById, fetchProducts } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { addRecentlyViewed } from "@/utils/recentlyViewed";
import RecentlyViewedProducts from "@/components/common/RecentlyViewedProducts";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [canReviewState, setCanReviewState] = useState<{ canReview: boolean; reason?: string }>({ canReview: false });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [titleInput, setTitleInput] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Variant Selection State
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  const { data: productData, isLoading: isProductLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id || ""),
    enabled: !!id,
  });

  const product = productData?.data;

  // Variant Selection Options
  const variants = product?.hasVariants && Array.isArray(product.variants) ? product.variants : [];
  const availableSizes = Array.from(
    new Set(variants.map((v: any) => v.attributes?.size || (typeof v.attributes?.get === 'function' ? v.attributes.get('size') : '')).filter(Boolean))
  ) as string[];
  const availableColors = Array.from(
    new Set(variants.map((v: any) => v.attributes?.color || (typeof v.attributes?.get === 'function' ? v.attributes.get('color') : '')).filter(Boolean))
  ) as string[];

  useEffect(() => {
    if (availableSizes.length > 0 && !selectedSize) setSelectedSize(availableSizes[0]);
    if (availableColors.length > 0 && !selectedColor) setSelectedColor(availableColors[0]);
  }, [product]);

  // Track product view in localStorage recently viewed
  useEffect(() => {
    if (product) {
      addRecentlyViewed(product);
    }
  }, [product]);

  // Load reviews and check review eligibility
  useEffect(() => {
    if (!id) return;

    const loadReviews = async () => {
      setLoadingReviews(true);
      try {
        const res = await fetch(`${API_BASE_URL}/reviews/product/${id}`);
        const data = await res.json();
        if (data.success) {
          setReviews(data.data || []);
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setLoadingReviews(false);
      }
    };

    const checkEligibility = async () => {
      if (!isAuthenticated) return;
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/reviews/can-review/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
          setCanReviewState(data.data);
        }
      } catch (err) {
        console.error("Failed to check review eligibility:", err);
      }
    };

    loadReviews();
    checkEligibility();
  }, [id, isAuthenticated]);

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

  const prodId = product._id || product.id || id;
  const isWishlisted = isInWishlist(prodId);

  const activeVariant = variants.find((v: any) => {
    const vSize = v.attributes?.size || (typeof v.attributes?.get === 'function' ? v.attributes.get('size') : '');
    const vColor = v.attributes?.color || (typeof v.attributes?.get === 'function' ? v.attributes.get('color') : '');
    const sizeMatch = !availableSizes.length || vSize === selectedSize;
    const colorMatch = !availableColors.length || vColor === selectedColor;
    return sizeMatch && colorMatch;
  }) || variants[0];

  const currentPrice = activeVariant?.price || product?.price || 0;
  const currentStock = activeVariant ? activeVariant.stock : (product?.stock || 0);
  const isOutOfStock = currentStock <= 0;

  const handleAddToCart = () => {
    addItem(product, quantity, activeVariant?._id || activeVariant?.id);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim() || !commentInput.trim()) {
      toast({ title: "Validation Error", description: "Please enter a title and review comment.", variant: "destructive" });
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          product: prodId,
          rating: ratingInput,
          title: titleInput.trim(),
          comment: commentInput.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({ title: "Review Submitted!", description: "Thank you for reviewing this product." });
        setShowReviewModal(false);
        setTitleInput('');
        setCommentInput('');
        setCanReviewState({ canReview: false, reason: 'You have already reviewed this product' });
        // Refresh reviews
        const revRes = await fetch(`${API_BASE_URL}/reviews/product/${prodId}`);
        const revData = await revRes.json();
        if (revData.success) setReviews(revData.data || []);
      } else {
        toast({ title: "Submission Error", description: data.message || "Failed to submit review", variant: "destructive" });
      }
    } catch (err) {
      console.error("Error submitting review:", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const features = [
    { icon: Truck, title: "Free Shipping", description: "On orders over ₹1000" },
    { icon: Shield, title: "Genuine Product", description: "Verified quality" },
    { icon: RotateCcw, title: "Easy Returns", description: "7-day return policy" },
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
                <div className="flex gap-4 mt-4">
                  {product.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square w-20 overflow-hidden rounded-lg transition-all ${selectedImage === index
                        ? "ring-2 ring-primary ring-offset-2"
                        : "opacity-70 hover:opacity-100"
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
            <div className="flex flex-col">
              <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {typeof product.category === "object" ? (product.category as any).name : product.category}
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold lg:text-4xl">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="mt-4 flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(product.rating || 0)
                        ? "fill-primary text-primary"
                        : "text-muted"
                        }`}
                    />
                  ))}
                </div>
                <span className="font-semibold">{product.rating || 0}</span>
                <span className="text-muted-foreground">
                  ({reviews.length || product.reviewCount || 0} customer reviews)
                </span>
              </div>

              {/* Price & Stock Badge */}
              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-3xl font-bold">
                    ₹{currentPrice.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xl text-muted-foreground line-through">
                      ₹{product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <div>
                  {isOutOfStock ? (
                    <span className="px-3 py-1 text-xs font-bold text-destructive bg-destructive/10 rounded-full">
                      Out of Stock
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-full">
                      In Stock ({currentStock} available)
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="mt-6 text-muted-foreground">{product.description}</p>

              {/* Variant Selectors (Size & Color) */}
              {product.hasVariants && (
                <div className="mt-6 space-y-4 p-4 rounded-xl border border-border/80 bg-secondary/20">
                  {/* Size Selector */}
                  {availableSizes.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Size</span>
                        <span className="text-xs font-semibold text-primary">{selectedSize}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {availableSizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`min-w-[44px] h-10 px-3 rounded-lg text-sm font-semibold border transition-all ${
                              selectedSize === size
                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                : "border-input bg-background hover:bg-muted text-foreground"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Color Selector */}
                  {availableColors.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Color</span>
                        <span className="text-xs font-semibold text-primary">{selectedColor}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {availableColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                              selectedColor === color
                                ? "border-primary bg-primary/10 text-primary font-semibold ring-2 ring-primary/20"
                                : "border-input bg-background hover:bg-muted text-muted-foreground"
                            }`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                  disabled={addedToCart || isOutOfStock}
                >
                  {isOutOfStock ? (
                    "Out of Stock"
                  ) : addedToCart ? (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      Added to Cart
                    </>
                  ) : (
                    "Add to Cart"
                  )}
                </Button>

                {/* Wishlist Toggle Button */}
                <Button
                  variant="outline"
                  size="xl"
                  className="px-4"
                  onClick={() => toggleWishlist(prodId)}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? "fill-destructive text-destructive" : ""}`} />
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
                    {product.tags.map((tag: string) => (
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
            </div>
          </div>

          {/* Customer Reviews Section */}
          <section className="mt-20 pt-10 border-t border-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <h2 className="font-display text-3xl font-bold flex items-center gap-3">
                  <MessageSquare className="h-7 w-7 text-primary" /> Verified Customer Reviews
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Real feedback from customers who purchased this item.
                </p>
              </div>

              {canReviewState.canReview ? (
                <Button
                  onClick={() => setShowReviewModal(true)}
                  className="rounded-xl font-bold text-xs uppercase tracking-widest px-6 py-3"
                >
                  Write a Review
                </Button>
              ) : (
                <div className="text-xs text-muted-foreground bg-secondary/50 px-4 py-2 rounded-xl border border-border/50 max-w-md">
                  {canReviewState.reason || "Login & purchase this product to leave a review."}
                </div>
              )}
            </div>

            {/* Reviews List */}
            {loadingReviews ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 bg-secondary/20 rounded-2xl border border-border/50 max-w-xl mx-auto">
                <Star className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="font-display text-lg font-bold text-foreground">No Reviews Yet</h3>
                <p className="text-sm text-muted-foreground mt-1">Be the first verified customer to leave a review for this product!</p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reviews.slice((reviewPage - 1) * 4, reviewPage * 4).map((rev) => (
                    <div key={rev._id || rev.id} className="p-6 rounded-2xl bg-card border border-border/60 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < rev.rating ? "fill-primary text-primary" : "text-muted"}`}
                              />
                            ))}
                          </div>
                          {rev.isVerifiedPurchase && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                              <CheckCircle2 className="h-3 w-3" /> Verified Buyer
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-foreground text-base mb-1">{rev.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{rev.comment}</p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {rev.user?.firstName} {rev.user?.lastName}
                        </span>
                        <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Review Pagination Controls */}
                {Math.ceil(reviews.length / 4) > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReviewPage((prev) => Math.max(1, prev - 1))}
                      disabled={reviewPage === 1}
                      className="rounded-xl"
                    >
                      Previous
                    </Button>
                    <span className="text-xs font-semibold text-muted-foreground">
                      Page {reviewPage} of {Math.ceil(reviews.length / 4)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReviewPage((prev) => Math.min(Math.ceil(reviews.length / 4), prev + 1))}
                      disabled={reviewPage === Math.ceil(reviews.length / 4)}
                      className="rounded-xl"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-20">
              <h2 className="font-display text-2xl font-bold">
                You Might Also Like
              </h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((product: any, index: number) => (
                  <ProductCard
                    key={product.id || product._id}
                    product={product}
                    index={index}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 md:p-8 shadow-2xl relative"
          >
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl font-display font-bold mb-1">Write a Review</h2>
            <p className="text-sm text-muted-foreground mb-6">Share your experience with fellow shoppers.</p>

            <form onSubmit={handleReviewSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">Overall Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRatingInput(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star className={`h-7 w-7 ${star <= ratingInput ? "fill-primary text-primary" : "text-muted"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">Review Title</label>
                <input
                  type="text"
                  placeholder="e.g. Excellent build quality!"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full bg-secondary/50 border border-border/60 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-2">Your Review</label>
                <textarea
                  rows={4}
                  placeholder="What did you like or dislike about this product?"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="w-full bg-secondary/50 border border-border/60 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" type="button" className="flex-1 rounded-xl h-12" onClick={() => setShowReviewModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 rounded-xl h-12 font-bold uppercase tracking-widest text-xs" disabled={submittingReview}>
                  {submittingReview ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Submit Review"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <RecentlyViewedProducts currentProductId={id} />

      <Footer />
    </>
  );
};

export default ProductDetail;
