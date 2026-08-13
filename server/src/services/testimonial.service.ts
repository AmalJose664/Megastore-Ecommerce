import { testimonialRepository } from '../repositories/testimonial.repository';
import { ITestimonial } from '../types';
import { ApiError } from '../utils/ApiError';

export class TestimonialService {
    async getApprovedTestimonials(limit?: number): Promise<ITestimonial[]> {
        return testimonialRepository.findApproved(limit);
    }

    async getAllTestimonials(_pagination?: any): Promise<ITestimonial[]> {
        // Simple findAll for now, pagination could be added
        return testimonialRepository.findMany({}, { sort: { createdAt: -1 } });
    }

    async createTestimonial(data: Partial<ITestimonial>): Promise<ITestimonial> {
        return testimonialRepository.create(data);
    }

    async updateTestimonial(id: string, data: Partial<ITestimonial>): Promise<ITestimonial> {
        const testimonial = await testimonialRepository.updateById(id, data);
        if (!testimonial) {
            throw ApiError.notFound('Testimonial not found');
        }
        return testimonial;
    }

    async deleteTestimonial(id: string): Promise<void> {
        const deleted = await testimonialRepository.deleteById(id);
        if (!deleted) {
            throw ApiError.notFound('Testimonial not found');
        }
    }
}

export const testimonialService = new TestimonialService();
