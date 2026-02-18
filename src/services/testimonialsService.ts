import { apiHandler } from './apiHandler';
import {
    Testimonial,
    TestimonialsResponse,
    CreateTestimonialRequest,
    UpdateTestimonialRequest
} from '@/types';

const API_BASE_URL = 'http://localhost:5000/api';

class TestimonialsService {
    // GET /api/testimonials (List Testimonials - Public)
    async getTestimonials(limit?: number): Promise<Testimonial[] | null> {
        try {
            const query = limit ? `?limit=${limit}` : '';
            const { data, error } = await apiHandler.handleRequest<TestimonialsResponse>(
                `${API_BASE_URL}/testimonials${query}`
            );

            if (error) {
                console.error('Get testimonials error:', error.message);
                return null;
            }

            return data?.data || null;
        } catch (error) {
            console.error('Get testimonials error:', error);
            return null;
        }
    }

    // POST /api/testimonials (Create Testimonial - Admin Only)
    async createTestimonial(testimonialData: CreateTestimonialRequest): Promise<Testimonial | null> {
        try {
            const { data, error } = await apiHandler.handleRequest<{ success: boolean; data: Testimonial }>(
                `${API_BASE_URL}/testimonials`,
                {
                    method: 'POST',
                    body: JSON.stringify(testimonialData),
                }
            );

            if (error) {
                console.error('Create testimonial error:', error.message);
                return null;
            }

            return data?.success ? data.data : null;
        } catch (error) {
            console.error('Create testimonial error:', error);
            return null;
        }
    }

    // PUT /api/testimonials/:id (Update Testimonial - Admin Only)
    async updateTestimonial(id: string, testimonialData: UpdateTestimonialRequest): Promise<Testimonial | null> {
        try {
            const { data, error } = await apiHandler.handleRequest<{ success: boolean; data: Testimonial }>(
                `${API_BASE_URL}/testimonials/${id}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(testimonialData),
                }
            );

            if (error) {
                console.error('Update testimonial error:', error.message);
                return null;
            }

            return data?.success ? data.data : null;
        } catch (error) {
            console.error('Update testimonial error:', error);
            return null;
        }
    }

    // DELETE /api/testimonials/:id (Delete Testimonial - Admin Only)
    async deleteTestimonial(id: string): Promise<boolean> {
        try {
            const { data, error } = await apiHandler.handleRequest<{ success: boolean; message: string }>(
                `${API_BASE_URL}/testimonials/${id}`,
                {
                    method: 'DELETE',
                }
            );

            if (error) {
                console.error('Delete testimonial error:', error.message);
                return false;
            }

            return data?.success || false;
        } catch (error) {
            console.error('Delete testimonial error:', error);
            return false;
        }
    }
}

export const testimonialsService = new TestimonialsService();
