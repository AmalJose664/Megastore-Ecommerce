import mongoose, { Schema } from 'mongoose';
import { IPromo } from '../types';

const promoSchema = new Schema<IPromo>(
    {
        tag: {
            type: String,
            default: 'Limited Time Offer',
            trim: true,
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
        },
        code: {
            type: String,
            default: 'WELCOME20',
            trim: true,
        },
        terms: {
            type: String,
            default: 'Valid for new customers only',
            trim: true,
        },
        link: {
            type: String,
            default: '/products',
            trim: true,
        },
        image: {
            type: String,
            required: [true, 'Image URL is required'],
        },
        isActive: {
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

export const Promo = mongoose.model<IPromo>('Promo', promoSchema);
