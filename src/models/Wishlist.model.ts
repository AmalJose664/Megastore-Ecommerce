import mongoose, { Schema } from 'mongoose';
import { IWishlist } from '../types';

const wishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    products: {
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

wishlistSchema.index({ user: 1 });

export const Wishlist = mongoose.model<IWishlist>('Wishlist', wishlistSchema);