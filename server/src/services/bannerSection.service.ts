import { bannerSectionRepository } from '../repositories';
import { IBannerSection, IBannerSlide } from '../types';
import { ApiError } from '../utils/ApiError';

export class BannerSectionService {
  private sortSlides(section: IBannerSection): IBannerSection {
    if (section.slides && section.slides.length > 0) {
      section.slides.sort((a: IBannerSlide, b: IBannerSlide) => (a.priority || 0) - (b.priority || 0));
    }
    return section;
  }

  async getActiveBannerSections(): Promise<IBannerSection[]> {
    const sections = await bannerSectionRepository.findActiveSections();
    return sections.map((sec) => this.sortSlides(sec));
  }

  async getAllBannerSections(): Promise<IBannerSection[]> {
    const sections = await bannerSectionRepository.findAllSorted();
    return sections.map((sec) => this.sortSlides(sec));
  }

  async getBannerSectionById(id: string): Promise<IBannerSection> {
    const section = await bannerSectionRepository.findById(id);
    if (!section) {
      throw ApiError.notFound('Banner section not found');
    }
    return this.sortSlides(section);
  }

  async createBannerSection(data: Partial<IBannerSection>): Promise<IBannerSection> {
    if (data.isActive !== false) {
      const activeCount = await bannerSectionRepository.countActiveSections();
      if (activeCount >= 3) {
        throw ApiError.badRequest('Maximum 3 active banner sections allowed on homepage');
      }
    }

    if (data.slides) {
      data.slides.sort((a, b) => (a.priority || 0) - (b.priority || 0));
    }

    const created = await bannerSectionRepository.create(data);
    return this.sortSlides(created);
  }

  async updateBannerSection(id: string, data: Partial<IBannerSection>): Promise<IBannerSection> {
    const existing = await bannerSectionRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Banner section not found');
    }

    if (data.isActive === true && !existing.isActive) {
      const activeCount = await bannerSectionRepository.countActiveSections(id);
      if (activeCount >= 3) {
        throw ApiError.badRequest('Maximum 3 active banner sections allowed on homepage');
      }
    }

    if (data.slides) {
      data.slides.sort((a, b) => (a.priority || 0) - (b.priority || 0));
    }

    const updated = await bannerSectionRepository.updateById(id, data);
    if (!updated) {
      throw ApiError.notFound('Banner section not found');
    }
    return this.sortSlides(updated);
  }

  async deleteBannerSection(id: string): Promise<void> {
    const deleted = await bannerSectionRepository.deleteById(id);
    if (!deleted) {
      throw ApiError.notFound('Banner section not found');
    }
  }
}

export const bannerSectionService = new BannerSectionService();
