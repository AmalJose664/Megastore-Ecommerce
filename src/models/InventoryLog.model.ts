import mongoose, { Schema } from 'mongoose';
import { IInventoryLog } from '../types';

const inventoryLogSchema = new Schema<IInventoryLog>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['addition', 'reduction', 'adjustment'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    reference: {
      type: String,
      trim: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

inventoryLogSchema.index({ product: 1, createdAt: -1 });
inventoryLogSchema.index({ performedBy: 1 });

export const InventoryLog = mongoose.model<IInventoryLog>(
  'InventoryLog',
  inventoryLogSchema
);