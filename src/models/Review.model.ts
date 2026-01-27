import mongoose, { Schema } from 'mongoose';
import { IReview } from '../types';

const reviewSchema = new Schema<IReview>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: {
      type: String,
      required: [true, 'Review title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    images: {
      type: [String],
      default: [],
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
      min: [0, 'Helpful count cannot be negative'],
    },
    notHelpful: {
      type: Number,
      default: 0,
      min: [0, 'Not helpful count cannot be negative'],
    },
    isApproved: {
      type: Boolean,
      default: false,
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

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, isApproved: 1 });
reviewSchema.index({ user: 1 });

export const Review = mongoose.model<IReview>('Review', reviewSchema);