import { BaseRepository } from './base.repository';
import { Testimonial } from '../models';
import { ITestimonial } from '../types';

export class TestimonialRepository extends BaseRepository<ITestimonial> {
    constructor() {
        super(Testimonial);
    }

    async findApproved(limit?: number): Promise<ITestimonial[]> {
        const query = this.model.find({ isApproved: true }).sort({ displayOrder: 1, createdAt: -1 });
        if (limit) {
            query.limit(limit);
        }
        return query.exec();
    }
}

export const testimonialRepository = new TestimonialRepository();
