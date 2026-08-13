import { BaseRepository } from './base.repository';
import { Banner } from '../models';
import { IBanner } from '../types';

export class BannerRepository extends BaseRepository<IBanner> {
    constructor() {
        super(Banner);
    }

    async findByPosition(position: string): Promise<IBanner[]> {
        return this.model
            .find({ position, isActive: true })
            .sort({ displayOrder: 1, createdAt: -1 })
            .exec();
    }

    async findOneByPosition(position: string): Promise<IBanner | null> {
        return this.model
            .findOne({ position, isActive: true })
            .sort({ displayOrder: 1, createdAt: -1 })
            .exec();
    }
}

export const bannerRepository = new BannerRepository();
