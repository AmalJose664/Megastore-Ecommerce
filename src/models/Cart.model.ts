import mongoose, { Schema } from 'mongoose';
import { ICart, ICartItem } from '../types';

const cartItemSchema = new Schema<ICartItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
  },
  { _id: false }
);

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    totalItems: {
      type: Number,
      default: 0,
    },
    subtotal: {
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

// Calculate totals before saving
cartSchema.pre('save', function (next) {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.subtotal = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  next();
});

export const Cart = mongoose.model<ICart>('Cart', cartSchema);