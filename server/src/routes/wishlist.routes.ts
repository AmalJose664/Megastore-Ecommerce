import { Router } from 'express';
import { wishlistController } from '../controllers/wishlist.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateMongoId } from '../middlewares/validation.middleware';

const router = Router();

// All wishlist routes require authentication
router.use(authenticate);

router.get('/', wishlistController.getWishlist);
router.post('/add', wishlistController.addToWishlist);
router.delete('/remove/:productId', validateMongoId('productId'), wishlistController.removeFromWishlist);
router.post('/toggle', wishlistController.toggleWishlist);
router.get('/check/:productId', validateMongoId('productId'), wishlistController.checkIsInWishlist);

export default router;
