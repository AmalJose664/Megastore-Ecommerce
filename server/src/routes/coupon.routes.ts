import { Router } from 'express';
import { couponController } from '../controllers/coupon.controller';
import { authenticate, authorize, optionalAuth } from '../middlewares/auth.middleware';
import { validateMongoId } from '../middlewares/validation.middleware';
import { UserRole } from '../types';

const router = Router();

// Public/User routes
router.get('/', optionalAuth, (req, res, next) => {
    if (req.user?.role === UserRole.ADMIN) {
        return couponController.getAllCoupons(req, res, next);
    }
    return couponController.getListedCoupons(req, res, next);
});
router.post('/validate', authenticate, couponController.validateCoupon);

// Admin routes: Manage coupons
router.use(authenticate, authorize(UserRole.ADMIN));

router.get('/all', couponController.getAllCoupons);
router.get('/:id', validateMongoId('id'), couponController.getCouponById);
router.post('/', couponController.createCoupon);
router.put('/:id', validateMongoId('id'), couponController.updateCoupon);
router.delete('/:id', validateMongoId('id'), couponController.deleteCoupon);

export default router;
