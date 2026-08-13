import mongoose, { Schema } from 'mongoose';
import { IHero } from '../types';

const heroSchema = new Schema<IHero>(
    {
        badge: {
            type: String,
            default: 'New Collection 2024',
            trim: true,
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        subtitle: {
            type: String,
            required: [true, 'Subtitle is required'],
            trim: true,
        },
        ctaText: {
            type: String,
            default: 'Shop Now',
            trim: true,
        },
        ctaLink: {
            type: String,
            default: '/products',
            trim: true,
        },
        secondaryCtaText: {
            type: String,
            default: 'Explore Categories',
            trim: true,
        },
        secondaryCtaLink: {
            type: String,
            default: '/categories',
            trim: true,
        },
        image: {
            type: String,
            required: [true, 'Image URL is required'],
        },
        stats: [
            {
                value: { type: String, required: true },
                label: { type: String, required: true },
            },
        ],
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

export const Hero = mongoose.model<IHero>('Hero', heroSchema);
