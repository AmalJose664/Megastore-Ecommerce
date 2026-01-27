import { Router } from 'express';
import { cartController } from '../controllers';
import { authenticate } from '../middlewares/auth.middleware';
import { validateMongoId } from '../middlewares/validation.middleware';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/items', cartController.addToCart);
router.put('/items/:productId', validateMongoId('productId'), cartController.updateCartItem);
router.delete('/items/:productId', validateMongoId('productId'), cartController.removeFromCart);
router.delete('/', cartController.clearCart);

export default router;