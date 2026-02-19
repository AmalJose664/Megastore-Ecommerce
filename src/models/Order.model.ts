import mongoose, { Schema } from 'mongoose';
import { IOrder, IOrderItem, OrderStatus, PaymentMethod, PaymentStatus } from '../types';

const orderItemSchema = new Schema<IOrderItem>(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'Quantity must be at least 1'],
        },
        price: {
            type: Number,
            required: true,
            min: [0, 'Price cannot be negative'],
        },
        total: {
            type: Number,
            required: true,
            min: [0, 'Total cannot be negative'],
        },
    },
    { _id: false }
);

const orderSchema = new Schema<IOrder>(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: function (v: IOrderItem[]) {
                    return v && v.length > 0;
                },
                message: 'Order must contain at least one item',
            },
        },
        shippingAddress: {
            fullName: { type: String, required: true },
            phone: { type: String, required: true },
            addressLine1: { type: String, required: true },
            addressLine2: { type: String },
            city: { type: String, required: true },
            state: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true, default: 'India' },
        },
        subtotal: {
            type: Number,
            required: true,
            min: [0, 'Subtotal cannot be negative'],
        },
        discount: {
            type: Number,
            default: 0,
            min: [0, 'Discount cannot be negative'],
        },
        shippingFee: {
            type: Number,
            default: 0,
            min: [0, 'Shipping fee cannot be negative'],
        },
        tax: {
            type: Number,
            default: 0,
            min: [0, 'Tax cannot be negative'],
        },
        total: {
            type: Number,
            required: true,
            min: [0, 'Total cannot be negative'],
        },
        status: {
            type: String,
            enum: Object.values(OrderStatus),
            default: OrderStatus.PENDING,
        },
        paymentMethod: {
            type: String,
            enum: Object.values(PaymentMethod),
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: Object.values(PaymentStatus),
            default: PaymentStatus.PENDING,
        },
        paymentId: {
            type: String,
        },
        couponCode: {
            type: String,
            uppercase: true,
        },
        notes: {
            type: String,
            maxlength: [500, 'Notes cannot exceed 500 characters'],
        },
        trackingNumber: {
            type: String,
        },
        estimatedDelivery: {
            type: Date,
        },
        deliveredAt: {
            type: Date,
        },
        cancelledAt: {
            type: Date,
        },
        cancelReason: {
            type: String,
            maxlength: [500, 'Cancel reason cannot exceed 500 characters'],
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (_doc, ret: any) => {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    }
);

// Generate order number before validation
orderSchema.pre('validate', async function (next) {
    if (this.isNew && !this.orderNumber) {
        const count = await mongoose.model('Order').countDocuments();
        const orderNum = `ORD${Date.now()}${String(count + 1).padStart(4, '0')}`;
        this.orderNumber = orderNum;
    }
    next();
});

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);