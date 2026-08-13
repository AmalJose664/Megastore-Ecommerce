import mongoose, { Schema } from 'mongoose';
import { IBannerSection, BannerSize } from '../types';

const bannerSlideSchema = new Schema(
  {
    imageUrl: {
      type: String,
      required: [true, 'Slide image URL is required'],
      trim: true,
    },
    imageTitle: {
      type: String,
      trim: true,
      default: '',
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    subtitle: {
      type: String,
      trim: true,
      default: '',
    },
    buttonText: {
      type: String,
      trim: true,
      default: '',
    },
    navigateLink: {
      type: String,
      trim: true,
      default: '',
    },
    priority: {
      type: Number,
      default: 1,
    },
    badge: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

const bannerSectionSchema = new Schema<IBannerSection>(
  {
    title: {
      type: String,
      required: [true, 'Banner section title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    subtitle: {
      type: String,
      trim: true,
      default: '',
    },
    size: {
      type: String,
      enum: Object.values(BannerSize),
      default: BannerSize.MD,
    },
    displayOrder: {
      type: Number,
      default: 1,
      min: 1,
      max: 3,
    },
    autoScrollInterval: {
      type: Number,
      default: 4000,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    slides: [bannerSlideSchema],
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

bannerSectionSchema.index({ isActive: 1, displayOrder: 1 });

export const BannerSection = mongoose.model<IBannerSection>('BannerSection', bannerSectionSchema);
