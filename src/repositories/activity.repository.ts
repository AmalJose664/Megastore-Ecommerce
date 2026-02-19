import { BaseRepository } from './base.repository';
import { Activity } from '../models/Activity.model';
import { IActivity } from '../types';

export class ActivityRepository extends BaseRepository<IActivity> {
    constructor() {
        super(Activity);
    }

    async getRecentActivities(limit: number = 20): Promise<IActivity[]> {
        return this.model
            .find()
            .populate('user', 'firstName lastName email avatar')
            .sort({ createdAt: -1 })
            .limit(limit);
    }
}

export const activityRepository = new ActivityRepository();
