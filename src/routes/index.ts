import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import reviewRoutes from './review.routes';
import testimonialRoutes from './testimonial.routes';
import heroRoutes from './hero.routes';
import promoRoutes from './promo.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/hero', heroRoutes);
router.use('/promo', promoRoutes);

export default router;