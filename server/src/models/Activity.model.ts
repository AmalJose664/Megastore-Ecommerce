import mongoose, { Schema } from 'mongoose';
import { IActivity, ActivityType } from '../types';

const activitySchema = new Schema<IActivity>(
    {
        type: {
            type: String,
            enum: Object.values(ActivityType),
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            index: true,
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
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

activitySchema.index({ createdAt: -1 });

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);
