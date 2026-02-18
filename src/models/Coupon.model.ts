import mongoose, { Schema } from 'mongoose';
import { ICoupon, DiscountType } from '../types';

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [50, 'Coupon code cannot exceed 50 characters'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Coupon description is required'],
      trim: true,
    },
    discountType: {
      type: String,
      enum: Object.values(DiscountType),
      required: true,
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
    },
    minPurchaseAmount: {
      type: Number,
      min: [0, 'Minimum purchase amount cannot be negative'],
    },
    maxDiscountAmount: {
      type: Number,
      min: [0, 'Maximum discount amount cannot be negative'],
    },
    usageLimit: {
      type: Number,
      min: [0, 'Usage limit cannot be negative'],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, 'Used count cannot be negative'],
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    applicableCategories: {
      type: [Schema.Types.ObjectId],
      ref: 'Category',
      default: [],
    },
    applicableProducts: {
      type: [Schema.Types.ObjectId],
      ref: 'Product',
      default: [],
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

// Validate dates
couponSchema.pre('save', function (next) {
  if (this.validFrom >= this.validUntil) {
    next(new Error('Valid until date must be after valid from date'));
  }
  next();
});

couponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });

export const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);