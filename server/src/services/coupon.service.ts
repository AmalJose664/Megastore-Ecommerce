import { couponRepository } from '../repositories/coupon.repository';
import { ICoupon, DiscountType } from '../types';
import { ApiError } from '../utils/ApiError';

export class CouponService {
    async getAllCoupons(): Promise<ICoupon[]> {
        return couponRepository.findMany({}, { sort: { createdAt: -1 } });
    }

    async getListedCoupons(userId?: string): Promise<ICoupon[]> {
        const now = new Date();
        const query: any = {
            isListed: true,
            isActive: true,
            validFrom: { $lte: now },
            validUntil: { $gte: now }
        };

        // If user is logged in, filter out coupons they've already used (if not reusable)
        if (userId) {
            query.$or = [
                { isReusable: true },
                { isReusable: false, usedBy: { $ne: userId } }
            ];
        }

        return couponRepository.findMany(query, { sort: { createdAt: -1 } });
    }

    async getCouponById(id: string): Promise<ICoupon> {
        const coupon = await couponRepository.findById(id);
        if (!coupon) throw ApiError.notFound('Coupon not found');
        return coupon;
    }

    async createCoupon(data: Partial<ICoupon>): Promise<ICoupon> {
        const existing = await couponRepository.findByCode(data.code!);
        if (existing) throw ApiError.conflict('Coupon code already exists');
        return couponRepository.create(data);
    }

    async updateCoupon(id: string, data: Partial<ICoupon>): Promise<ICoupon> {
        const updated = await couponRepository.updateById(id, data);
        if (!updated) throw ApiError.notFound('Coupon not found');
        return updated;
    }

    async deleteCoupon(id: string): Promise<void> {
        const deleted = await couponRepository.deleteById(id);
        if (!deleted) throw ApiError.notFound('Coupon not found');
    }

    async validateCoupon(code: string, cartTotal: number, userId?: string): Promise<ICoupon> {
        const coupon = await couponRepository.findActiveByCode(code);

        if (!coupon || !coupon.isActive) {
            throw ApiError.badRequest('Invalid or expired coupon code');
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            throw ApiError.badRequest('Coupon usage limit reached');
        }

        if (coupon.minPurchaseAmount && cartTotal < coupon.minPurchaseAmount) {
            throw ApiError.badRequest(`Minimum purchase of ${coupon.minPurchaseAmount} required for this coupon`);
        }

        // Check if coupon and user-specific reuse logic
        if (!coupon.isReusable && userId) {
            const hasUsed = coupon.usedBy.some(id => id.toString() === userId);
            if (hasUsed) {
                throw ApiError.badRequest('You have already used this coupon');
            }
        }

        return coupon;
    }

    async applyCoupon(code: string, userId: string): Promise<void> {
        const coupon = await couponRepository.findByCode(code);
        if (!coupon) return;

        await couponRepository.incrementUsedCount(coupon._id.toString(), userId);
    }

    calculateDiscount(coupon: ICoupon, cartTotal: number): number {
        let discount = 0;

        if (coupon.discountType === DiscountType.PERCENTAGE) {
            discount = (cartTotal * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
                discount = coupon.maxDiscountAmount;
            }
        } else {
            discount = coupon.discountValue;
        }

        return Math.min(discount, cartTotal);
    }
}

export const couponService = new CouponService();
