import { BaseRepository } from './base.repository';
import { Promo } from '../models';
import { IPromo } from '../types';

export class PromoRepository extends BaseRepository<IPromo> {
    constructor() {
        super(Promo);
    }

    async findActive(): Promise<IPromo | null> {
        return this.model.findOne({ isActive: true }).exec();
    }
}

export const promoRepository = new PromoRepository();
