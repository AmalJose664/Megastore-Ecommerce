import mongoose, { Schema } from 'mongoose';
import { IBanner } from '../types';

const bannerSchema = new Schema<IBanner>(
  {
    title: {
      type: String,
      required: [true, 'Banner title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [200, 'Subtitle cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    image: {
      type: String,
      required: [true, 'Banner image is required'],
    },
    mobileImage: {
      type: String,
    },
    buttonText: {
      type: String,
      trim: true,
      maxlength: [50, 'Button text cannot exceed 50 characters'],
    },
    buttonLink: {
      type: String,
      trim: true,
    },
    position: {
      type: String,
      required: true,
      default: 'hero',
      enum: ['hero', 'secondary', 'footer'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
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

bannerSchema.index({ isActive: 1, position: 1, displayOrder: 1 });
bannerSchema.index({ startDate: 1, endDate: 1 });

export const Banner = mongoose.model<IBanner>('Banner', bannerSchema);