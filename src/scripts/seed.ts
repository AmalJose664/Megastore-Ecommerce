import mongoose from 'mongoose';
import config from '../config/env';
import {
  User,
  Category,
  ProductModel as Product,
  Testimonial,
  Banner,
} from '../models';
import { UserRole } from '../types';

const seedData = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Connect to database
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Testimonial.deleteMany({}),
      Banner.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create Admin User
    await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: config.admin.email,
      password: config.admin.password,
      role: UserRole.ADMIN,
      isEmailVerified: true,
      isActive: true,
    });
    console.log('👤 Admin user created');

    // Create Sample User
    await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'user@example.com',
      password: 'User@123456',
      role: UserRole.USER,
      phone: '9876543210',
      isEmailVerified: true,
      isActive: true,
    });
    console.log('👤 Sample user created');

    // Create Categories
    const categories = await Category.create([
      {
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80',
        displayOrder: 1,
      },
      {
        name: 'Fashion',
        description: 'Clothing, shoes, and accessories',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&q=80',
        displayOrder: 2,
      },
      {
        name: 'Home & Living',
        description: 'Furniture and home decor',
        image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=500&q=80',
        displayOrder: 3,
      },
      {
        name: 'Beauty',
        description: 'Cosmetics and personal care',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80',
        displayOrder: 4,
      },
      {
        name: 'Sports',
        description: 'Sports equipment and activewear',
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&q=80',
        displayOrder: 5,
      },
    ]);
    console.log('📁 Categories created');

    // Create Products
    const products = await Product.create([
      // Electronics
      {
        name: 'Wireless Bluetooth Headphones',
        description: 'Premium noise-cancelling wireless headphones with 30-hour battery life',
        price: 2999,
        originalPrice: 4999,
        category: categories[0]._id,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&q=80',
        ],
        sku: 'ELEC-WH-001',
        stock: 50,
        rating: 4.5,
        reviewCount: 128,
        featured: true,
        isNew: true,
        tags: ['headphones', 'wireless', 'bluetooth', 'audio'],
      },
      {
        name: 'Smart Watch Pro',
        description: 'Advanced fitness tracking with heart rate monitor and GPS',
        price: 5499,
        originalPrice: 7999,
        category: categories[0]._id,
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
        ],
        sku: 'ELEC-SW-002',
        stock: 30,
        rating: 4.7,
        reviewCount: 95,
        featured: true,
        tags: ['smartwatch', 'fitness', 'wearable'],
      },
      // Fashion
      {
        name: 'Classic Denim Jacket',
        description: 'Timeless denim jacket with premium quality fabric',
        price: 1899,
        originalPrice: 2999,
        category: categories[1]._id,
        images: [
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80',
        ],
        sku: 'FASH-DJ-003',
        stock: 75,
        rating: 4.3,
        reviewCount: 67,
        tags: ['jacket', 'denim', 'casual'],
      },
      {
        name: 'Premium Leather Handbag',
        description: 'Elegant leather handbag with multiple compartments',
        price: 3499,
        category: categories[1]._id,
        images: [
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&q=80',
        ],
        sku: 'FASH-HB-004',
        stock: 25,
        rating: 4.8,
        reviewCount: 142,
        featured: true,
        isNew: true,
        tags: ['handbag', 'leather', 'accessories'],
      },
      // Home & Living
      {
        name: 'Modern Table Lamp',
        description: 'Contemporary design table lamp with adjustable brightness',
        price: 1299,
        category: categories[2]._id,
        images: [
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80',
        ],
        sku: 'HOME-TL-005',
        stock: 40,
        rating: 4.4,
        reviewCount: 53,
        tags: ['lamp', 'lighting', 'decor'],
      },
      {
        name: 'Decorative Wall Art Set',
        description: 'Set of 3 abstract canvas wall art pieces',
        price: 2499,
        originalPrice: 3999,
        category: categories[2]._id,
        images: [
          'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=500&q=80',
        ],
        sku: 'HOME-WA-006',
        stock: 20,
        rating: 4.6,
        reviewCount: 89,
        isNew: true,
        tags: ['wall art', 'decor', 'canvas'],
      },
      // Beauty
      {
        name: 'Organic Skincare Set',
        description: 'Complete skincare routine with natural ingredients',
        price: 1799,
        category: categories[3]._id,
        images: [
          'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=500&q=80',
        ],
        sku: 'BEAUTY-SS-007',
        stock: 60,
        rating: 4.7,
        reviewCount: 156,
        featured: true,
        tags: ['skincare', 'organic', 'beauty'],
      },
      // Sports
      {
        name: 'Yoga Mat Premium',
        description: 'Non-slip eco-friendly yoga mat with carrying strap',
        price: 899,
        category: categories[4]._id,
        images: [
          'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&q=80',
        ],
        sku: 'SPORT-YM-008',
        stock: 100,
        rating: 4.5,
        reviewCount: 234,
        tags: ['yoga', 'fitness', 'exercise'],
      },
      {
        name: 'Running Shoes Pro',
        description: 'Lightweight running shoes with superior cushioning',
        price: 3999,
        originalPrice: 5499,
        category: categories[4]._id,
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
        ],
        sku: 'SPORT-RS-009',
        stock: 45,
        rating: 4.8,
        reviewCount: 312,
        featured: true,
        isNew: true,
        tags: ['shoes', 'running', 'sports'],
      },
    ]);
    console.log('📦 Products created');

    // Create Testimonials
    const testimonials = await Testimonial.create([
      {
        name: 'Sarah Johnson',
        role: 'Interior Designer',
        content:
          'The quality of products is exceptional. Every item I\'ve purchased has exceeded my expectations. The attention to detail is remarkable.',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
        isApproved: true,
        displayOrder: 1,
      },
      {
        name: 'Michael Chen',
        role: 'Tech Entrepreneur',
        content:
          'This has become my go-to for premium lifestyle products. The customer service is outstanding and shipping is always fast.',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
        isApproved: true,
        displayOrder: 2,
      },
      {
        name: 'Emily Rodriguez',
        role: 'Fashion Blogger',
        content:
          'I love how they curate their collections. Every product tells a story and fits perfectly into my lifestyle. Highly recommended!',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
        isApproved: true,
        displayOrder: 3,
      },
    ]);
    console.log('💬 Testimonials created');

    // Create Banners
    const banners = await Banner.create([
      {
        title: 'Summer Sale',
        subtitle: 'Up to 50% Off',
        description: 'Shop the best deals of the season',
        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80',
        buttonText: 'Shop Now',
        buttonLink: '/products',
        position: 'hero',
        isActive: true,
        displayOrder: 1,
      },
      {
        title: 'New Arrivals',
        subtitle: 'Fresh Collection',
        description: 'Discover the latest trends',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
        buttonText: 'Explore',
        buttonLink: '/products?isNew=true',
        position: 'secondary',
        isActive: true,
        displayOrder: 2,
      },
    ]);
    console.log('🎨 Banners created');

    console.log(`
╔════════════════════════════════════════════╗
║   ✅ Database Seeded Successfully!         ║
╠════════════════════════════════════════════╣
║   Users: ${String(2).padEnd(35)} ║
║   Categories: ${String(categories.length).padEnd(30)} ║
║   Products: ${String(products.length).padEnd(32)} ║
║   Testimonials: ${String(testimonials.length).padEnd(28)} ║
║   Banners: ${String(banners.length).padEnd(33)} ║
╠════════════════════════════════════════════╣
║   Admin Credentials:                       ║
║   Email: ${config.admin.email.padEnd(33)} ║
║   Password: ${config.admin.password.padEnd(28)} ║
╠════════════════════════════════════════════╣
║   User Credentials:                        ║
║   Email: user@example.com                  ║
║   Password: User@123456                    ║
╚════════════════════════════════════════════╝
    `);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedData();