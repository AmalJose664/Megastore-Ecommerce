import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, User, Menu, X, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useSiteSettings } from "@/context/SettingsContext";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/products" },
  { name: "Categories", path: "/categories" },
  { name: "About", path: "/about" },
];

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems, toggleCart } = useCart();
  const { user } = useAuth();
  const { wishlistItems } = useWishlist();
  const { settings } = useSiteSettings();

  // Debounced search suggestions fetch
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const response = await fetch(`${API_BASE_URL}/products/suggestions?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setSuggestions(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSuggestion = (productId: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSuggestions([]);
    navigate(`/products/${productId}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <nav className="container flex h-16 items-center justify-between gap-4 lg:h-20">
        {/* Logo */}
        <Link
          to="/"
          className="font-display text-xl font-semibold tracking-tight lg:text-2xl flex items-center gap-2 shrink-0"
        >
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt={settings.siteName} className="h-8 max-w-[140px] object-contain" />
          ) : (
            settings.siteName || "MegaStore"
          )}
        </Link>

        {/* Prominent Long Search Bar */}
        <div className="flex-1 max-w-2xl mx-2 lg:mx-6 relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-border/80 bg-secondary/40 py-2.5 pl-11 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner"
            />

            {loadingSuggestions ? (
              <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            ) : searchQuery.trim() !== "" ? (
              <button
                type="button"
                onClick={() => { setSearchQuery(""); setSuggestions([]); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </form>

          {/* Floating Autocomplete Suggestions Overlay */}
          {searchQuery.trim() !== "" && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-card border border-border/80 rounded-2xl p-2 shadow-2xl max-h-80 overflow-y-auto z-50">
              {suggestions.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  {loadingSuggestions ? "Searching products..." : "No matching products found."}
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Search Suggestions
                  </div>
                  {suggestions.map((item) => (
                    <button
                      key={item._id || item.id}
                      onClick={() => handleSelectSuggestion(item._id || item.id)}
                      className="w-full p-2.5 flex items-center gap-3 hover:bg-secondary/60 rounded-xl transition-colors text-left group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-secondary/80 border border-border/50 overflow-hidden shrink-0">
                        {item.images && item.images[0] ? (
                          <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <Search className="h-4 w-4 text-muted-foreground m-auto mt-3" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">₹{item.price?.toFixed(2)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions (Wishlist, Profile, Cart) */}
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <Link to="/categories" className="text-xs uppercase" >
            Categories
          </Link>
          {/* Wishlist Link */}
          <Link to="/wishlist">
            <Button variant="ghost" size="icon" className="relative" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground"
                >
                  {wishlistItems.length}
                </motion.span>
              )}
            </Button>
          </Link>

          {/* User Profile */}
          <Link to={user ? "/profile" : "/login"}>
            <Button variant="ghost" size="icon" aria-label="Account">
              {user ? (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                  {user.firstName ? user.firstName[0] : 'U'}
                </div>
              ) : (
                <User className="h-5 w-5" />
              )}
            </Button>
          </Link>

          {/* Cart Drawer Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCart}
            className="relative"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
              >
                {totalItems > 99 ? "99+" : totalItems}
              </motion.span>
            )}
          </Button>
        </div>
      </nav>
    </header>
  );
}
