export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  images: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  featured?: boolean;
  isNew?: boolean;
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

export const categories: Category[] = [
  {
    id: "electronics",
    name: "Electronics",
    description: "Latest tech gadgets and devices",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80",
    productCount: 124,
  },
  {
    id: "fashion",
    name: "Fashion",
    description: "Curated styles for every occasion",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80",
    productCount: 89,
  },
  {
    id: "home",
    name: "Home & Living",
    description: "Transform your living space",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80",
    productCount: 156,
  },
  {
    id: "beauty",
    name: "Beauty",
    description: "Premium skincare and cosmetics",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
    productCount: 67,
  },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    description: "Experience crystal-clear audio with our premium wireless headphones. Featuring active noise cancellation, 30-hour battery life, and ultra-comfortable ear cushions for all-day listening.",
    price: 299.99,
    originalPrice: 349.99,
    category: "electronics",
    subcategory: "audio",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80",
    ],
    rating: 4.8,
    reviewCount: 342,
    inStock: true,
    featured: true,
    isNew: true,
    tags: ["wireless", "noise-cancelling", "premium"],
  },
  {
    id: "2",
    name: "Minimalist Leather Watch",
    description: "Timeless elegance meets modern design. This minimalist watch features a genuine leather strap and Swiss movement for precision timekeeping.",
    price: 189.99,
    category: "fashion",
    subcategory: "accessories",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
    ],
    rating: 4.6,
    reviewCount: 128,
    inStock: true,
    featured: true,
    tags: ["leather", "minimalist", "swiss"],
  },
  {
    id: "3",
    name: "Organic Cotton Throw Blanket",
    description: "Wrap yourself in luxury with our organic cotton throw blanket. Perfect for cozy evenings and sustainable living.",
    price: 79.99,
    originalPrice: 99.99,
    category: "home",
    subcategory: "textiles",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
    ],
    rating: 4.9,
    reviewCount: 89,
    inStock: true,
    featured: true,
    tags: ["organic", "sustainable", "cozy"],
  },
  {
    id: "4",
    name: "Vitamin C Serum",
    description: "Brighten and revitalize your skin with our powerful Vitamin C serum. Formulated with 20% pure vitamin C for visible results.",
    price: 45.99,
    category: "beauty",
    subcategory: "skincare",
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80",
    ],
    rating: 4.7,
    reviewCount: 256,
    inStock: true,
    featured: true,
    isNew: true,
    tags: ["skincare", "vitamin-c", "brightening"],
  },
  {
    id: "5",
    name: "Smart Home Speaker",
    description: "Transform your home with voice-controlled convenience. Premium sound quality meets intelligent home automation.",
    price: 149.99,
    category: "electronics",
    subcategory: "smart-home",
    images: [
      "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=600&q=80",
    ],
    rating: 4.5,
    reviewCount: 567,
    inStock: true,
    tags: ["smart-home", "voice-control", "speaker"],
  },
  {
    id: "6",
    name: "Linen Blend Blazer",
    description: "Effortlessly elegant blazer crafted from premium linen blend. Perfect for both formal and casual occasions.",
    price: 225.00,
    originalPrice: 275.00,
    category: "fashion",
    subcategory: "clothing",
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80",
    ],
    rating: 4.4,
    reviewCount: 78,
    inStock: true,
    tags: ["linen", "formal", "casual"],
  },
  {
    id: "7",
    name: "Ceramic Vase Set",
    description: "Handcrafted ceramic vases in contemporary design. Set of 3 pieces to elevate any room's aesthetic.",
    price: 89.99,
    category: "home",
    subcategory: "decor",
    images: [
      "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600&q=80",
    ],
    rating: 4.8,
    reviewCount: 45,
    inStock: true,
    isNew: true,
    tags: ["handcrafted", "ceramic", "decor"],
  },
  {
    id: "8",
    name: "Retinol Night Cream",
    description: "Advanced anti-aging formula with encapsulated retinol. Wake up to smoother, more youthful-looking skin.",
    price: 68.00,
    category: "beauty",
    subcategory: "skincare",
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80",
    ],
    rating: 4.6,
    reviewCount: 189,
    inStock: true,
    tags: ["retinol", "anti-aging", "night-cream"],
  },
  {
    id: "9",
    name: "Mechanical Keyboard",
    description: "Premium mechanical keyboard with customizable RGB lighting and hot-swappable switches for the perfect typing experience.",
    price: 159.99,
    category: "electronics",
    subcategory: "accessories",
    images: [
      "https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&q=80",
    ],
    rating: 4.9,
    reviewCount: 423,
    inStock: true,
    featured: true,
    tags: ["mechanical", "rgb", "gaming"],
  },
  {
    id: "10",
    name: "Cashmere Scarf",
    description: "Luxuriously soft 100% cashmere scarf. Timeless elegance for the colder months.",
    price: 175.00,
    category: "fashion",
    subcategory: "accessories",
    images: [
      "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&q=80",
    ],
    rating: 4.7,
    reviewCount: 92,
    inStock: true,
    tags: ["cashmere", "luxury", "winter"],
  },
  {
    id: "11",
    name: "Aromatherapy Candle Set",
    description: "Hand-poured soy candles with essential oils. Set of 4 calming scents for relaxation and ambiance.",
    price: 54.99,
    category: "home",
    subcategory: "wellness",
    images: [
      "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=600&q=80",
    ],
    rating: 4.8,
    reviewCount: 167,
    inStock: true,
    tags: ["aromatherapy", "soy", "relaxation"],
  },
  {
    id: "12",
    name: "Hydrating Face Mask",
    description: "Intensive hydration treatment with hyaluronic acid. Plump and nourish dry skin instantly.",
    price: 32.00,
    originalPrice: 40.00,
    category: "beauty",
    subcategory: "skincare",
    images: [
      "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80",
    ],
    rating: 4.5,
    reviewCount: 234,
    inStock: true,
    tags: ["hydrating", "face-mask", "hyaluronic"],
  },
];

export const getFeaturedProducts = () => products.filter((p) => p.featured);

export const getNewProducts = () => products.filter((p) => p.isNew);

export const getProductsByCategory = (categoryId: string) =>
  products.filter((p) => p.category === categoryId);

export const getProductById = (id: string) => products.find((p) => p.id === id);

export const searchProducts = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery) ||
      p.tags?.some((tag) => tag.includes(lowercaseQuery))
  );
};
