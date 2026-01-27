import mongoose, { Schema } from 'mongoose';
import { IPayment, PaymentMethod, PaymentStatus } from '../types';

const paymentSchema = new Schema<IPayment>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      required: true,
      default: 'INR',
      uppercase: true,
    },
    method: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      index: true,
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    gatewayResponse: {
      type: Schema.Types.Mixed,
    },
    failureReason: {
      type: String,
    },
    refundAmount: {
      type: Number,
      min: [0, 'Refund amount cannot be negative'],
    },
    refundedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
  transform: (_doc, ret: any) => {
        delete ret.__v;
        delete ret.gatewayResponse;
        return ret;
      },
    },
  }
);

paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);