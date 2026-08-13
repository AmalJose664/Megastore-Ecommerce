import mongoose, { Schema } from 'mongoose';
import { ISetting } from '../types';

const settingSchema = new Schema<ISetting>(
  {
    siteName: {
      type: String,
      required: [true, 'Site name is required'],
      trim: true,
      default: 'MegaStore',
    },
    siteDescription: {
      type: String,
      trim: true,
      default: 'Your one-stop destination for modern e-commerce shopping.',
    },
    contactEmail: {
      type: String,
      trim: true,
      default: 'support@megastore.com',
    },
    contactPhone: {
      type: String,
      trim: true,
      default: '+1 (800) 123-4567',
    },
    address: {
      type: String,
      trim: true,
      default: '123 E-Commerce Way, Tech City, TC 10001',
    },
    currencySymbol: {
      type: String,
      trim: true,
      default: '₹',
    },
    logoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    socialLinks: {
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
    metaTitle: {
      type: String,
      trim: true,
      default: 'MegaStore - Modern E-Commerce Platform',
    },
    metaKeywords: {
      type: String,
      trim: true,
      default: 'ecommerce, shopping, online store, deals',
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

export const Setting = mongoose.model<ISetting>('Setting', settingSchema);
