import { bannerRepository } from '../repositories/banner.repository';
import { IBanner } from '../types';
import { ApiError } from '../utils/ApiError';

export class BannerService {


    // Admin Services
    async getAllBanners(): Promise<IBanner[]> {
        return bannerRepository.findMany({}, { sort: { position: 1, displayOrder: 1 } });
    }

    async createBanner(data: Partial<IBanner>): Promise<IBanner> {
        return bannerRepository.create(data);
    }

    async updateBanner(id: string, data: Partial<IBanner>): Promise<IBanner> {
        const banner = await bannerRepository.updateById(id, data);
        if (!banner) {
            throw ApiError.notFound('Banner not found');
        }
        return banner;
    }

    async deleteBanner(id: string): Promise<void> {
        const deleted = await bannerRepository.deleteById(id);
        if (!deleted) {
            throw ApiError.notFound('Banner not found');
        }
    }
}

export const bannerService = new BannerService();
