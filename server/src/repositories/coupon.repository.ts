import { BaseRepository } from './base.repository';
import { Coupon } from '../models/Coupon.model';
import { ICoupon } from '../types';

export class CouponRepository extends BaseRepository<ICoupon> {
    constructor() {
        super(Coupon);
    }

    async findByCode(code: string): Promise<ICoupon | null> {
        return this.model.findOne({ code: code.toUpperCase() });
    }

    async findActiveByCode(code: string): Promise<ICoupon | null> {
        const now = new Date();
        return this.model.findOne({
            code: code.toUpperCase(),
            isActive: true,
            validFrom: { $lte: now },
            validUntil: { $gte: now },
        });
    }

    async incrementUsedCount(id: string, userId?: string): Promise<void> {
        const update: any = { $inc: { usedCount: 1 } };
        if (userId) {
            update.$push = { usedBy: userId };
        }
        await this.model.findByIdAndUpdate(id, update);
    }
}

export const couponRepository = new CouponRepository();
