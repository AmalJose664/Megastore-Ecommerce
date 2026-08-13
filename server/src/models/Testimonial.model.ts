import mongoose, { Schema } from 'mongoose';
import { ITestimonial } from '../types';

const testimonialSchema = new Schema<ITestimonial>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
      maxlength: [100, 'Role cannot exceed 100 characters'],
    },
    content: {
      type: String,
      required: [true, 'Testimonial content is required'],
      trim: true,
      maxlength: [1000, 'Content cannot exceed 1000 characters'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      default: 5,
    },
    avatar: {
      type: String,
      required: [true, 'Avatar is required'],
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
       transform: (_doc, ret: any) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

testimonialSchema.index({ isApproved: 1, displayOrder: 1 });

export const Testimonial = mongoose.model<ITestimonial>(
  'Testimonial',
  testimonialSchema
);