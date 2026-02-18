import { BaseRepository } from './base.repository';
import { Address } from '../models/Address.model';
import { IAddress } from '../types';

export class AddressRepository extends BaseRepository<IAddress> {
    constructor() {
        super(Address);
    }

    async findByUser(userId: string): Promise<IAddress[]> {
        return this.model.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
    }

    async findDefault(userId: string): Promise<IAddress | null> {
        return this.model.findOne({ user: userId, isDefault: true });
    }

    async clearDefaults(userId: string, exceptId?: string): Promise<void> {
        const query: any = { user: userId, isDefault: true };
        if (exceptId) {
            query._id = { $ne: exceptId };
        }
        await this.model.updateMany(query, { isDefault: false });
    }
}

export const addressRepository = new AddressRepository();
