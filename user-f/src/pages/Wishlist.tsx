import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

export const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { wishlistItems, loading, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleMoveToCart = async (product: any) => {
    const prodId = product._id || product.id;
    if (!prodId) return;
    const formattedProduct = {
      id: prodId,
      _id: prodId,
      name: product.name,
      slug: product.slug,
      price: product.price,
      originalPrice: product.originalPrice,
      images: product.images || [product.thumbnail],
      thumbnail: product.thumbnail,
      category: typeof product.category === 'object' ? product.category.name : product.category,
      inStock: product.inStock !== false,
      stock: product.stock || 10,
      rating: product.rating || 5,
      reviewCount: product.reviewCount || 0,
    };
    await addItem(formattedProduct as any, 1);
    await toggleWishlist(prodId);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground antialiased pb-20">
        {/* Hero Banner */}
        <section className="relative py-16 px-4 hero-gradient border-b border-border/40 overflow-hidden">
          <div className="container max-w-5xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4"
            >
              <Heart className="h-3.5 w-3.5 fill-primary" /> Your Saved Items
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground"
            >
              My Wishlist
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-3 text-muted-foreground max-w-xl mx-auto text-sm md:text-base"
            >
              Save your favorite items and purchase them whenever you are ready.
            </motion.p>
          </div>
        </section>

        {/* Content Section */}
        <section className="container max-w-7xl mx-auto px-4 py-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm font-medium">Loading your saved items...</p>
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="text-center py-20 max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                <Heart className="h-10 w-10 text-muted-foreground/60" />
              </div>
              <h3 className="text-2xl font-display font-bold text-foreground">Your Wishlist is Empty</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Explore our catalog and click the heart icon on any product to save it here.
              </p>
              <Button
                onClick={() => navigate('/products')}
                className="mt-8 rounded-xl font-bold uppercase tracking-widest text-xs px-8 py-3"
              >
                Explore Products <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlistItems.map((product: any, index) => {
                const prodId = product._id || product.id;
                return (
                  <motion.div
                    key={prodId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-300"
                  >
                    {/* Remove button */}
                    <button
                      onClick={() => toggleWishlist(prodId)}
                      className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-md border border-border/60 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-background transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    {/* Thumbnail */}
                    <Link to={`/products/${prodId}`} className="block relative aspect-square bg-secondary/40 overflow-hidden">
                      <img
                        src={product.thumbnail || product.images?.[0] || 'https://via.placeholder.com/300'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                          {typeof product.category === 'object' ? product.category?.name : 'Collection'}
                        </p>
                        <Link
                          to={`/products/${prodId}`}
                          className="font-display text-base font-bold text-foreground hover:text-primary transition-colors line-clamp-1 mt-1"
                        >
                          {product.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="font-bold text-lg text-foreground">₹{product.price?.toFixed(2)}</span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-xs text-muted-foreground line-through">
                              ₹{product.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-border/50 flex gap-2">
                        <Button
                          onClick={() => handleMoveToCart(product)}
                          className="w-full rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                        >
                          <ShoppingBag className="h-4 w-4" /> Add To Cart
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
};

export default WishlistPage;
