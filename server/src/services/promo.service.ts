import { promoRepository } from '../repositories/promo.repository';
import { IPromo } from '../types';
import { ApiError } from '../utils/ApiError';

export class PromoService {
    private static lastActivationTime = 0;

    async getPromoSection() {
        const promo = await promoRepository.findActive();
        return {
            promo,
            version: "2.0.0-FIXED",
            db_check: "FORCE_DATABASE_FETCH"
        };
    }

    async createPromo(data: Partial<IPromo>): Promise<IPromo> {
        console.log('[PromoService] Creating promo', data);
        // Default to false if not specified
        if (data.isActive === undefined) data.isActive = false;

        // If creating an active promo, deactivate all others
        if (data.isActive === true) {
            console.log('[PromoService] New promo is active, deactivating others');
            await promoRepository.updateMany(
                {},
                { $set: { isActive: false } }
            );
        }
        return promoRepository.create(data);
    }

    async updatePromo(id: string, data: Partial<IPromo>): Promise<IPromo> {
        // Handle both boolean true and string "true"
        const isActivating = data.isActive === true || String(data.isActive) === 'true';

        if (isActivating) {
            // Force EVERY other promo to be inactive
            await promoRepository.updateMany({}, { $set: { isActive: false } });
            data.isActive = true;
        }

        const promo = await promoRepository.updateById(id, data);
        if (!promo) throw ApiError.notFound('Promo section not found');
        return promo;
    }

    async activatePromo(id: string): Promise<IPromo> {
        const cleanId = id.trim();
        const now = Date.now();

        // THROTTLE CHECK: Prevent ghost dashboard from double-activating
        if (now - PromoService.lastActivationTime < 3000) {
            console.error(`[PromoService] REJECTED: Rapid activation detected for ${cleanId}. Ghost request blocked.`);
            throw ApiError.badRequest('Ignoring rapid activation request (Ghost blocking active)');
        }

        PromoService.lastActivationTime = now;

        console.log(`[PromoService] --- ACTIVATION START for ID: ${cleanId} ---`);

        // 1. Force Reset: Deactivate EVERY promo in the collection regardless of ID
        await promoRepository.updateMany({}, { $set: { isActive: false } });

        // 2. Target activation: Set ONLY the requested ID to active
        const promo = await promoRepository.updateById(cleanId, { isActive: true });
        if (!promo) throw ApiError.notFound('Promo section not found');

        return promo;
    }

    async deactivatePromo(id: string): Promise<IPromo> {
        const promo = await promoRepository.updateById(id, { isActive: false });
        if (!promo) throw ApiError.notFound('Promo section not found');
        return promo;
    }

    async deletePromo(id: string): Promise<void> {
        const deleted = await promoRepository.deleteById(id);
        if (!deleted) throw ApiError.notFound('Promo section not found');
    }

    async getAllPromos(): Promise<IPromo[]> {
        return promoRepository.findMany({}, { sort: { updatedAt: -1 } });
    }
}

export const promoService = new PromoService();
