import { BaseRepository } from './base.repository';
import { BannerSection } from '../models';
import { IBannerSection } from '../types';

export class BannerSectionRepository extends BaseRepository<IBannerSection> {
  constructor() {
    super(BannerSection);
  }

  async findActiveSections(): Promise<IBannerSection[]> {
    return this.model
      .find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(3)
      .exec();
  }

  async countActiveSections(excludeId?: string): Promise<number> {
    const query: any = { isActive: true };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return this.model.countDocuments(query);
  }

  async findAllSorted(): Promise<IBannerSection[]> {
    return this.model.find({}).sort({ displayOrder: 1, createdAt: -1 }).exec();
  }
}

export const bannerSectionRepository = new BannerSectionRepository();
