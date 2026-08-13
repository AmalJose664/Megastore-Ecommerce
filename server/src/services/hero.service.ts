import { heroRepository } from '../repositories/hero.repository';
import { IHero } from '../types';
import { ApiError } from '../utils/ApiError';

export class HeroService {
    private static lastActivationTime = 0;

    async getHeroSection() {
        return heroRepository.findActive();
    }

    async createHero(data: Partial<IHero>): Promise<IHero> {
        console.log('[HeroService] Creating hero', data);
        // Default to false if not specified
        if (data.isActive === undefined) data.isActive = false;

        // If creating an active hero, deactivate all others
        if (data.isActive === true) {
            console.log('[HeroService] New hero is active, deactivating others');
            await heroRepository.updateMany(
                {},
                { $set: { isActive: false } }
            );
        }
        return heroRepository.create(data);
    }

    async updateHero(id: string, data: Partial<IHero>): Promise<IHero> {
        // Handle both boolean true and string "true"
        const isActivating = data.isActive === true || String(data.isActive) === 'true';

        if (isActivating) {
            // Force EVERY other hero to be inactive
            await heroRepository.updateMany({}, { $set: { isActive: false } });
            data.isActive = true;
        }

        const hero = await heroRepository.updateById(id, data);
        if (!hero) throw ApiError.notFound('Hero section not found');
        return hero;
    }

    async activateHero(id: string): Promise<IHero> {
        const cleanId = id.trim();
        const now = Date.now();

        // THROTTLE CHECK: Prevent ghost dashboard from double-activating
        if (now - HeroService.lastActivationTime < 3000) {
            console.error(`[HeroService] REJECTED: Rapid activation detected for ${cleanId}. Ghost request blocked.`);
            throw ApiError.badRequest('Ignoring rapid activation request (Ghost blocking active)');
        }

        HeroService.lastActivationTime = now;

        console.log(`[HeroService] --- ACTIVATION START for ID: ${cleanId} ---`);

        // 1. Force Reset: Deactivate EVERY hero in the collection
        await heroRepository.updateMany({}, { $set: { isActive: false } });

        // 2. Target activation: Set ONLY the requested ID to active
        const hero = await heroRepository.updateById(cleanId, { isActive: true });
        if (!hero) throw ApiError.notFound('Hero section not found');

        return hero;
    }

    async deactivateHero(id: string): Promise<IHero> {
        const hero = await heroRepository.updateById(id, { isActive: false });
        if (!hero) throw ApiError.notFound('Hero section not found');
        return hero;
    }

    async deleteHero(id: string): Promise<void> {
        const deleted = await heroRepository.deleteById(id);
        if (!deleted) throw ApiError.notFound('Hero section not found');
    }

    async getAllHeroes(): Promise<IHero[]> {
        return heroRepository.findMany({}, { sort: { updatedAt: -1 } });
    }
}

export const heroService = new HeroService();
