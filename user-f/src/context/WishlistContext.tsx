import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WishlistProduct {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  images: string[];
  thumbnail?: string;
  inStock?: boolean;
  stock?: number;
  rating?: number;
  reviewCount?: number;
  category?: { name: string; slug: string } | string;
}

interface WishlistContextType {
  wishlistItems: WishlistProduct[];
  loading: boolean;
  wishlistIds: Set<string>;
  toggleWishlist: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  fetchWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<WishlistProduct[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      setWishlistIds(new Set());
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success && data.data?.products) {
        const items = data.data.products;
        setWishlistItems(items);
        const ids = new Set<string>(items.map((item: any) => item._id || item.id));
        setWishlistIds(ids);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated, user]);

  const toggleWishlist = async (productId: string): Promise<boolean> => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to save items to your wishlist.',
        variant: 'destructive',
      });
      return false;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/wishlist/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: data.added ? 'Added to Wishlist' : 'Removed from Wishlist',
          description: data.message,
        });
        await fetchWishlist();
        return data.added;
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update wishlist',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
    return false;
  };

  const isInWishlist = (productId: string) => {
    return wishlistIds.has(productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        loading,
        wishlistIds,
        toggleWishlist,
        isInWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
